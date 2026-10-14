import React from 'react';
import { router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

export default function ServiceHistoryTab({ vehicle, history, filters }) {
    const [dateFilters, setDateFilters] = React.useState({ start_date: filters?.start_date || '', end_date: filters?.end_date || '' });

    const applyFilters = () => router.get(route('owner.vehicles.profile', vehicle.id), dateFilters, { preserveState: true });
    const clearFilters = () => { setDateFilters({ start_date: '', end_date: '' }); router.get(route('owner.vehicles.profile', vehicle.id), {}, { preserveState: true }); };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">Global Service Records</h3>
                    <p className="text-xs text-slate-500">Maintained securely and anonymously across the network.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <input type="date" className="text-xs border-none focus:ring-0 text-slate-600 font-medium py-1" value={dateFilters.start_date} onChange={e => setDateFilters({...dateFilters, start_date: e.target.value})} />
                    <span className="text-slate-300">-</span>
                    <input type="date" className="text-xs border-none focus:ring-0 text-slate-600 font-medium py-1" value={dateFilters.end_date} onChange={e => setDateFilters({...dateFilters, end_date: e.target.value})} />
                    <button onClick={applyFilters} className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-700 ml-1">Filter</button>
                    {(filters?.start_date || filters?.end_date) && <button onClick={clearFilters} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200">Clear</button>}
                </div>
            </div>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">{history.total} Total Records</span>
            </div>
            <div className="p-5 md:p-6">
                {history.data.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <div className="w-12 h-12 bg-white text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                        <h4 className="font-bold text-slate-700 mb-1 text-sm">No Service History</h4>
                        <p className="text-slate-500 text-xs">No records found for the selected criteria.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {history.data.map((job) => (
                            <div key={job.id} className="relative pl-6 border-l-2 border-blue-200 pb-2">
                                <div className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full -left-[7px] top-1.5 shadow-sm"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-slate-800">{job.date}</span>
                                        <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded shadow-sm">{job.time}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 sm:mt-0">Mileage: {job.mileage}</span>
                                </div>
                                {job.description && <p className="text-slate-600 font-medium text-sm mb-3">{job.description}</p>}
                                {job.items?.length > 0 && (
                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1.5">Services &amp; Parts Replaced</h5>
                                        <ul className="space-y-1.5">
                                            {job.items.map((item, idx) => (
                                                <li key={idx} className="text-xs font-bold text-slate-700 flex items-start gap-2">
                                                    <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5"><svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                                                    <span>{item.description} {item.quantity > 1 && <span className="text-slate-400 font-medium ml-1">({item.quantity} units)</span>}</span>
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
            {history?.data?.length > 0 && <div className="p-4 border-t border-slate-100 bg-slate-50/50"><Pagination paginator={history} /></div>}
        </div>
    );
}
