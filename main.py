import eel

from utilities import get_screen_resolution

eel.init('web') 

width, height = get_screen_resolution()

# Start Eel using the returned dimensions
eel.start(
    'index.html', 
    size=(width, height), 
    position=(0, 0)
)

#python -m eel main.py web --onefile --noconsole --icon=icon.ico
