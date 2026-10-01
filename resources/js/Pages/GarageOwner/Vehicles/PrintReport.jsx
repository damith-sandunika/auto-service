import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

export default function PrintReport({ vehicle, history, filters, garage }) {
    
    useEffect(() => {
        // Automatically open the print dialog when the page loads
        window.print();
    }, []);

    return (
        <div className="min-h-screen bg-white text-black p-6 font-sans print:p-0 text-sm">
            <Head title={`Vehicle Report - ${vehicle.vehicle_number}`} />

            {/* Print Header */}
            <div className="border-b-[3px] border-blue-600 pb-4 mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-blue-700">{garage?.name || 'Garage Network'}</h1>
                    <p className="text-slate-600 mt-0.5 text-xs font-medium">{garage?.address || 'Authorized Service Center'}</p>
                    <p className="text-slate-600 text-xs font-medium">{garage?.phone}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Service Report</h2>
                    <p className="text-blue-600 font-bold mt-1 text-xs">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-slate-50 border-l-4 border-blue-500 rounded p-4 mb-6 flex justify-between items-center print:border-l-4 print:border-blue-500 print:bg-slate-50 print:p-4 print:mb-6">
                <div>
                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Vehicle</h3>
                    <p className="text-lg font-black text-slate-900">{vehicle.vehicle_number}</p>
                    <p className="text-sm font-bold text-slate-600">{vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Current Owner</h3>
                    <p className="text-base font-bold text-slate-800">{vehicle.owner?.name || 'Unknown'}</p>
                    <p className="text-sm text-slate-600 font-medium">{vehicle.owner?.phone || 'No phone'}</p>
                </div>
            </div>

            {/* Report Filters Note */}
            {(filters?.start_date || filters?.end_date) && (
                <div className="mb-5 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Report Period: {filters.start_date ? new Date(filters.start_date).toLocaleDateString() : 'Beginning'} &mdash; {filters.end_date ? new Date(filters.end_date).toLocaleDateString() : 'Present'}
                </div>
            )}

            {/* History Table */}
            <div>
                <h3 className="text-sm font-black text-slate-800 uppercase border-b-2 border-slate-200 pb-2 mb-4">Service Records ({history.length})</h3>
                
                {history.length === 0 ? (
                    <p className="text-slate-400 text-center py-6 text-sm font-bold italic">No service records found for this vehicle in the selected period.</p>
                ) : (
                    <div className="space-y-6">
                        {history.map((job, index) => (
                            <div key={job.id} className="pb-5 border-b border-slate-100 border-dashed last:border-0 print:break-inside-avoid">
                                <div className="flex justify-between items-start mb-2.5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-base text-slate-900">{job.date}</span>
                                            <span className="text-xs font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">{job.time}</span>
                                        </div>
                                        {job.description && (
                                            <p className="text-slate-600 text-sm font-medium">{job.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mileage</p>
                                        <p className="font-black text-slate-800 text-sm">{job.mileage}</p>
                                    </div>
                                </div>

                                {job.items && job.items.length > 0 && (
                                    <div className="mt-3">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-y border-slate-200 bg-slate-50">
                                                    <th className="py-1 px-2 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                                                    <th className="py-1 px-2 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                                                    <th className="py-1 px-2 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {job.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="py-1.5 px-2 font-bold text-slate-600 w-1/4 uppercase text-[10px]">{item.type}</td>
                                                        <td className="py-1.5 px-2 font-medium text-slate-900">{item.description}</td>
                                                        <td className="py-1.5 px-2 text-right font-bold text-slate-600">{item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Print Footer */}
            <div className="mt-8 pt-4 border-t-2 border-slate-800 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest print:mt-6">
                This is a computer-generated report and does not require a signature.
                <p className="mt-1 font-medium text-slate-400 normal-case tracking-normal text-[10px]">Generated by GarageSaaS Network</p>
            </div>
            
            {/* Action Buttons (Hidden on Print) */}
            <div className="mt-8 flex justify-center gap-3 print:hidden">
                <button onClick={() => window.close()} className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200">Close Window</button>
                <button onClick={() => window.print()} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">Print Again</button>
            </div>
        </div>
    );
}
