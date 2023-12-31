from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
from picture import extract_text_from_screenshot, count_lines
from link import extract_link_post

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return send_file('main.html')

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

if __name__ == '__main__':
    app.run(debug=True, port=3000)