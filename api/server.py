from flask import Flask, json, jsonify, request
from flask_cors import CORS
import classifier as MLTHSC
import random
from werkzeug.utils import secure_filename
import os
from picture import extract_text_from_screenshot, count_lines
from link import extract_link_post

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


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


@app.route("/random_labels", methods=['GET'])
def get_random_labels():

    input_text = request.args.get('input', '')

    labels = MLTHSC.get_predictions(input_text)

    sample_json = [
        {
            "labels": [
                {
                    "name": "Gender",
                    "probability": "95.15%"
                },
                {
                    "name": "Race",
                    "probability": "14.40%"
                },
                {
                    "name": "Physical",
                    "probability": "10.09%"
                },
                {
                    "name": "Age",
                    "probability": "8.11%"
                },
                {
                    "name": "Religion",
                    "probability": "7.61%"
                },
                {
                    "name": "Others",
                    "probability": "3.16%"
                }
            ],
            "text": "di na natauhan tong mga animal na bakla"
        }, 
        {
        "labels": [
            {
            "name": "Age",
            "probability": "90.39%"
            },
            {
            "name": "Physical",
            "probability": "21.30%"
            },
            {
            "name": "Others",
            "probability": "8.25%"
            },
            {
            "name": "Race",
            "probability": "6.87%"
            },
            {
            "name": "Gender",
            "probability": "6.16%"
            },
            {
            "name": "Religion",
            "probability": "4.03%"
            }
            ],
            "text": "Tanginang nga batang paslit na to ang babaho pota dikit pa ng dikit sakin"
            },
            {
            "labels": [
            {
            "name": "Others",
            "probability": "47.97%"
            },
            {
            "name": "Physical",
            "probability": "41.99%"
            },
            {
            "name": "Religion",
            "probability": "8.62%"
            },
            {
            "name": "Race",
            "probability": "8.55%"
            },
            {
            "name": "Gender",
            "probability": "2.61%"
            },
            {
            "name": "Age",
            "probability": "1.71%"
            }
            ],
            "text": "Bobo mo Daniella tanga mahulog ka sana"
            }

        ]

    rand = random.randint(0,3)  

    text = sample_json[rand]["text"]
    labels = sample_json[rand]["labels"]

    data = {
        "text": text,
        "labels": labels
    }

    return jsonify(data)



# @app.route('/')
# def index():
#     return send_file('main.html')

@app.route('/upload', methods=['POST'])
def upload():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['image']

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if file:
            # Generate a secure filename for the uploaded file
            filename = secure_filename(file.filename)

            # Create a unique folder for each user
            user_folder = os.path.join(app.config['UPLOAD_FOLDER'], 'user_' + str(hash(request.remote_addr)))
            os.makedirs(user_folder, exist_ok=True)

            # Save the file in the user's folder with the secure filename
            file_path = os.path.join(user_folder, filename)
            file.save(file_path)

            extracted_text = extract_text_from_screenshot(file_path)
            line_count = count_lines(extracted_text)

            # Remove the uploaded file
            os.remove(file_path)

            return jsonify({"hateSpeech": extracted_text, "lineCount": line_count})

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
    app.run(debug=True)