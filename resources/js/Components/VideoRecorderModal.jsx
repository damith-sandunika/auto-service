import React from 'react';
import Modal from '@/Components/Modal';
import useVideoRecorder from '@/Components/useVideoRecorder';

export default function VideoRecorderModal({ show, onClose, onUpload, maxDuration = 30 }) {
    const {
        videoRef, previewRef, isRecording, recordingTime, previewUrl, isPreparing,
        progressPercentage, startRecording, stopRecording, resetRecording,
        handleUpload, handleClose, handleDownload, stream
    } = useVideoRecorder({ show, onClose, onUpload, maxDuration });

    return (
        <Modal show={show} onClose={handleClose} maxWidth="lg">
            <div className="p-0 bg-black rounded-xl overflow-hidden relative">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/70 to-transparent">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        {isRecording && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>}
                        {previewUrl ? 'Review Recording' : (isRecording ? 'Recording...' : 'Digital Inspection Camera')}
                    </h3>
                    <button onClick={handleClose} className="text-white/80 hover:text-white p-1 bg-black/40 rounded-full backdrop-blur-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Video Area */}
                <div className="relative w-full aspect-[3/4] bg-slate-900 flex items-center justify-center">
                    {isPreparing && !previewUrl && (
                        <div className="text-white/60 text-sm flex flex-col items-center gap-3">
                            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Starting Camera...
                        </div>
                    )}
                    {!previewUrl ? (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                        <video ref={previewRef} src={previewUrl} controls className="w-full h-full object-contain bg-black" />
                    )}
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center pb-8">
                    {!previewUrl ? (
                        <>
                            {isRecording && (
                                <div className="w-full max-w-[200px] mb-6">
                                    <div className="flex justify-between text-white text-xs font-bold mb-1.5 drop-shadow-md">
                                        <span>0:{recordingTime.toString().padStart(2, '0')}</span>
                                        <span>0:{maxDuration}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                </div>
                            )}
                            {!isRecording ? (
                                <button onClick={startRecording} disabled={!stream || isPreparing} className="w-16 h-16 rounded-full bg-red-500 border-4 border-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"></button>
                            ) : (
                                <button onClick={stopRecording} className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                                    <div className="w-6 h-6 bg-red-500 rounded-sm"></div>
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="w-full flex gap-2">
                            <button onClick={resetRecording} className="flex-[0.8] py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors text-xs">Retake</button>
                            <button onClick={handleDownload} className="flex-[0.8] py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors text-xs flex flex-col items-center justify-center gap-1 leading-none" title="Save to phone gallery">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Save
                            </button>
                            <button onClick={handleUpload} className="flex-[1.4] py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-600/30 transition-colors flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                Upload
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
