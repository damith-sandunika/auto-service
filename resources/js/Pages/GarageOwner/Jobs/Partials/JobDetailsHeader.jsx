import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function JobDetailsHeader({ job, subTotal, discount, totalAdvance, balanceDue, auth }) {
    const [editingPayment, setEditingPayment] = useState(null);
    const [voidingPayment, setVoidingPayment] = useState(null);

    // Edit Payment Form
    const { 
        data: editData, 
        setData: setEditData, 
        patch: patchPayment, 
        processing: editProcessing, 
        reset: resetEdit, 
        errors: editErrors 
    } = useForm({
        amount: '',
        payment_method: 'cash'
    });

    // Void / Delete Payment Form
    const { 
        data: voidData, 
        setData: setVoidData, 
        delete: deletePayment, 
        processing: voidProcessing, 
        reset: resetVoid 
    } = useForm({
        reason: ''
    });

    const handleOpenEdit = (payment) => {
        setEditingPayment(payment);
        setEditData({
            amount: payment.amount,
            payment_method: payment.payment_method
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!editingPayment) return;

        patchPayment(route('owner.jobs.payment.update', [job.id, editingPayment.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingPayment(null);
                resetEdit();
            }
        });
    };

    const handleOpenVoid = (payment) => {
        setVoidingPayment(payment);
        setVoidData({ reason: '' });
    };

    const submitVoid = (e) => {
        e.preventDefault();
        if (!voidingPayment) return;

        deletePayment(route('owner.jobs.payment.destroy', [job.id, voidingPayment.id]), {
            preserveScroll: true,
            data: { reason: voidData.reason },
            onSuccess: () => {
                setVoidingPayment(null);
                resetVoid();
            }
        });
    };

    return (
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
            <div className="md:col-span-8 bg-emerald-50/50 border border-emerald-200 rounded-2xl shadow-sm p-4 text-slate-800 relative overflow-hidden flex flex-col md:flex-row items-stretch gap-4">
                <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                
                {/* Left part: Payment Summary */}
                <div className="w-full md:w-5/12 flex flex-col justify-center md:border-r border-emerald-200 md:pr-4 relative z-10">
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
                                onClick={() => window.dispatchEvent(new CustomEvent('open-discount-modal'))}
                                className="text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-2 py-0.5 rounded cursor-pointer transition-colors"
                                title="Click to edit discount"
                            >
                                - LKR {discount.toFixed(2)}
                            </button>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                            <span>Advance Paid</span>
                            <span className="text-emerald-600 font-bold">- LKR {totalAdvance.toFixed(2)}</span>
                        </div>
                        
                        <div className="h-px w-full bg-emerald-200 my-2"></div>
                        
                        <div className="flex justify-between items-end">
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Balance Due</span>
                            <span className="text-xl md:text-2xl font-black tracking-tight leading-none text-slate-800">LKR {balanceDue.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right part: History List */}
                <div 
                    className="w-full md:w-7/12 md:pl-2 flex flex-col max-h-[210px] overflow-y-auto relative z-10 pr-1" 
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#a7f3d0 transparent' }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Payment History
                        </h4>
                        <span className="text-[9px] font-bold text-slate-400">
                            {job.payments?.length || 0} Record{(job.payments?.length || 0) === 1 ? '' : 's'}
                        </span>
                    </div>

                    {job.payments && job.payments.length > 0 ? (
                        <div className="space-y-2 pb-1">
                            {job.payments.map((p) => {
                                const isVoid = !!p.is_void;

                                if (isVoid) {
                                    return (
                                        <div key={p.id} className="p-2 rounded-xl bg-rose-50/70 border border-rose-200 text-slate-700 relative overflow-hidden">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-bold line-through text-rose-500 text-xs">
                                                        LKR {parseFloat(p.amount).toFixed(2)}
                                                    </span>
                                                    <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-rose-200 text-rose-800">
                                                        VOIDED
                                                    </span>
                                                    <span className="text-[8px] font-bold text-slate-500 uppercase">
                                                        {p.payment_method?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <span className="text-[8px] text-slate-400">
                                                    {new Date(p.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="mt-1 text-[8px] text-rose-700 font-semibold flex items-center gap-1">
                                                <span>🚫 Deleted by <strong className="font-black text-rose-800">{p.voided_by_name || 'Staff'}</strong></span>
                                                {p.voided_at && (
                                                    <span>on {new Date(p.voided_at).toLocaleDateString()} {new Date(p.voided_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                )}
                                            </div>
                                            {p.void_reason && (
                                                <div className="text-[8px] text-rose-600/90 italic mt-0.5">
                                                    "{p.void_reason}"
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={p.id} className="p-2 rounded-xl bg-white border border-emerald-100 shadow-sm hover:border-emerald-300 transition-all flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-black text-slate-800 text-xs">
                                                    LKR {parseFloat(p.amount).toFixed(2)}
                                                </span>
                                                <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                                                    {p.payment_method?.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleOpenEdit(p)}
                                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Edit payment"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleOpenVoid(p)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                                    title="Void / Delete payment"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-[8px] text-slate-500 pt-0.5 border-t border-slate-50">
                                            <span>Added by <strong className="text-slate-700">{p.created_by_name || 'Staff'}</strong></span>
                                            <span>
                                                {new Date(p.created_at).toLocaleDateString()} {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {p.edited_at && (
                                            <div className="text-[7.5px] font-bold text-amber-700 bg-amber-50/80 rounded px-1.5 py-0.5 flex justify-between items-center">
                                                <span>✏️ Edited by {p.edited_by_name || 'Staff'}</span>
                                                <span>{new Date(p.edited_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center text-emerald-600/60 text-xs font-semibold py-6">
                            No payments recorded yet
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Payment Modal */}
            <Modal show={!!editingPayment} onClose={() => setEditingPayment(null)}>
                <form onSubmit={submitEdit} className="p-6 bg-white rounded-2xl relative overflow-hidden">
                    <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </div>
                        Edit Payment #{editingPayment?.id}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Amount (LKR)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                min="0.01"
                                className="w-full text-lg font-black p-3 rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500" 
                                value={editData.amount} 
                                onChange={e => setEditData('amount', e.target.value)} 
                                required 
                            />
                            {editErrors.amount && <p className="text-rose-500 text-xs mt-1 font-bold">{editErrors.amount}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Payment Method</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['cash', 'card', 'bank_transfer', 'credit'].map((method) => (
                                    <label key={method} className={`cursor-pointer border rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 transition-all ${editData.payment_method === method ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                                        <input type="radio" name="edit_method" value={method} className="sr-only" onChange={e => setEditData('payment_method', e.target.value)} checked={editData.payment_method === method} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{method.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
                            ℹ️ Note: This update will be recorded in the audit log under <strong>{auth?.user?.name || 'Your Account'}</strong> and synchronized with your cashbook.
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button 
                                type="button" 
                                onClick={() => setEditingPayment(null)} 
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 text-xs transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={editProcessing} 
                                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 text-xs transition-all disabled:opacity-50"
                            >
                                {editProcessing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Void / Delete Confirmation Modal */}
            <Modal show={!!voidingPayment} onClose={() => setVoidingPayment(null)}>
                <form onSubmit={submitVoid} className="p-6 bg-white rounded-2xl relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Void &amp; Delete Payment</h3>
                            <p className="text-xs text-rose-600 font-bold">Audit Protected Action</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                            <p className="text-xs text-slate-700 leading-relaxed">
                                Are you sure you want to void this payment of <strong className="text-rose-700 font-black">LKR {parseFloat(voidingPayment?.amount || 0).toFixed(2)}</strong> ({voidingPayment?.payment_method?.replace('_', ' ')})?
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">
                                This will remove it from the job advance balance and cashbook, and permanently record <strong className="text-slate-800">{auth?.user?.name || 'Current User'}</strong> as the staff member who voided it.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Reason for Voiding / Deletion</label>
                            <input 
                                type="text" 
                                className="w-full text-sm p-3 rounded-xl border-slate-200 focus:ring-rose-500 focus:border-rose-500 placeholder:text-slate-400" 
                                value={voidData.reason} 
                                onChange={e => setVoidData('reason', e.target.value)} 
                                placeholder="e.g. Incorrect amount entered / Customer refund"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button 
                                type="button" 
                                onClick={() => setVoidingPayment(null)} 
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 text-xs transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={voidProcessing} 
                                className="px-5 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-md shadow-rose-500/20 text-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {voidProcessing ? 'Voiding...' : 'Confirm Void Payment'}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
