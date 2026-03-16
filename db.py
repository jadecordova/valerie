import datetime
import shutil
import sys
import os
import sqlite3
import sqlite3
from ast import List
from typing import List as ListType
from utilities import get_base_dir



#--------------------------------------------------------------------------------------------------------
# Function to get the path to the database file, handling both development and packaged modes
def get_db_path(db_name='valerie.db'):  # Replace with your actual DB file name
    if getattr(sys, 'frozen', False):
        # Packaged mode (PyInstaller exe)
        base_path = sys._MEIPASS
    else:
        # Development mode
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, 'data', db_name)

#--------------------------------------------------------------------------------------------------------
# Fetch all rows from the specified table and return them as a list of dictionaries.
# Args:
#   table_name (str): Name of the table to query ('stars', 'tags', etc.)
# Returns:
#   list[dict]: List of rows as dictionaries, or empty list if error occurs
def get_table_data(table_name: str) -> list[dict]:
    db_path = get_db_path()  # Assuming this function exists in your code
    
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # Allows accessing columns by name
        cursor = conn.cursor()
        
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        
        # Convert sqlite3.Row objects to regular dictionaries
        return [dict(row) for row in rows]
        
    except sqlite3.Error as e:
        print(f"SQLite error while reading table '{table_name}': {e}")
        return []
        
    finally:
        if 'conn' in locals():
            conn.close()

#--------------------------------------------------------------------------------------------------------
def get_max_id(table_name: str = "stars") -> int | None:
    db_path = get_db_path()  
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute(f"SELECT MAX(id) FROM {table_name}")
        result = cursor.fetchone()[0]
        return result if result is not None else 0
        
    except sqlite3.Error as e:
        print(f"SQLite error while trying to get max id from table '{table_name}': {e}")
        return []
        
    finally:
        if 'conn' in locals():
            conn.close()

#--------------------------------------------------------------------------------------------------------
def add_new_elements(stars: ListType[dict], tags: ListType[dict]) -> dict:
    db_path = get_db_path()
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        # Insert stars (ignore duplicates)
        for s in stars or []:
            name = s.get('name') or s.get('star') or s.get('label') or ''
            special = 1 if s.get('special') else 0
            score = int(s.get('score') or 0)
            movies = int(s.get('movies') or 0)
            cursor.execute(
                "INSERT OR IGNORE INTO stars (name, special, score, movies) VALUES (?, ?, ?, ?)",
                (name, special, score, movies)
            )
        # Insert tags (ignore duplicates)
        for t in tags or []:
            tag = t.get('tag') or t.get('name') or ''
            score = int(t.get('score') or 0)
            cursor.execute(
                "INSERT OR IGNORE INTO tags (tag, score) VALUES (?, ?)",
                (tag, score)
            )

        conn.commit()
        # Return current tables
        stars_rows = get_table_data('stars')
        tags_rows = get_table_data('tags')
        return {"stars": stars_rows, "tags": tags_rows}
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return {"error": str(e)}
    finally:
        if 'conn' in locals():
            conn.close()
            
