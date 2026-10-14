import React, { useState } from 'react';
import Badge from '@/Components/Badge';
import Pagination from '@/Components/Pagination';

const formatPrice = (price) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price);

export default function OrdersTable({ invoices, deletedOrders, activeCount = 0, deletedCount = 0, currentTab = 'active', onPay, onDelete }) {
    const [tab, setTab] = useState(currentTab);

    return (
        <div className="space-y-4">
            {/* Tabs Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                <button
                    onClick={() => setTab('active')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all ${
                        tab === 'active'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <span>Active Orders</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        tab === 'active' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                        {activeCount || invoices?.total || 0}
                    </span>
                </button>

                <button
                    onClick={() => setTab('deleted')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all ${
                        tab === 'deleted'
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                            : 'bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-slate-200'
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Deleted Orders</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        tab === 'deleted' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-700'
                    }`}>
                        {deletedCount || deletedOrders?.total || 0}
                    </span>
                </button>
            </div>

            {/* Active Orders View */}
            {tab === 'active' && (
                <>
                    <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Vehicle</th>
                                    <th className="px-6 py-4">Customer Name</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(!invoices?.data || invoices.data.length === 0) ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500 font-medium text-base">
                                            No active orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.data.map((inv) => {
                                        const totalPaid = inv.payments?.reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;
                                        const fullAmount = parseFloat(inv.total_amount);
                                        const balance = fullAmount - totalPaid;
                                        const isPaid = balance <= 0 || inv.status === 'paid';

                                        return (
                                            <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-6 py-4 font-black text-slate-900 text-base">
                                                    #{inv.invoice_number || inv.id}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-800">
                                                    {inv.job?.vehicle?.license_plate || inv.job?.vehicle?.vehicle_number || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-700">
                                                    {inv.job?.owner?.name || inv.job?.vehicle?.owner?.name || 'Walk-in Customer'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-black text-slate-900 text-base mb-1">
                                                        {formatPrice(fullAmount)}
                                                    </div>
                                                    {isPaid ? (
                                                        <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                                                            Fully Paid
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 text-[11px] font-bold">
                                                            <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Rec: {formatPrice(totalPaid)}</span>
                                                            <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Due: {formatPrice(balance)}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <Badge variant={inv.job?.status === 'completed' ? 'success' : 'warning'}>
                                                            Order {inv.job?.status ? inv.job.status.replace('_', ' ') : 'Completed'}
                                                        </Badge>
                                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                                            Payment {isPaid ? 'Paid' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 items-center h-full">
                                                        {!isPaid && (
                                                            <button onClick={() => onPay(inv)} className="text-white hover:bg-emerald-700 transition-colors px-3 py-1.5 bg-emerald-600 rounded-lg font-bold text-xs shadow-sm whitespace-nowrap">
                                                                Add Pay
                                                            </button>
                                                        )}
                                                        <a href={route('owner.orders.show', inv.id)} className="text-slate-600 hover:text-blue-600 transition-colors p-1.5 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200" title="View Details">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        </a>
                                                        <a href={route('owner.orders.print', inv.id)} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors p-1.5 bg-slate-50 hover:bg-slate-200 rounded-lg border border-slate-200" title="Print">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                                                        </a>
                                                        <a href={route('owner.orders.edit', inv.id)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200" title="Edit">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                                        </a>
                                                        <button onClick={() => onDelete(inv)} className="text-slate-400 hover:text-red-600 transition-colors p-1.5 bg-slate-50 hover:bg-red-50 rounded-lg border border-slate-200" title="Delete">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {invoices?.links && <Pagination links={invoices.links} />}
                </>
            )}

            {/* Deleted Orders View */}
            {tab === 'deleted' && (
                <>
                    <div className="overflow-hidden bg-white border border-rose-200 rounded-2xl shadow-sm">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-rose-50/80 border-b border-rose-200 text-xs font-black text-rose-800 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Vehicle</th>
                                    <th className="px-6 py-4">Customer Name</th>
                                    <th className="px-6 py-4">Total Amount</th>
                                    <th className="px-6 py-4">Deleted By</th>
                                    <th className="px-6 py-4 text-right">Deletion Date &amp; Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-100">
                                {(!deletedOrders?.data || deletedOrders.data.length === 0) ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500 font-medium text-base">
                                            No deleted orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    deletedOrders.data.map((inv) => (
                                        <tr key={`del-${inv.id}`} className="bg-rose-50/30 hover:bg-rose-50/70 transition-colors">
                                            <td className="px-6 py-4 font-black text-rose-900 text-base">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                                                    #{inv.invoice_number || inv.id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800">
                                                {inv.vehicle_number || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700">
                                                {inv.customer_name || 'Walk-in Customer'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-rose-900 text-base">
                                                    {formatPrice(parseFloat(inv.total_amount || 0))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-start gap-0.5">
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                                        Deleted
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-600">
                                                        by {inv.deleted_by_name || 'Staff'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span className="text-xs font-bold text-slate-600">
                                                        {new Date(inv.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-400">
                                                        {new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {deletedOrders?.links && <Pagination links={deletedOrders.links} />}
                </>
            )}
        </div>
    );
}
