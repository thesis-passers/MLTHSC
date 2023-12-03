from flask import Flask, json, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
# import classifier2 as MLTHSC
from api import classifier as MLTHSC
from werkzeug.utils import secure_filename
import os
from api.picture import extract_text_from_screenshot
from api.link import extract_link_post

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/")
def hello_world():
    return send_file('index.html')

@app.route('/frontend/<path:filename>')
def serve_static(filename):
    return send_from_directory('frontend', filename)


@app.route("/labels", methods=['GET'])
def get_labels():

    # http://127.0.0.1:5000/labels?input=di%20na%20natauhan%20tong%20mga%20animal%20na%20bakla

    input_text = request.args.get('input', '')

    labels = MLTHSC.get_predictions(input_text)

    data = {
        "text": input_text,
        "labels": labels
    }

    return jsonify(data)


@app.route('/upload', methods=['POST'])
def upload():
    try:
        print("upload test")

        # return jsonify({"text": "image"})

        if 'image' not in request.files:
            print("image NOT in request file")
            return jsonify({"error": "No file part"}), 400
        
        print("image in request file")

        file = request.files['image']

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if file:

            extracted_text = extract_text_from_screenshot(file)
            print(f'extracted_text {extracted_text}')

        return jsonify({"hateSpeech": extracted_text})

    except Exception as e:
        print('Error:', str(e))
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/extract-link-post', methods=['POST'])
def extract_link_posts():
    try:
        data = request.json

        # Ensure 'link' is present in the JSON data
        if 'link' not in data:
            return jsonify({"error": "Link is missing"}), 400

        link = data['link']

        # Call the extract_link_post function from link.py
        link_data = extract_link_post(link)
        
        # Return the extracted data as JSON
        return jsonify(link_data)

    except Exception as e:
        print('Error:', str(e))
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=8080)