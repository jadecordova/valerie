import os
import re
import sys
import eel
import json
import shutil
import threading
import subprocess
from tkinter import Tk
from pathlib import Path
from datetime import datetime
from tkinter import filedialog
from typing import Dict, List, Set, Optional, Union, Any
from db import get_table_data
import logging

logger = logging.getLogger(__name__)
#---------------------------------------------------------------------------------------------------------------------
# Define a set of video file extensions to filter files in the selected folder
#---------------------------------------------------------------------------------------------------------------------
VIDEO_EXTENSIONS: Set[str] = {
    '.mp4', '.m4v', '.mkv', '.webm', '.mov', '.avi', '.wmv',
    '.flv', '.mpg', '.mpeg', '.mpe', '.mpv', '.mpeg4',
    '.3gp', '.3g2', '.3gp2', '.mts', '.m2ts', '.ts', '.vob',
    '.ogv', '.divx', '.asf', '.f4v', '.rm', '.rmvb', '.m2v', '.txt'
}

#---------------------------------------------------------------------------------------------------------------------
# Function to open a folder selection dialog and return the selected path
#---------------------------------------------------------------------------------------------------------------------
def select_folder():
    try:
        root = Tk()
        root.attributes('-topmost', True)  # Keep the window on top
        root.withdraw()  # Hide the root window
        folder = filedialog.askdirectory(
            title="Select the folder to process",
            mustexist=True
        )
        root.destroy()
        if folder:
            logger.info(f"Selected folder saved in backend: {folder}")
            return folder
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        return None
    
#---------------------------------------------------------------------------------------------------------------------
# Recursively find all video files in the given folder and subfolders.
# Args:
#   folder_path: Path to the root folder (str or Path)
#   extensions: Set of lowercase extensions to match (default: comprehensive list above)
#   case_insensitive: Match extensions ignoring case (recommended: True)
#   follow_symlinks: Follow symbolic links (usually False to avoid loops)
# Returns:
#   List of Path objects pointing to video files, sorted by full path
#---------------------------------------------------------------------------------------------------------------------
def find_video_files(
    folder_path: str | Path,
    extensions: Optional[Set[str]] = None,
    case_insensitive: bool = True,
    follow_symlinks: bool = False
) -> List[Path]:
    root = Path(folder_path).resolve()
    if not root.is_dir():
        raise NotADirectoryError(f"Not a directory: {root}")
    if extensions is None:
        extensions = VIDEO_EXTENSIONS
    video_files: List[Path] = []
    for dirpath, dirnames, filenames in os.walk(
        root,
        followlinks=follow_symlinks,
        topdown=True
    ):
        for filename in filenames:
            path = Path(dirpath) / filename
            ext = path.suffix.lower() if case_insensitive else path.suffix

            if ext in extensions:
                video_files.append(path)
    # Sort for consistent order (by full path)
    video_files.sort()
    return video_files

