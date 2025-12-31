import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText, Download, Check } from 'lucide-react';
import axios from 'axios';
import { jsPDF } from "jspdf";

const TranscriptEditor = ({ transcription, onBack }) => {
    const [text, setText] = useState(transcription?.text || '');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        if (transcription) {
            setText(transcription.text);
        }
    }, [transcription]);

    const handleSave = async () => {
        if (!transcription) return;
        setIsSaving(true);
        // In a real app, we would have an update endpoint
        // For now, we'll simulate a save or just implement the update in backend if planned
        // Let's assume PUT /api/transcriptions/:id exists or we just store locally for demo

        // Implementation of save logic:
        // await axios.put(`http://localhost:5000/api/transcriptions/${transcription._id}`, { text });

        setTimeout(() => {
            setIsSaving(false);
            setLastSaved(new Date());
        }, 800);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(transcription.filename || "Transcription", 10, 10);
        doc.setFontSize(12);

        const splitText = doc.splitTextToSize(text, 180);
        doc.text(splitText, 10, 20);
        doc.save(`${transcription.filename || 'transcription'}.pdf`);
    };

    const exportTXT = () => {
        const element = document.createElement("a");
        const file = new Blob([text], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${transcription.filename || 'transcription'}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    if (!transcription) return <div>No transcription selected</div>;

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="mr-2" size={20} />
                    Back to Dashboard
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={exportTXT}
                        className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                        <FileText size={16} className="mr-2" /> TXT
                    </button>
                    <button
                        onClick={exportPDF}
                        className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                        <Download size={16} className="mr-2" /> PDF
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        {isSaving ? <span className='flex items-center'>Saving...</span> : <span className='flex items-center'><Save size={16} className="mr-2" /> Save Changes</span>}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-gray-800">{transcription.filename}</h3>
                        <p className="text-xs text-gray-500">
                            {new Date(transcription.createdAt).toLocaleString()} • {transcription.duration ? `${transcription.duration}s` : 'Audio'}
                        </p>
                    </div>
                    {lastSaved && <span className="text-xs text-green-600 flex items-center"><Check size={12} className="mr-1" /> Saved {lastSaved.toLocaleTimeString()}</span>}
                </div>
                <textarea
                    className="flex-1 w-full p-6 resize-none focus:outline-none text-gray-800 leading-relaxed text-lg"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Transcription content..."
                />
            </div>
        </div>
    );
};

export default TranscriptEditor;
