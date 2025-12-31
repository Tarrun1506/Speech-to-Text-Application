import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, X, Loader2, FileAudio } from 'lucide-react';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const uploadFile = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });
            setIsUploading(false);
            onUploadSuccess();
        } catch (err) {
            console.error(err);
            setError('Failed to upload and transcribe. Please try again.');
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">Upload & Transcribe</h2>

            <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {!file ? (
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <Upload size={32} />
                        </div>
                        <p className="text-xl font-medium text-gray-700 mb-2">Click to upload or drag & drop</p>
                        <p className="text-gray-500 text-sm">MP3, WAV, M4A, OGG (max 25MB)</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <FileAudio size={32} />
                        </div>
                        <p className="text-lg font-medium text-gray-800 mb-2">{file.name}</p>
                        <p className="text-gray-500 text-sm mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                        {!isUploading && (
                            <button
                                onClick={() => setFile(null)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                            >
                                <X size={16} className="mr-1" /> Remove File
                            </button>
                        )}
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="audio/*"
                />
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {isUploading && (
                <div className="mt-8">
                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>Processing...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-2">Transcribing audio (this may take a while using local models)</p>
                </div>
            )}

            {file && !isUploading && (
                <button
                    onClick={uploadFile}
                    className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                    <Upload className="mr-2" /> Start Transcription
                </button>
            )}
        </div>
    );
};

export default FileUpload;
