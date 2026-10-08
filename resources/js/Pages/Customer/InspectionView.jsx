import React from 'react';
import { Head } from '@inertiajs/react';

export default function InspectionView({ job }) {
    const { garage, vehicle, media } = job;
    const customer = vehicle?.owner;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <Head title={`Vehicle Inspection - ${vehicle?.vehicle_number}`} />

            <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                            Digital Vehicle Inspection
                        </h1>
                        <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">
                            {garage?.name || 'GarageSaaS'}
                        </p>
                    </div>
                    {garage?.logo && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                            <img src={`/storage/${garage.logo}`} alt={garage.name} className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Job & Vehicle Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Vehicle Details</p>
                        <p className="font-bold text-lg text-slate-800">{vehicle?.vehicle_number}</p>
                        <p className="text-sm font-semibold text-slate-600">{vehicle?.make} {vehicle?.model}</p>
                    </div>
                    <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Customer Details</p>
                        <p className="font-bold text-lg text-slate-800">{customer?.name || 'Customer'}</p>
                        <p className="text-sm font-semibold text-slate-600">{new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Media Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-slate-800 border-b border-slate-200 pb-3">Inspection Media</h2>
                    
                    {media && media.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {media.map((item, index) => (
                                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="font-bold text-sm text-slate-700">Attachment #{index + 1}</h3>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                                            {item.file_type}
                                        </span>
                                    </div>
                                    <div className="w-full aspect-video bg-black flex items-center justify-center">
                                        {item.file_type === 'video' ? (
                                            <video 
                                                src={`/storage/${item.file_path}`} 
                                                className="w-full h-full object-contain" 
                                                controls 
                                                playsInline
                                                preload="metadata"
                                            />
                                        ) : (
                                            <img 
                                                src={`/storage/${item.file_path}`} 
                                                className="w-full h-full object-contain" 
                                                alt={`Inspection Attachment ${index + 1}`} 
                                            />
                                        )}
                                    </div>
                                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 font-semibold text-right">
                                        Uploaded on {new Date(item.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-1">No media attached</h3>
                            <p className="text-sm text-slate-500">The garage has not uploaded any digital inspection media for this job yet.</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 pt-6 border-t border-slate-200 text-center">
                    <p className="text-xs font-bold text-slate-400">
                        Powered by GarageSaaS
                    </p>
                </div>
            </div>
        </div>
    );
}
