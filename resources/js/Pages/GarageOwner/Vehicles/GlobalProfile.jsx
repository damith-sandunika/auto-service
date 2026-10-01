import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';

export default function GlobalProfile({ vehicle, history, ownersHistory, myCustomers, filters }) {
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('service_history');
    
    const { data, setData, patch, processing, errors } = useForm({
        customer_id: vehicle.owner_id || ''
    });

    const [dateFilters, setDateFilters] = useState({
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || ''
    });

    const applyFilters = () => {
        router.get(route('owner.vehicles.profile', vehicle.id), dateFilters, { preserveState: true });
    };

    const clearFilters = () => {
        setDateFilters({ start_date: '', end_date: '' });
        router.get(route('owner.vehicles.profile', vehicle.id), {}, { preserveState: true });
    };

    const submitTransfer = (e) => {
        e.preventDefault();
        patch(route('owner.vehicles.owner.update', vehicle.id), {
            onSuccess: () => setIsTransferModalOpen(false)
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link href={route('owner.vehicles.index')} className="text-slate-500 hover:text-slate-700">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h2 className="text-xl font-bold text-slate-800">
                            Vehicle Profile
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsTransferModalOpen(true)}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors shadow-sm text-xs flex items-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Transfer Ownership
                        </button>
                        <a 
                            href={route('owner.vehicles.print', { vehicle: vehicle.id, start_date: filters?.start_date, end_date: filters?.end_date })}
                            target="_blank"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm text-xs"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Export Report
                        </a>
                    </div>
                </div>
            }
        >
            <Head title={`Vehicle ${vehicle.vehicle_number}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                
                {/* TOP SECTION: Colorful Centered Vehicle Banner */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 rounded-2xl shadow-md shadow-blue-500/20 overflow-hidden mb-6 text-center text-white relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>

                    <div className="px-6 py-8 relative z-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl border border-white/20 mb-4 backdrop-blur-sm">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-wider mb-1 drop-shadow-sm">{vehicle.vehicle_number}</h3>
                        <p className="text-blue-100 font-medium tracking-wide text-sm">{vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}</p>
                        
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

                {/* TABS HEADER */}
                <div className="flex border-b border-slate-200 mb-6">
                    <button 
                        onClick={() => setActiveTab('service_history')}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'service_history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
                    >
                        Service History
                    </button>
                    <button 
                        onClick={() => setActiveTab('ownership_history')}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'ownership_history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
                    >
                        Ownership History
                    </button>
                </div>

                {/* TABS CONTENT */}
                <div>
                    {activeTab === 'service_history' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">Global Service Records</h3>
                                    <p className="text-xs text-slate-500">Maintained securely and anonymously across the network.</p>
                                </div>
                                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                                    <input 
                                        type="date" 
                                        className="text-xs border-none focus:ring-0 text-slate-600 font-medium py-1" 
                                        value={dateFilters.start_date}
                                        onChange={e => setDateFilters({...dateFilters, start_date: e.target.value})}
                                    />
                                    <span className="text-slate-300">-</span>
                                    <input 
                                        type="date" 
                                        className="text-xs border-none focus:ring-0 text-slate-600 font-medium py-1"
                                        value={dateFilters.end_date}
                                        onChange={e => setDateFilters({...dateFilters, end_date: e.target.value})}
                                    />
                                    <button onClick={applyFilters} className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-700 ml-1">Filter</button>
                                    {(filters?.start_date || filters?.end_date) && (
                                        <button onClick={clearFilters} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200">Clear</button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">
                                    {history.total} Total Records
                                </span>
                            </div>

                            <div className="p-5 md:p-6">
                                {history.data.length === 0 ? (
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
                                                
                                                {job.description && (
                                                    <p className="text-slate-600 font-medium text-sm mb-3">{job.description}</p>
                                                )}

                                                {job.items && job.items.length > 0 && (
                                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1.5">Services & Parts Replaced</h5>
                                                        <ul className="space-y-1.5">
                                                            {job.items.map((item, idx) => (
                                                                <li key={idx} className="text-xs font-bold text-slate-700 flex items-start gap-2">
                                                                    <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                                        <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </div>
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
                            
                            {history.data.length > 0 && (
                                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                                    <Pagination links={history.links} />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'ownership_history' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 text-sm">Ownership History</h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Track the timeline of owners for this vehicle.</p>
                            </div>
                            <div className="p-5 md:p-6">
                                {ownersHistory.length === 0 ? (
                                    <p className="text-slate-500 text-sm font-bold text-center py-8">No ownership history recorded.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {ownersHistory.map((oh, i) => (
                                            <div key={oh.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 transition-colors">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${oh.is_current ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h4 className="font-bold text-sm text-slate-800">{oh.customer?.name || 'Unknown User'}</h4>
                                                        {oh.is_current && (
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded">Current Owner</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        {new Date(oh.start_date).toLocaleDateString()} &mdash; {oh.is_current ? 'Present' : (oh.end_date ? new Date(oh.end_date).toLocaleDateString() : 'N/A')}
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

            </div>

            {/* Transfer Ownership Modal */}
            <Modal show={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} maxWidth="sm">
                <form onSubmit={submitTransfer} className="p-6">
                    <h2 className="text-lg font-bold mb-3 text-slate-800">Transfer Ownership</h2>
                    <p className="text-sm text-slate-500 mb-5">Assign this vehicle to another customer registered in your garage.</p>
                    
                    <div className="mb-5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select New Owner</label>
                        <select 
                            className="w-full rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                            value={data.customer_id}
                            onChange={e => setData('customer_id', e.target.value)}
                            required
                        >
                            <option value="">-- Select Customer --</option>
                            {myCustomers.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.phone || c.email})</option>
                            ))}
                        </select>
                        {errors.customer_id && <p className="text-red-500 text-xs mt-1">{errors.customer_id}</p>}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsTransferModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                            {processing ? 'Transferring...' : 'Transfer'}
                        </button>
                    </div>
                </form>
            </Modal>

        </AuthenticatedLayout>
    );
}
