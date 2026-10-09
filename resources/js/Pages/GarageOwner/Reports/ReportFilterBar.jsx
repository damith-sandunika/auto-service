import React from 'react';
import { router } from '@inertiajs/react';

export default function ReportFilterBar({ startDate, endDate, activeTab = 'sales', branches = [], branchId = '' }) {
    const applyQuickDate = (start, end) => {
        router.get(route('owner.reports.index'), { start_date: start, end_date: end, tab: activeTab, branch_id: branchId });
    };

    const applyFilter = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        router.get(route('owner.reports.index'), { start_date: fd.get('start_date'), end_date: fd.get('end_date'), tab: activeTab, branch_id: fd.get('branch_id') || '' });
    };

    const getYesterday = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    };

    const getToday = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm">
            <form onSubmit={applyFilter} className="flex flex-wrap gap-2 md:gap-4 items-end">
                {branches.length > 1 && (
                    <div className="w-full md:flex-1 md:min-w-[200px]">
                        <label className="block text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 md:mb-2">Branch</label>
                        <select name="branch_id" defaultValue={branchId} className="w-full px-2 py-1.5 md:px-4 md:py-2.5 border-2 border-slate-200 rounded-lg md:rounded-xl text-[10px] md:text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-0 transition-colors">
                            <option value="">🌍 All Branches</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>🏪 {b.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="flex-1 md:min-w-[150px]">
                    <label className="block text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 md:mb-2">Start Date</label>
                    <input type="date" name="start_date" defaultValue={startDate} className="w-full px-2 py-1.5 md:px-4 md:py-2.5 border-2 border-slate-200 rounded-lg md:rounded-xl text-[10px] md:text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-0 transition-colors" />
                </div>
                <div className="flex-1 md:min-w-[150px]">
                    <label className="block text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 md:mb-2">End Date</label>
                    <input type="date" name="end_date" defaultValue={endDate} className="w-full px-2 py-1.5 md:px-4 md:py-2.5 border-2 border-slate-200 rounded-lg md:rounded-xl text-[10px] md:text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-0 transition-colors" />
                </div>
                <div className="flex-none flex gap-2">
                    <button type="button" onClick={() => applyQuickDate(getToday(), getToday())} className="px-3 py-2 md:px-4 md:py-3 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 text-[10px] md:text-sm font-bold rounded-lg md:rounded-xl transition-colors h-[34px] md:h-[46px] flex items-center">Today</button>
                    <button type="button" onClick={() => applyQuickDate(getYesterday(), getYesterday())} className="px-3 py-2 md:px-4 md:py-3 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 text-[10px] md:text-sm font-bold rounded-lg md:rounded-xl transition-colors h-[34px] md:h-[46px] flex items-center">Yesterday</button>
                </div>
                <div className="flex-none">
                    <button type="submit" className="px-3 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 text-white text-[10px] md:text-sm font-bold rounded-lg md:rounded-xl flex items-center gap-1 md:gap-2 shadow-lg shadow-blue-600/25 transition-all h-[34px] md:h-[46px]">
                        <svg width="14" height="14" className="md:w-[18px] md:h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                        <span className="hidden md:inline">Apply Filter</span>
                        <span className="md:hidden">Apply</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
