import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function JobPayModal({ job, balanceDue = 0 }) {
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const amountInputRef = useRef(null);

    const { data: payData, setData: setPayData, post: postPay, processing: payProcessing, reset: resetPay, errors: payErrors } = useForm({
        amount: '',
        payment_method: 'cash'
    });

    useEffect(() => {
        const handleOpenPay = () => {
            setIsPayModalOpen(true);
            if (balanceDue > 0) {
                setPayData('amount', balanceDue.toFixed(2));
            } else {
                setPayData('amount', '');
            }
            setTimeout(() => {
                if (amountInputRef.current) {
                    amountInputRef.current.focus();
                    amountInputRef.current.select();
                }
            }, 100);
        };
        window.addEventListener('open-pay-modal', handleOpenPay);
        return () => window.removeEventListener('open-pay-modal', handleOpenPay);
    }, [balanceDue]);

    const submitPayment = (e) => {
        if (e) e.preventDefault();
        if (payProcessing) return;

        postPay(route('owner.jobs.payment.store', job.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsPayModalOpen(false);
                resetPay();
            }
        });
    };

    return (
        <Modal show={isPayModalOpen} onClose={() => { setIsPayModalOpen(false); resetPay(); }}>
            <form onSubmit={submitPayment} className="p-6 relative overflow-hidden bg-white">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl pointer-events-none"></div>
                
                <h2 className="text-2xl font-black mb-4 text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    Record Advance Payment
                </h2>

                {/* Prominent Pending Balance Due Banner */}
                <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800/80">Pending Balance Due</span>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            LKR {parseFloat(balanceDue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    {balanceDue > 0 && (
                        <button 
                            type="button" 
                            onClick={() => setPayData('amount', balanceDue.toFixed(2))}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                        >
                            <span>⚡</span> Pay Full Due
                        </button>
                    )}
                </div>

                <div className="space-y-5 relative z-10">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Payment Amount (LKR)</label>
                        <input 
                            ref={amountInputRef}
                            type="number" 
                            step="0.01" 
                            min="0.01"
                            className="w-full text-xl font-black p-4 rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-300" 
                            value={payData.amount} 
                            onChange={e => setPayData('amount', e.target.value)} 
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    submitPayment(e);
                                }
                            }}
                            placeholder="0.00"
                            required 
                        />
                        {payErrors.amount && <p className="text-red-500 text-xs mt-1 font-bold">{payErrors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
                        <div className="grid grid-cols-4 gap-3">
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
                            <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${payData.payment_method === 'credit' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-500' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                                <input type="radio" name="payment_method" value="credit" className="sr-only" onChange={(e) => setPayData('payment_method', e.target.value)} checked={payData.payment_method === 'credit'} />
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-xs font-bold uppercase tracking-wider text-center">Credit</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={() => { setIsPayModalOpen(false); resetPay(); }} 
                            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={payProcessing} 
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {payProcessing ? 'Processing...' : 'Process Payment'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
