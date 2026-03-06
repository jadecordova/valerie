import logging
import os
import sys
from pathlib import Path

# Configure logging to write to a file in the application directory.
# Works both when running from source and when frozen as an executable.
def setup_logging():
    if getattr(sys, 'frozen', False):
        # frozen – log file goes next to the .exe
        app_dir = os.path.dirname(sys.executable)
    else:
        # development – log file goes next to main.py
        app_dir = os.path.abspath(os.path.dirname(__file__))
    
    log_dir = Path(app_dir) / 'logs'
    log_dir.mkdir(exist_ok=True)
    
    log_file = log_dir / 'valerie.log'
    
    logging.basicConfig(
        level=logging.ERROR,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()  # also print to console during development
        ]
    )
    
    logging.info(f'Logging initialized. Log file: {log_file}')
