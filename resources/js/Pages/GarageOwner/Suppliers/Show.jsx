import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { BanknotesIcon, DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import SupplierPaymentModal from './Partials/SupplierPaymentModal';

export default function SupplierShow({ supplier }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const updateChequeStatus = (paymentId, status) => {
        if (confirm(`Are you sure you want to mark this cheque as ${status}?`)) {
            router.post(route('owner.suppliers.payments.cheque-status', paymentId), { cheque_status: status });
        }
    };

    return (
        <AuthenticatedLayout
            fullWidth={true}
            header={<div className="w-full text-left"><div><div className="flex items-center gap-3 mb-1 text-left"><Link href={route('owner.purchases.index')} className="text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg"><ArrowLeftIcon className="w-4 h-4" /></Link><h2 className="text-xl font-black text-black">Supplier Ledger</h2></div><p className="text-xs font-bold text-blue-600 mt-0.5 ml-9">Manage payments, GRNs, and cheques for {supplier.name}.</p></div></div>}
        >
            <Head title={`${supplier.name} - Ledger`} />
            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mb-8 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-4 -mt-4 opacity-10 ${supplier.balance_due > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div><h2 className="text-3xl font-black text-slate-800 tracking-tight">{supplier.name}</h2><p className="text-slate-500 font-medium mt-1">Contact: {supplier.contact_person || 'N/A'} • {supplier.phone}</p></div>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl text-center md:text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Payable Balance</p>
                                <p className={`text-2xl font-black ${supplier.balance_due > 0 ? 'text-red-500' : 'text-emerald-500'}`}>Rs. {Number(supplier.balance_due).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                            <button onClick={() => setIsPaymentModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-all transform hover:-translate-y-0.5"><BanknotesIcon className="w-5 h-5" /> Settle Payment</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50"><h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><DocumentTextIcon className="w-5 h-5 text-blue-500" /> Purchase Orders</h3></div>
                        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                            {supplier.purchase_orders?.map(po => (
                                <div key={po.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-center mb-1"><span className="font-bold text-slate-700">GRN #{po.id} {po.reference_no && `(${po.reference_no})`}</span><span className="font-black text-slate-800">Rs. {Number(po.total_amount).toLocaleString()}</span></div>
                                    <div className="flex justify-between items-center text-xs"><span className="text-slate-500">{new Date(po.date).toLocaleDateString()}</span><span className={`font-bold uppercase ${po.status === 'paid' ? 'text-emerald-500' : po.status === 'partial' ? 'text-amber-500' : 'text-red-500'}`}>{po.status}</span></div>
                                </div>
                            ))}
                            {(!supplier.purchase_orders || supplier.purchase_orders.length === 0) && <div className="p-8 text-center text-slate-400 font-medium">No purchases yet.</div>}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50"><h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><BanknotesIcon className="w-5 h-5 text-emerald-500" /> Payment History</h3></div>
                        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                            {supplier.payments?.map(payment => (
                                <div key={payment.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-emerald-600">Payment</span><span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase">{payment.payment_method}</span>
                                            {payment.payment_method === 'cheque' && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${payment.cheque_status === 'pending' ? 'bg-amber-100 text-amber-700' : payment.cheque_status === 'cleared' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{payment.cheque_status}</span>}
                                        </div>
                                        <span className="font-black text-emerald-600">- Rs. {Number(payment.amount).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div><span className="text-slate-500 mr-2">{new Date(payment.payment_date).toLocaleDateString()}</span>{payment.payment_method === 'cheque' && payment.cheque_due_date && <span className="text-red-500 font-bold">Due: {new Date(payment.cheque_due_date).toLocaleDateString()}</span>}</div>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-slate-400 font-mono">{payment.reference_no}</span>
                                            {payment.payment_method === 'cheque' && payment.cheque_status === 'pending' && <div className="flex gap-1 ml-2"><button onClick={() => updateChequeStatus(payment.id, 'cleared')} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold hover:bg-emerald-200">Clear</button><button onClick={() => updateChequeStatus(payment.id, 'bounced')} className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold hover:bg-red-200">Bounce</button></div>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!supplier.payments || supplier.payments.length === 0) && <div className="p-8 text-center text-slate-400 font-medium">No payments recorded.</div>}
                        </div>
                    </div>
                </div>
            </div>

            <SupplierPaymentModal show={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} supplier={supplier} />
        </AuthenticatedLayout>
    );
}
