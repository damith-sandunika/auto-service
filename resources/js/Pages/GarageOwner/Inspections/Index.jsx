import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

export default function InspectionsIndex({ inspections }) {
    const { delete: destroy } = useForm();

    const deleteInspection = (id) => {
        if (confirm('Are you sure you want to delete this inspection record?')) {
            destroy(route('owner.inspections.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">Vehicle Inspections</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Digital vehicle condition reports and checklists</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <Link href={route('owner.inspections.create')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black transition-all text-xs shadow-sm shadow-blue-500/20 whitespace-nowrap">
                        + Start New Inspection
                    </Link>
                </div>
            }
        >
            <Head title="Inspections" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6">
                
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">ID / Date</th>
                                    <th className="px-6 py-4">Vehicle</th>
                                    <th className="px-6 py-4">Inspector</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {inspections.data && inspections.data.length > 0 ? (
                                    inspections.data.map((inspection) => (
                                        <tr key={inspection.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-black text-slate-800">INSP-{String(inspection.id).padStart(5, '0')}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase">{inspection.inspection_date}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{inspection.vehicle?.vehicle_number}</div>
                                                <div className="text-xs text-slate-500">{inspection.vehicle?.make} {inspection.vehicle?.model}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-700">{inspection.inspector?.name || 'System'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                                    inspection.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {inspection.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                {/* <Link href={route('owner.inspections.show', inspection.id)} className="text-blue-600 hover:text-blue-800 font-bold text-[11px] uppercase tracking-wider">View</Link> */}
                                                <button onClick={() => deleteInspection(inspection.id)} className="text-red-500 hover:text-red-700 font-bold text-[11px] uppercase tracking-wider">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold">No inspections found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {inspections.links && <Pagination links={inspections.links} />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
