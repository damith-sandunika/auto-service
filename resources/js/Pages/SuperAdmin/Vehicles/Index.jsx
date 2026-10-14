import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

export default function VehiclesIndex({ vehicles }) {
    
    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center w-full">
                <span>Global Vehicle Database</span>
            </div>
        }>
            <Head title="Global Vehicles" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Vehicle Number</th>
                                    <th className="px-6 py-4">Make & Model</th>
                                    <th className="px-6 py-4">Current Owner</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {vehicles?.data?.length > 0 ? vehicles.data.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-black text-slate-800">
                                            {vehicle.vehicle_number}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-600">
                                            {vehicle.make} {vehicle.model}
                                        </td>
                                        <td className="px-6 py-4">
                                            {vehicle.owner ? (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">{vehicle.owner.name}</span>
                                                    <span className="text-xs text-slate-500">{vehicle.owner.phone}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">Unknown</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            {/* Reuse the GlobalProfile page from GarageOwner but as an admin we might just view it. 
                                                For now we can link to the global profile route (requires vehicle id) */}
                                            <a href={`/vehicles/${vehicle.id}/profile`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">
                                                View Profile
                                            </a>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                                            No vehicles found in the global database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {vehicles?.links && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                            <Pagination paginator={vehicles} />
                        </div>
                    )}
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