#---------------------------------------------------------------------------------------------------------------------
# Finds videos, processes each with get_video_info,
# updates progress after each, sends full results at end.
# Starts a background thread to avoid blocking the Eel app.
# Returns immediately with 'started' status.
#---------------------------------------------------------------------------------------------------------------------
def get_videos_in_folder(folder_path: str | Path):
    root = Path(folder_path).resolve()
    if not root.is_dir():
        raise NotADirectoryError(f"Not a directory: {root}")
    def process_videos():
        logger.info(f"Processing videos in folder: {root}")
        try:
            # Get all existing stars and tags from the database
            db_stars_data = get_table_data('stars')
            db_star_names: Set[str] = {star.get('name', '').strip().lower() for star in db_stars_data if star.get('name')}
            
            db_tags_data = get_table_data('tags')
            db_tag_names: Set[str] = {tag.get('tag', '').strip().lower() for tag in db_tags_data if tag.get('tag')}
            
            videos = find_video_files(folder_path)  # from your earlier function
            total = len(videos)
            results = []
            new_stars: Set[str] = set()  # Track stars not in the database
            new_tags: Set[str] = set()  # Track tags not in the database
            
            # Initial progress (optional)
            eel.update_progress(0, total, "Starting...")

            for i, video in enumerate(videos):
                info = get_video_info(video)
                results.append(info)
                
                # Check if any stars in this video are not in the database
                video_stars = info.get('stars', [])
                for star in video_stars:
                    star_lower = star.strip().lower()
                    if star_lower and star_lower not in db_star_names:
                        new_stars.add(star)

                # Check if any tags in this video are not in the database
                video_tags = info.get('tags', [])
                for tag in video_tags:
                    tag_lower = tag.strip().lower()
                    if tag_lower and tag_lower not in db_tag_names:
                        new_tags.add(tag)

                # Update progress after each file
                eel.update_progress(i + 1, total, f"Processed {info['originalFilename']}")

            # All done — send full results to JS with new stars list
            eel.show_results({
                "status": "success",
                "count": len(results),
                "videos": results,
                "folder": str(folder_path),
                "new_stars": sorted(list(new_stars)),
                "new_tags": sorted(list(new_tags))
            })

        except Exception as e:
            eel.show_results({
                "status": "error",
                "message": str(e)
            })
    # Start in background thread
    threading.Thread(target=process_videos, daemon=True).start()

    # Return immediately so JS doesn't wait
    return {"status": "started", "message": "Processing videos in background..."}

#---------------------------------------------------------------------------------------------------------------------
# Parses video filename with the exact structure you described:
# Stars (comma-separated), number, tags (comma-separated), +number, [optional flag].ext
#
# Returns:
# {
#   "originalFilename": str,
#   "stars": List[str],
#   "tags": List[str],
#   "flag": str | None,
#   "extension": str   # lowercase with dot, e.g. ".mp4"
# }
#---------------------------------------------------------------------------------------------------------------------
def parse_filename(input_data: str | Path) -> Dict:
    
   # Convert Path object to string if necessary
    filename = str(input_data.name) if isinstance(input_data, Path) else str(input_data)
    
    # REGEX EXPLANATION:
    # ^(?P<stars>.+?)         -> Non-greedy capture of stars
    # \s+(?P<id>\d+)          -> A space followed by the ID number
    # (?P<tags>[^+]*)         -> Everything until the '+' (can be empty)
    # \+                      -> The literal plus sign
    # (?P<count>\d+)          -> The number after the plus
    # (?P<suffix>.*)          -> Everything else before the dot
    # \.(?P<ext>\w+)$         -> The extension
    pattern = r"^(?P<stars>.+?)\s+(?P<id>\d+)(?P<tags>[^+]*)\+(?P<count>\d+)(?P<suffix>.*)\.(?P<ext>\w+)$"
    
    match = re.search(pattern, filename)
    
    if not match:
        # Return a consistent structure even on failure to avoid Subscriptable errors
        return {
            "originalFilename": filename, "stars": [], "tags": [], 
            "flag": None, "extension": None, "success": False
        }

    # 1. Process Stars
    stars = [s.strip() for s in match.group("stars").split(",") if s.strip()]
    
    # 2. Process Tags
    tags_raw = match.group("tags").strip()
    tags = [t.strip() for t in tags_raw.split(",") if t.strip()]
    
    # 3. Process the Flag (The word just before the dot)
    # We look at the suffix (e.g., " - Copy - Copy (2)") and find the last alphanumeric word
    suffix = match.group("suffix").strip()
    flag_match = re.findall(r"(\w+)", suffix)
    flag = flag_match[-1] if flag_match else None
    
    return {
        "originalFilename": filename,
        "stars": stars,
        "tags": tags,
        "flag": flag,
        "extension": match.group("ext"),
        "success": True
    }

