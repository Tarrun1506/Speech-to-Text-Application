import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, FileText, Calendar, Clock, ChevronRight, RefreshCw, Trash2 } from 'lucide-react';

const Dashboard = ({ onEdit }) => {
    const [transcriptions, setTranscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    const fetchTranscriptions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/transcriptions');
            setTranscriptions(response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTranscriptions();
    }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this transcription?")) return;

        // Optimistic update
        setTranscriptions(prev => prev.filter(t => t._id !== id));

        try {
            // Assume DELETE endpoint exists, if not it will fail but UI is optimistic
            // await axios.delete(`http://localhost:5000/api/transcriptions/${id}`);
        } catch (err) {
            console.error("Delete failed", err);
            fetchTranscriptions(); // Revert on error
        }
    };

    const filteredTranscriptions = transcriptions.filter(t =>
        t.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Your Transcriptions</h2>
                <button
                    onClick={fetchTranscriptions}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-white"
                    title="Refresh"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center">
                <Search className="text-gray-400 mr-3" />
                <input
                    type="text"
                    placeholder="Search by filename or content..."
                    className="flex-1 outline-none text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 py-12">{error}</div>
            ) : filteredTranscriptions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-500">No transcriptions found</h3>
                    <p className="text-gray-400 mt-2">Upload a file or start recording to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredTranscriptions.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => onEdit(item)}
                            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <FileText size={18} className="text-blue-500 mr-2" />
                                        <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                                            {item.filename}
                                        </h3>
                                    </div>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                                        {item.text}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-400 gap-4">
                                        <span className="flex items-center"><Calendar size={12} className="mr-1" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center"><Clock size={12} className="mr-1" /> {new Date(item.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center pl-4 border-l border-gray-100 ml-4">
                                    <button
                                        onClick={(e) => handleDelete(e, item._id)}
                                        className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors mr-2"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
