import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function Branches({ garages }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingGarage, setEditingGarage] = useState(null);
    const [deletingGarage, setDeletingGarage] = useState(null);
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({ name: '', address: '', phone: '' });

    const openCreate = () => { clearErrors(); reset(); setEditingGarage(null); setIsModalOpen(true); };
    const openEdit = (garage) => { clearErrors(); setData({ name: garage.name, address: garage.address, phone: garage.phone }); setEditingGarage(garage); setIsModalOpen(true); };
    const openDelete = (garage) => { setDeletingGarage(garage); setIsDeleteModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setTimeout(() => { reset(); clearErrors(); }, 200); };
    const closeDeleteModal = () => { setIsDeleteModalOpen(false); setTimeout(() => setDeletingGarage(null), 200); };
    const submitForm = (e) => { e.preventDefault(); editingGarage ? put(route('admin.garages.update', editingGarage.id), { onSuccess: () => closeModal() }) : post(route('admin.garages.store'), { onSuccess: () => closeModal() }); };
    const confirmDelete = () => destroy(route('admin.garages.destroy', deletingGarage.id), { onSuccess: () => closeDeleteModal() });

    return (
        <AuthenticatedLayout header={<div className="flex justify-between items-center w-full"><span>Garage Branches Network</span><button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-blue-500/20"><span className="text-lg leading-none mb-0.5">+</span> Register New Branch</button></div>}>
            <Head title="Branches" />
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider"><tr><th className="px-6 py-4">Branch Name</th><th className="px-6 py-4">Location</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {garages?.length > 0 ? garages.map((garage) => (
                                    <tr key={garage.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-black text-slate-800 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black">{garage.name.charAt(0)}</div>{garage.name}</td>
                                        <td className="px-6 py-4 font-bold text-slate-600">{garage.address || 'Not Set'}</td>
                                        <td className="px-6 py-4 font-medium text-slate-500">{garage.phone || '-'}</td>
                                        <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">Active</span></td>
                                        <td className="px-6 py-4 text-right space-x-3"><button onClick={() => openEdit(garage)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">Edit</button><button onClick={() => openDelete(garage)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider">Delete</button></td>
                                    </tr>
                                )) : <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">No branches registered yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">{editingGarage ? 'Edit Branch details' : 'Register New Branch'}</h2>
                    <form onSubmit={submitForm} className="space-y-4">
                        <div><InputLabel htmlFor="name" value="Branch Name" /><TextInput id="name" type="text" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800" value={data.name} onChange={(e) => setData('name', e.target.value)} /><InputError message={errors.name} className="mt-2" /></div>
                        <div><InputLabel htmlFor="address" value="Location / Address" /><TextInput id="address" type="text" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800" value={data.address} onChange={(e) => setData('address', e.target.value)} /><InputError message={errors.address} className="mt-2" /></div>
                        <div><InputLabel htmlFor="phone" value="Contact Number" /><TextInput id="phone" type="text" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800" value={data.phone} onChange={(e) => setData('phone', e.target.value)} /><InputError message={errors.phone} className="mt-2" /></div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">Cancel</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50">{processing ? 'Saving...' : 'Save Branch'}</button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div><h2 className="text-lg font-black text-slate-800">Delete Branch</h2></div>
                    <p className="text-sm text-slate-600 mb-6 font-medium">Are you sure you want to delete <span className="font-bold text-slate-800">{deletingGarage?.name}</span>? All data related to this branch will be permanently removed.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={closeDeleteModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">Cancel</button>
                        <button onClick={confirmDelete} disabled={processing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50">{processing ? 'Deleting...' : 'Yes, Delete'}</button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
