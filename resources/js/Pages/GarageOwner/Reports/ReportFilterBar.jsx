import React from 'react';
import { router } from '@inertiajs/react';

export default function ReportFilterBar({ startDate, endDate }) {
    const applyFilter = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        router.get(route('owner.reports.index'), { start_date: fd.get('start_date'), end_date: fd.get('end_date') });
    };

    return (
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
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors">Apply Filter</button>
                <a href={route('owner.reports.export', { start_date: startDate, end_date: endDate })} className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700 transition-colors flex items-center" target="_blank" rel="noreferrer">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export CSV
                </a>
            </form>
        </div>
    );
}