#--------------------------------------------------------------------------------------------------------
# Inserts only successfully renamed movies into DB with their stars and tags.
# Returns summary of successful/failed insertions.
def insert_movies(movies: list) -> dict:
    db_path = get_db_path()
    # make a quick backup before we touch the database
    try:
        ts = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        backup = f"{db_path}.{ts}.bak"
        shutil.copy2(db_path, backup)
    except Exception as e:
        print(f"warning: could not back up database before insert: {e}")
    successful = []
    failed_insert = []
   
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        for m in movies or []:
            # Skip if rename failed
            if not m.get('success'):
                failed_insert.append(m)
                continue
            
            try:
                mid = m.get('id')
                new_name = m.get('name') or ''
                extension = m.get('extension')
                score = int(m.get('score') or 0)
                container = m.get('container')
                disk = m.get('disk')
                special = 1 if m.get('special') else 0
                size = m.get('size')
                width = m.get('width')
                height = m.get('height')
                duration = m.get('duration')
                codec = m.get('codec')
                fps = m.get('fps')

                # Insert movie
                if mid is not None:
                    cursor.execute(
                        "INSERT OR REPLACE INTO movies (id, name, extension, score, container, disk, special, size, width, height, duration, codec, fps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        (mid, new_name, extension, score, container, disk, special, size, width, height, duration, codec, fps)
                    )
                    movie_id = mid
                else:
                    cursor.execute(
                        "INSERT INTO movies (name, extension, score, container, disk, special, size, width, height, duration, codec, fps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        (new_name, extension, score, container, disk, special, size, width, height, duration, codec, fps)
                    )
                    movie_id = cursor.lastrowid

                # Link stars
                for sid in m.get('stars', []) or []:
                    if sid is None:
                        continue
                    cursor.execute(
                        "INSERT OR IGNORE INTO movie_stars (movie_id, star_id) VALUES (?, ?)",
                        (movie_id, int(sid))
                    )

                # Link tags
                for tid in m.get('tags', []) or []:
                    if tid is None:
                        continue
                    cursor.execute(
                        "INSERT OR IGNORE INTO movie_tags (movie_id, tag_id) VALUES (?, ?)",
                        (movie_id, int(tid))
                    )
                
                successful.append(m)
            except Exception as e:
                m['insertError'] = str(e)
                failed_insert.append(m)

        conn.commit()
        return {
            "successful": successful,
            "failedRename": [m for m in movies if not m.get('success')],
            "failedInsert": [m for m in failed_insert if m.get('success')]
        }
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return {"error": str(e), "successful": [], "failedRename": [], "failedInsert": failed_insert}
    finally:
        if 'conn' in locals():
            conn.close()

#--------------------------------------------------------------------------------------------------------
db_path = get_db_path()

#---------------------------------------------------------------------------------------------------------------------
def get_video_thumbnails(video_id: int) -> list[str]:
    try:
        base_dir = get_base_dir()        
        thumbs_dir = os.path.join(base_dir, "web", "lin", str(video_id))
        if not os.path.exists(thumbs_dir):
            return []
        return sorted([f for f in os.listdir(thumbs_dir) if f.endswith('.jpg')])
    except Exception as e:
        return []
    
