import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import LiveRecorder from './components/LiveRecorder';
import TranscriptEditor from './components/TranscriptEditor';
import { Mic, Upload, List, FileText, Home, ArrowLeft } from 'lucide-react';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo / Home Link */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Mic size={18} />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              WhisperNote
            </span>
          </Link>

          {/* Right Side Links */}
          <div className="flex items-center gap-4">
            {location.pathname === '/' ? (
              <Link
                to="/transcripts"
                className="flex items-center px-4 py-2 rounded-full font-medium text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all"
              >
                <List size={18} className="mr-2" />
                Your Transcripts
              </Link>
            ) : (
              <Link
                to="/"
                className="flex items-center px-4 py-2 rounded-full font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all border border-blue-100"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Home
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/transcripts" element={<Dashboard />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/record" element={<LiveRecorder />} />
          <Route path="/editor/:id" element={<TranscriptEditor />} />
        </Routes>
      </main>
    </div>
  );
}

function HomeView() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
          WhisperNote
        </h1>
        <p className="text-xl text-gray-500">AI-Powered Speech Transcription</p>
      </div>

      <div className="flex gap-8 w-full max-w-4xl justify-center">

        {/* Upload Button Card */}
        <Link
          to="/upload"
          className="flex-1 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:border-blue-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col items-center text-center no-underline"
        >
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Upload size={48} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Upload Audio</h3>
          <p className="text-gray-500">Transcribe MP3, WAV, or M4A files instantly.</p>
        </Link>

        {/* Record Button Card */}
        <Link
          to="/record"
          className="flex-1 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:border-red-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col items-center text-center no-underline"
        >
          <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Mic size={48} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Live Record</h3>
          <p className="text-gray-500">Record directly from your microphone.</p>
        </Link>
      </div>
    </div>
  );
}

export default App;
