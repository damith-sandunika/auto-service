import React from 'react';
import Badge from '@/Components/Badge';
import DataTable from '@/Components/DataTable';
import Pagination from '@/Components/Pagination';

const formatPrice = (price) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price);

export default function OrdersTable({ invoices, onPay, onEdit, onDelete }) {
    return (
        <>
            <DataTable
                columns={[
                    { label: 'Invoice ID' },
                    { label: 'Vehicle / Job' },
                    { label: 'Amount & Balance' },
                    { label: 'Status' },
                    { label: 'Actions', align: 'right' },
                ]}
                isEmpty={!invoices?.data?.length}
                emptyMessage="No invoices created yet."
            >
                {invoices?.data?.map((inv) => {
                    const totalPaid = inv.payments?.reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;
                    const balance = parseFloat(inv.total_amount) - totalPaid;
                    const isPaid = balance <= 0 || inv.status === 'paid';
                    return (
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-black text-slate-800">{inv.invoice_number}</td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-800">{inv.job?.vehicle?.license_plate || 'Unknown Vehicle'}</div>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">Job #{inv.job_id}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-black text-slate-700">{formatPrice(inv.total_amount)}</div>
                                {balance > 0 && <div className="text-xs font-bold text-rose-500 mt-0.5">Due: {formatPrice(balance)}</div>}
                            </td>
                            <td className="px-6 py-4">
                                <Badge variant={isPaid ? 'success' : inv.status === 'partially_paid' ? 'info' : 'warning'}>
                                    {isPaid ? 'Paid' : inv.status.replace('_', ' ')}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    {!isPaid && (
                                        <button onClick={() => onPay(inv)} className="text-white hover:bg-emerald-700 transition-colors px-3 py-1.5 bg-emerald-600 rounded-lg font-bold text-xs shadow-sm">Pay</button>
                                    )}
                                    <a href={route('owner.orders.show', inv.id)} className="text-slate-600 hover:text-blue-600 transition-colors p-1.5 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200" title="View Details">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    </a>
                                    <a href={route('owner.orders.print', inv.id)} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors p-1.5 bg-slate-50 hover:bg-slate-200 rounded-lg border border-slate-200" title="Print">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                                    </a>
                                    <button onClick={() => onEdit(inv)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button onClick={() => onDelete(inv)} className="text-slate-400 hover:text-red-600 transition-colors p-1.5 bg-slate-50 hover:bg-red-50 rounded-lg border border-slate-200">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </DataTable>
            {invoices?.links && <Pagination links={invoices.links} />}
        </>
    );
}
