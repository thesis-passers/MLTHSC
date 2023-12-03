from PIL import Image
import pytesseract
import re

pytesseract.pytesseract.tesseract_cmd = r"D:/Program Files/Tesseract-OCR/tesseract.exe"

def extract_text_from_screenshot(file):
    try:
        # Use Tesseract to do OCR on the image
        result = pytesseract.image_to_string(Image.open(file), lang='eng')

        # Apply modifications
        modified_text = exclude_lines_not_starting_with_text_and_short_lines(
            exclude_submitted_line(exclude_username_buttons_and_brackets(result))
        )

        return modified_text.strip()

    except Exception as e:
        print(f"Error: {e}")
        return None
    

def exclude_username_buttons_and_brackets(text):
    pattern = re.compile(r'(?:@|u|r\/)(\w+)[^[\]]+?([\s\S]+)')
    match = pattern.search(text)

    if match:
        text_after_username = match.group(2).strip()
        text_without_brackets = re.sub(r'\[.*?\]', '', text_after_username)
        return text_without_brackets

    return text

def exclude_lines_not_starting_with_text_and_short_lines(text):
    lines = text.split('\n')
    filtered_lines = [line for line in lines if re.match(r'^\s*[a-zA-Z]', line) and len(line.split()) > 2]
    return '\n'.join(filtered_lines)

def exclude_submitted_line(text):
    return re.sub(r'^Submitted:.*', '', text, flags=re.MULTILINE)



# if __name__ == "__main__":
#     # Replace 'path/to/your/image.jpg' with the actual path to your image file
#     image_path = './images/reddit.PNG'

#     extracted_text = extract_text_from_screenshot(image_path)

#     if extracted_text:
#         print("Extracted Text:")
#         print(extracted_text)
#     else:
#         print("Text extraction failed.")
