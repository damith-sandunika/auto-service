import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import JobDiscountModal from './JobDiscountModal';
import JobItemModals from './JobItemModals';

export default function JobCart({ job, inventory, services, suppliers, subTotal, discount }) {
    const [isAddPartOpen, setIsAddPartOpen] = useState(false);
    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
    const [isAddOutsourceOpen, setIsAddOutsourceOpen] = useState(false);

    const updateQuantityAction = (item, action, value = null) => {
        router.patch(route('owner.jobs.items.quantity', item.id), { action, quantity: value }, { preserveScroll: true });
    };

    const handleQuantityChange = (item, e) => {
        const val = e.target.value;
        if (val && !isNaN(val) && parseFloat(val) > 0) {
            updateQuantityAction(item, 'set', parseFloat(val));
        }
    };
    const deleteItem = (itemId) => { if (confirm('Are you sure you want to remove this item?')) router.delete(route('owner.jobs.items.destroy', itemId), { preserveScroll: true }); };

    const closeModal = (type) => {
        if (type === 'part') setIsAddPartOpen(false);
        if (type === 'service') setIsAddServiceOpen(false);
        if (type === 'outsource') setIsAddOutsourceOpen(false);
    };

    return (
        <div className="w-full md:w-1/3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)] sticky top-6">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-2 justify-center">
                    <button onClick={() => setIsAddPartOpen(true)} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">+ Add Part</button>
                    <button onClick={() => setIsAddServiceOpen(true)} className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-xs font-bold hover:bg-teal-200">+ Add Service</button>
                    <button onClick={() => setIsAddOutsourceOpen(true)} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200">+ Add Outsource</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {job.items?.length === 0 ? (
                        <div className="text-center text-slate-400 py-10 text-sm">No items added yet.</div>
                    ) : (
                        job.items?.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-2">
                                        <p className="text-sm font-bold text-slate-800 leading-tight">{item.description}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-slate-500 capitalize">{item.item_type}</p>
                                            {item.location && (
                                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                                    Stored at: {item.location.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0"><p className="text-sm font-bold text-blue-600">LKR {(item.price * item.quantity).toFixed(2)}</p>{item.quantity > 1 && <p className="text-[9px] font-bold text-slate-400 mt-0.5">LKR {parseFloat(item.price).toFixed(2)} each</p>}</div>
                                </div>
                                <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-50">
                                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                                        <button type="button" onClick={() => updateQuantityAction(item, 'set', Math.max(0.01, parseFloat(item.quantity) - 1))} disabled={parseFloat(item.quantity) <= 0.01} className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-slate-600 hover:text-slate-900 shadow-sm disabled:opacity-50 font-bold">-</button>
                                        <input 
                                            key={`qty-${item.id}-${item.quantity}`}
                                            type="number" 
                                            step="0.01" 
                                            min="0.01"
                                            defaultValue={item.quantity} 
                                            onBlur={(e) => handleQuantityChange(item, e)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleQuantityChange(item, e); e.target.blur(); } }}
                                            className="w-12 text-center text-xs font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0" 
                                        />
                                        <button type="button" onClick={() => updateQuantityAction(item, 'set', parseFloat(item.quantity) + 1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-slate-600 hover:text-slate-900 shadow-sm font-bold">+</button>
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
                    <div className="flex justify-between items-center mb-1"><span className="font-semibold text-slate-500 text-sm">Subtotal</span><span className="font-bold text-slate-800 text-sm">LKR {subTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-500 text-sm flex items-center gap-2">
                            Discount
                            <button onClick={() => window.dispatchEvent(new CustomEvent('open-discount-modal'))} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold transition-colors">Edit</button>
                        </span>
                        <span className="font-bold text-rose-600 text-sm">- LKR {discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 mt-2 pt-2 border-t border-slate-100"><span className="font-bold text-slate-600">Total</span><span className="text-2xl font-black text-slate-800">LKR {(subTotal - discount).toFixed(2)}</span></div>
                    {['completed', 'done'].includes(job.status) ? (
                        <Link href={route('owner.orders.show', job.invoice?.id || job.id)} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 shadow-md shadow-slate-500/20 text-center transition-all block">
                            Return to Order
                        </Link>
                    ) : (
                        <Link href={route('owner.jobs.complete', job.id)} method="post" as="button" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 text-center transition-all block">
                            Complete &amp; Generate Order
                        </Link>
                    )}
                </div>
            </div>

            <JobItemModals job={job} inventory={inventory} services={services} suppliers={suppliers} isAddPartOpen={isAddPartOpen} isAddServiceOpen={isAddServiceOpen} isAddOutsourceOpen={isAddOutsourceOpen} onClose={closeModal} />
            <JobDiscountModal job={job} subTotal={subTotal} />
        </div>
    );
}
