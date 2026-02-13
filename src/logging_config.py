import logging
import sys

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,  # change to DEBUG if you want more noise
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )