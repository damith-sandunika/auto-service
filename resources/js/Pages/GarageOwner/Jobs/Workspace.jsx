import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SearchableSelect from '@/Components/SearchableSelect';
import DigitalInspection from './Partials/DigitalInspection';
import JobNotes from './Partials/JobNotes';
import JobCart from './Partials/JobCart';
import JobDetailsHeader from './Partials/JobDetailsHeader';
import JobPayModal from './Partials/JobPayModal';

export default function Workspace({ auth, job, inventory, services, suppliers }) {
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





    const { data: payData, setData: setPayData, post: postPay, processing: payProcessing, reset: resetPay, errors: payErrors } = useForm({
        amount: '',
        payment_method: 'cash'
    });



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
                            onClick={() => window.dispatchEvent(new CustomEvent('open-note-modal'))}
                            className="group relative flex items-center justify-center w-9 h-9 rounded-lg bg-amber-400 border border-amber-500 text-white hover:bg-amber-500 hover:border-amber-600 transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl z-50 pointer-events-none">Add Note</span>
                        </button>

                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('open-pay-modal'))}
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
                    
                    <JobDetailsHeader job={job} subTotal={subTotal} discount={discount} totalAdvance={totalAdvance} balanceDue={balanceDue} />

                    <JobNotes job={job} />

                    {/* Digital Inspection Media Section */}
                    <DigitalInspection job={job} />
                </div>

                <JobCart job={job} inventory={inventory} services={services} suppliers={suppliers} subTotal={subTotal} discount={discount} />
            </div>

            <JobPayModal job={job} />
        </AuthenticatedLayout>
    );
}
