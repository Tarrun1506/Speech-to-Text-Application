import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import whisper
from bson.objectid import ObjectId
import datetime

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# MongoDB Setup (Ensure MongoDB is running locally or provide connection string)
mongo_client = MongoClient('mongodb://localhost:27017/')
db = mongo_client['speech_to_text_db']
transcriptions_collection = db['transcriptions']

# Load Whisper Model (This might take time on first run)
print("Loading Whisper model...")
model = whisper.load_model("base") 
print("Whisper model loaded.")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "flask-backend"}), 200

@app.route('/api/transcriptions', methods=['GET'])
def get_transcriptions():
    try:
        transcriptions = list(transcriptions_collection.find().sort("createdAt", -1))
        for t in transcriptions:
            t['_id'] = str(t['_id'])
        return jsonify(transcriptions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/transcriptions/<id>', methods=['GET'])
def get_transcription(id):
    try:
        transcription = transcriptions_collection.find_one({"_id": ObjectId(id)})
        if transcription:
            transcription['_id'] = str(transcription['_id'])
            return jsonify(transcription), 200
        else:
            return jsonify({"error": "Transcription not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/transcriptions/<id>', methods=['DELETE'])
def delete_transcription(id):
    try:
        result = transcriptions_collection.delete_one({"_id": ObjectId(id)})
        if result.deleted_count > 0:
            return jsonify({"message": "Transcription deleted"}), 200
        else:
            return jsonify({"error": "Transcription not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/transcriptions/<id>', methods=['PUT'])
def update_transcription(id):
    try:
        data = request.json
        if not data or 'text' not in data:
             return jsonify({"error": "No text provided"}), 400
             
        result = transcriptions_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"text": data['text']}}
        )
        
        if result.matched_count > 0:
            return jsonify({"message": "Transcription updated"}), 200
        else:
            return jsonify({"error": "Transcription not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = file.filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        try:
            # Transcribe
            result = model.transcribe(filepath, fp16=False)
            
            # Save to DB
            transcription_entry = {
                "filename": filename,
                "text": result['text'],
                "language": result['language'], # Save detected language
                "segments": result['segments'], # Detailed segments with timestamps
                "createdAt": datetime.datetime.utcnow(),
                "status": "completed"
            }
            
            insert_result = transcriptions_collection.insert_one(transcription_entry)
            
            # cleanup file if needed, or keep it
            # os.remove(filepath) 

            return jsonify({
                "message": "Transcription successful",
                "id": str(insert_result.inserted_id),
                "text": result['text']
            }), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/generate-summary', methods=['POST'])
def generate_summary():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    
    transcription_text = data['text']
    
    # Payload for Ollama
    ollama_payload = {
        "model": "llama3.2:3b",
        "prompt": f"Summarize the following text concisely:\n\n{transcription_text}",
        "stream": False
    }

    try:
        # Call local Ollama instance
        import requests
        response = requests.post('http://localhost:11434/api/generate', json=ollama_payload)
        
        if response.status_code == 200:
            summary = response.json().get('response', '')
            return jsonify({"summary": summary}), 200
        else:
            return jsonify({"error": f"Ollama Error: {response.text}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # usage_reloader=False prevents WinError 10038 on Windows
    app.run(debug=True, port=5000, use_reloader=False)
