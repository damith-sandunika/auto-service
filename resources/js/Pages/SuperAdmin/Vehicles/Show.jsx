import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function VehicleShow({
    vehicle,
    serviceHistory = [],
    ownershipHistory = [],
    stats = {},
}) {
    const [activeTab, setActiveTab] = useState('services'); // 'services' | 'ownership'
    const [expandedJobIds, setExpandedJobIds] = useState({});

    const toggleJobExpand = (id) => {
        setExpandedJobIds((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'completed' || s === 'done') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Completed
                </span>
            );
        }
        if (s === 'in_progress' || s === 'pending') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    {s === 'in_progress' ? 'In Progress' : 'Pending'}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
                {status || 'Unknown'}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                            <Link href={route('saas.vehicles.index')} className="hover:text-blue-600 transition-colors">
                                Vehicles Database
                            </Link>
                            <span>/</span>
                            <span className="text-slate-600">{vehicle.vehicle_number}</span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <span>Vehicle Passport & Profile</span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-extrabold">
                                Super Admin Global View
                            </span>
                        </h1>
                    </div>
                    <Link
                        href={route('saas.vehicles.index')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-colors shadow-2xs"
                    >
                        <span>&larr; Back to Vehicles</span>
                    </Link>
                </div>
            }
        >
            <Head title={`Vehicle Profile - ${vehicle.vehicle_number}`} />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* 1. Vehicle Identity Card & Cross-Tenant Telemetry */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-3">
                            <div className="inline-block bg-white text-slate-900 border-2 border-slate-200 px-4 py-1.5 rounded-xl font-mono font-black text-xl md:text-2xl tracking-widest shadow-inner">
                                {vehicle.vehicle_number}
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                                    {vehicle.make || 'Unknown Make'} {vehicle.model || ''}
                                </h2>
                                <p className="text-xs md:text-sm text-slate-300 font-semibold mt-0.5">
                                    {vehicle.year ? `Model Year: ${vehicle.year}` : 'Year: N/A'} &bull; Registered:{' '}
                                    {new Date(vehicle.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Top Summary Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-300">
                                    Total Jobs
                                </span>
                                <span className="text-2xl font-black text-white">{stats.total_jobs || 0}</span>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-300">
                                    Lifetime Spend
                                </span>
                                <span className="text-lg md:text-xl font-black text-emerald-400">
                                    {formatCurrency(stats.total_spend)}
                                </span>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-300">
                                    Companies Visited
                                </span>
                                <span className="text-2xl font-black text-indigo-300">{stats.companies_count || 0}</span>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-300">
                                    Branches Visited
                                </span>
                                <span className="text-2xl font-black text-blue-300">{stats.branches_count || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Navigation Tabs */}
                <div className="flex border-b border-slate-200 gap-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab('services')}
                        className={`pb-3 px-1 text-sm font-black border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'services'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <span>Cross-Tenant Service History</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 font-extrabold">
                            {serviceHistory.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('ownership')}
                        className={`pb-3 px-1 text-sm font-black border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'ownership'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <span>Customer & Ownership Records</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-extrabold">
                            {ownershipHistory.length}
                        </span>
                    </button>
                </div>

                {/* 3. Tab Contents */}
                {activeTab === 'services' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-black text-slate-900">
                                Global Work Orders & Job Timelines
                            </h3>
                            <span className="text-xs font-semibold text-slate-500">
                                Aggregated across all tenant company databases
                            </span>
                        </div>

                        {serviceHistory.length > 0 ? (
                            <div className="space-y-4">
                                {serviceHistory.map((job) => {
                                    const isExpanded = !!expandedJobIds[job.id];
                                    return (
                                        <div
                                            key={`${job.company_id}-${job.id}`}
                                            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                
                                                {/* Left: Company & Branch Origin */}
                                                <div className="space-y-1.5">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {/* Company Badge */}
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                            <span>Company: {job.company_name}</span>
                                                        </span>

                                                        {/* Branch Badge */}
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span>Branch: {job.branch_name}</span>
                                                        </span>

                                                        {getStatusBadge(job.status)}
                                                    </div>

                                                    <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-3 pt-1">
                                                        <span>📅 {job.created_at}</span>
                                                        {job.branch_address && <span>📍 {job.branch_address}</span>}
                                                        {job.branch_phone && <span>📞 {job.branch_phone}</span>}
                                                    </div>
                                                </div>

                                                {/* Right: Cost & Expand Items */}
                                                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                                                    <div className="text-left md:text-right">
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                                            Job Total
                                                        </span>
                                                        <span className="text-lg font-black text-slate-900">
                                                            {formatCurrency(job.total_cost)}
                                                        </span>
                                                    </div>

                                                    {job.items && job.items.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleJobExpand(job.id)}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                                                        >
                                                            <span>{isExpanded ? 'Hide Items' : `View ${job.items.length} Items`}</span>
                                                            <svg
                                                                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth="2.5"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>

                                            </div>

                                            {/* Job Items Dropdown */}
                                            {isExpanded && job.items && job.items.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-5 rounded-b-2xl space-y-2">
                                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                                                        Services & Replacement Parts
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                                        {job.items.map((item, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex justify-between items-center"
                                                            >
                                                                <div>
                                                                    <div className="text-xs font-bold text-slate-900">
                                                                        {item.description || 'Service Item'}
                                                                    </div>
                                                                    <div className="text-[10px] font-semibold text-slate-400 capitalize">
                                                                        Type: {item.type} &bull; Qty: {item.quantity}
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs font-black text-slate-700">
                                                                    {formatCurrency(item.price * item.quantity)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
                                <div className="text-3xl">🛠️</div>
                                <h4 className="text-sm font-black text-slate-700">No Service Records Found</h4>
                                <p className="text-xs font-medium text-slate-500">
                                    No tenant garage has logged work orders for this vehicle yet.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Ownership History Tab */}
                {activeTab === 'ownership' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-black text-slate-900">
                                Registered Customers & Ownership Records
                            </h3>
                            <span className="text-xs font-semibold text-slate-500">
                                Linked customer profiles across garages
                            </span>
                        </div>

                        {ownershipHistory.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Customer Name</th>
                                            <th className="px-6 py-4">Contact Phone</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Registered By Company</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {ownershipHistory.map((owner, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-4 font-black text-slate-900">
                                                    {owner.name}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-700">
                                                    {owner.phone || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                                    {owner.email || '—'}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-indigo-700">
                                                    {owner.company_name}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {owner.is_current ? (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            Current Owner
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                                                            Past Owner
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
                                <div className="text-3xl">👤</div>
                                <h4 className="text-sm font-black text-slate-700">No Ownership Records Linked</h4>
                                <p className="text-xs font-medium text-slate-500">
                                    No customer profiles have been linked to this vehicle across garages yet.
                                </p>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
