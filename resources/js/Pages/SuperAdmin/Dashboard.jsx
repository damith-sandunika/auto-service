import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

export default function Dashboard({
    stats,
    companies = [],
    topMakes = [],
    vehicleTrend = [],
    recentVehicles = [],
}) {
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const BRAND_COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Multi-Tenant SaaS Engine
                            </span>
                            <span className="text-xs font-bold text-slate-400">&bull; Central Operations</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Super Admin Dashboard</h1>
                        <p className="text-xs text-slate-500 font-medium">Real-time health, fleet telemetry, and cross-company analytics</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('saas.companies.index')}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Company</span>
                        </Link>
                        <Link
                            href={route('saas.vehicles.index')}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <span>Vehicles Database</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Super Admin Dashboard" />

            <div className="max-w-7xl mx-auto space-y-8 pb-12">
                
                {/* 1. Core KPIs Stat Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* Companies */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Registered Companies</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats?.total_companies || 0}</h3>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Live Multi-DB</span>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-500 mt-2">
                                    Total {stats?.total_branches || 0} active garage branches
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <Link href={route('saas.companies.index')} className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                <span>Manage Companies</span>
                                <span>&rarr;</span>
                            </Link>
                        </div>
                    </div>

                    {/* Vehicles Database */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Central Vehicles</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats?.total_vehicles || 0}</h3>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Global Fleet</span>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-500 mt-2">
                                    Across all tenant customer histories
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <Link href={route('saas.vehicles.index')} className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                <span>View Vehicles Database</span>
                                <span>&rarr;</span>
                            </Link>
                        </div>
                    </div>

                    {/* Makes & Models Catalog */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Makes & Models Master</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats?.total_makes || 0}</h3>
                                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                        {stats?.total_models || 0} Models
                                    </span>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-500 mt-2">
                                    Standard catalog for all garages
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <Link href={route('saas.vehicle-master.index')} className="font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                                <span>Catalog Management</span>
                                <span>&rarr;</span>
                            </Link>
                        </div>
                    </div>

                    {/* Platform Total Invoiced Volume */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Network Volume</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                        {formatCurrency(stats?.total_revenue)}
                                    </h3>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-500 mt-2">
                                    {stats?.total_invoices || 0} invoices &bull; {stats?.total_jobs || 0} jobs
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-500">
                                Staff: <span className="font-bold text-slate-800">{stats?.total_staff || 0}</span> | Customers: <span className="font-bold text-slate-800">{stats?.total_customers || 0}</span>
                            </span>
                        </div>
                    </div>

                </div>

                {/* 2. Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* 7-Day Vehicle Onboarding Trend (Area Chart) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div>
                                <h2 className="text-base font-black text-slate-900 tracking-tight">Vehicle Registration Growth</h2>
                                <p className="text-xs font-semibold text-slate-500">Central vehicle inflow over the last 7 days</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                <span className="text-xs font-bold text-slate-600">Registered Vehicles</span>
                            </div>
                        </div>

                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={vehicleTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="vehicleGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            borderRadius: '12px',
                                            border: 'none',
                                            color: '#fff',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                                        }}
                                        itemStyle={{ color: '#93c5fd', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#cbd5e1', fontSize: '11px', marginBottom: '4px' }}
                                        formatter={(val) => [`${val} vehicles`, 'Registered']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="vehicles"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#vehicleGradient)"
                                        dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: '#3b82f6' }}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Vehicle Brands Distribution (Bar Chart) */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
                        <div className="mb-4">
                            <h2 className="text-base font-black text-slate-900 tracking-tight">Top Vehicle Brands</h2>
                            <p className="text-xs font-semibold text-slate-500">Fleet distribution by automotive make</p>
                        </div>

                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topMakes} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#334155', fontWeight: 'bold' }}
                                        width={65}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            borderRadius: '12px',
                                            border: 'none',
                                            color: '#fff',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                                        }}
                                        formatter={(val) => [`${val} vehicles in database`, 'Count']}
                                    />
                                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                                        {topMakes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* 3. Tenant Companies Multi-Database Fleet Overview */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-black text-slate-900">Tenant Companies & Multi-DB Status</h2>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                                    {companies.length} Tenants Live
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                Real-time cross-database status and operational metrics
                            </p>
                        </div>
                        <Link
                            href={route('saas.companies.index')}
                            className="text-xs font-black text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            View All Companies &rarr;
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3.5">Company & Subdomain</th>
                                    <th className="px-6 py-3.5 text-center">Branches</th>
                                    <th className="px-6 py-3.5 text-center">Staff Users</th>
                                    <th className="px-6 py-3.5 text-center">Customers</th>
                                    <th className="px-6 py-3.5 text-center">Work Orders</th>
                                    <th className="px-6 py-3.5 text-right">Revenue</th>
                                    <th className="px-6 py-3.5 text-center">Isolation Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {companies && companies.length > 0 ? (
                                    companies.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                                                        {c.name?.charAt(0) || 'C'}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-800 text-sm">{c.name}</div>
                                                        <div className="text-xs text-blue-600 font-bold flex items-center gap-1">
                                                            <span>http://{c.domain}:8000</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-black bg-slate-100 text-slate-800">
                                                    {c.branches_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-slate-700">
                                                {c.staff_count}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-slate-700">
                                                {c.customers_count}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-slate-700">
                                                {c.jobs_count}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-slate-900">
                                                {formatCurrency(c.revenue)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Isolated DB
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <a
                                                    href={`http://${c.domain}:8000`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    <span>Open Portal</span>
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-10 text-center text-slate-400 font-medium">
                                            No tenant companies found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. Quick Action Super Admin Toolkit & Recent Central Vehicles */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Quick Access Toolkit */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
                        <div className="mb-4">
                            <h2 className="text-base font-black text-slate-900">Super Admin Control Center</h2>
                            <p className="text-xs font-semibold text-slate-500">Essential navigation and administrative tools</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                            <Link
                                href={route('saas.companies.index')}
                                className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group flex flex-col justify-between gap-3 shadow-xs"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xs font-black text-slate-800 group-hover:text-blue-700">Manage Companies</div>
                                    <div className="text-[11px] text-slate-500 font-medium">Tenants, subdomains, DB setup</div>
                                </div>
                            </Link>

                            <Link
                                href={route('saas.owners.index')}
                                className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group flex flex-col justify-between gap-3 shadow-xs"
                            >
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xs font-black text-slate-800 group-hover:text-indigo-700">Company Owners</div>
                                    <div className="text-[11px] text-slate-500 font-medium">Admin credentials & access</div>
                                </div>
                            </Link>

                            <Link
                                href={route('saas.vehicles.index')}
                                className="p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group flex flex-col justify-between gap-3 shadow-xs"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xs font-black text-slate-800 group-hover:text-emerald-700">Vehicles Database</div>
                                    <div className="text-[11px] text-slate-500 font-medium">Central fleet registration</div>
                                </div>
                            </Link>

                            <Link
                                href={route('saas.vehicle-master.index')}
                                className="p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group flex flex-col justify-between gap-3 shadow-xs"
                            >
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xs font-black text-slate-800 group-hover:text-amber-700">Makes & Models</div>
                                    <div className="text-[11px] text-slate-500 font-medium">Global brand catalog</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Recently Registered Vehicles Feed */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-black text-slate-900">Recently Registered Vehicles</h2>
                                <p className="text-xs font-semibold text-slate-500">Live entries in central database</p>
                            </div>
                            <Link
                                href={route('saas.vehicles.index')}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800"
                            >
                                View All &rarr;
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentVehicles && recentVehicles.length > 0 ? (
                                recentVehicles.map((v) => (
                                    <div
                                        key={v.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                                                🚗
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-slate-900 font-mono tracking-wide">
                                                    {v.vehicle_number}
                                                </div>
                                                <div className="text-[11px] font-semibold text-slate-500">
                                                    {v.make} {v.model} {v.year ? `(${v.year})` : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200/60 shadow-2xs">
                                                {v.created_at}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-6">No vehicles registered yet.</p>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}
