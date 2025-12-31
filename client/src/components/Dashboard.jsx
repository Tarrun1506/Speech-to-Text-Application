import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, FileAudio, Calendar, Clock, ChevronRight, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [transcriptions, setTranscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/transcriptions');
            setTranscriptions(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching history:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this transcription?')) {
            try {
                // Optimistic update
                setTranscriptions(transcriptions.filter(t => t._id !== id));
                await axios.delete(`http://localhost:5000/api/transcriptions/${id}`);
            } catch (error) {
                console.error('Error deleting:', error);
                fetchHistory();
            }
        }
    };

    const filteredTranscriptions = transcriptions.filter(t => {
        const langCode = t.language ? t.language.toLowerCase() : '';
        const langName = t.language ? new Intl.DisplayNames(['en'], { type: 'language' }).of(t.language).toLowerCase() : '';
        return t.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            langCode.includes(searchTerm.toLowerCase()) ||
            langName.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Your Transcripts</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search transcripts (name, text, language)..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredTranscriptions.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <FileAudio className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No transcriptions found</h3>
                    <p className="text-gray-500 mt-2">Upload an audio file or start recording to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredTranscriptions.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => navigate(`/editor/${item._id}`)}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                        <FileAudio size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center">
                                            {item.filename}
                                            {item.language && (
                                                <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium uppercase border border-blue-200">
                                                    {new Intl.DisplayNames(['en'], { type: 'language' }).of(item.language) || item.language}
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <Calendar size={14} className="mr-1" />
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center">
                                                <Clock size={14} className="mr-1" />
                                                {new Date(item.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleDelete(e, item._id)}
                                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                            <p className="mt-4 text-gray-600 text-sm line-clamp-2">
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default Dashboard;
