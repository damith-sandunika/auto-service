import { useState, useEffect, useRef } from 'react';

export default function useVideoRecorder({ show, onClose, onUpload, maxDuration }) {
    const [stream, setStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreparing, setIsPreparing] = useState(false);
    const videoRef = useRef(null);
    const previewRef = useRef(null);
    const timerIntervalRef = useRef(null);

    useEffect(() => {
        if (show) { startCamera(); } else { stopCamera(); resetRecording(); }
    }, [show]);

    useEffect(() => {
        if (stream && videoRef.current && !previewUrl) { videoRef.current.srcObject = stream; }
    }, [stream, previewUrl]);

    useEffect(() => {
        if (isRecording) {
            timerIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= maxDuration) { stopRecording(); return prev; }
                    return prev + 1;
                });
            }, 1000);
        } else { clearInterval(timerIntervalRef.current); }
        return () => clearInterval(timerIntervalRef.current);
    }, [isRecording, maxDuration]);

    const startCamera = async () => {
        setIsPreparing(true); setPreviewUrl(null); setRecordedChunks([]);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
            setStream(mediaStream);
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Could not access camera. Please ensure permissions are granted.');
            onClose();
        } finally { setIsPreparing(false); }
    };

    const stopCamera = () => {
        if (stream) { stream.getTracks().forEach(track => track.stop()); setStream(null); }
    };

    const startRecording = () => {
        if (!stream) return;
        setRecordedChunks([]); setRecordingTime(0);
        let options = { mimeType: 'video/webm' };
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) options = { mimeType: 'video/webm;codecs=vp9,opus' };
        else if (MediaRecorder.isTypeSupported('video/mp4')) options = { mimeType: 'video/mp4' };
        try {
            const recorder = new MediaRecorder(stream, { ...options, videoBitsPerSecond: 1000000 });
            recorder.ondataavailable = (e) => { if (e.data.size > 0) setRecordedChunks(prev => [...prev, e.data]); };
            recorder.start(200);
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (e) { console.error(e); alert('Error starting recorder'); }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop(); setIsRecording(false);
            setTimeout(() => {
                setRecordedChunks(currentChunks => {
                    if (currentChunks.length > 0) {
                        const blob = new Blob(currentChunks, { type: mediaRecorder.mimeType || 'video/webm' });
                        setPreviewUrl(URL.createObjectURL(blob));
                        stopCamera();
                    }
                    return currentChunks;
                });
            }, 500);
        }
    };

    const resetRecording = () => {
        setRecordedChunks([]); setRecordingTime(0); setIsRecording(false);
        if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
        if (show && !stream) startCamera();
    };

    const handleUpload = () => {
        if (recordedChunks.length === 0) return;
        const blob = new Blob(recordedChunks, { type: mediaRecorder?.mimeType || 'video/webm' });
        const file = new File([blob], `inspection_video_${Date.now()}.webm`, { type: blob.type });
        onUpload(file);
    };

    const handleClose = () => { stopCamera(); resetRecording(); onClose(); };

    const handleDownload = () => {
        if (!previewUrl) return;
        const a = document.createElement('a');
        a.href = previewUrl; a.download = `inspection_video_${Date.now()}.webm`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    return {
        videoRef, previewRef, stream, isRecording, recordingTime, previewUrl, isPreparing,
        progressPercentage: (recordingTime / maxDuration) * 100,
        startRecording, stopRecording, resetRecording, handleUpload, handleClose, handleDownload
    };
}
