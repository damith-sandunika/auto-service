import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import JobDiscountModal from '../Jobs/Partials/JobDiscountModal';
import JobItemModals from '../Jobs/Partials/JobItemModals';

export default function EditOrder({ auth, invoice, inventory, services, suppliers }) {
    const job = invoice.job;
    if (!job) return <div>Job missing</div>;

    const totalAdvance = job.payments?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;
    const subTotal = parseFloat(job.total_cost || 0);
    const discount = parseFloat(job.discount || 0);
    const balanceDue = Math.max(0, subTotal - discount - totalAdvance);

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
        <AuthenticatedLayout
            header={
                <div className="flex flex-col">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">
                        Edit Items & Services - Order #{invoice.invoice_number || invoice.id}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Use this editor to add parts, services, outsource work, or apply discounts. Changes will automatically update the order's total amount.
                    </p>
                </div>
            }
        >
            <Head title={`Edit Order #${invoice.invoice_number || invoice.id}`} />

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 mt-4">
                
                {/* Left Side: Items & Actions */}
                <div className="w-full lg:w-2/3 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-3 items-center justify-between">
                            <h3 className="font-black text-slate-800 text-lg">Order Items</h3>
                            <div className="flex gap-2">
                                <button onClick={() => setIsAddPartOpen(true)} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200 shadow-sm transition-colors">+ Add Part</button>
                                <button onClick={() => setIsAddServiceOpen(true)} className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm font-bold hover:bg-teal-200 shadow-sm transition-colors">+ Add Service</button>
                                <button onClick={() => setIsAddOutsourceOpen(true)} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-200 shadow-sm transition-colors">+ Add Outsource</button>
                            </div>
                        </div>
                        
                        <div className="p-4 space-y-4 bg-slate-50/50 min-h-[300px]">
                            {job.items?.length === 0 ? (
                                <div className="text-center text-slate-400 py-10 font-medium">No items added yet.</div>
                            ) : (
                                job.items?.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300">
                                        <div className="flex-1">
                                            <p className="text-base font-bold text-slate-800 leading-tight">{item.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs font-semibold text-slate-400 capitalize tracking-wider uppercase">{item.item_type}</p>
                                                {item.location && (
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                                        Stored at: {item.location.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-base font-black text-blue-600">LKR {(item.price * item.quantity).toFixed(2)}</p>
                                                {item.quantity > 1 && <p className="text-[10px] font-bold text-slate-400 mt-0.5">LKR {parseFloat(item.price).toFixed(2)} each</p>}
                                            </div>

                                            <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
                                                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                                                    <button type="button" onClick={() => updateQuantityAction(item, 'set', Math.max(0.01, parseFloat(item.quantity) - 1))} disabled={parseFloat(item.quantity) <= 0.01} className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-600 hover:text-slate-900 shadow-sm disabled:opacity-50 font-bold text-lg">-</button>
                                                    <input 
                                                        key={`qty-${item.id}-${item.quantity}`}
                                                        type="number" 
                                                        step="0.01" 
                                                        min="0.01"
                                                        defaultValue={item.quantity} 
                                                        onBlur={(e) => handleQuantityChange(item, e)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleQuantityChange(item, e); e.target.blur(); } }}
                                                        className="w-16 text-center font-black text-slate-800 bg-transparent border-none focus:ring-0 p-0 text-base" 
                                                    />
                                                    <button type="button" onClick={() => updateQuantityAction(item, 'set', parseFloat(item.quantity) + 1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-600 hover:text-slate-900 shadow-sm font-bold text-lg">+</button>
                                                </div>
                                                <button type="button" onClick={() => deleteItem(item.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors" title="Remove item">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Totals & Summary */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                        <div className="p-6">
                            <h3 className="font-black text-slate-800 text-lg mb-6 border-b border-slate-100 pb-4">Order Summary</h3>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-500">Subtotal</span>
                                    <span className="font-black text-slate-800">LKR {subTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-500 flex items-center gap-2">
                                        Discount
                                        <button onClick={() => window.dispatchEvent(new CustomEvent('open-discount-modal'))} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold transition-colors uppercase tracking-wider">Edit</button>
                                    </span>
                                    <span className="font-black text-rose-600">- LKR {discount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-slate-200 mb-8">
                                <span className="font-black text-slate-800 text-lg">Total Amount</span>
                                <span className="text-3xl font-black text-blue-600">LKR {(subTotal - discount).toFixed(2)}</span>
                            </div>

                            <Link href={route('owner.orders.show', invoice.id)} className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white font-bold py-4 rounded-xl hover:bg-slate-900 shadow-lg shadow-slate-500/20 transition-all">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Return to Order
                            </Link>
                        </div>
                    </div>
                </div>

            </div>

            <JobItemModals job={job} inventory={inventory} services={services} suppliers={suppliers} isAddPartOpen={isAddPartOpen} isAddServiceOpen={isAddServiceOpen} isAddOutsourceOpen={isAddOutsourceOpen} onClose={closeModal} />
            <JobDiscountModal job={job} subTotal={subTotal} />

        </AuthenticatedLayout>
    );
}
