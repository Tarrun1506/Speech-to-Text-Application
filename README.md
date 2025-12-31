# WhisperNote - AI Speech to Text Application

WhisperNote is a powerful full-stack application that transforms your audio into text with high accuracy using OpenAI's Whisper model. It goes beyond simple transcription by providing AI-powered summarization, language detection, and a seamless editing experience.

## 🌟 Key Features

*   **🎙️ Live Recording**: Record audio directly from your browser with real-time visual feedback.
*   **📁 File Upload**: Drag & drop support for MP3, WAV, M4A, and OGG files.
*   **📝 High-Accuracy Transcription**: Powered by OpenAI's Whisper (running locally) for industry-leading speech recognition.
*   **🤖 AI Summarization**: Instantly generate concise summaries of your transcripts using **Llama 3.2** (via Ollama).
*   **🌍 Language Detection**: Automatically detects and displays the language of the spoken audio (e.g., [ENGLISH], [FRENCH]).
*   **✏️ Smart Editor**: Review, edit, and save changes to your transcriptions. Updates are persisted instantly.
*   **📊 History Dashboard**: Organize, search, and manage all your past transcriptions in one place.
*   **🗑️ Management**: Delete unwanted transcriptions with ease.
*   **📤 Export**: Download your work as formatted text (.txt) or PDF files.

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, React Router, Lucide React, Wavesurfer.js
*   **Backend**: Python Flask, PyMongo
*   **AI/ML**: OpenAI Whisper (Speech-to-Text), Ollama + Llama 3.2 (Summarization)
*   **Database**: MongoDB

## 📋 Prerequisites

Before running WhisperNote, ensure you have the following installed:

1.  **Node.js**: [Download](https://nodejs.org/)
2.  **Python (3.8+)**: [Download](https://www.python.org/)
3.  **MongoDB**: [Download Community Server](https://www.mongodb.com/try/download/community) (Ensure it's running as a service)
4.  **Ollama**: [Download](https://ollama.com/) (Required for summarization)
    *   Run: `ollama pull llama3.2:3b`
5.  **FFmpeg**: Essential for audio processing.

### ⚡ Rapid FFmpeg Setup (Windows)
We've included a script to automate this:
1.  Right-click `install_ffmpeg.ps1` in the project folder.
2.  Select **"Run with PowerShell"**.
3.  **Restart your computer** after it finishes.

## 🚀 How to Run

You need to run the backend and frontend simultaneously in two separate terminals.

### 1️⃣ Start the Backend
```bash
cd server
pip install -r requirements.txt
python app.py
```
*Wait until you see "Whisper model loaded".*

### 2️⃣ Start the Frontend
```bash
cd client
npm install
npm run dev
```

Open your browser and navigate to the link shown (e.g., `http://localhost:5173`).

## 🧩 Usage Guide

1.  **Home**: Choose to "Upload Audio" or "Live Record".
2.  **Recording/Upload**: Wait for the transcription to finish. You'll be redirected to the Editor.
3.  **Editor**:
    *   **Edit**: Fix any typos in the text area and click **Save**.
    *   **Summarize**: Click the **✨ Summarize** button to get an AI summary.
    *   **Export**: Use the PDF/TXT buttons to download.
4.  **Dashboard**: access "Your Transcripts" from the top bar to view history or delete old files.

## 🔧 Troubleshooting

*   **"Transcription not found"**: Restart the Flask server (`python app.py`) if you recently updated the code.
*   **Upload Fails**: Ensure FFmpeg is installed and added to your system PATH.
*   **Summarization Error**: Ensure Ollama is running in the background (`ollama serve`).
