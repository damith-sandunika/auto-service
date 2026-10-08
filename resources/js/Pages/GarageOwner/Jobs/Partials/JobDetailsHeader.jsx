import React from 'react';

export default function JobDetailsHeader({ job, subTotal, discount, totalAdvance, balanceDue }) {
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
                                onClick={() => window.dispatchEvent(new CustomEvent('open-discount-modal'))}
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
    );
}
