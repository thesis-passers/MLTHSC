import os
import onnx
import onnxruntime
from transformers import BertTokenizer
import numpy as np

# onnx_path = os.getcwd() + '\\models\\best_trained_model.onnx' # Locally
onnx_path = os.getcwd() + '/models/best_trained_model.onnx'
onnx_model = onnx.load(onnx_path)
ort_session = onnxruntime.InferenceSession(onnx_path)

tokenizer = BertTokenizer.from_pretrained('gklmip/bert-tagalog-base-uncased')
model_name = "gklmip/bert-tagalog-base-uncased"
LABELS = ['Age', 'Gender', 'Physical', 'Race', 'Religion', 'Others']

def _positive_sigmoid(x):
    return 1 / (1 + np.exp(-x))

def _negative_sigmoid(x):
    exp = np.exp(x)
    return exp / (exp + 1)

def sigmoid(x):
    positive = x >= 0
    negative = ~positive

    result = np.empty_like(x, dtype=float)
    result[positive] = _positive_sigmoid(x[positive])
    result[negative] = _negative_sigmoid(x[negative])

    return result

def preprocess_text(text):
    encoding = tokenizer(text, padding="max_length", truncation=True, max_length=128, return_tensors='pt')
    
    input_ids = encoding['input_ids'].numpy()
    attention_mask = encoding['attention_mask'].numpy()
    
    return {'input_ids': input_ids, 'attention_mask': attention_mask}

def get_predictions(test_sentence):

    encoded_test_sentence = preprocess_text(test_sentence)

    ort_inputs = {'input_ids': encoded_test_sentence['input_ids'], 'attention_mask': encoded_test_sentence['attention_mask']}
    ort_outputs = ort_session.run(None, ort_inputs)

    logits = ort_outputs[0]

    predictions = sigmoid(logits.flatten())  # Apply sigmoid to get probabilities

    label_probabilities = [{"name": label, "probability": f"{prob * 100:.2f}%"} for label, prob in zip(LABELS, predictions)]

    label_probabilities = sorted(label_probabilities, key=lambda item: -float(item["probability"][:-1]))

    threshold = 0.5

    predicted_labels = [(label, f"{pred*100:.2f}%") for label, pred in zip(LABELS, predictions) if pred >= threshold]
    print("Input:",  test_sentence)
    print("Probabilities: ", label_probabilities)

    print("Labels:")
    for label, probability in predicted_labels:
        print(f"({label}, {probability})")

    return label_probabilities
