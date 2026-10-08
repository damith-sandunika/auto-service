import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SearchableSelect from '@/Components/SearchableSelect';

export default function ServiceTemplatesIndex({ templates, categories }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [deletingTemplate, setDeletingTemplate] = useState(null);
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({ branch_category_id: '', service_name: '', default_price: '', estimated_time_minutes: '', is_active: true });

    const openCreate = () => { clearErrors(); reset(); setEditingTemplate(null); setIsModalOpen(true); };
    const openEdit = (template) => { clearErrors(); setData({ branch_category_id: template.branch_category_id, service_name: template.service_name, default_price: template.default_price || '', estimated_time_minutes: template.estimated_time_minutes || '', is_active: template.is_active }); setEditingTemplate(template); setIsModalOpen(true); };
    const openDelete = (template) => { setDeletingTemplate(template); setIsDeleteModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setTimeout(() => { reset(); clearErrors(); }, 200); };
    const closeDeleteModal = () => { setIsDeleteModalOpen(false); setTimeout(() => setDeletingTemplate(null), 200); };
    const submitForm = (e) => { e.preventDefault(); editingTemplate ? put(route('admin.templates.update', editingTemplate.id), { onSuccess: () => closeModal() }) : post(route('admin.templates.store'), { onSuccess: () => closeModal() }); };
    const confirmDelete = () => destroy(route('admin.templates.destroy', deletingTemplate.id), { onSuccess: () => closeDeleteModal() });

    return (
        <AuthenticatedLayout header={<div className="flex justify-between items-center w-full"><span>Service Templates (Pre-defined Services)</span><button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-blue-500/20"><span className="text-lg leading-none mb-0.5">+</span> Add Service Template</button></div>}>
            <Head title="Service Templates" />
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider"><tr><th className="px-6 py-4">Service Name</th><th className="px-6 py-4">Branch Category</th><th className="px-6 py-4">Default Price</th><th className="px-6 py-4">Est. Time (Mins)</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {templates?.length > 0 ? templates.map((template) => (
                                    <tr key={template.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-black text-slate-800">{template.service_name}</td>
                                        <td className="px-6 py-4 font-bold text-slate-600">{template.category?.name || 'Uncategorized'}</td>
                                        <td className="px-6 py-4 font-medium text-slate-500">{template.default_price ? `Rs. ${template.default_price}` : '-'}</td>
                                        <td className="px-6 py-4 font-medium text-slate-500">{template.estimated_time_minutes ? `${template.estimated_time_minutes} min` : '-'}</td>
                                        <td className="px-6 py-4 text-right space-x-3"><button onClick={() => openEdit(template)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">Edit</button><button onClick={() => openDelete(template)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider">Delete</button></td>
                                    </tr>
                                )) : <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">No service templates defined yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">{editingTemplate ? 'Edit Service Template' : 'Add New Service Template'}</h2>
                    <form onSubmit={submitForm} className="space-y-4">
                        <div><InputLabel htmlFor="branch_category_id" value="Branch Category" /><SearchableSelect value={data.branch_category_id} onChange={(e) => setData('branch_category_id', e.target.value)} options={categories || []} placeholder="-- Select Category --" /><InputError message={errors.branch_category_id} className="mt-2" /></div>
                        <div><InputLabel htmlFor="service_name" value="Service Name" /><TextInput id="service_name" type="text" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800" value={data.service_name} onChange={(e) => setData('service_name', e.target.value)} placeholder="e.g. Full Service, Oil Change" /><InputError message={errors.service_name} className="mt-2" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><InputLabel htmlFor="default_price" value="Default Price (Rs)" /><TextInput id="default_price" type="number" step="0.01" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800" value={data.default_price} onChange={(e) => setData('default_price', e.target.value)} /><InputError message={errors.default_price} className="mt-2" /></div>
                            <div><InputLabel htmlFor="estimated_time_minutes" value="Est. Time (Mins)" /><TextInput id="estimated_time_minutes" type="number" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800" value={data.estimated_time_minutes} onChange={(e) => setData('estimated_time_minutes', e.target.value)} /><InputError message={errors.estimated_time_minutes} className="mt-2" /></div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">Cancel</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50">{processing ? 'Saving...' : 'Save Template'}</button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div><h2 className="text-lg font-black text-slate-800">Delete Template</h2></div>
                    <p className="text-sm text-slate-600 mb-6 font-medium">Are you sure you want to delete <span className="font-bold text-slate-800">{deletingTemplate?.service_name}</span>?</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={closeDeleteModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">Cancel</button>
                        <button onClick={confirmDelete} disabled={processing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50">{processing ? 'Deleting...' : 'Yes, Delete'}</button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
