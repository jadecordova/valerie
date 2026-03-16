import eel
from typing import Any, Dict, Dict, List, Optional
from db import add_edit_star, add_new_elements, clean_edited_status, delete_star, get_max_id, get_movies, get_table_data, insert_movies
from files import delete_thumbnail, generate_thumbnails, get_videos_in_folder, import_videos, rename_movies, select_folder, set_poster
from utilities import get_screen_resolution

eel.init('web') 


#--------------------------------------------------------------------------------------------------------
@eel.expose
def Import_Videos():
    return import_videos()

#--------------------------------------------------------------------------------------------------------
@eel.expose
def Get_Stars():
    return get_table_data('stars')

#--------------------------------------------------------------------------------------------------------
@eel.expose
def Get_Tags():
    return get_table_data('tags')

#--------------------------------------------------------------------------------------------------------
@eel.expose
def Get_Max_Id(table_name):
    return get_max_id(table_name)

#--------------------------------------------------------------------------------------------------------


@eel.expose
def Rename_Movies(movies, folder_path):
    return rename_movies(movies, folder_path)

#--------------------------------------------------------------------------------------------------------
@eel.expose
def Insert_Movies(movies):
    return insert_movies(movies)

#--------------------------------------------------------------------------------------------------------
@eel.expose
def Generate_Thumbnails(filenames: List[str], folder_path: str, interval_seconds: int = 10) -> Dict[str, Any]:
    return generate_thumbnails(filenames, folder_path, interval_seconds)

#--------------------------------------------------------------------------------------------------------
@eel.expose
def Set_Poster(movie_id: int, filename: str) -> bool:
    return set_poster(movie_id, filename)

#--------------------------------------------------------------------------------------------------------
@eel.expose
def Delete_Thumbnail(movie_id: int, filename: str) -> bool:
    return delete_thumbnail(movie_id, filename)

#--------------------------------------------------------------------------------------------------------
@eel.expose
def Get_Movies(
    star_ids: Optional[List[int]] = None,
    tag_ids: Optional[List[int]] = None,
    min_score: Optional[int] = None,
    disk: Optional[str] = None,
    container: Optional[str] = None
) -> List[Dict[str, Any]]:
    return get_movies(star_ids, tag_ids, min_score, disk, container)

#--------------------------------------------------------------------------------------------------------
@eel.expose
def Add_Edit_Star(data: dict) -> dict:
    return add_edit_star(data)

#--------------------------------------------------------------------------------------------------------
@eel.expose
def Delete_Star(star_id: int) -> bool:
    return delete_star(star_id)

# ---------------------------------------------------------------
@eel.expose
def Clean_Edited_Status(star_id: int) -> bool:
    return clean_edited_status(star_id)

# ---------------------------------------------------------------
@eel.expose
def Set_Special_Status(star_id: int, special: bool) -> bool:
    return add_edit_star({'id': star_id, 'special': special})

#--------------------------------------------------------------------------------------------------------
# Accepts lists of star/tag dicts from the frontend, inserts them,
# and returns either {'stars': [...], 'tags': [...]} or {'error': '...'}.
@eel.expose
def Add_New_Elements(stars, tags):
    return add_new_elements(stars, tags)

    
width, height = get_screen_resolution()

# Start Eel using the returned dimensions
eel.start(
    'index.html', 
    size=(width, height), 
    position=(0, 0)
)

#python -m eel main.py web --onefile --noconsole --icon=icon.ico
