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

if __name__ == '__main__':
    # usage_reloader=False prevents WinError 10038 on Windows
    app.run(debug=True, port=5000, use_reloader=False)
