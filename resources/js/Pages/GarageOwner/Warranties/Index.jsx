import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function WarrantiesIndex({ warranties, customers, vehicles }) {
    const { auth } = usePage().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [updatingWarranty, setUpdatingWarranty] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        vehicle_id: '',
        customer_id: '',
        warranty_period: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        terms: 'Standard warranty covers parts replacement only. Labor charges may apply.',
    });

    const submitForm = (e) => {
        e.preventDefault();
        post(route('owner.warranties.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const { data: statusData, setData: setStatusData, patch, processing: statusProcessing } = useForm({
        status: '',
    });

    const openStatusModal = (w) => {
        setUpdatingWarranty(w);
        setStatusData('status', w.status);
        setIsStatusModalOpen(true);
    };

    const confirmStatusUpdate = (e) => {
        e.preventDefault();
        patch(route('owner.warranties.status', updatingWarranty.id), {
            onSuccess: () => {
                setIsStatusModalOpen(false);
                setUpdatingWarranty(null);
            },
        });
    };

    const { delete: destroy } = useForm();
    const deleteWarranty = (id) => {
        if (confirm('Are you sure you want to delete this warranty?')) {
            destroy(route('owner.warranties.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">Warranties</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Manage vehicle and parts warranties</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black transition-all text-xs shadow-sm shadow-blue-500/20 whitespace-nowrap">
                        + Add Warranty
                    </button>
                </div>
            }
        >
            <Head title="Warranties" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6">
                
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Warranty ID</th>
                                    <th className="px-6 py-4">Vehicle & Customer</th>
                                    <th className="px-6 py-4">Period</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {warranties.data && warranties.data.length > 0 ? (
                                    warranties.data.map((warranty) => (
                                        <tr key={warranty.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-black text-slate-800">WAR-{String(warranty.id).padStart(5, '0')}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{warranty.vehicle?.vehicle_number}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase">{warranty.customer?.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{warranty.warranty_period}</div>
                                                <div className="text-[10px] text-slate-500">Exp: {warranty.end_date || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                                    warranty.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                    warranty.status === 'expired' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {warranty.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button onClick={() => openStatusModal(warranty)} className="text-amber-600 hover:text-amber-800 font-bold text-[11px] uppercase tracking-wider">Status</button>
                                                <button onClick={() => deleteWarranty(warranty.id)} className="text-red-500 hover:text-red-700 font-bold text-[11px] uppercase tracking-wider">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold">No warranties found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {warranties.links && <Pagination links={warranties.links} />}
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="md">
                <form onSubmit={submitForm} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Issue Warranty</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Customer" />
                            <select className="w-full mt-1 bg-slate-50 border-slate-200 rounded-lg text-sm" value={data.customer_id} onChange={e => setData('customer_id', e.target.value)} required>
                                <option value="">Select Customer</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <InputError message={errors.customer_id} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Vehicle" />
                            <select className="w-full mt-1 bg-slate-50 border-slate-200 rounded-lg text-sm" value={data.vehicle_id} onChange={e => setData('vehicle_id', e.target.value)} required>
                                <option value="">Select Vehicle</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_number}</option>)}
                            </select>
                            <InputError message={errors.vehicle_id} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <InputLabel value="Warranty Period" />
                                <TextInput className="w-full mt-1" value={data.warranty_period} onChange={e => setData('warranty_period', e.target.value)} required placeholder="e.g. 6 Months, 10,000 km" />
                                <InputError message={errors.warranty_period} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel value="Start Date" />
                                <TextInput type="date" className="w-full mt-1 text-sm" value={data.start_date} onChange={e => setData('start_date', e.target.value)} required />
                            </div>
                            <div>
                                <InputLabel value="End Date (Optional)" />
                                <TextInput type="date" className="w-full mt-1 text-sm" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <InputLabel value="Terms & Conditions" />
                            <textarea className="w-full mt-1 bg-slate-50 border-slate-200 rounded-lg text-sm" rows="3" value={data.terms} onChange={e => setData('terms', e.target.value)}></textarea>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase">Cancel</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase disabled:opacity-50">Save</button>
                    </div>
                </form>
            </Modal>

            {/* Status Modal */}
            <Modal show={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} maxWidth="sm">
                <form onSubmit={confirmStatusUpdate} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Update Status</h2>
                    <select className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm mb-6" value={statusData.status} onChange={e => setStatusData('status', e.target.value)}>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="voided">Voided</option>
                    </select>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase">Cancel</button>
                        <button type="submit" disabled={statusProcessing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase disabled:opacity-50">Update</button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
