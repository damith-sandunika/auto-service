import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function CategoriesIndex({ categories }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        is_active: true,
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        clearErrors();
        setData({
            name: category.name,
            description: category.description || '',
            is_active: category.is_active,
        });
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const openDeleteModal = (category) => {
        setDeletingCategory(category);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => { reset(); clearErrors(); }, 200);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTimeout(() => setDeletingCategory(null), 200);
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (editingCategory) {
            put(route('admin.categories.update', editingCategory.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.categories.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = () => {
        destroy(route('admin.categories.destroy', deletingCategory.id), {
            onSuccess: () => closeDeleteModal(),
        });
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center w-full">
                <span>Branch Categories</span>
                <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-blue-500/20">
                    <span className="text-lg leading-none mb-0.5">+</span> Add Category
                </button>
            </div>
        }>
            <Head title="Branch Categories" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Category Name</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Branches Count</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categories && categories.length > 0 ? (
                                    categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-black text-slate-800">
                                                {category.name}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-500">{category.description || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                    {category.garages_count || 0} Branches
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button onClick={() => openEditModal(category)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">Edit</button>
                                                {category.garages_count === 0 && (
                                                    <button onClick={() => openDeleteModal(category)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider">Delete</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500 font-medium">
                                            No categories defined yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add / Edit Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    
                    <form onSubmit={submitForm} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Category Name" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="description" value="Description" />
                            <textarea
                                id="description"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                rows="3"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 shadow-md shadow-blue-500/20">
                                {processing ? 'Saving...' : 'Save Category'}
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
                            Delete Category
                        </h2>
                    </div>
                    <p className="text-sm text-slate-600 mb-6 font-medium">
                        Are you sure you want to delete <span className="font-bold text-slate-800">{deletingCategory?.name}</span>?
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
