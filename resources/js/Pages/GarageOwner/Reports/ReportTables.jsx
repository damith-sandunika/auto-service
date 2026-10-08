import React from 'react';
import { router } from '@inertiajs/react';
import SearchableSelect from '@/Components/SearchableSelect';

export default function ReportTables({ activeReport, services, orders, expenses, creditOrders }) {
    const handleCreditPayment = (e, orderId, maxAmount) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const amount = fd.get('amount');
        if (amount > maxAmount) { alert('Cannot pay more than the balance due.'); return; }
        router.post(route('owner.orders.payments.store', orderId), { amount, payment_method: fd.get('payment_method') }, { preserveScroll: true });
    };

    return (
        <div className="p-6">
            {activeReport === 'services' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b"><tr><th className="px-4 py-2">Service Name</th><th className="px-4 py-2 text-center">Total Count</th><th className="px-4 py-2 text-right">Revenue Generated</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {services.map((serv, i) => <tr key={i}><td className="px-4 py-3 font-semibold">{serv.name}</td><td className="px-4 py-3 text-center">{serv.total_qty}</td><td className="px-4 py-3 text-right font-semibold text-blue-600">Rs.{serv.total_revenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td></tr>)}
                            {services.length === 0 && <tr><td colSpan="3" className="px-4 py-6 text-center text-gray-400">No service usage tracked in this range.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
            {activeReport === 'sales' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b"><tr><th className="px-4 py-2">Order No</th><th className="px-4 py-2">Vehicle / Customer</th><th className="px-4 py-2">Date</th><th className="px-4 py-2 text-right">Total</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map(order => <tr key={order.id}><td className="px-4 py-3 font-medium text-blue-600"><a href={route('owner.orders.show', order.id)} className="hover:underline">ORD-{order.id.toString().padStart(5, '0')}</a></td><td className="px-4 py-3">{order.job?.vehicle?.vehicle_number || 'Walk-in'}</td><td className="px-4 py-3 text-xs text-gray-500">{new Date(order.created_at).toLocaleString('en-GB')}</td><td className="px-4 py-3 text-right font-semibold">Rs.{parseFloat(order.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td></tr>)}
                            {orders.length === 0 && <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-400">No sales record in this range.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
            {activeReport === 'expenses' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b"><tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Details</th><th className="px-4 py-2 text-right">Amount</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {expenses.map(exp => <tr key={exp.id}><td className="px-4 py-3 text-xs text-gray-500">{new Date(exp.expense_date).toLocaleDateString()}</td><td className="px-4 py-3 font-medium capitalize text-gray-700">{exp.category}</td><td className="px-4 py-3 text-gray-600">{exp.description}</td><td className="px-4 py-3 text-right font-semibold text-red-600">Rs.{parseFloat(exp.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td></tr>)}
                            {expenses.length === 0 && <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-400">No expenses logged in this range.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
            {activeReport === 'credit' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b"><tr><th className="px-4 py-2">Order No</th><th className="px-4 py-2">Vehicle</th><th className="px-4 py-2">Date Issued</th><th className="px-4 py-2 text-right">Total</th><th className="px-4 py-2 text-right">Balance Due</th><th className="px-4 py-2 text-center">Action</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {creditOrders.map(order => {
                                const totalPaid = order.payments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
                                const balanceDue = parseFloat(order.total_amount) - totalPaid;
                                return (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3 font-medium text-blue-600"><a href={route('owner.orders.show', order.id)} className="hover:underline">ORD-{order.id.toString().padStart(5, '0')}</a></td>
                                        <td className="px-4 py-3 font-semibold">{order.job?.vehicle?.vehicle_number || '-'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(order.created_at).toLocaleString('en-GB')}</td>
                                        <td className="px-4 py-3 text-right font-semibold">Rs.{parseFloat(order.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                        <td className="px-4 py-3 text-right font-bold text-orange-600">Rs.{balanceDue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                        <td className="px-4 py-3 text-center">
                                            <form onSubmit={(e) => handleCreditPayment(e, order.id, balanceDue)} className="flex gap-2 items-center justify-center flex-wrap">
                                                <input type="number" name="amount" defaultValue={balanceDue} step="0.01" max={balanceDue} className="w-24 px-2 py-1 border border-gray-300 rounded text-xs" required />
                                                <div className="w-32">
                                                    <SearchableSelect name="payment_method" isClearable={false} options={[{value: 'cash', label: '💵 Cash'}, {value: 'card', label: '💳 Card'}]} value="cash" />
                                                </div>
                                                <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 whitespace-nowrap">✓ Pay</button>
                                            </form>
                                        </td>
                                    </tr>
                                );
                            })}
                            {creditOrders.length === 0 && <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-400">No active credit customers.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
