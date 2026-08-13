import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

export default function Reports({ startDate, endDate, stats, orders, services, expenses, creditOrders }) {
    const [activeReport, setActiveReport] = useState('services');
    
    // For Pending Orders Modal
    const [pendingModalOpen, setPendingModalOpen] = useState(false);
    const [selectedServiceName, setSelectedServiceName] = useState('');
    const [selectedServiceOrders, setSelectedServiceOrders] = useState([]);

    const applyFilter = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        router.get(route('owner.reports.index'), {
            start_date: fd.get('start_date'),
            end_date: fd.get('end_date')
        });
    };

    const handleCreditPayment = (e, orderId, maxAmount) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const amount = fd.get('amount');
        const method = fd.get('payment_method');
        
        if (amount > maxAmount) {
            alert('Cannot pay more than the balance due.');
            return;
        }

        router.post(route('owner.orders.payments.store', orderId), {
            amount: amount,
            payment_method: method
        }, {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Business Reports</h2>} fullWidth={true}>
            <Head title="Reports" />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* Header text */}
                <div className="mb-2">
                    <h2 className="text-2xl font-black text-slate-800">Business Reports</h2>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Analyze sales, revenue, and payroll</p>
                </div>

                {/* Filter Form */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100 shadow-sm">
                    <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Start Date</label>
                            <input type="date" name="start_date" defaultValue={startDate} className="text-sm border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">End Date</label>
                            <input type="date" name="end_date" defaultValue={endDate} className="text-sm border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors">
                            Apply Filter
                        </button>
                    </form>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-md border border-gray-100 shadow-sm">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Sales Revenue</h4>
                        <p className="text-2xl font-bold text-gray-900">Rs.{stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-white p-5 rounded-md border border-gray-100 shadow-sm">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Done Payments (Collected)</h4>
                        <p className="text-2xl font-bold text-green-600">Rs.{stats.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        <div className="mt-2 text-[11px] font-bold text-gray-500 flex justify-between">
                            <span>💵 Cash: Rs.{stats.collectedCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            <span>💳 Card: Rs.{stats.collectedCard.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-md border border-gray-100 shadow-sm">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Pending Payments</h4>
                        <p className="text-2xl font-bold text-red-500">Rs.{stats.totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* Reports Content Wrapper */}
                <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
                    
                    {/* Premium Horizontally Scrollable Tab Header */}
                    <div className="p-3 border-b border-gray-100 bg-gray-50/50 overflow-x-auto scrollbar-hide">
                        <div className="flex gap-2 w-max bg-gray-200/50 p-1 rounded-xl">
                            <button onClick={() => setActiveReport('services')} 
                                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${activeReport === 'services' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>
                                Service Breakdown
                            </button>
                            <button onClick={() => setActiveReport('sales')} 
                                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${activeReport === 'sales' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>
                                Sales Log
                            </button>
                            <button onClick={() => setActiveReport('expenses')} 
                                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${activeReport === 'expenses' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>
                                Expenses / Salaries Log
                            </button>
                            <button onClick={() => setActiveReport('credit')} 
                                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${activeReport === 'credit' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>
                                Credit Customers
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        
                        {/* SERVICE BREAKDOWN */}
                        {activeReport === 'services' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-2">Service Name</th>
                                            <th className="px-4 py-2 text-center">Total Count</th>
                                            <th className="px-4 py-2 text-right">Revenue Generated</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {services.map((serv, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 font-semibold">{serv.name}</td>
                                                <td className="px-4 py-3 text-center">{serv.total_qty}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-blue-600">Rs.{serv.total_revenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                            </tr>
                                        ))}
                                        {services.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-4 py-6 text-center text-gray-400">No service usage tracked in this range.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* SALES LOG */}
                        {activeReport === 'sales' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-2">Order No</th>
                                            <th className="px-4 py-2">Vehicle / Customer</th>
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td className="px-4 py-3 font-medium text-blue-600">
                                                    <a href={route('owner.orders.show', order.id)} className="hover:underline">ORD-{order.id.toString().padStart(5, '0')}</a>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {order.job?.vehicle?.vehicle_number || 'Walk-in'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500">
                                                    {new Date(order.created_at).toLocaleString('en-GB')}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold">Rs.{parseFloat(order.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-6 text-center text-gray-400">No sales record in this range.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* EXPENSES LOG */}
                        {activeReport === 'expenses' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2">Type</th>
                                            <th className="px-4 py-2">Details</th>
                                            <th className="px-4 py-2 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {expenses.map(exp => (
                                            <tr key={exp.id}>
                                                <td className="px-4 py-3 text-xs text-gray-500">{new Date(exp.expense_date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-medium capitalize text-gray-700">{exp.category}</td>
                                                <td className="px-4 py-3 text-gray-600">{exp.description}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-red-600">Rs.{parseFloat(exp.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                            </tr>
                                        ))}
                                        {expenses.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-6 text-center text-gray-400">No expenses logged in this range.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* CREDIT CUSTOMERS LOG */}
                        {activeReport === 'credit' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-2">Order No</th>
                                            <th className="px-4 py-2">Vehicle</th>
                                            <th className="px-4 py-2">Date Issued</th>
                                            <th className="px-4 py-2 text-right">Total</th>
                                            <th className="px-4 py-2 text-right">Balance Due</th>
                                            <th className="px-4 py-2 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {creditOrders.map(order => {
                                            const totalPaid = order.payments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
                                            const balanceDue = parseFloat(order.total_amount) - totalPaid;
                                            return (
                                                <tr key={order.id}>
                                                    <td className="px-4 py-3 font-medium text-blue-600">
                                                        <a href={route('owner.orders.show', order.id)} className="hover:underline">ORD-{order.id.toString().padStart(5, '0')}</a>
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold">{order.job?.vehicle?.vehicle_number || '-'}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(order.created_at).toLocaleString('en-GB')}</td>
                                                    <td className="px-4 py-3 text-right font-semibold">Rs.{parseFloat(order.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-orange-600">Rs.{balanceDue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <form onSubmit={(e) => handleCreditPayment(e, order.id, balanceDue)} className="flex gap-2 items-center justify-center flex-wrap">
                                                            <input type="number" name="amount" defaultValue={balanceDue} step="0.01" max={balanceDue} className="w-24 px-2 py-1 border border-gray-300 rounded text-xs" required />
                                                            <select name="payment_method" className="w-24 px-2 py-1 pr-6 border border-gray-300 rounded text-xs bg-white appearance-auto">
                                                                <option value="cash">💵 Cash</option>
                                                                <option value="card">💳 Card</option>
                                                            </select>
                                                            <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 whitespace-nowrap">✓ Pay</button>
                                                        </form>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {creditOrders.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-6 text-center text-gray-400">No active credit customers.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
