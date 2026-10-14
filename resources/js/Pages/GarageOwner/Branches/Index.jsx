import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Pagination from '@/Components/Pagination';

export default function BranchesIndex({ branches, filters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [deletingBranch, setDeletingBranch] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const branchList = branches?.data || (Array.isArray(branches) ? branches : []);
    const totalCount = branches?.total ?? branchList.length;

    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '', address: '', phone: '', tagline: '', logo: null
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('owner.branches.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        router.get(route('owner.branches.index'), {}, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        clearErrors();
        reset();
        setEditingBranch(null);
        setIsModalOpen(true);
    };

    const openEdit = (branch) => {
        clearErrors();
        setData({
            name: branch.name,
            address: branch.address,
            phone: branch.phone,
            tagline: branch.tagline || '',
            logo: null
        });
        setEditingBranch(branch);
        setIsModalOpen(true);
    };

    const openDelete = (branch) => {
        setDeletingBranch(branch);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => { reset(); clearErrors(); }, 200);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTimeout(() => setDeletingBranch(null), 200);
    };

    const submitForm = (e) => {
        e.preventDefault();
        
        // Since we are uploading a file, we need to use POST even for updates, and simulate PUT if editing
        if (editingBranch) {
            post(route('owner.branches.update', editingBranch.id) + '?_method=PUT', {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('owner.branches.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = () => {
        destroy(route('owner.branches.destroy', deletingBranch.id), {
            onSuccess: () => closeDeleteModal(),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Branch Management</h2>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            Total: <span className="text-indigo-600 font-black">{totalCount}</span> Branches Registered
                            {branches?.current_page && (
                                <span className="ml-2 text-slate-400">
                                    • Page {branches.current_page} of {branches.last_page} (15 per page)
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md whitespace-nowrap">
                        + Add New Branch
                    </button>
                </div>
            }
        >
            <Head title="Branches" />
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:max-w-md">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search branch name, address, phone..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap">
                            Search
                        </button>
                        {filters?.search && (
                            <button type="button" onClick={handleClearSearch} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors whitespace-nowrap">
                                Clear
                            </button>
                        )}
                    </form>
                    <div className="text-xs font-bold text-slate-500">
                        Showing {branchList.length} of {totalCount} results
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Branch Details</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {branchList?.length > 0 ? branchList.map((b) => (
                                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {b.logo_path ? (
                                                    <img src={`/tenant-media/${b.logo_path}`} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl">
                                                        {b.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-slate-800 text-base">{b.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{b.tagline}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-800 font-medium">{b.phone}</div>
                                            <div className="text-slate-500 text-xs mt-0.5">{b.address}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => openEdit(b)} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase tracking-wider">Edit</button>
                                            <button onClick={() => openDelete(b)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider">Delete</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            No branches found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Server-Side Pagination Links */}
                    {branches?.links && (
                        <div className="p-4 border-t border-slate-100">
                            <Pagination links={branches.links} />
                        </div>
                    )}
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">{editingBranch ? 'Edit Branch' : 'Add New Branch'}</h2>
                    <form onSubmit={submitForm} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Branch Name" />
                            <TextInput id="name" type="text" className="mt-1 block w-full bg-slate-50 border-slate-200" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="phone" value="Phone Number" />
                            <TextInput id="phone" type="text" className="mt-1 block w-full bg-slate-50 border-slate-200" value={data.phone} onChange={(e) => setData('phone', e.target.value)} required />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="address" value="Address" />
                            <TextInput id="address" type="text" className="mt-1 block w-full bg-slate-50 border-slate-200" value={data.address} onChange={(e) => setData('address', e.target.value)} required />
                            <InputError message={errors.address} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="tagline" value="Tagline (Optional)" />
                            <TextInput id="tagline" type="text" className="mt-1 block w-full bg-slate-50 border-slate-200" value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} />
                            <InputError message={errors.tagline} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="logo" value="Branch Logo (Optional)" />
                            <input id="logo" type="file" className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" onChange={(e) => setData('logo', e.target.files[0])} accept="image/*" />
                            <InputError message={errors.logo} className="mt-2" />
                        </div>
                        
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm">Cancel</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm disabled:opacity-50">
                                {processing ? 'Saving...' : 'Save Branch'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-2">Delete Branch</h2>
                    <p className="text-sm text-slate-600 mb-6 font-medium">Are you sure you want to delete the branch <span className="font-bold">{deletingBranch?.name}</span>? This will wipe all data associated with it (inventory, orders, staff records, etc). This cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={closeDeleteModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold text-sm">Cancel</button>
                        <button onClick={confirmDelete} disabled={processing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm disabled:opacity-50">
                            {processing ? 'Deleting...' : 'Yes, Delete Branch'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
