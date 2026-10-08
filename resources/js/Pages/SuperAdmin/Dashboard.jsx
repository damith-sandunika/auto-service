import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ stats, recentActivities }) {
    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Super Admin Hub</span>
                <span className="text-2xl font-black text-slate-800">Global System Dashboard</span>
            </div>
        }>
            <Head title="Super Admin Dashboard" />

            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Branches */}
                    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Branches</p>
                                <h4 className="text-4xl font-black text-slate-800 tracking-tight">{stats?.total_branches || 0}</h4>
                            </div>
                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-200/50 shadow-inner">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                            </div>
                        </div>
                    </div>

                    {/* Users */}
                    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Users</p>
                                <h4 className="text-4xl font-black text-slate-800 tracking-tight">{stats?.total_users || 0}</h4>
                            </div>
                            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-200/50 shadow-inner">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                            </div>
                        </div>
                    </div>

                    {/* Revenue */}
                    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">SaaS Revenue</p>
                                <h4 className="text-4xl font-black text-slate-800 tracking-tight">Rs. {stats?.total_revenue?.toLocaleString() || 0}</h4>
                            </div>
                            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-200/50 shadow-inner">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                        </div>
                    </div>

                    {/* Subscriptions */}
                    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Subs</p>
                                <h4 className="text-4xl font-black text-slate-800 tracking-tight">{stats?.active_subscriptions || 0}</h4>
                            </div>
                            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200/50 shadow-inner">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Activity Log */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-800">Recent Branch Activity Log</h3>
                            <div className="flex space-x-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live</span>
                            </div>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="space-y-6">
                                {recentActivities && recentActivities.length > 0 ? recentActivities.map((log) => (
                                    <div key={log.id} className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600 font-black border border-slate-200">
                                            {log.garage?.name?.charAt(0) || '-'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{log.action}</p>
                                            <p className="text-sm text-slate-600">{log.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{log.garage?.name}</span>
                                                <span className="text-xs text-slate-400 font-medium">{new Date(log.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10">
                                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        <p className="text-slate-500 font-medium">No activity logs recorded yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Super Admin Toolkit */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[400px]">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-black text-slate-800">Super Admin Toolkit</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4 h-[calc(100%-70px)] overflow-y-auto">
                            
                            <Link href={route('saas.companies.index')} className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group hover:-translate-y-1">
                                <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                                    <svg className="w-7 h-7 text-slate-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                                </div>
                                <span className="text-sm font-bold text-slate-600 group-hover:text-blue-700">Manage Companies</span>
                            </Link>

                            <Link href="#" className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group hover:-translate-y-1">
                                <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-indigo-100 flex items-center justify-center mb-3 transition-colors">
                                    <svg className="w-7 h-7 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                                </div>
                                <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-700">Manage Subscriptions</span>
                            </Link>

                            <Link href={route('saas.vehicle-master.index')} className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group hover:-translate-y-1">
                                <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                                    <svg className="w-7 h-7 text-slate-400 group-hover:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                                </div>
                                <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-700">Vehicle Master Data</span>
                            </Link>

                            <Link href="#" className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl hover:border-rose-500 hover:bg-rose-50 transition-all group hover:-translate-y-1">
                                <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-rose-100 flex items-center justify-center mb-3 transition-colors">
                                    <svg className="w-7 h-7 text-slate-400 group-hover:text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                                </div>
                                <span className="text-sm font-bold text-slate-600 group-hover:text-rose-700">System Backups</span>
                            </Link>

                            <Link href={route('saas.owners.index')} className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all group hover:-translate-y-1">
                                <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-orange-100 flex items-center justify-center mb-3 transition-colors">
                                    <svg className="w-7 h-7 text-slate-400 group-hover:text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                                </div>
                                <span className="text-sm font-bold text-slate-600 group-hover:text-orange-700">Company Owners</span>
                            </Link>

                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
