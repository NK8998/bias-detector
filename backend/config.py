import os

# Base directory for file storage
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Upload folder configuration
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'csv'}