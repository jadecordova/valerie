import os
import sys
import tkinter as tk

def get_screen_resolution():
    # 1. Get the screen resolution using Tkinter
    root = tk.Tk()
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    root.destroy() # Close the Tkinter window

    return screen_width, screen_height

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
