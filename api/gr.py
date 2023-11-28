import torch
from transformers import BertTokenizer
import gradio as gr
import classifier as MLTHSC
import os

tokenizer = BertTokenizer.from_pretrained('gklmip/bert-tagalog-base-uncased')
model_name = "gklmip/bert-tagalog-base-uncased"
LABELS = ['Age', 'Gender', 'Physical', 'Race', 'Religion', 'Others']

model = MLTHSC.HateSpeechClassifier(model_name, len(LABELS))
model.load_state_dict(torch.load(os.getcwd() + '\\models\\best_trained_model.pth'))

def preprocess_text(text):
    encoding = tokenizer(text, padding="max_length", truncation=True, max_length=128, return_tensors='pt')
    return encoding


def preprocess_text(text):
    encoding = tokenizer(text, padding="max_length", truncation=True, max_length=128, return_tensors='pt')
    return encoding

def predict_labels(text):
    encoded_text = preprocess_text(text)

    model.eval()
    with torch.no_grad():
        logits = model(ids=encoded_text['input_ids'], mask=encoded_text['attention_mask'])
        
    predictions = logits.flatten().sigmoid()
    probs = [str(round(pred.item() * 100, 2)) + "%" for pred in predictions]

    threshold = 0.5
    predicted_labels = list(zip(LABELS, probs))

    predicted_labels.sort(key=lambda x: float(x[1][:-1]), reverse=True)

    print(predicted_labels)

    return predicted_labels


iface = gr.Interface(
    fn=predict_labels,
    inputs=gr.Textbox(label="Input Text"),
    outputs=[gr.HighlightedText(label="Highlight")],
    live=True,
    title="Tagalog Hate Speech Classifier",
    description="Enter a hate speech in Tagalog to classify its targets: Age, Gender, Physical, Race, Religion, Others.",
)

iface.launch()