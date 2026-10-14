import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

// ─── Payment Modal ───────────────────────────────────────────────────────────
function PaymentModal({ order, onClose }) {
    const [amount, setAmount] = useState(order.balanceDue.toFixed(2));
    const [method, setMethod] = useState('cash');
    const [processing, setProcessing] = useState(false);

    const handlePay = (e) => {
        e.preventDefault();
        if (parseFloat(amount) > order.balanceDue) {
            alert('Amount cannot exceed the pending balance.');
            return;
        }
        setProcessing(true);
        router.post(route('owner.orders.payments.store', order.invoiceId), {
            amount,
            payment_method: method
        }, {
            onSuccess: () => {
                onClose();
            },
            onError: () => setProcessing(false),
            onFinish: () => setProcessing(false)
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-white">Receive Payment</h3>
                        <p className="text-xs text-slate-400 mt-0.5">#{order.invoiceId} · {order.customer}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handlePay} className="p-6 space-y-5">
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Order</p>
                            <p className="text-base font-black text-slate-800">Rs.{order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">Pending Balance</p>
                            <p className="text-base font-black text-orange-600">Rs.{order.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Payment Amount (Rs.)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            step="0.01"
                            min="0.01"
                            max={order.balanceDue}
                            required
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Payment Method</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'cash',          label: 'Cash',          icon: '💵' },
                                { value: 'card',          label: 'Card',          icon: '💳' },
                                { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setMethod(opt.value)}
                                    className={`flex flex-col items-center justify-center px-3 py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                                        method === opt.value
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-xl mb-1">{opt.icon}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-colors text-sm shadow-lg shadow-emerald-600/25 disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                            ) : (
                                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Confirm Payment</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportTables({ activeReport, services, orders, expenses, creditOrders, pendingJobs, topCustomers, shiftReports, deletedOrders }) {
    const [payModalOrder, setPayModalOrder] = useState(null);

    return (
        <div className="p-6">
            {/* Pay Modal */}
            {payModalOrder && (
                <PaymentModal order={payModalOrder} onClose={() => setPayModalOrder(null)} />
            )}

            {/* ── Sales ── */}
            {activeReport === 'sales' && (
                <>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b"><tr><th className="px-4 py-2">Order No</th><th className="px-4 py-2">Vehicle Number</th><th className="px-4 py-2">Customer Name</th><th className="px-4 py-2">Date & Time</th><th className="px-4 py-2">Payment Method</th><th className="px-4 py-2 text-right">Amount</th><th className="px-4 py-2 text-right">Branch</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders?.data?.map(payment => <tr key={payment.id}><td className="px-4 py-3 font-medium text-blue-600">{payment.invoice?.id || '-'}</td><td className="px-4 py-3">{payment.invoice?.job?.vehicle?.vehicle_number || 'Walk-in'}</td><td className="px-4 py-3">{payment.invoice?.job?.owner?.name || '-'}</td><td className="px-4 py-3 text-xs text-gray-500">{new Date(payment.created_at).toLocaleString('en-GB')}</td><td className="px-4 py-3 capitalize">{payment.payment_method?.replace('_', ' ')}</td><td className="px-4 py-3 text-right font-semibold">Rs.{parseFloat(payment.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td><td className="px-4 py-3 text-right text-xs text-gray-500">{payment.invoice?.job?.garage?.name || '-'}</td></tr>)}
                            {(!orders?.data || orders.data.length === 0) && <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-400">No payments recorded in this range.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {orders?.links && <Pagination paginator={orders} />}
                </>
            )}

            {/* ── Expenses ── */}
            {activeReport === 'expenses' && (
                <>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b"><tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Branch Name</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Details</th><th className="px-4 py-2 text-right">Amount</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {expenses?.data?.map(exp => <tr key={exp.id}><td className="px-4 py-3 text-xs text-gray-500">{new Date(exp.expense_date).toLocaleDateString()}</td><td className="px-4 py-3 font-medium text-gray-700">{exp.garage?.name || '-'}</td><td className="px-4 py-3 font-medium capitalize text-gray-700">{exp.category}</td><td className="px-4 py-3 text-gray-600">{exp.description}</td><td className="px-4 py-3 text-right font-semibold text-red-600">Rs.{parseFloat(exp.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td></tr>)}
                            {(!expenses?.data || expenses.data.length === 0) && <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">No expenses logged in this range.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {expenses?.links && <Pagination paginator={expenses} />}
                </>
            )}

            {/* ── Credit ── */}
            {activeReport === 'credit' && (
                <>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-2">Order No</th>
                                <th className="px-4 py-2">Vehicle Number</th>
                                <th className="px-4 py-2">Date & Time</th>
                                <th className="px-4 py-2">Customer Name</th>
                                <th className="px-4 py-2 text-right">Total Price</th>
                                <th className="px-4 py-2 text-right">Received</th>
                                <th className="px-4 py-2 text-right">Pending Balance</th>
                                <th className="px-4 py-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {creditOrders?.data?.map(order => {
                                const validPayments = order.payments?.filter(p => p.payment_method !== 'credit') || [];
                                const totalPaid = validPayments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
                                const balanceDue = parseFloat(order.total_amount) - totalPaid;
                                return (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3 font-medium text-blue-600"><a href={route('owner.orders.show', order.id)} className="hover:underline">{order.id}</a></td>
                                        <td className="px-4 py-3 font-semibold">{order.job?.vehicle?.vehicle_number || '-'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(order.created_at).toLocaleString('en-GB')}</td>
                                        <td className="px-4 py-3">{order.job?.owner?.name || '-'}</td>
                                        <td className="px-4 py-3 text-right font-semibold">Rs.{parseFloat(order.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-green-600">Rs.{totalPaid.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                        <td className="px-4 py-3 text-right font-bold text-orange-600">Rs.{balanceDue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => setPayModalOrder({
                                                    invoiceId: order.id,
                                                    customer: order.job?.owner?.name || 'Customer',
                                                    totalAmount: parseFloat(order.total_amount),
                                                    balanceDue,
                                                })}
                                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg shadow-sm shadow-emerald-600/30 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                                            >
                                                💰 Pay
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!creditOrders?.data || creditOrders.data.length === 0) && <tr><td colSpan="8" className="px-4 py-6 text-center text-gray-400">No active credit customers.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {creditOrders?.links && <Pagination paginator={creditOrders} />}
                </>
            )}

            {/* ── Pending ── */}
            {activeReport === 'pending' && (
                <>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-2">Order Number</th>
                                <th className="px-4 py-2">Vehicle</th>
                                <th className="px-4 py-2">Customer Name</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2 text-right">Full Amount</th>
                                <th className="px-4 py-2 text-right">Received Amount</th>
                                <th className="px-4 py-2 text-right">Pending Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pendingJobs?.data?.map(job => {
                                const validPayments = job.payments?.filter(p => p.payment_method !== 'credit') || [];
                                const received = validPayments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
                                const pending = parseFloat(job.total_cost || 0) - received;
                                return (
                                <tr key={job.id}>
                                    <td className="px-4 py-3 font-medium text-blue-600">{job.id}</td>
                                    <td className="px-4 py-3 font-semibold">{job.vehicle?.vehicle_number || '-'}</td>
                                    <td className="px-4 py-3">{job.owner?.name || '-'}</td>
                                    <td className="px-4 py-3 uppercase text-xs font-bold text-orange-500">{job.status?.replace('_', ' ')}</td>
                                    <td className="px-4 py-3 text-right font-semibold">Rs.{parseFloat(job.total_cost || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-green-600">Rs.{received.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                    <td className="px-4 py-3 text-right font-bold text-red-600">Rs.{pending.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                </tr>
                            );})}
                            {(!pendingJobs?.data || pendingJobs.data.length === 0) && <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-400">No pending or active jobs found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {pendingJobs?.links && <Pagination paginator={pendingJobs} />}
                </>
            )}

            {/* ── Customers ── */}
            {activeReport === 'customers' && (
                <>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-2">Customer Name</th>
                                <th className="px-4 py-2">Phone / Email</th>
                                <th className="px-4 py-2 text-center">Total Orders</th>
                                <th className="px-4 py-2 text-right">Total Price</th>
                                <th className="px-4 py-2 text-right">Pending Payment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {topCustomers?.data?.map(cust => (
                                <tr key={cust.id}>
                                    <td className="px-4 py-3 font-semibold">{cust.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{cust.phone || cust.email || '-'}</td>
                                    <td className="px-4 py-3 text-center">{cust.jobs_count}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">Rs.{parseFloat(cust.jobs_sum_total_cost || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                    <td className="px-4 py-3 text-right font-bold text-orange-600">Rs.{parseFloat(cust.pending_balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                </tr>
                            ))}
                            {(!topCustomers?.data || topCustomers.data.length === 0) && <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">No customers found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {topCustomers?.links && <Pagination paginator={topCustomers} />}
                </>
            )}

            {/* ── Deleted Orders ── */}
            {activeReport === 'deleted_orders' && (
                <>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-2">Order No</th>
                                <th className="px-4 py-2">Vehicle Number</th>
                                <th className="px-4 py-2">Customer Name</th>
                                <th className="px-4 py-2 text-right">Total Price</th>
                                <th className="px-4 py-2">Deleted By</th>
                                <th className="px-4 py-2">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {deletedOrders?.data?.map(order => (
                                <tr key={order.id} className="bg-rose-50/50">
                                    <td className="px-4 py-3 font-medium text-rose-600">#{order.invoice_number || order.id}</td>
                                    <td className="px-4 py-3 font-semibold">{order.vehicle_number || '-'}</td>
                                    <td className="px-4 py-3">{order.customer_name || '-'}</td>
                                    <td className="px-4 py-3 text-right font-black text-slate-800">Rs.{parseFloat(order.total_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                    <td className="px-4 py-3 text-slate-600 font-bold">{order.deleted_by_name || 'Unknown'}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500 font-bold">{new Date(order.created_at).toLocaleString('en-GB')}</td>
                                </tr>
                            ))}
                            {(!deletedOrders?.data || deletedOrders.data.length === 0) && <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-400 font-bold">No deleted orders found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {deletedOrders?.links && <Pagination paginator={deletedOrders} />}
                </>
            )}
        </div>
    );
}
