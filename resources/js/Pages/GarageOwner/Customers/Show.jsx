import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ customer }) {
    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center w-full">
                <span>{customer.name} - Vehicle History</span>
                <Link href={route('owner.customers.index')} className="text-sm bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors">
                    Back to Customers
                </Link>
            </div>
        }>
            <Head title={`History - ${customer.name}`} />
            
            <div className="max-w-7xl mx-auto py-12 px-4 space-y-8">
                {customer.vehicles && customer.vehicles.map(vehicle => (
                    <div key={vehicle.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-xl tracking-wider">{vehicle.license_plate}</span>
                            <span className="text-slate-500 text-sm font-bold uppercase">{vehicle.make} {vehicle.model} ({vehicle.year})</span>
                        </h3>
                        
                        <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8 pb-4">
                            {vehicle.jobs && vehicle.jobs.length > 0 ? vehicle.jobs.map(job => (
                                <div key={job.id} className="relative pl-8">
                                    <div className="absolute -left-[11px] top-1 w-5 h-5 bg-indigo-500 rounded-full border-4 border-white shadow-sm"></div>
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-black text-slate-800 text-lg">{job.description || `Service Job #${job.id}`}</h4>
                                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{new Date(job.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-sm">
                                                Rs. {job.total_cost || '0.00'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mb-3 mt-4">
                                            Mechanic: <span className="font-bold text-slate-800">{job.mechanic?.name || 'N/A'}</span>
                                        </div>
                                        
                                        {job.items && job.items.length > 0 && (
                                            <div className="mt-5 pt-4 border-t border-slate-200">
                                                <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Parts Used / Sub-tasks</p>
                                                <ul className="space-y-2">
                                                    {job.items.map(item => (
                                                        <li key={item.id} className="flex justify-between text-sm text-slate-600 bg-white px-4 py-2.5 rounded-lg border border-slate-100 shadow-sm">
                                                            <span className="font-medium">{item.description} <span className="text-slate-400 font-bold ml-1">x{item.quantity}</span></span>
                                                            <span className="font-bold text-slate-800">Rs. {item.subtotal}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="pl-8 text-slate-400 text-sm font-bold uppercase tracking-wider pt-2">No service history found for this vehicle.</div>
                            )}
                        </div>
                    </div>
                ))}
                
                {(!customer.vehicles || customer.vehicles.length === 0) && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-slate-400 font-black text-xl mb-2">No Vehicles Registered</div>
                        <div className="text-slate-500 font-medium">This customer hasn't registered any vehicles yet.</div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
