import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function Workspace({ auth, job, inventory, services, suppliers }) {
    const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
    const [isAddOutsourceModalOpen, setIsAddOutsourceModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    
    const totalAdvance = job.payments?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;
    const subTotal = parseFloat(job.total_cost || 0);
    const discount = parseFloat(job.discount || 0);
    const balanceDue = Math.max(0, subTotal - discount - totalAdvance);
    
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    
    const { data: noteData, setData: setNoteData, post: postNote, patch: patchNote, delete: destroyNoteReq, processing: noteProcessing, reset: resetNote, errors: noteErrors } = useForm({
        title: '',
        content: '',
        color: 'amber',
        is_important: false
    });

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
        if(confirm('Are you sure you want to delete this note?')) {
            destroyNoteReq(route('owner.jobs.notes.destroy', noteId));
        }
    };

    const updateQuantity = (item, action) => {
        router.patch(route('owner.jobs.items.quantity', item.id), { action }, { preserveScroll: true });
    };

    const deleteItem = (itemId) => {
        if(confirm('Are you sure you want to remove this item?')) {
            router.delete(route('owner.jobs.items.destroy', itemId), { preserveScroll: true });
        }
    };

    const { data, setData, post, processing, reset, errors } = useForm({
        item_type: '',
        description: '',
        quantity: 1,
        price: '',
        cost_price: '',
        payment_method: 'cash',
        item_id: null,
        supplier_id: ''
    });

    const submitPart = (e) => {
        e.preventDefault();
        post(route('owner.jobs.items.store', job.id), {
            onSuccess: () => {
                setIsAddPartModalOpen(false);
                reset();
            }
        });
    };

    const submitService = (e) => {
        e.preventDefault();
        post(route('owner.jobs.items.store', job.id), {
            onSuccess: () => {
                setIsAddServiceModalOpen(false);
                reset();
            }
        });
    };

    const submitOutsource = (e) => {
        e.preventDefault();
        post(route('owner.jobs.items.store', job.id), {
            onSuccess: () => {
                setIsAddOutsourceModalOpen(false);
                reset();
            }
        });
    };

    const { data: payData, setData: setPayData, post: postPay, processing: payProcessing, reset: resetPay, errors: payErrors } = useForm({
        amount: '',
        payment_method: 'cash'
    });

    const submitPayment = (e) => {
        e.preventDefault();
        postPay(route('owner.jobs.payment.store', job.id), {
            onSuccess: () => {
                setIsPayModalOpen(false);
                resetPay();
            }
        });
    };

    const { data: discountData, setData: setDiscountData, patch: patchDiscount, processing: discountProcessing, reset: resetDiscount, errors: discountErrors } = useForm({
        discount: job.discount || ''
    });

    const [discountType, setDiscountType] = useState('fixed');
    const [percentValue, setPercentValue] = useState('');

    const submitDiscount = (e) => {
        e.preventDefault();
        patchDiscount(route('owner.jobs.discount.update', job.id), {
            onSuccess: () => {
                setIsDiscountModalOpen(false);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href={route('owner.pos.index')} 
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm group"
                            title="Back to Jobs"
                        >
                            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">
                            Job Workspace: {job.vehicle?.make && <span className="text-blue-600">{job.vehicle.make} {job.vehicle.model}</span>} <span className="text-slate-400 font-bold">({job.vehicle?.vehicle_number || 'Unknown'})</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 p-1.5 bg-slate-100 rounded-xl border border-slate-200/60 shadow-inner">
                        <button 
                            onClick={() => openNoteModal()}
                            className="group relative flex items-center justify-center w-9 h-9 rounded-lg bg-amber-400 border border-amber-500 text-white hover:bg-amber-500 hover:border-amber-600 transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl z-50 pointer-events-none">Add Note</span>
                        </button>

                        <button 
                            onClick={() => setIsPayModalOpen(true)}
                            className="group relative flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500 border border-emerald-600 text-white hover:bg-emerald-600 hover:border-emerald-700 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl z-50 pointer-events-none">Pay Now</span>
                        </button>
                        
                        <div className="w-px h-6 bg-slate-300 mx-1"></div>

                        <a 
                            href={route('owner.jobs.print', job.id) + '?type=a4'} 
                            target="_blank"
                            className="group relative flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl z-50 pointer-events-none">A4 Print</span>
                        </a>
                        <a 
                            href={route('owner.jobs.print', job.id) + '?type=thermal'} 
                            target="_blank"
                            className="group relative flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl z-50 pointer-events-none">Thermal Print</span>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Job Workspace" />

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
                
                {/* Left Side: Job Details */}
                <div className="w-full md:w-2/3 space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Card 1: Vehicle & Customer */}
                        <div className="md:col-span-4 bg-blue-50/50 border border-blue-200 rounded-2xl shadow-sm p-4 text-slate-800 relative overflow-hidden flex flex-col justify-between">
                            {/* Decorative bubbles */}
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-100/50 rounded-full blur-xl pointer-events-none"></div>
                            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-100/50 rounded-full blur-xl pointer-events-none"></div>
                            
                            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5 relative z-10">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                                Vehicle & Customer
                            </h3>
                            
                            <div className="grid grid-cols-1 gap-y-1.5 gap-x-2 relative z-10">
                                <div>
                                    <p className="text-blue-600/80 text-[9px] font-bold uppercase tracking-wide mb-0.5">Vehicle Number</p>
                                    <p className="font-black text-sm text-slate-800 leading-tight">{job.vehicle?.vehicle_number}</p>
                                </div>
                                <div>
                                    <p className="text-blue-600/80 text-[9px] font-bold uppercase tracking-wide mb-0.5">Customer</p>
                                    <p className="font-black text-sm leading-tight break-words text-slate-800">{job.vehicle?.owner?.name}</p>
                                </div>
                                <div>
                                    <p className="text-blue-600/80 text-[9px] font-bold uppercase tracking-wide mb-0.5">Mechanic</p>
                                    <p className="font-bold text-xs leading-tight break-words text-slate-700">{job.mechanic?.name || 'Unassigned'}</p>
                                </div>
                                <div>
                                    <p className="text-blue-600/80 text-[9px] font-bold uppercase tracking-wide mb-0.5">Started At</p>
                                    <p className="font-bold text-xs text-slate-700 leading-tight">{new Date(job.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Payment & Advance History */}
                        <div className="md:col-span-8 bg-emerald-50/50 border border-emerald-200 rounded-2xl shadow-sm p-5 text-slate-800 relative overflow-hidden flex flex-row items-stretch">
                            <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                            
                            {/* Left part: Payment Summary */}
                            <div className="w-2/3 flex flex-col justify-center border-r border-emerald-200 pr-5 relative z-10">
                                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Payment Summary
                                </h3>
                                
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                                        <span>Total Cost</span>
                                        <span className="text-slate-800">LKR {subTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                                        <span>Discount</span>
                                        <button 
                                            onClick={() => setIsDiscountModalOpen(true)}
                                            className="text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-2 py-0.5 rounded cursor-pointer transition-colors"
                                            title="Click to edit discount"
                                        >
                                            - LKR {discount.toFixed(2)}
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                                        <span>Advance Paid</span>
                                        <span className="text-emerald-600">- LKR {totalAdvance.toFixed(2)}</span>
                                    </div>
                                    
                                    <div className="h-px w-full bg-emerald-200 my-2"></div>
                                    
                                    <div className="flex justify-between items-end">
                                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Balance Due</span>
                                        <span className="text-2xl font-black tracking-tight leading-none text-slate-800">LKR {balanceDue.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right part: History List */}
                            <div 
                                className="w-1/3 pl-5 flex flex-col max-h-[160px] overflow-y-auto relative z-10 pr-2" 
                                style={{ scrollbarWidth: 'thin', scrollbarColor: '#a7f3d0 transparent' }}
                            >
                                <h4 className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-2">History</h4>
                                {job.payments && job.payments.length > 0 ? (
                                    <div className="space-y-2 pb-2">
                                        {job.payments.map((p, i) => (
                                            <div key={i} className="flex justify-between items-center text-[10px] bg-white border border-emerald-100 shadow-sm rounded-lg px-2.5 py-1.5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 leading-tight">LKR {parseFloat(p.amount).toFixed(2)}</span>
                                                    <span className="text-emerald-600 uppercase text-[8px] font-bold">{p.payment_method.replace('_', ' ')}</span>
                                                </div>
                                                <div className="text-right text-slate-500 text-[8px] font-medium leading-tight">
                                                    {new Date(p.created_at).toLocaleDateString()}<br/>
                                                    {new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-center text-emerald-600/60 text-xs font-semibold pb-4">
                                        No payments yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Job Notes
                            </h3>
                            <div className="flex-1 h-px bg-slate-200"></div>
                        </div>
                        
                        <div className="columns-1 sm:columns-2 md:columns-3 gap-6 p-2">
                            {[...(job.notes || [])].sort((a, b) => b.is_important - a.is_important).map((note, index) => {
                                // Different slight rotations for realistic effect based on index
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
                                    {/* Tape effect */}
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
                            {(!job.notes || job.notes.length === 0) && (
                                <div className="col-span-full py-8 text-center text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-xl">
                                    No notes added yet. Click the Add Note icon above to create one.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Cart */}
                <div className="w-full md:w-1/3">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)] sticky top-6">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-2 justify-center">
                            <button onClick={() => { setData('item_type', 'part'); setIsAddPartModalOpen(true); }} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">+ Add Part</button>
                            <button onClick={() => { setData('item_type', 'service'); setIsAddServiceModalOpen(true); }} className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-xs font-bold hover:bg-teal-200">+ Add Service</button>
                            <button onClick={() => { setData('item_type', 'outsource'); setIsAddOutsourceModalOpen(true); }} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200">+ Add Outsource</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                            {job.items?.length === 0 ? (
                                <div className="text-center text-slate-400 py-10 text-sm">
                                    No items added yet.
                                </div>
                            ) : (
                                job.items?.map(item => (
                                    <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 pr-2">
                                                <p className="text-sm font-bold text-slate-800 leading-tight">{item.description}</p>
                                                <p className="text-xs text-slate-500 capitalize mt-0.5">{item.item_type}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold text-blue-600">LKR {(item.price * item.quantity).toFixed(2)}</p>
                                                {item.quantity > 1 && <p className="text-[9px] font-bold text-slate-400 mt-0.5">LKR {parseFloat(item.price).toFixed(2)} each</p>}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-50">
                                            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                                                <button type="button" onClick={() => updateQuantity(item, 'decrement')} disabled={item.quantity <= 1} className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-slate-600 hover:text-slate-900 shadow-sm disabled:opacity-50 disabled:shadow-none font-bold transition-all">-</button>
                                                <span className="w-6 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(item, 'increment')} className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-slate-600 hover:text-slate-900 shadow-sm font-bold transition-all">+</button>
                                            </div>
                                            <button type="button" onClick={() => deleteItem(item.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Remove item">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className="p-4 border-t border-slate-100 bg-white shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-slate-500 text-sm">Subtotal</span>
                                <span className="font-bold text-slate-800 text-sm">LKR {subTotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-slate-500 text-sm">Discount</span>
                                    <span className="font-bold text-rose-600 text-sm">- LKR {discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center mb-4 mt-2 pt-2 border-t border-slate-100">
                                <span className="font-bold text-slate-600">Total</span>
                                <span className="text-2xl font-black text-slate-800">LKR {(subTotal - discount).toFixed(2)}</span>
                            </div>
                            <Link 
                                href={route('owner.jobs.complete', job.id)} 
                                method="post" 
                                as="button" 
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 text-center transition-all block"
                            >
                                Complete & Generate Invoice
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals for Adding Items */}
            <Modal show={isAddOutsourceModalOpen} onClose={() => setIsAddOutsourceModalOpen(false)}>
                <form onSubmit={submitOutsource} className="p-6">
                    <h2 className="text-xl font-bold mb-4">Add Outsource Work</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Select Supplier</label>
                            <select className="w-full rounded-lg border-slate-300" value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} required>
                                <option value="">Select Supplier...</option>
                                {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.phone || 'No Phone'})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Description</label>
                            <input type="text" className="w-full rounded-lg border-slate-300" value={data.description} onChange={e => setData('description', e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Customer Price</label>
                                <input type="number" step="0.01" className="w-full rounded-lg border-slate-300" value={data.price} onChange={e => setData('price', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Our Cost (Payable)</label>
                                <input type="number" step="0.01" className="w-full rounded-lg border-slate-300" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Payment Method</label>
                            <select className="w-full rounded-lg border-slate-300" value={data.payment_method} onChange={e => setData('payment_method', e.target.value)}>
                                <option value="cash">Cash (Deduct Today)</option>
                                <option value="credit">Credit (Pay Later)</option>
                            </select>
                        </div>
                        <button type="submit" disabled={processing} className="w-full bg-purple-600 text-white font-bold py-2.5 rounded-lg mt-4">Add Outsource Item</button>
                    </div>
                </form>
            </Modal>

            {/* Other Modals (Part/Service) similar... */}
            <Modal show={isAddPartModalOpen} onClose={() => setIsAddPartModalOpen(false)}>
                <form onSubmit={submitPart} className="p-6">
                    <h2 className="text-xl font-bold mb-4">Add Part</h2>
                    <div className="space-y-4">
                        <select className="w-full rounded-lg border-slate-300" onChange={e => {
                            const part = inventory.find(i => i.id == e.target.value);
                            if (part) {
                                setData({ ...data, item_type: 'part', item_id: part.id, description: part.item_name, price: part.price });
                            }
                        }}>
                            <option value="">Select Part...</option>
                            {inventory.map(i => <option key={i.id} value={i.id}>{i.item_name} (Qty: {i.quantity}) - LKR {i.price}</option>)}
                        </select>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg mt-4">Add Part</button>
                    </div>
                </form>
            </Modal>
            
            <Modal show={isAddServiceModalOpen} onClose={() => setIsAddServiceModalOpen(false)}>
                <form onSubmit={submitService} className="p-6">
                    <h2 className="text-xl font-bold mb-4">Add Service</h2>
                    <div className="space-y-4">
                        <input type="text" placeholder="Service Description" className="w-full rounded-lg border-slate-300" value={data.description} onChange={e => setData('description', e.target.value)} required />
                        <input type="number" placeholder="Price" className="w-full rounded-lg border-slate-300" value={data.price} onChange={e => setData('price', e.target.value)} required />
                        <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2.5 rounded-lg mt-4">Add Service</button>
                    </div>
                </form>
            </Modal>

            {/* Pay Now Modal */}
            <Modal show={isPayModalOpen} onClose={() => setIsPayModalOpen(false)}>
                <form onSubmit={submitPayment} className="p-6 relative overflow-hidden bg-white">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        Record Advance Payment
                    </h2>

                    <div className="space-y-5 relative z-10">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Payment Amount (LKR)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                className="w-full text-lg font-black p-4 rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500" 
                                value={payData.amount} 
                                onChange={e => setPayData('amount', e.target.value)} 
                                placeholder="0.00"
                                required 
                            />
                            {payErrors.amount && <p className="text-red-500 text-xs mt-1">{payErrors.amount}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
                            <div className="grid grid-cols-3 gap-3">
                                <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${payData.payment_method === 'cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-500' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                                    <input type="radio" name="payment_method" value="cash" className="sr-only" onChange={(e) => setPayData('payment_method', e.target.value)} checked={payData.payment_method === 'cash'} />
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    <span className="text-xs font-bold uppercase tracking-wider">Cash</span>
                                </label>
                                <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${payData.payment_method === 'card' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-500' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                                    <input type="radio" name="payment_method" value="card" className="sr-only" onChange={(e) => setPayData('payment_method', e.target.value)} checked={payData.payment_method === 'card'} />
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    <span className="text-xs font-bold uppercase tracking-wider">Card</span>
                                </label>
                                <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${payData.payment_method === 'bank_transfer' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-500' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                                    <input type="radio" name="payment_method" value="bank_transfer" className="sr-only" onChange={(e) => setPayData('payment_method', e.target.value)} checked={payData.payment_method === 'bank_transfer'} />
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                                    <span className="text-xs font-bold uppercase tracking-wider text-center">Transfer</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={() => setIsPayModalOpen(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                            <button type="submit" disabled={payProcessing} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2">
                                {payProcessing ? 'Processing...' : 'Process Payment'}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Discount Modal */}
            <Modal show={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} maxWidth="sm">
                <form onSubmit={submitDiscount} className="p-6 relative overflow-hidden bg-white">
                    <h2 className="text-xl font-black mb-4 text-slate-800">Apply Discount</h2>
                    
                    <div className="flex gap-2 mb-4 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <button type="button" onClick={() => setDiscountType('fixed')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${discountType === 'fixed' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>Fixed (LKR)</button>
                        <button type="button" onClick={() => setDiscountType('percentage')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${discountType === 'percentage' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>Percentage (%)</button>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            {discountType === 'fixed' ? 'Discount Amount (LKR)' : 'Discount Percentage (%)'}
                        </label>
                        {discountType === 'fixed' ? (
                            <input 
                                type="number" 
                                step="0.01" 
                                className="w-full text-lg font-bold p-3 rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500" 
                                value={discountData.discount} 
                                onChange={e => setDiscountData('discount', e.target.value)} 
                                placeholder="0.00"
                            />
                        ) : (
                            <div>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    max="100"
                                    min="0"
                                    className="w-full text-lg font-bold p-3 rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500" 
                                    value={percentValue} 
                                    onChange={e => {
                                        setPercentValue(e.target.value);
                                        const val = parseFloat(e.target.value) || 0;
                                        setDiscountData('discount', (subTotal * (val / 100)).toFixed(2));
                                    }} 
                                    placeholder="0 - 100"
                                />
                                {percentValue && (
                                    <p className="text-xs font-bold text-blue-600 mt-2 bg-blue-50 p-2 rounded-lg">
                                        Calculated Discount: LKR {discountData.discount}
                                    </p>
                                )}
                            </div>
                        )}
                        {discountErrors.discount && <p className="text-red-500 text-xs mt-1">{discountErrors.discount}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsDiscountModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                        <button type="submit" disabled={discountProcessing} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                            {discountProcessing ? 'Applying...' : 'Apply Discount'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Note Modal */}
            <Modal show={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} maxWidth="sm">
                <form onSubmit={submitNote} className="p-6 relative overflow-hidden bg-white">
                    <h2 className="text-xl font-black mb-4 text-slate-800">{editingNoteId ? 'Edit Note' : 'Add Note'}</h2>
                    <div className="mb-3">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Title (Optional)</label>
                        <input 
                            type="text" 
                            className="w-full text-sm font-medium p-2.5 rounded-lg border-slate-200 focus:ring-amber-500 focus:border-amber-500" 
                            value={noteData.title || ''} 
                            onChange={e => setNoteData('title', e.target.value)} 
                            placeholder="e.g. Needs checkup"
                        />
                        {noteErrors.title && <p className="text-red-500 text-xs mt-1">{noteErrors.title}</p>}
                    </div>
                    <div className="mb-4 flex flex-col gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Content</label>
                            <textarea 
                                className="w-full text-sm font-medium p-2.5 rounded-lg border-slate-200 focus:ring-amber-500 focus:border-amber-500 min-h-[120px]" 
                                value={noteData.content} 
                                onChange={e => setNoteData('content', e.target.value)} 
                                placeholder="Enter note details here..."
                                required
                            ></textarea>
                            {noteErrors.content && <p className="text-red-500 text-xs mt-1">{noteErrors.content}</p>}
                        </div>
                        
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Color</label>
                                <div className="flex gap-2">
                                    {['amber', 'yellow', 'rose', 'blue', 'emerald'].map(c => {
                                        const bgColors = {
                                            'amber': 'bg-amber-400 hover:bg-amber-500',
                                            'yellow': 'bg-yellow-400 hover:bg-yellow-500',
                                            'rose': 'bg-rose-400 hover:bg-rose-500',
                                            'blue': 'bg-blue-400 hover:bg-blue-500',
                                            'emerald': 'bg-emerald-400 hover:bg-emerald-500'
                                        };
                                        return (
                                            <button 
                                                key={c}
                                                type="button"
                                                onClick={() => setNoteData('color', c)}
                                                className={`w-6 h-6 rounded-full border-2 transition-all ${
                                                    noteData.color === c 
                                                        ? 'border-slate-800 scale-110 shadow-sm' 
                                                        : 'border-white/50 hover:scale-110 shadow-sm'
                                                } ${bgColors[c]}`}
                                            ></button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm">
                                <input 
                                    type="checkbox" 
                                    className="rounded text-red-500 focus:ring-red-500 border-slate-300 w-4 h-4"
                                    checked={!!noteData.is_important}
                                    onChange={e => setNoteData('is_important', e.target.checked)}
                                />
                                <span className="text-xs font-bold text-slate-700">Mark Important</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button type="button" onClick={() => setIsNoteModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                        <button type="submit" disabled={noteProcessing} className="px-5 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors">
                            {noteProcessing ? 'Saving...' : 'Save Note'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