#--------------------------------------------------------------------------------------------------------
def delete_star(star_id: int) -> bool:
    db_path = get_db_path()
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM stars WHERE id = ?", (star_id,))
        conn.commit()
        return True
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        print(f"Error deleting star_id {star_id}: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()    
            
#--------------------------------------------------------------------------------------------------------
def clean_edited_status(star_id: int) -> bool:
    db_path = get_db_path()
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("UPDATE stars SET edited = 0 WHERE id = ?", (star_id,))
        conn.commit()
        return True
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        print(f"Error cleaning edited status for star_id {star_id}: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

#--------------------------------------------------------------------------------------------------------
def set_special_status(star_id: int, special: bool) -> bool:
    db_path = get_db_path()
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("UPDATE stars SET special = ? WHERE id = ?", (1 if special else 0, star_id))
        conn.commit()
        return True
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        print(f"Error updating special status for star_id {star_id}: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()
            
#--------------------------------------------------------------------------------------------------------
def add_edit_star(data: dict) -> dict:
    print(f"edit_star called with data: {data}")
    # Extract fields from the input dict
    star_id = data.get('id')
    name = data.get('name')
    special = data.get('special')
    score = data.get('score')
    movies = data.get('movies')
    edited = data.get('edited')
    
    db_path = get_db_path()
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # Enable dict conversion on rows
        cursor = conn.cursor()
        
        if star_id is None:
            # Insert a new star
            inserts = []
            params = []
            if name is not None:
                inserts.append("name")
                params.append(name)
            if special is not None:
                inserts.append("special")
                params.append(1 if special else 0)
            if score is not None:
                inserts.append("score")
                params.append(score)
            if movies is not None:
                inserts.append("movies")
                params.append(movies)
            if edited is not None:
                inserts.append("edited")
                params.append(edited)
            
            if not inserts:
                return {"error": "No fields provided to create a new star"}
            
            placeholders = ','.join('?' * len(inserts))
            query = f"INSERT OR IGNORE INTO stars ({', '.join(inserts)}) VALUES ({placeholders})"
            cursor.execute(query, params)
            conn.commit()
            
            # Get the new star's ID and return it
            new_id = cursor.lastrowid
            cursor.execute("SELECT * FROM stars WHERE id = ?", (new_id,))
            row = cursor.fetchone()
            return dict(row) if row else {"error": "Failed to retrieve new star after insert"}
        else:
            # Update existing star (original logic)
            updates = []
            params = []
            if name is not None:
                updates.append("name = ?")
                params.append(name)
            if special is not None:
                updates.append("special = ?")
                params.append(1 if special else 0)
            if score is not None:
                updates.append("score = ?")
                params.append(score)
            if movies is not None:
                updates.append("movies = ?")
                params.append(movies)
            if edited is not None:
                updates.append("edited = ?")
                params.append(edited)
            
            if not updates:
                return {"error": "No fields to update"}
            
            params.append(star_id)
            query = f"UPDATE stars SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            
            # Return updated star
            cursor.execute("SELECT * FROM stars WHERE id = ?", (star_id,))
            row = cursor.fetchone()
            return dict(row) if row else {"error": "Star not found after update"}
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return {"error": str(e)}
    finally:
        if 'conn' in locals():
            conn.close()
            
#--------------------------------------------------------------------------------------------------------
# Retrieves movies from the SQLite database based on optional filters.
# :param stars: List of star IDs (integers). Movies must contain ALL specified stars if provided.
# :param tags: List of tag IDs (integers). Movies must contain ALL specified tags if provided.
# :param min_score: Minimum score (integer). Movies must have score >= this value if provided.
# :param disk: Disk string. Exact match if provided.
# :param container: Container string. Exact match if provided.
# :param limit: Maximum number of results to return.
# :param offset: Number of results to skip.
# :return: List of movie dictionaries with 'star_ids' and 'tag_ids' lists.
def get_movies(stars=None, tags=None, min_score=None, disk=None, container=None, limit=5000, offset=0):
    print(f"get_movies called with stars={stars}, tags={tags}, min_score={min_score}, disk='{disk}', container='{container}', limit={limit}, offset={offset}")
    
    if stars is None:
        stars = []
    if tags is None:
        tags = []
    
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    cur.execute(
    "SELECT movie_id FROM movie_stars WHERE star_id IN (?,?) GROUP BY movie_id HAVING COUNT(DISTINCT star_id) = ?",
    (5, 3, 2))
    print("movie_ids matching both stars:", [r[0] for r in cur.fetchall()])

    query = "SELECT * FROM movies"
    params = []
    conditions = []
    
    if min_score is not None:
        conditions.append("score >= ?")
        params.append(min_score)
    
    if disk and disk.strip():
        conditions.append("disk = ?")
        params.append(disk)
    
    if container and container.strip():
        conditions.append("container = ?")
        params.append(container)
    
    if stars:
        star_placeholders = ','.join('?' * len(stars))
        conditions.append(f"id IN (SELECT movie_id FROM movie_stars WHERE star_id IN ({star_placeholders}) GROUP BY movie_id HAVING COUNT(DISTINCT star_id) = ?)")
        params.extend(stars)
        params.append(len(stars))
    
    if tags:
        tag_placeholders = ','.join('?' * len(tags))
        conditions.append(f"id IN (SELECT movie_id FROM movie_tags WHERE tag_id IN ({tag_placeholders}) GROUP BY movie_id HAVING COUNT(DISTINCT tag_id) = ?)")
        params.extend(tags)
        params.append(len(tags))
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += f" LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    print(f"Executing query: {query}")
    print(f"With params: {params}")
    
    try:
        cur.execute(query, params)
        rows = cur.fetchall()
        
        # === Batch-fetch stars and tags for ALL movies in one go (avoids N+1 queries) ===
        movies_list = []
        if rows:
            movie_ids = [row['id'] for row in rows]
            ph = ','.join('?' * len(movie_ids))
            
            # Stars
            cur.execute(f"""
                SELECT movie_id, star_id 
                FROM movie_stars 
                WHERE movie_id IN ({ph}) 
                ORDER BY movie_id, star_id
            """, movie_ids)
            star_map = {}
            for mid, sid in cur.fetchall():
                if mid not in star_map:
                    star_map[mid] = []
                star_map[mid].append(sid)
            
            # Tags
            cur.execute(f"""
                SELECT movie_id, tag_id 
                FROM movie_tags 
                WHERE movie_id IN ({ph}) 
                ORDER BY movie_id, tag_id
            """, movie_ids)
            tag_map = {}
            for mid, tid in cur.fetchall():
                if mid not in tag_map:
                    tag_map[mid] = []
                tag_map[mid].append(tid)
            
            # Build final list
            for row in rows:
                movie_dict = dict(row)
                movie_id = movie_dict['id']
                movie_dict['star_ids'] = star_map.get(movie_id, [])
                movie_dict['tag_ids'] = tag_map.get(movie_id, [])
                # add a thumbnails list so the frontend can render them
                try:
                    movie_dict['thumbnails'] = get_video_thumbnails(movie_id)
                except Exception:
                    # any failure here should not break the search
                    movie_dict['thumbnails'] = []
                movies_list.append(movie_dict)
        
        print(f"Query returned {len(movies_list)} rows")
        if movies_list:
            print(f"Sample result: {movies_list[0]}")
        
        conn.close()
        return movies_list
    
    except Exception as e:
        print(f"Error in get_movies: {e}")
        conn.close()
        return []




'''
def get_movies(stars=None, tags=None, min_score=None, disk=None, container=None, limit=5000, offset=0):
    """
    Retrieves movies from the SQLite database based on optional filters.
    
    :param stars: List of star IDs (integers). Movies must contain ALL specified stars if provided.
    :param tags: List of tag IDs (integers). Movies must contain ALL specified tags if provided.
    :param min_score: Minimum score (integer). Movies must have score >= this value if provided.
    :param disk: Disk string. Exact match if provided.
    :param container: Container string. Exact match if provided.
    :param limit: Maximum number of results to return.
    :param offset: Number of results to skip.
    :return: List of movie dictionaries with 'star_ids' and 'tag_ids' lists.
    """
    print(f"get_movies called with stars={stars}, tags={tags}, min_score={min_score}, disk='{disk}', container='{container}', limit={limit}, offset={offset}")
    
    if stars is None:
        stars = []
    if tags is None:
        tags = []
    
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    query = "SELECT * FROM movies"
    params = []
    conditions = []
    
    if min_score is not None:
        conditions.append("score >= ?")
        params.append(min_score)
    
    if disk and disk.strip():
        conditions.append("disk = ?")
        params.append(disk)
    
    if container and container.strip():
        conditions.append("container = ?")
        params.append(container)
    
    if stars:
        star_placeholders = ','.join('?' * len(stars))
        conditions.append(f"id IN (SELECT movie_id FROM movie_stars WHERE star_id IN ({star_placeholders}) GROUP BY movie_id HAVING COUNT(DISTINCT star_id) = ?)")
        params.extend(stars)
        params.append(len(stars))
    
    if tags:
        tag_placeholders = ','.join('?' * len(tags))
        conditions.append(f"id IN (SELECT movie_id FROM movie_tags WHERE tag_id IN ({tag_placeholders}) GROUP BY movie_id HAVING COUNT(DISTINCT tag_id) = ?)")
        params.extend(tags)
        params.append(len(tags))
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += f" LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    print(f"Executing query: {query}")
    print(f"With params: {params}")
    
    try:
        cur.execute(query, params)
        rows = cur.fetchall()
        
        #Convert to list of dicts and fetch star/tag IDs for each movie
        movies_list = []
        for row in rows:
            movie_dict = dict(row)
            movie_id = movie_dict['id']
            
            # Get star IDs for this movie
            cur.execute("SELECT star_id FROM movie_stars WHERE movie_id = ? ORDER BY star_id", (movie_id,))
            star_ids = [star_row[0] for star_row in cur.fetchall()]
            movie_dict['stars'] = star_ids
            
            # Get tag IDs for this movie
            cur.execute("SELECT tag_id FROM movie_tags WHERE movie_id = ? ORDER BY tag_id", (movie_id,))
            tag_ids = [tag_row[0] for tag_row in cur.fetchall()]
            movie_dict['tags'] = tag_ids
            
            movies_list.append(movie_dict)
        
        print(f"Query returned {len(movies_list)} rows")
        if movies_list:
            print(f"Sample result: {movies_list[0]}")
        
        conn.close()
        return movies_list
    
    except Exception as e:
        print(f"Error executing query: {e}", exc_info=True)
        conn.close()
        return print

'''