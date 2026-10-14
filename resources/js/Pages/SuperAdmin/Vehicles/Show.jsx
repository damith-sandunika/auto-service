import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const TABS = [
    { key: 'service_history', label: 'Service History' },
    { key: 'ownership_history', label: 'Ownership History' },
];

export default function VehicleShow({
    vehicle,
    serviceHistory = [],
    ownershipHistory = [],
    stats = {},
}) {
    const [activeTab, setActiveTab] = useState('service_history');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Completed
                </span>
            );
        }
        if (s === 'in_progress' || s === 'pending') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                    {s === 'in_progress' ? 'In Progress' : 'Pending'}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-100 text-slate-700">
                {status || 'Unknown'}
            </span>
        );
    };

    const filteredJobs = serviceHistory.filter((job) => {
        if (!dateFilter.start && !dateFilter.end) return true;
        const jobDate = job.date || '';
        if (dateFilter.start && jobDate < dateFilter.start) return false;
        if (dateFilter.end && jobDate > dateFilter.end) return false;
        return true;
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-bold text-slate-800">Vehicle Profile</h2>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-extrabold uppercase tracking-wider">
                            Super Admin View
                        </span>
                    </div>
                    <Link
                        href={route('saas.vehicles.index')}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors shadow-sm text-xs flex items-center gap-1.5"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Vehicles
                    </Link>
                </div>
            }
        >
            <Head title={`Vehicle ${vehicle.vehicle_number}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                
                {/* 1. Vehicle Hero Banner (Matching GlobalProfile style) */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 rounded-2xl shadow-md shadow-blue-500/20 overflow-hidden text-center text-white relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl pointer-events-none"></div>
                    <div className="px-6 py-8 relative z-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl border border-white/20 mb-4 backdrop-blur-sm shadow-inner">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-wider mb-1 drop-shadow-sm">
                            {vehicle.vehicle_number}
                        </h3>
                        <p className="text-blue-100 font-medium tracking-wide text-sm">
                            {vehicle.make || 'Unknown Make'} {vehicle.model || ''} {vehicle.year ? `(${vehicle.year})` : ''}
                        </p>
                        
                        <div className="mt-5 inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 bg-black/20 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-md">
                            <span className="text-[10px] uppercase tracking-widest font-black text-blue-200">Owner:</span>
                            {vehicle.owner ? (
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-white">{vehicle.owner.name}</span>
                                    <span className="text-blue-200/50 text-xs">•</span>
                                    <span className="text-sm font-medium text-blue-100">{vehicle.owner.phone || 'No phone'}</span>
                                </div>
                            ) : (
                                <span className="text-sm italic font-medium text-blue-200">Unassigned</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Super Admin Cross-Tenant Telemetry Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Jobs</span>
                            <span className="text-xl font-black text-slate-900">{stats.total_jobs || serviceHistory.length}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Lifetime Spend</span>
                            <span className="text-xl font-black text-emerald-600">{formatCurrency(stats.total_spend)}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Companies</span>
                            <span className="text-xl font-black text-indigo-700">{stats.companies_count || 1}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Branches</span>
                            <span className="text-xl font-black text-purple-700">{stats.branches_count || 1}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Tabs */}
                <div className="flex border-b border-slate-200">
                    {TABS.map((tab) => {
                        const count = tab.key === 'service_history' ? serviceHistory.length : ownershipHistory.length;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                                    activeTab === tab.key
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* 4. Tab 1: Service History Tab */}
                {activeTab === 'service_history' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Global Service Records</h3>
                                <p className="text-xs text-slate-500">Cross-tenant work orders aggregated from all company databases.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                                <input
                                    type="date"
                                    className="text-xs border-none focus:ring-0 text-slate-600 font-medium py-1"
                                    value={dateFilter.start}
                                    onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                                />
                                <span className="text-slate-300">-</span>
                                <input
                                    type="date"
                                    className="text-xs border-none focus:ring-0 text-slate-600 font-medium py-1"
                                    value={dateFilter.end}
                                    onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                                />
                                {(dateFilter.start || dateFilter.end) && (
                                    <button
                                        onClick={() => setDateFilter({ start: '', end: '' })}
                                        className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">
                                {filteredJobs.length} Total Records
                            </span>
                        </div>

                        <div className="p-5 md:p-6">
                            {filteredJobs.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <div className="w-12 h-12 bg-white text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-slate-700 mb-1 text-sm">No Service History</h4>
                                    <p className="text-slate-500 text-xs">No records found for the selected criteria.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {filteredJobs.map((job) => (
                                        <div key={`${job.company_id}-${job.id}`} className="relative pl-6 border-l-2 border-blue-200 pb-2">
                                            <div className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full -left-[7px] top-1.5 shadow-sm"></div>
                                            
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <span className="text-sm font-black text-slate-800">{job.date || job.created_at}</span>
                                                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded shadow-xs">{job.time}</span>
                                                    
                                                    {/* ONLY FOR SUPER ADMIN: Company Name and Branch Name Badges */}
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                                                        <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        <span>Company: {job.company_name}</span>
                                                    </span>

                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                                                        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span>Branch: {job.branch_name}</span>
                                                    </span>

                                                    {getStatusBadge(job.status)}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Mileage: {job.mileage || 'N/A'}
                                                    </span>
                                                    {job.total_cost > 0 && (
                                                        <span className="text-xs font-black text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                                                            {formatCurrency(job.total_cost)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {job.description && (
                                                <p className="text-slate-600 font-medium text-sm mb-3">
                                                    {job.description}
                                                </p>
                                            )}

                                            {job.items?.length > 0 && (
                                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1.5">
                                                        Services &amp; Parts Replaced
                                                    </h5>
                                                    <ul className="space-y-1.5">
                                                        {job.items.map((item, idx) => (
                                                            <li key={idx} className="text-xs font-bold text-slate-700 flex items-start justify-between gap-2">
                                                                <div className="flex items-start gap-2">
                                                                    <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                                        <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </div>
                                                                    <span>
                                                                        {item.description} {parseFloat(item.quantity) > 1 && <span className="text-slate-400 font-medium ml-1">({item.quantity} units)</span>}
                                                                    </span>
                                                                </div>
                                                                {item.price > 0 && (
                                                                    <span className="text-slate-500 font-bold text-[11px]">
                                                                        {formatCurrency(item.price)}
                                                                    </span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 5. Tab 2: Ownership History Tab */}
                {activeTab === 'ownership_history' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 text-sm">Ownership History</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Track the timeline of owners across registered companies.</p>
                        </div>
                        <div className="p-5 md:p-6">
                            {ownershipHistory.length === 0 ? (
                                <p className="text-slate-500 text-sm font-bold text-center py-8">No ownership history recorded.</p>
                            ) : (
                                <div className="space-y-4">
                                    {ownershipHistory.map((oh, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 transition-colors"
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${oh.is_current ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                                    <h4 className="font-bold text-sm text-slate-800">{oh.name}</h4>
                                                    {oh.is_current && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded">
                                                            Current Owner
                                                        </span>
                                                    )}
                                                    {/* ONLY FOR SUPER ADMIN: Company Name */}
                                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded">
                                                        Company: {oh.company_name}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-medium text-slate-500">
                                                    {oh.phone || 'No phone'} &bull; {oh.email || 'No email'} &bull; Registered: {oh.registered_at}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
