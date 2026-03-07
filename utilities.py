import tkinter as tk

def get_screen_resolution():
    # 1. Get the screen resolution using Tkinter
    root = tk.Tk()
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    root.destroy() # Close the Tkinter window

    return screen_width, screen_height
