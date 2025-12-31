import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Mic, Square, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LiveRecorder = () => {
    const navigate = useNavigate();
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);

    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Initialize Wavesurfer for playback (if needed later) or just visualization container
        // For live recording visualizer, we might need Web Audio API directly drawing on canvas
        // But WaveSurfer also has a microphone plugin, let's keep it simple with Web Audio API for live viz first

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = uploadRecording;

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setDuration(0);

            // Start visualization
            visualize(stream);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Stop all tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    const visualize = (stream) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 256;
        source.connect(analyzer);

        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const canvasCtx = canvas.getContext("2d");

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyzer.getByteFrequencyData(dataArray);

            canvasCtx.fillStyle = 'rgb(249, 250, 251)'; // Match bg-gray-50
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;

                // Gradient color
                const r = barHeight + 25 * (i / bufferLength);
                const g = 250 * (i / bufferLength);
                const b = 50;

                canvasCtx.fillStyle = `rgb(${r},${g},${b})`;
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();
    };

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const uploadRecording = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], `recording_${new Date().getTime()}.wav`, { type: 'audio/wav' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setIsProcessing(false);
            navigate(`/editor/${response.data.id}`);
        } catch (error) {
            console.error(error);
            setIsProcessing(false);
            alert("Failed to upload recording.");
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">Live Recording</h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                <canvas
                    ref={canvasRef}
                    width="600"
                    height="150"
                    className="w-full h-40 bg-gray-50 rounded-lg mb-8"
                />

                <div className="text-4xl font-mono text-gray-700 font-bold mb-8">
                    {formatTime(duration)}
                </div>

                <div className="flex justify-center gap-4">
                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            disabled={isProcessing}
                            className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all transform hover:scale-105"
                        >
                            <Mic size={32} />
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-900 text-white shadow-lg transition-all transform hover:scale-105"
                        >
                            <Square size={32} fill="currentColor" />
                        </button>
                    )}
                </div>

                {isRecording && <p className="text-red-500 mt-4 animate-pulse font-medium">Recording...</p>}
            </div>

            {isProcessing && (
                <div className="flex items-center justify-center text-blue-600">
                    <Loader2 className="animate-spin mr-2" />
                    <span>Processing transcription...</span>
                </div>
            )}
        </div>
    );
};

export default LiveRecorder;
