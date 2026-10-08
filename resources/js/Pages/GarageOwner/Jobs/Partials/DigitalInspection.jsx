import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import VideoRecorderModal from '@/Components/VideoRecorderModal';

export default function DigitalInspection({ job }) {
    const [showInspection, setShowInspection] = useState(job.media?.length > 0);
    const [isRecorderModalOpen, setIsRecorderModalOpen] = useState(false);

    const { data: mediaData, setData: setMediaData, post: postMedia, processing: mediaProcessing, reset: resetMedia, errors: mediaErrors } = useForm({
        media: null
    });
    
    const handleMediaUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            router.post(route('owner.jobs.media.store', job.id), { media: e.target.files[0] }, {
                preserveScroll: true
            });
        }
    };

    const handleBlobUpload = (file) => {
        router.post(route('owner.jobs.media.store', job.id), { media: file }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsRecorderModalOpen(false);
            }
        });
    };
    
    const deleteMedia = (mediaId) => {
        if (confirm('Are you sure you want to delete this media?')) {
            router.delete(route('owner.jobs.media.destroy', mediaId), { preserveScroll: true });
        }
    };

    return (
        <div className="mt-8">
            {!showInspection ? (
                <button 
                    onClick={() => setShowInspection(true)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors font-bold text-sm"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Start Digital Inspection
                </button>
            ) : (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-4">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Digital Inspection Media
                        </h3>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsRecorderModalOpen(true)}
                                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                Record Camera
                            </button>
                            <label className="cursor-pointer bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1">
                                {mediaProcessing ? 'Uploading...' : 'Upload File'}
                                <input type="file" accept="video/*,image/*" capture="environment" className="hidden" onChange={handleMediaUpload} disabled={mediaProcessing} />
                            </label>
                            {job.media?.length > 0 && (
                                <button
                                    onClick={() => {
                                        const url = window.location.origin + route('customer.inspection.show', job.id);
                                        navigator.clipboard.writeText(url);
                                        alert('Link copied to clipboard: ' + url);
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    Copy Link
                                </button>
                            )}
                            {job.media?.length === 0 && (
                                <button onClick={() => setShowInspection(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                    {mediaErrors.media && <p className="text-red-500 text-xs mb-4">{mediaErrors.media}</p>}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {job.media && job.media.length > 0 ? job.media.map(media => (
                            <div key={media.id} className="relative group bg-slate-100 rounded-xl overflow-hidden aspect-video border border-slate-200 shadow-sm flex items-center justify-center">
                                {media.file_type === 'video' ? (
                                    <video src={'/storage/' + media.file_path} className="w-full h-full object-cover" controls preload="metadata" />
                                ) : (
                                    <img src={'/storage/' + media.file_path} className="w-full h-full object-cover" alt="Inspection" />
                                )}
                                <button 
                                    onClick={() => deleteMedia(media.id)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                                    title="Delete Media"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        )) : (
                            <div className="col-span-full py-8 text-center text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                No inspection videos or photos uploaded yet. Click upload to capture from phone camera.
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <VideoRecorderModal 
                show={isRecorderModalOpen} 
                onClose={() => setIsRecorderModalOpen(false)} 
                onUpload={handleBlobUpload}
                maxDuration={120}
            />
        </div>
    );
}
