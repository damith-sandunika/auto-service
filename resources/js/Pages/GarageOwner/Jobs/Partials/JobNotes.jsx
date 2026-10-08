import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function JobNotes({ job }) {
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);

    const { data: noteData, setData: setNoteData, post: postNote, patch: patchNote, delete: destroyNoteReq, processing: noteProcessing, reset: resetNote, errors: noteErrors } = useForm({
        title: '',
        content: '',
        color: 'amber',
        is_important: false
    });

    useEffect(() => {
        const handleOpenModal = () => openNoteModal();
        window.addEventListener('open-note-modal', handleOpenModal);
        return () => window.removeEventListener('open-note-modal', handleOpenModal);
    }, []);

    const openNoteModal = (note = null) => {
        if (note) {
            setEditingNoteId(note.id);
            setNoteData({
                title: note.title || '',
                content: note.content || '',
                color: note.color || 'amber',
                is_important: !!note.is_important
            });
        } else {
            setEditingNoteId(null);
            resetNote();
        }
        setIsNoteModalOpen(true);
    };

    const submitNote = (e) => {
        e.preventDefault();
        if (editingNoteId) {
            patchNote(route('owner.jobs.notes.update', editingNoteId), {
                onSuccess: () => {
                    setIsNoteModalOpen(false);
                    resetNote();
                }
            });
        } else {
            postNote(route('owner.jobs.notes.store', job.id), {
                onSuccess: () => {
                    setIsNoteModalOpen(false);
                    resetNote();
                }
            });
        }
    };

    const deleteNote = (noteId) => {
        if (confirm('Are you sure you want to delete this note?')) {
            destroyNoteReq(route('owner.jobs.notes.destroy', noteId));
        }
    };

    return (
        <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Job Notes
                </h3>
                <div className="flex-1 h-px bg-slate-200"></div>
            </div>
            
            {job.notes && job.notes.length > 0 ? (
                <div className="columns-1 sm:columns-2 md:columns-3 gap-6 p-2">
                    {[...(job.notes)].sort((a, b) => b.is_important - a.is_important).map((note, index) => {
                    const rotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2'];
                    const rotation = rotations[index % 4];
                    
                    const colorMap = {
                        'amber': 'bg-amber-100/80 border-amber-200',
                        'yellow': 'bg-yellow-100/90 border-yellow-200',
                        'rose': 'bg-rose-50 border-rose-200',
                        'blue': 'bg-blue-50 border-blue-200',
                        'emerald': 'bg-emerald-50 border-emerald-200',
                    };
                    const colorClass = colorMap[note.color] || colorMap['amber'];

                    return (
                    <div key={note.id} className={`${colorClass} ${note.is_important ? 'border-b-[6px] border-b-red-500' : 'border'} shadow-sm hover:shadow-md rounded-bl-xl rounded-tr-xl rounded-br-3xl rounded-tl-sm p-4 relative group flex flex-col transition-all transform ${rotation} hover:rotate-0 hover:z-10 hover:scale-[1.02] duration-200 break-inside-avoid mb-6`}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-white/60 shadow-[0_1px_2px_rgba(0,0,0,0.1)] rotate-[-2deg] z-20 backdrop-blur-sm rounded-sm"></div>
                        
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button onClick={() => openNoteModal(note)} className="p-1 text-slate-600 hover:bg-white/70 rounded bg-white/40 shadow-sm">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => deleteNote(note.id)} className="p-1 text-red-500 hover:bg-white/70 rounded bg-white/40 shadow-sm">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                        
                        {note.title && <h4 className={`font-bold ${note.is_important ? 'text-red-700' : 'text-slate-800'} text-sm mb-1.5 pr-14 relative z-10 pt-1 break-words line-clamp-2`}>
                            {note.is_important && <span className="inline-block mr-1">⚠️</span>}
                            {note.title}
                        </h4>}
                        
                        {!note.title && note.is_important && (
                            <div className="font-black text-red-600 text-[9px] uppercase tracking-widest mb-1 mt-1">⚠️ Important</div>
                        )}

                        <div className="text-slate-800 text-xs font-medium relative z-10 font-sans leading-relaxed break-words whitespace-pre-wrap">
                            {note.content}
                        </div>

                        <div className="mt-4 pt-2 border-t border-black/5 flex justify-between items-end text-[9px] text-slate-600 font-bold relative z-10 shrink-0 bg-inherit">
                            <div className="flex flex-col">
                                <span>{new Date(note.created_at).toLocaleDateString()}</span>
                                <span>{new Date(note.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <span className="truncate max-w-[80px]">By {note.user?.name?.split(' ')[0] || 'Unknown'}</span>
                        </div>
                    </div>
                    );
                    })}
                </div>
            ) : (
                <div className="py-8 text-center text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-xl">
                    No notes added yet. Click the Add Note icon above to create one.
                </div>
            )}

            <Modal show={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)}>
                <form onSubmit={submitNote} className="p-6">
                    <h2 className="text-xl font-bold mb-4">{editingNoteId ? 'Edit Note' : 'Add Note'}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Title (Optional)</label>
                            <input type="text" className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500" value={noteData.title} onChange={e => setNoteData('title', e.target.value)} placeholder="e.g. Engine noise detail" maxLength="50" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Note Content <span className="text-red-500">*</span></label>
                            <textarea className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 h-32" value={noteData.content} onChange={e => setNoteData('content', e.target.value)} required placeholder="Write your observation here..."></textarea>
                        </div>
                        <div className="flex items-center gap-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Color Label</label>
                                <div className="flex gap-2">
                                    {['amber', 'yellow', 'rose', 'blue', 'emerald'].map(color => (
                                        <button key={color} type="button" onClick={() => setNoteData('color', color)} className={`w-8 h-8 rounded-full border-2 ${noteData.color === color ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'} transition-all`} style={{ backgroundColor: color === 'amber' ? '#fcd34d' : color === 'yellow' ? '#fef08a' : color === 'rose' ? '#ffe4e6' : color === 'blue' ? '#dbeafe' : '#d1fae5' }}></button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-6">
                                <input type="checkbox" id="is_important" className="rounded border-slate-300 text-red-500 focus:ring-red-500 w-5 h-5 cursor-pointer" checked={noteData.is_important} onChange={e => setNoteData('is_important', e.target.checked)} />
                                <label htmlFor="is_important" className="text-sm font-bold text-red-600 cursor-pointer">Mark as Important</label>
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsNoteModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
                            <button type="submit" disabled={noteProcessing} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">{editingNoteId ? 'Update Note' : 'Save Note'}</button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
