from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import pandas as pd
import os
from relic.loan_model import train_and_analyze
from config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS
from flask import Flask
from flask_cors import CORS
from predict.predict_data import predict
import json

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app, resources={r"/*": {"origins": "*"}})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request."}), 400
    
    file = request.files['file']
    model_type = request.form.get('model_type', 'logistic') 

    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            df = pd.read_csv(filepath)
            
            results = train_and_analyze(df, model_type=model_type)

            os.remove(filepath) 
            
            if isinstance(results, dict) and "error" in results:
                return jsonify(results), 500
        
            return jsonify(results), 200

        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            app.logger.error(f"Analysis error: {e}")
            return jsonify({"error": f"An error occurred during analysis: {e}"}), 500

    else:
        return jsonify({"error": "File type not allowed."}), 400
    

@app.route('/predict-bulk', methods=['POST'])
def predict_bulk():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request."}), 400
    
    file = request.files['file']
    model_type = request.form.get('model_type', 'logistic_regression') 
    bias_flag = request.form.get('bias_flag', 'false').lower() == 'true'

    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    if file and allowed_file(file.filename):
        try:
            df = pd.read_csv(file)

            result = predict(df, model_type=model_type, bias_flag=bias_flag)
            return jsonify(result), 200

        except Exception as e:
            app.logger.error(f"Prediction error: {e}")
            return jsonify({"error": f"An error occurred during prediction: {e}"}), 500

    else:
        return jsonify({"error": "File type not allowed."}), 400
    

@app.route('/predict-single', methods=['POST'])
def predict_single():
    data = request.json
    model_type = data.get('model_type', 'logistic_regression')
    bias_flag = request.form.get('bias_flag', 'false').lower() == 'true'
    applicant_data = data.get('applicant_data', {})

    if not applicant_data:
        return jsonify({"error": "No applicant data provided."}), 400

    try:
        result = predict(applicant_data, model_type=model_type, bias_flag=bias_flag)
        return jsonify(result), 200
    except Exception as e:
        app.logger.error(f"Prediction error: {e}")
        return jsonify({"error": f"An error occurred during prediction: {e}"}), 500

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True)