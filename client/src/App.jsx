import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import LiveRecorder from './components/LiveRecorder';
import TranscriptEditor from './components/TranscriptEditor';
import { Mic, Upload, List, FileText } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTranscription, setSelectedTranscription] = useState(null);

  const handleEdit = (transcription) => {
    setSelectedTranscription(transcription);
    setActiveTab('editor');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onEdit={handleEdit} />;
      case 'upload':
        return <FileUpload onUploadSuccess={() => setActiveTab('dashboard')} />;
      case 'record':
        return <LiveRecorder onRecordingComplete={() => setActiveTab('dashboard')} />;
      case 'editor':
        return <TranscriptEditor transcription={selectedTranscription} onBack={() => setActiveTab('dashboard')} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar / Navigation */}
      <div className="flex h-screen">
        <aside className="w-64 bg-white border-r border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              WhisperNote
            </h1>
          </div>
          <nav className="mt-6 px-4 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <List className="w-5 h-5 mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'upload' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Upload className="w-5 h-5 mr-3" />
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('record')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'record' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Mic className="w-5 h-5 mr-3" />
              Live Record
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
