from flask import Flask, request, jsonify
from transformers import BartForConditionalGeneration, BartTokenizer
import torch

app = Flask(__name__)

# Load model and tokenizer
model_name = "facebook/bart-large-cnn"
tokenizer = BartTokenizer.from_pretrained(model_name)
model = BartForConditionalGeneration.from_pretrained(model_name)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    text = data.get("text", "")

    if not text.strip():
        return jsonify({"summary": ""})

    inputs = tokenizer.encode(text, return_tensors="pt", truncation=True, max_length=1024).to(device)

    input_len = inputs.shape[-1]
    min_len = max(200, int(input_len * 0.4))    # ~40% of input length
    max_len = min(450, int(input_len * 0.7))    # ~70% of input length

    summary_ids = model.generate(
        inputs,
        max_length=max_len,
        min_length=min_len,
        num_beams=4,
        length_penalty=2.0,
        early_stopping=True
    )

    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return jsonify({"summary": summary})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5197)
