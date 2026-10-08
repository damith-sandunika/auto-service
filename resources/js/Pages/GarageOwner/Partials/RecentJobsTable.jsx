import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function RecentJobsTable({ recentJobs }) {
    return (
        <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden animate-slide-up flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
                <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Recent Jobs</h3>
                    <p className="text-[12px] font-semibold text-slate-500">Currently processing</p>
                </div>
                <Link href={route('owner.orders.index')} className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors">
                    View All
                    <ArrowRightIcon className="w-3 h-3" />
                </Link>
            </div>
            <div className="overflow-x-auto flex-1 p-0">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Job</th>
                            <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Customer / Vehicle</th>
                            <th className="px-4 py-3.5 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50/50">
                        {recentJobs.map((job) => {
                            return (
                                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-[13px] font-black text-slate-800">JOB-{job.id}</div>
                                        <div className="text-[10px] font-bold text-slate-500 mt-0.5">{job.mechanic}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-[13px] font-bold text-slate-700">{job.customer}</div>
                                        <div className="text-[11px] font-semibold text-slate-500 mt-0.5 bg-slate-100 inline-block px-1.5 rounded">{job.vehicle_number}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                        <Link href={route('owner.orders.index')} className="inline-block px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 rounded-lg text-[11px] font-bold transition-all">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                        {recentJobs.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-[13px] font-semibold text-slate-400">No active jobs</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
