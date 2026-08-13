import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function Services({ services }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [deletingService, setDeletingService] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        service_name: '',
        description: '',
        default_price: '',
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingService(null);
        setIsModalOpen(true);
    };

    const openEditModal = (service) => {
        clearErrors();
        setData({
            service_name: service.service_name,
            description: service.description || '',
            default_price: service.default_price,
        });
        setEditingService(service);
        setIsModalOpen(true);
    };

    const openDeleteModal = (service) => {
        setDeletingService(service);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => { reset(); clearErrors(); }, 200);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTimeout(() => setDeletingService(null), 200);
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (editingService) {
            put(route('owner.services.update', editingService.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('owner.services.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = () => {
        destroy(route('owner.services.destroy', deletingService.id), {
            onSuccess: () => closeDeleteModal(),
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price);
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center w-full">
                <span>Services Catalog</span>
                <button onClick={openCreateModal} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-teal-500/20">
                    <span className="text-lg leading-none mb-0.5">+</span> Add Service
                </button>
            </div>
        }>
            <Head title="Services" />

            <div className="max-w-7xl mx-auto space-y-6">

                {services && services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((svc) => (
                            <div key={svc.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-teal-300 transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center group-hover:bg-teal-100 transition-colors border border-teal-100">
                                        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(svc)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                        </button>
                                        <button onClick={() => openDeleteModal(svc)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                        </button>
                                    </div>
                                </div>
                                <h4 className="text-lg font-black text-slate-800 mb-2">{svc.service_name}</h4>
                                <p className="text-sm text-slate-500 font-medium mb-6 flex-1 min-h-[40px]">{svc.description}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Default Price</span>
                                    <span className="text-lg font-black text-teal-600">{formatPrice(svc.default_price)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                        <p className="text-slate-500 font-medium">No services added to the catalog yet.</p>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">
                        {editingService ? 'Edit Service Details' : 'Add New Service'}
                    </h2>
                    
                    <form onSubmit={submitForm} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="service_name" value="Service Name" />
                            <TextInput
                                id="service_name"
                                type="text"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800"
                                value={data.service_name}
                                onChange={(e) => setData('service_name', e.target.value)}
                            />
                            <InputError message={errors.service_name} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="description" value="Description" />
                            <textarea
                                id="description"
                                rows="3"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="default_price" value="Default Price (Rs.)" />
                            <TextInput
                                id="default_price"
                                type="number"
                                min="0"
                                step="0.01"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800"
                                value={data.default_price}
                                onChange={(e) => setData('default_price', e.target.value)}
                            />
                            <InputError message={errors.default_price} className="mt-2" />
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 shadow-md shadow-teal-500/20">
                                {processing ? 'Saving...' : 'Save Service'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </div>
                        <h2 className="text-lg font-black text-slate-800">
                            Delete Service
                        </h2>
                    </div>
                    <p className="text-sm text-slate-600 mb-6 font-medium">
                        Are you sure you want to delete <span className="font-bold text-slate-800">{deletingService?.service_name}</span>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button onClick={closeDeleteModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">
                            Cancel
                        </button>
                        <button onClick={confirmDelete} disabled={processing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 shadow-md shadow-red-500/20">
                            {processing ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                    </div>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