#---------------------------------------------------------------------------------------------------------------------
# Converts seconds to "HH:MM:SS" or "MM:SS" format. If input is None, returns "??:??".    
#---------------------------------------------------------------------------------------------------------------------
def seconds_to_hhmmss(s: Optional[float]) -> str:
    if s is None: return "??:??"
    h = int(s // 3600)
    m = int((s % 3600) // 60)
    sec = int(s % 60)
    if h: return f"{h:02d}:{m:02d}:{sec:02d}"
    return f"{m:02d}:{sec:02d}"

#---------------------------------------------------------------------------------------------------------------------
# Uses local ./ffprobe to extract:
# - size_bytes
# - size_mb (rounded to 2 decimals)
# - width
# - height
# - duration_seconds
# - codec_name
# - fps (from r_frame_rate)
#
# Returns dict with these keys + 'error' if something fails.
#---------------------------------------------------------------------------------------------------------------------
def get_technical_video_info(file_path: Union[str, Path]) -> Dict:

    path = Path(file_path).resolve()
    result: Dict = {
        "size_bytes": 0,
        "size": None,
        "width": None,
        "height": None,
        "duration_seconds": None,
        "duration": None,
        "codec": None,
        "fps": None,
        "error": None,
    }

    if not path.is_file():
        result["error"] = "Not a file or file not found"
        return result

    # Basic file size (always available, no ffprobe needed)
    try:
        size_bytes = path.stat().st_size
        result["size_bytes"] = size_bytes
        result["size"] = human_readable_size(size_bytes)
    except Exception as e:
        result["error"] = f"Cannot read file size: {str(e)}"
        return result

    # ffprobe part
    try:
        cmd = [
            "./ffprobe",                     # relative to main.py
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",                  # for duration
            "-show_streams",
            "-select_streams", "v:0",        # first video stream only
            str(path)
        ]

        output = subprocess.check_output(
            cmd,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=12                      # prevent hanging on corrupt files
        )

        data = json.loads(output)

        # Video stream info
        streams = data.get("streams", [])
        if not streams:
            result["error"] = "No streams found"
            return result

        video = streams[0]  # we selected v:0 so first should be video

        result["codec"] = video.get("codec_long_name") or video.get("codec_name")  or "unknown"
        
        result["width"]  = video.get("width")
        result["height"] = video.get("height")

        # FPS — often given as fraction "30000/1001" → ≈29.97
        r_frame_rate = video.get("r_frame_rate")
        if r_frame_rate and "/" in r_frame_rate:
            try:
                num, den = map(int, r_frame_rate.split("/"))
                if den != 0:
                    result["fps"] = round(num / den, 3)
            except:
                pass

        # Duration from format section
        fmt = data.get("format", {})
        duration_str = fmt.get("duration")
        if duration_str:
            try:
                result["duration_seconds"] = round(float(duration_str), 3)
                result["duration"] = seconds_to_hhmmss(result["duration_seconds"])
            except:
                pass

    except FileNotFoundError:
        result["error"] = "ffprobe not found in current directory (./ffprobe)"
    except subprocess.TimeoutExpired:
        result["error"] = "ffprobe timed out"
    except subprocess.CalledProcessError as e:
        result["error"] = f"ffprobe error: {e.output.strip()[:180]}"
    except json.JSONDecodeError:
        result["error"] = "ffprobe returned invalid JSON"
    except Exception as e:
        result["error"] = f"Unexpected: {type(e).__name__}: {str(e)}"

    return result

#---------------------------------------------------------------------------------------------------------------------
def get_video_info(video_path: Path) -> dict:
    filename_info = parse_filename(video_path)           # your previous function
    tech_info     = get_technical_video_info(video_path)
    full_info = {**filename_info, **tech_info}
    return full_info

#---------------------------------------------------------------------------------------------------------------------
# Convert a size in bytes to a human-readable string with appropriate unit.
# Examples:
#   1024     → "1.00 KB"
#   1500000  → "1.43 MB"
#   0        → "0 bytes"
#   1024**4  → "1.00 TB"
#    
# Args:
#   size_bytes: Size in bytes (int or float)
#   decimal_places: How many decimals to show (default: 2)
#    
# Returns:
#   Formatted string like "2.35 GB"
def human_readable_size(size_bytes: int | float, decimal_places: int = 2) -> str:
    if size_bytes == 0:
        return "0 bytes"
    
    # Units in order: bytes, KB, MB, GB, TB, PB, EB, ZB, YB
    units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    
    # Find the right unit by repeatedly dividing by 1024
    size = float(size_bytes)
    unit_index = 0
    
    while size >= 1024 and unit_index < len(units) - 1:
        size /= 1024
        unit_index += 1
    
    # Format with specified decimal places
    return f"{size:.{decimal_places}f} {units[unit_index]}"

#---------------------------------------------------------------------------------------------------------------------
# Attempts to rename movie files from originalFilename to name.
# Returns array of movies with success flag:
#   [{ ...movie, success: True/False, error: "..." (if failed) }, ...]
def rename_movies(movies: list, folder_path: str) -> list:
    result = []
    
    for m in movies or []:
        original_filename = m.get('originalFilename')
        new_name = m.get('name') or ''
        
        old_path = os.path.join(folder_path, original_filename) if original_filename else None
        new_path = os.path.join(folder_path, new_name)
        
        try:
            if not old_path or not os.path.exists(old_path):
                raise FileNotFoundError(f"Original file not found: {old_path}")
            
            if old_path != new_path:
                shutil.move(old_path, new_path)
            
            m['success'] = True
        except Exception as e:
            m['success'] = False
            m['error'] = str(e)
        
        result.append(m)
    
    return result

#---------------------------------------------------------------------------------------------------------------------
# Extract the folder name from filename - the number between square brackets.
def extract_folder_name(filename: str) -> str:
    start = filename.find('[')
    end = filename.find(']')
    if start != -1 and end != -1:
        return filename[start+1:end]
    return None

#---------------------------------------------------------------------------------------------------------------------
def import_videos():
    folder = select_folder()
    if not folder:
        logger.info("No folder selected.")
        return [] # or return None
    eel.update_folder(folder)
    return get_videos_in_folder(folder)

#---------------------------------------------------------------------------------------------------------------------
# Return the directory in which the application’s data live.
#   * when running from Python it is the `web` folder next to this module;
#   * when frozen by PyInstaller/py2exe/etc. it is the directory containing the .exe, which will also contain `lin`.
def get_base_dir() -> str:
    if getattr(sys, 'frozen', False):
        # frozen – sys.executable points at the .exe
        return os.path.dirname(sys.executable)
    else:
        # development – return the directory containing main.py/files.py
        return os.path.abspath(os.path.dirname(__file__))

#---------------------------------------------------------------------------------------------------------------------
def delete_thumbnail(movie_id: int, filename: str) -> bool:
    try:
        path = os.path.join(get_base_dir(), "web", "lin", str(movie_id), filename)
        os.remove(path)
        return True
    except Exception as e:
        logger.error(f"Error deleting thumbnail: {e}")
        return False

#---------------------------------------------------------------------------------------------------------------------
# Renames the source file (filename) to 'poster.jpg' in the movie's directory.
# If 'poster.jpg' already exists, renames the old one to 'poster-TIMESTAMP.jpg'.
# Returns:
#   list[str]: All filenames (basenames only) in the movie directory after the operation.
#   Returns empty list [] on failure.
def set_poster(movie_id: int, filename: str) -> list[str]:
    try:
        base_dir = get_base_dir()
        movie_dir = os.path.join(base_dir, "web", "lin", str(movie_id))
        
        source_path = os.path.join(movie_dir, filename)
        dest_path   = os.path.join(movie_dir, "poster.jpg")
        
        # Safety: source must exist and be a file
        if not os.path.isfile(source_path):
            logger.error(f"Source file not found: {source_path}")
            return []
        
        # Backup existing poster.jpg if it exists
        if os.path.exists(dest_path):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"poster-{timestamp}.jpg"
            backup_path = os.path.join(movie_dir, backup_name)
            
            counter = 1
            while os.path.exists(backup_path):
                backup_name = f"poster-{timestamp}-{counter}.jpg"
                backup_path = os.path.join(movie_dir, backup_name)
                counter += 1
            
            os.rename(dest_path, backup_path)
            logger.info(f"Renamed existing poster → {backup_name}")
        
        # Perform the rename
        os.rename(source_path, dest_path)
        logger.info(f"Renamed {filename} → poster.jpg for movie {movie_id}")
        
        # Get all filenames in the directory (only files, not subfolders)
        all_files = [f for f in os.listdir(movie_dir) if os.path.isfile(os.path.join(movie_dir, f))]
        
        return sorted(all_files)  # optional: sort for consistent UI order
    
    except FileNotFoundError as e:
        logger.error(f"File not found error: {e}")
        return []
    except PermissionError as e:
        logger.error(f"Permission denied: {e}")
        return []
    except OSError as e:
        logger.error(f"OS error during rename: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error setting poster for movie {movie_id}: {e}")
        return []
    
#---------------------------------------------------------------------------------------------------------------------
# Generate thumbnails for movies at specified intervals using threading.
# Uses Eel to report progress back to JS.
def generate_thumbnails(filenames: List[str], folder_path: str, interval_seconds: int = 10) -> Dict[str, Any]:
    def process_thumbnails():
        try:
            results = []
            total_files = len(filenames)
            base = get_base_dir()                # defined earlier in this module
            web_lin_path = Path(base) / "web" / "lin"
            web_lin_path.mkdir(parents=True, exist_ok=True)            
            # Initial progress
            eel.update_progress(0, total_files, "Starting thumbnail generation...")
            
            for index, filename in enumerate(filenames):
                folder_name = extract_folder_name(filename)
                
                if not folder_name:
                    continue
                
                # Create folder for this movie's thumbnails
                movie_thumb_folder = web_lin_path / folder_name
                movie_thumb_folder.mkdir(parents=True, exist_ok=True)
                
                # Full path to movie file
                movie_path = os.path.join(folder_path, filename)
                
                if not os.path.exists(movie_path):
                    eel.update_progress(index + 1, total_files, f"File not found: {filename}")
                    continue
                
                # Generate thumbnails using ffmpeg
                output_pattern = str(movie_thumb_folder / "%d.jpg")
                
                try:
                    cmd = [
                        './ffmpeg',
                        '-i', movie_path,
                        '-vf', f'fps=1/{interval_seconds}',
                        output_pattern
                    ]
                    
                    subprocess.run(cmd, capture_output=True, check=True, timeout=300)
                    
                    # Get list of generated thumbnail files
                    thumbs = sorted([f for f in os.listdir(movie_thumb_folder) if f.endswith('.jpg')])
                    
                    results.append({
                        'folder': folder_name,
                        'thumbs': thumbs
                    })
                    
                    # Update progress
                    eel.update_progress(index + 1, total_files, f"Generated {len(thumbs)} thumbnails for {filename}")
                    
                except subprocess.CalledProcessError as e:
                    eel.update_progress(index + 1, total_files, f"Failed: {filename}")
                except subprocess.TimeoutExpired:
                    eel.update_progress(index + 1, total_files, f"Timeout: {filename}")
            
            # Send final results
            eel.show_thumbnail_results({
                "status": "success",
                "count": len(results),
                "results": results
            })
        
        except Exception as e:
            eel.show_thumbnail_results({
                "status": "error",
                "message": str(e)
            })
    
    # Start in background thread
    threading.Thread(target=process_thumbnails, daemon=True).start()
    
    return {"status": "started", "message": "Generating thumbnails in background..."}
