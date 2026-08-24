import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import dayjs from 'dayjs';

export default function Show({ invoice }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price);
    };

    const totalPaid = invoice.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
    const balance = parseFloat(invoice.total_amount) - totalPaid;

    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-4">
                    <Link href={route('owner.orders.index')} className="text-slate-500 hover:text-slate-700">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <span>Order Details: INV-{invoice.id.toString().padStart(4, '0')}</span>
                </div>
                <a href={route('owner.orders.print', invoice.id)} target="_blank" rel="noreferrer" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-indigo-500/20 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                    Print Invoice
                </a>
            </div>
        }>
            <Head title={`Order INV-${invoice.id.toString().padStart(4, '0')}`} />

            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm md:col-span-2">
                        <h3 className="text-lg font-black text-slate-800 mb-4 border-b pb-2">Vehicle & Job Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase">Vehicle</p>
                                <p className="text-lg font-black text-slate-800">{invoice.job?.vehicle?.make} {invoice.job?.vehicle?.model}</p>
                                <p className="text-sm text-slate-600 font-bold">{invoice.job?.vehicle?.license_plate}</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase">Mechanic</p>
                                <p className="text-lg font-black text-slate-800">{invoice.job?.mechanic?.name || 'Not Assigned'}</p>
                            </div>
                            <div className="col-span-2 mt-2">
                                <p className="text-sm font-bold text-slate-500 uppercase">Job Description</p>
                                <p className="text-slate-700 mt-1">{invoice.job?.description || 'No description provided.'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                        <h3 className="text-lg font-black text-slate-800 mb-4 border-b pb-2">Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-bold">Total Amount:</span>
                                <span className="text-lg font-black text-slate-800">{formatPrice(invoice.total_amount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-emerald-600">
                                <span className="font-bold">Total Paid:</span>
                                <span className="font-black">{formatPrice(totalPaid)}</span>
                            </div>
                            <div className="flex justify-between items-center text-rose-600 border-t pt-2">
                                <span className="font-bold">Balance Due:</span>
                                <span className="font-black">{formatPrice(Math.max(0, balance))}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-black text-slate-800">Job Items / Services</h3>
                        </div>
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Item/Service</th>
                                    <th className="px-6 py-3">Qty</th>
                                    <th className="px-6 py-3 text-right">Price</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoice.job?.items && invoice.job.items.length > 0 ? (
                                    invoice.job.items.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-3 font-bold text-slate-800">{item.item_name}</td>
                                            <td className="px-6 py-3">{item.quantity}</td>
                                            <td className="px-6 py-3 text-right">{formatPrice(item.unit_price)}</td>
                                            <td className="px-6 py-3 text-right font-bold text-slate-700">{formatPrice(item.total_price)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-6 text-center text-slate-500 font-medium">No items listed for this job.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-black text-slate-800">Payment History</h3>
                        </div>
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Method</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoice.payments && invoice.payments.length > 0 ? (
                                    invoice.payments.map(payment => (
                                        <tr key={payment.id}>
                                            <td className="px-6 py-3 font-medium">{dayjs(payment.payment_date).format('MMM D, YYYY')}</td>
                                            <td className="px-6 py-3 uppercase text-xs font-bold">{payment.payment_method}</td>
                                            <td className="px-6 py-3 text-right font-bold text-emerald-600">{formatPrice(payment.amount)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-6 text-center text-slate-500 font-medium">No payments recorded.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
