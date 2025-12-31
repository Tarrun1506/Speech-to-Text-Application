import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText, Download, Check } from 'lucide-react';
import axios from 'axios';
import { jsPDF } from "jspdf";

const TranscriptEditor = ({ transcription, onBack }) => {
    const [text, setText] = useState(transcription?.text || '');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [summary, setSummary] = useState(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    useEffect(() => {
        if (transcription) {
            setText(transcription.text);
            setSummary(null); // Reset summary on new transcription
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

    const handleSummarize = async () => {
        if (!text) return;
        setIsSummarizing(true);
        try {
            const response = await axios.post('http://localhost:5000/api/generate-summary', { text });
            setSummary(response.data.summary);
        } catch (err) {
            console.error("Summarization failed", err);
            alert("Failed to generate summary. Ensure Ollama is running.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(transcription.filename || "Transcription", 10, 10);
        doc.setFontSize(12);

        const splitText = doc.splitTextToSize(text, 180);
        doc.text(splitText, 10, 20);

        // Add summary if exists
        if (summary) {
            doc.addPage();
            doc.setFontSize(14);
            doc.text("Summary", 10, 20);
            doc.setFontSize(12);
            const splitSummary = doc.splitTextToSize(summary, 180);
            doc.text(splitSummary, 10, 30);
        }

        doc.save(`${transcription.filename || 'transcription'}.pdf`);
    };

    const exportTXT = () => {
        let content = text;
        if (summary) {
            content += "\n\n--- SUMMARY ---\n\n" + summary;
        }

        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
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
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${summary ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                    >
                        {isSummarizing ? (
                            'Generating...'
                        ) : (
                            <span className="flex items-center">
                                {summary ? <span className="mr-1">✨ Summarized</span> : <span className="mr-1">✨ Summarize</span>}
                            </span>
                        )}
                    </button>
                    <div className="h-8 w-px bg-gray-300 mx-1"></div>
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

            <div className="flex gap-6 h-full overflow-hidden">
                {/* Main Transcription Area */}
                <div className={`flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${summary ? 'w-2/3' : 'w-full'}`}>
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

                {/* Summary Sidebar */}
                {summary && (
                    <div className="w-1/3 bg-purple-50 rounded-xl border border-purple-100 p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                        <h3 className="text-purple-800 font-bold mb-4 flex items-center">
                            ✨ AI Summary
                        </h3>
                        <div className="prose prose-sm prose-purple text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {summary}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TranscriptEditor;
