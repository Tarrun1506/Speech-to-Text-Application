# WhisperNote - AI Speech to Text Application

A full-stack application that provides highly accurate speech transcription using OpenAI's Whisper model. Built with React, Flask, and MongoDB.

## Features
- 🎙️ **Live Recording**: Record audio directly from your browser with real-time visualization.
- 📁 **File Upload**: Support for MP3, WAV, M4A, and OGG files.
- 📝 **AI Transcription**: Uses OpenAI's Whisper (local model) for robust speech recognition.
- ✏️ **Editor**: View and edit your transcriptions.
- 💾 **History**: All transcriptions are saved to MongoDB.
- 📤 **Export**: Download results as TXT or PDF.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Wavesurfer.js
- **Backend**: Python Flask
- **Database**: MongoDB
- **AI**: OpenAI Whisper (running locally)

## Prerequisites

Before running the app, you need to have a few things installed on your computer.

1.  **Node.js**: Download and install from [nodejs.org](https://nodejs.org/).
2.  **Python**: Download and install Python (version 3.8 or higher) from [python.org](https://www.python.org/).
3.  **MongoDB**: Download **MongoDB Community Server** from [mongodb.com](https://www.mongodb.com/try/download/community) and install it.
    *   *Important*: During installation, keep "Install MongoDB as a Service" checked.
4.  **FFmpeg**: This is required for the AI to process audio. **See the step below.**

### 🖥️ FFmpeg Installation (Crucial Step)
The application will **not work** without FFmpeg. We have included an automatic installer for you.

**Option A: Automatic Installation (Easier)**
1.  Open your project folder in File Explorer.
2.  Right-click on the `install_ffmpeg.ps1` file (if you don't see it, it's in the root folder).
3.  Select **"Run with PowerShell"**.
4.  Wait for the script to finish downloading and installing.
5.  **Restart your computer** or close and reopen all terminal windows to ensure it works.

**Option B: Manual Installation (If Option A fails)**
1.  **Download**: Go to [gyan.dev](https://www.gyan.dev/ffmpeg/builds/ffmpeg-git-full.7z) and download the build.
2.  **Extract**: 
    *   Unzip the downloaded file. 
    *   Rename the extracted folder (e.g., `ffmpeg-2025...`) to just `ffmpeg`.
    *   Move this `ffmpeg` folder to your C drive: `C:\ffmpeg`.
3.  **Add to PATH**:
    *   Press the **Windows Key** on your keyboard and search for **"Edit the system environment variables"**. Click it.
    *   Click the **"Environment Variables..."** button.
    *   In the bottom section ("System variables"), find the variable named **Path** and select it. Click **Edit**.
    *   Click **New** on the right side.
    *   Type exactly: `C:\ffmpeg\bin`
    *   Click **OK** on all three open windows to save.
4.  **Verify**: Open a new terminal and type `ffmpeg -version`. If it prints details, you succeeded!

---

## 🚀 How to Run the App

You need to open **two** separate terminals (command prompts) to run the backend and frontend at the same time.

### Step 1: Start the Backend (Server)
1.  Open a terminal/command prompt.
2.  Navigate to the project folder:
    ```bash
    cd path\to\Speech_to_Text\server
    ```
3.  Install the required Python tools (run this once):
    ```bash
    pip install -r requirements.txt
    ```
4.  Start the server:
    ```bash
    python app.py
    ```
    *You will see "Whisper model loaded" when it's ready.*

### Step 2: Start the Frontend (User Interface)
1.  Open a **new, second** terminal window.
2.  Navigate to the client folder:
    ```bash
    cd path\to\Speech_to_Text\client
    ```
3.  Install the interface tools (run this once):
    ```bash
    npm install
    ```
4.  Start the interface:
    ```bash
    npm run dev
    ```
5.  Hold `Ctrl` and click the link shown (usually `http://localhost:5173`) to open the app in your browser.

## Troubleshooting
- **"ffmpeg is not recognized"**: If you see this error, run the `install_ffmpeg.ps1` script again and **restart your computer**.
- **Upload fails**: Check the terminal running `python app.py` for error messages. Ensure MongoDB is running.

