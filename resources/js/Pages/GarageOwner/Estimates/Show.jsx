import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function EstimateShow({ estimate }) {
    const { auth } = usePage().props;

    const printEstimate = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="text-left w-full print:hidden">
                    <h2 className="text-xl font-black text-black">View Estimate</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">{estimate.estimate_number}</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end gap-2 print:hidden">
                    <Link href={route('owner.estimates.index')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg font-black transition-all text-xs whitespace-nowrap">
                        Back
                    </Link>
                    <button onClick={printEstimate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black transition-all text-xs shadow-sm shadow-blue-500/20 whitespace-nowrap">
                        Print
                    </button>
                </div>
            }
        >
            <Head title={`Estimate ${estimate.estimate_number}`} />

            <div className="w-full max-w-4xl mx-auto py-8 px-2 sm:px-4 lg:px-6">
                
                {/* Print Container */}
                <div className="bg-white p-8 sm:p-12 shadow-sm sm:rounded-2xl border border-slate-100 relative print:shadow-none print:border-none print:p-0">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
                        <div>
                            {estimate.garage?.logo ? (
                                <img src={`/tenant-media/${estimate.garage.logo}`} alt="Logo" className="h-16 object-contain mb-4" />
                            ) : (
                                <div className="h-16 w-32 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 mb-4">LOGO</div>
                            )}
                            <h2 className="text-xl font-black text-slate-800">{estimate.garage?.name || 'Auto Service'}</h2>
                            <p className="text-sm text-slate-500 mt-1">{estimate.garage?.address}</p>
                            <p className="text-sm text-slate-500">{estimate.garage?.phone}</p>
                            <p className="text-sm text-slate-500">{estimate.garage?.email}</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-4xl font-black text-slate-800 uppercase tracking-widest">Estimate</h1>
                            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div className="font-bold text-slate-500">Estimate No:</div>
                                <div className="font-black text-slate-800">{estimate.estimate_number}</div>
                                
                                <div className="font-bold text-slate-500">Date:</div>
                                <div className="font-bold text-slate-800">{estimate.estimate_date}</div>
                                
                                <div className="font-bold text-slate-500">Expires:</div>
                                <div className="font-bold text-slate-800">{estimate.expiry_date || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Estimate To:</h3>
                            <div className="font-black text-slate-800 text-lg">{estimate.customer?.name}</div>
                            <div className="text-sm text-slate-600 mt-1">{estimate.customer?.email}</div>
                            <div className="text-sm text-slate-600">{estimate.customer?.phone}</div>
                        </div>
                        {estimate.vehicle && (
                            <div className="text-right">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Vehicle Details:</h3>
                                <div className="font-black text-slate-800 text-lg">{estimate.vehicle.vehicle_number}</div>
                                <div className="text-sm text-slate-600 mt-1">{estimate.vehicle.make} {estimate.vehicle.model}</div>
                            </div>
                        )}
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-left mb-8">
                        <thead>
                            <tr className="border-b-2 border-slate-800">
                                <th className="py-3 font-black text-slate-800 uppercase tracking-wider text-xs">Description</th>
                                <th className="py-3 font-black text-slate-800 uppercase tracking-wider text-xs text-center w-24">Type</th>
                                <th className="py-3 font-black text-slate-800 uppercase tracking-wider text-xs text-center w-24">Qty</th>
                                <th className="py-3 font-black text-slate-800 uppercase tracking-wider text-xs text-right w-32">Unit Price</th>
                                <th className="py-3 font-black text-slate-800 uppercase tracking-wider text-xs text-right w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {estimate.items?.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-4 font-bold text-slate-700">{item.description}</td>
                                    <td className="py-4 text-center text-xs font-bold text-slate-500 uppercase">{item.type}</td>
                                    <td className="py-4 text-center font-bold text-slate-700">{Number(item.quantity)}</td>
                                    <td className="py-4 text-right font-bold text-slate-700">{Number(item.unit_price).toFixed(2)}</td>
                                    <td className="py-4 text-right font-black text-slate-800">{Number(item.total).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm font-bold text-slate-600">
                                <span>Subtotal:</span>
                                <span>Rs. {Number(estimate.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-slate-600">
                                <span>Discount:</span>
                                <span>Rs. {Number(estimate.discount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-slate-600">
                                <span>Tax:</span>
                                <span>Rs. {Number(estimate.tax).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-4 border-t-2 border-slate-800 mt-2">
                                <span className="text-lg font-black text-slate-800">Total:</span>
                                <span className="text-xl font-black text-blue-600">Rs. {Number(estimate.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Terms */}
                    <div className="border-t border-slate-100 pt-8 grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Terms & Conditions</h3>
                            <p className="text-xs text-slate-500 whitespace-pre-wrap">{estimate.terms || 'No specific terms.'}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Authorized Signature</h3>
                            <div className="mt-12 border-b border-slate-300 w-48 ml-auto"></div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

