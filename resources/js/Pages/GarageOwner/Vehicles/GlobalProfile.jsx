import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import ServiceHistoryTab from './Partials/ServiceHistoryTab';
import TransferOwnershipModal from './Partials/TransferOwnershipModal';

const TABS = [
    { key: 'service_history', label: 'Service History' },
    { key: 'ownership_history', label: 'Ownership History' },
];

export default function GlobalProfile({ vehicle, history, ownersHistory, myCustomers, filters }) {
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('service_history');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-bold text-slate-800">Vehicle Profile</h2>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsTransferModalOpen(true)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors shadow-sm text-xs flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            Transfer Ownership
                        </button>
                        <a href={route('owner.vehicles.print', { vehicle: vehicle.id, start_date: filters?.start_date, end_date: filters?.end_date })} target="_blank" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm text-xs">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Export Report
                        </a>
                    </div>
                </div>
            }
        >
            <Head title={`Vehicle ${vehicle.vehicle_number}`} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Vehicle Banner */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 rounded-2xl shadow-md shadow-blue-500/20 overflow-hidden mb-6 text-center text-white relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>
                    <div className="px-6 py-8 relative z-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl border border-white/20 mb-4 backdrop-blur-sm">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
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
                            ) : <span className="text-sm italic font-medium text-blue-200">Unassigned</span>}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-6">
                    {TABS.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'service_history' && <ServiceHistoryTab vehicle={vehicle} history={history} filters={filters} />}

                {activeTab === 'ownership_history' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50"><h3 className="font-bold text-slate-800 text-sm">Ownership History</h3><p className="text-xs text-slate-500 font-medium mt-0.5">Track the timeline of owners for this vehicle.</p></div>
                        <div className="p-5 md:p-6">
                            {ownersHistory.length === 0 ? <p className="text-slate-500 text-sm font-bold text-center py-8">No ownership history recorded.</p> : (
                                <div className="space-y-4">
                                    {ownersHistory.map((oh) => (
                                        <div key={oh.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 transition-colors">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${oh.is_current ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="font-bold text-sm text-slate-800">{oh.customer?.name || 'Unknown User'}</h4>
                                                    {oh.is_current && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded">Current Owner</span>}
                                                </div>
                                                <p className="text-xs font-medium text-slate-500">{new Date(oh.start_date).toLocaleDateString()} &mdash; {oh.is_current ? 'Present' : (oh.end_date ? new Date(oh.end_date).toLocaleDateString() : 'N/A')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <TransferOwnershipModal show={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} vehicle={vehicle} myCustomers={myCustomers} />
        </AuthenticatedLayout>
    );
}
