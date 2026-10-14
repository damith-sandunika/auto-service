import React, { useState } from 'react';
import Badge from '@/Components/Badge';
import Pagination from '@/Components/Pagination';
import { router } from '@inertiajs/react';

const formatPrice = (price) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price);

export default function OrdersTable({ invoices, filters = {}, selectedBranchId, onPay, onDelete }) {
    const [search, setSearch] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (selectedBranchId) params.branch_id = selectedBranchId;
        router.get(route('owner.orders.index'), params, { preserveState: true, replace: true });
    };

    const handleClear = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
        const params = {};
        if (selectedBranchId) params.branch_id = selectedBranchId;
        router.get(route('owner.orders.index'), params, { preserveState: true, replace: true });
    };

    const hasActiveFilters = !!(filters.search || filters.start_date || filters.end_date);

    return (
        <div className="space-y-4">
            {/* Filter Bar: Search and Date Range */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                <form onSubmit={handleFilter} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Order ID (#), Vehicle Plate, Customer, or Deleted by..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                        />
                    </div>

                    {/* Date Filters & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                            <span className="text-xs font-bold text-slate-400">From:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border-none bg-transparent p-0 text-xs font-bold text-slate-700 focus:ring-0"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                            <span className="text-xs font-bold text-slate-400">To:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border-none bg-transparent p-0 text-xs font-bold text-slate-700 focus:ring-0"
                            />
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs shadow-blue-500/20 transition-all flex items-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filter
                        </button>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Total Results Counter */}
            <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    {invoices?.total ?? 0} Orders in Sequential Audit Registry
                </span>
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Vehicle</th>
                            <th className="px-6 py-4">Customer Name</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Status &amp; Audit Trail</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(!invoices?.data || invoices.data.length === 0) ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold text-sm">
                                    No orders match the search or filter criteria.
                                </td>
                            </tr>
                        ) : (
                            invoices.data.map((inv) => {
                                const isDeleted = !!inv.is_deleted;
                                const fullAmount = parseFloat(inv.total_amount) || 0;
                                const totalPaid = parseFloat(inv.total_paid) || 0;
                                const balance = parseFloat(inv.balance) || 0;
                                const isPaid = !isDeleted && (balance <= 0 || inv.status === 'paid');

                                return (
                                    <tr
                                        key={inv.id}
                                        className={`transition-colors ${
                                            isDeleted
                                                ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-500'
                                                : 'hover:bg-slate-50/70'
                                        }`}
                                    >
                                        {/* Order ID */}
                                        <td className="px-6 py-4 font-black text-base">
                                            <div className="flex items-center gap-2">
                                                {isDeleted && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 animate-pulse"></span>}
                                                <span className={isDeleted ? 'text-rose-950 font-black' : 'text-slate-900 font-black'}>
                                                    {inv.display_number || `#${inv.invoice_number || inv.id}`}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Vehicle */}
                                        <td className="px-6 py-4 font-bold text-slate-800">
                                            {inv.vehicle_plate || 'Unknown'}
                                        </td>

                                        {/* Customer Name */}
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {inv.customer_name || 'Walk-in Customer'}
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-4">
                                            {isDeleted ? (
                                                <div>
                                                    <span className="line-through text-slate-400 font-bold text-sm block">
                                                        {formatPrice(fullAmount)}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-100/70 px-1.5 py-0.5 rounded">
                                                        VOIDED
                                                    </span>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="font-black text-slate-900 text-base mb-1">
                                                        {formatPrice(fullAmount)}
                                                    </div>
                                                    {isPaid ? (
                                                        <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                                                            Fully Paid
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 text-[11px] font-bold">
                                                            <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                                Rec: {formatPrice(totalPaid)}
                                                            </span>
                                                            <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                                                Due: {formatPrice(balance)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        {/* Status & Anti-Fraud Audit Trail */}
                                        <td className="px-6 py-4">
                                            {isDeleted ? (
                                                <div className="space-y-1">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider">
                                                        <svg className="w-3 h-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Deleted Order
                                                    </span>
                                                    <div className="text-xs font-bold text-slate-700">
                                                        Deleted by: <span className="text-rose-700 font-black">{inv.deleted_by_name || 'Staff'}</span>
                                                    </div>
                                                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                                        <span>🕒</span>
                                                        <span>{inv.deleted_at || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-start gap-1">
                                                    <Badge variant={inv.job_status === 'completed' ? 'success' : 'warning'}>
                                                        Order {inv.job_status ? inv.job_status.replace('_', ' ') : 'Completed'}
                                                    </Badge>
                                                    <span
                                                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                                            isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                                                        }`}
                                                    >
                                                        Payment {isPaid ? 'Paid' : 'Pending'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            {isDeleted ? (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-rose-700 bg-rose-100/90 border border-rose-200 px-3 py-1.5 rounded-lg shadow-2xs">
                                                    <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    Audit Locked
                                                </span>
                                            ) : (
                                                <div className="flex justify-end gap-2 items-center h-full">
                                                    {!isPaid && (
                                                        <button
                                                            onClick={() => onPay(inv)}
                                                            className="text-white hover:bg-emerald-700 transition-colors px-3 py-1.5 bg-emerald-600 rounded-lg font-bold text-xs shadow-sm whitespace-nowrap"
                                                        >
                                                            Add Pay
                                                        </button>
                                                    )}
                                                    <a
                                                        href={route('owner.orders.show', inv.id)}
                                                        className="text-slate-600 hover:text-blue-600 transition-colors p-1.5 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200"
                                                        title="View Details"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </a>
                                                    <a
                                                        href={route('owner.orders.print', inv.id)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-slate-600 hover:text-slate-900 transition-colors p-1.5 bg-slate-50 hover:bg-slate-200 rounded-lg border border-slate-200"
                                                        title="Print"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                        </svg>
                                                    </a>
                                                    <a
                                                        href={route('owner.orders.edit', inv.id)}
                                                        className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </a>
                                                    <button
                                                        onClick={() => onDelete(inv)}
                                                        className="text-slate-400 hover:text-red-600 transition-colors p-1.5 bg-slate-50 hover:bg-red-50 rounded-lg border border-slate-200"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {invoices?.links && <Pagination paginator={invoices} />}
        </div>
    );
}
