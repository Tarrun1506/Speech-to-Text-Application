import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Download, FileText, Check, X } from 'lucide-react';
import jsPDF from 'jspdf';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const TranscriptEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transcription, setTranscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [summary, setSummary] = useState(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    useEffect(() => {
        const fetchTranscription = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/transcriptions/${id}`);
                setTranscription(response.data);
                setText(response.data.text);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load transcription", error);
                alert("Transcription not found");
                navigate('/transcripts');
            }
        };

        if (id) {
            fetchTranscription();
        }
    }, [id, navigate]);

    const handleSave = async () => {
        if (!transcription) return;
        setIsSaving(true);
        try {
            await axios.put(`http://localhost:5000/api/transcriptions/${id}`, { text });
            setLastSaved(new Date());
        } catch (err) {
            console.error("Failed to save", err);
            alert("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
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

        // Add text
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

    if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (!transcription) return <div>No transcription found</div>;

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('/transcripts')}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="mr-2" size={20} />
                    Back to All Transcripts
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
                            <h3 className="font-semibold text-gray-800 flex items-center">
                                {transcription.filename}
                                {transcription.language && (
                                    <span className="ml-3 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium uppercase border border-blue-200">
                                        {new Intl.DisplayNames(['en'], { type: 'language' }).of(transcription.language) || transcription.language}
                                    </span>
                                )}
                            </h3>
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
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-purple-800 font-bold flex items-center">
                                ✨ AI Summary
                            </h3>
                            <button
                                onClick={() => setSummary(null)}
                                className="text-purple-400 hover:text-purple-700 transition-colors p-1 hover:bg-purple-100 rounded-full"
                            >
                                <X size={18} />
                            </button>
                        </div>
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
