from flask import Flask, render_template, request, jsonify, redirect, url_for
from werkzeug.utils import secure_filename
import pandas as pd
import os
from loan_model import train_and_analyze
from config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS
from flask import Flask
from flask_cors import CORS


app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app, resources={r"/*": {"origins": "*"}})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    # Serves the main HTML page for the frontend
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    # 1. Check for file and model type in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request."}), 400
    
    file = request.files['file']
    model_type = request.form.get('model_type', 'logistic') # Default to logistic if not specified

    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    if file and allowed_file(file.filename):
        # 2. Save the uploaded file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # 3. Load data and run analysis
            df = pd.read_csv(filepath)
            
            # The model_type must be passed from the frontend (e.g., a dropdown)
            results = train_and_analyze(df, model_type=model_type)

            # 4. Cleanup and return results
            os.remove(filepath) # Delete the temporary file
            
            if isinstance(results, dict) and "error" in results:
                return jsonify(results), 500
        
            return jsonify(results), 200

        except Exception as e:
            # Clean up if an error occurs during processing
            if os.path.exists(filepath):
                os.remove(filepath)
            app.logger.error(f"Analysis error: {e}")
            return jsonify({"error": f"An error occurred during analysis: {e}"}), 500

    else:
        return jsonify({"error": "File type not allowed."}), 400

if __name__ == '__main__':
    # Ensure the upload directory exists
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)