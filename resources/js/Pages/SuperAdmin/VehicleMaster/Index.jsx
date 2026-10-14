import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function VehicleMasterIndex({ makes = [], filters = {} }) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.user?.role === 'saas_admin';

    const [search, setSearch] = useState(filters?.search || '');
    const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
    const [editingMake, setEditingMake] = useState(null);
    const [editingModel, setEditingModel] = useState(null);

    // Form for Adding / Editing Make
    const makeForm = useForm({
        name: '',
    });

    // Form for Adding / Editing Model
    const modelForm = useForm({
        make_id: '',
        name: '',
        type: '',
    });

    // Open Make Modal (Add or Edit)
    const openMakeModal = (make = null) => {
        makeForm.clearErrors();
        if (make) {
            setEditingMake(make);
            makeForm.setData({ name: make.name });
        } else {
            setEditingMake(null);
            makeForm.reset();
        }
        setIsMakeModalOpen(true);
    };

    // Open Model Modal (Add or Edit)
    const openModelModal = (make = null, model = null) => {
        modelForm.clearErrors();
        if (model) {
            setEditingModel(model);
            modelForm.setData({
                make_id: model.make_id || (make ? make.id : ''),
                name: model.name || '',
                type: model.type || '',
            });
        } else {
            setEditingModel(null);
            modelForm.reset();
            if (make) {
                modelForm.setData('make_id', make.id);
            }
        }
        setIsModelModalOpen(true);
    };

    // Submit Make (Create or Update)
    const submitMake = (e) => {
        e.preventDefault();
        if (editingMake) {
            makeForm.put(route('saas.vehicle-master.makes.update', editingMake.id), {
                onSuccess: () => {
                    setIsMakeModalOpen(false);
                    setEditingMake(null);
                },
            });
        } else {
            makeForm.post(route('saas.vehicle-master.makes.store'), {
                onSuccess: () => {
                    setIsMakeModalOpen(false);
                },
            });
        }
    };

    // Submit Model (Create or Update)
    const submitModel = (e) => {
        e.preventDefault();
        if (editingModel) {
            modelForm.put(route('saas.vehicle-master.models.update', editingModel.id), {
                onSuccess: () => {
                    setIsModelModalOpen(false);
                    setEditingModel(null);
                },
            });
        } else {
            modelForm.post(route('saas.vehicle-master.models.store'), {
                onSuccess: () => {
                    setIsModelModalOpen(false);
                },
            });
        }
    };

    // Delete Make (Super Admin only)
    const handleDeleteMake = (make) => {
        if (!isSuperAdmin) return;
        const count = make.models?.length || 0;
        const msg = count > 0
            ? `Are you sure you want to delete brand "${make.name}"?\nWARNING: This will permanently delete ${count} associated model(s)!`
            : `Are you sure you want to delete brand "${make.name}"?`;

        if (window.confirm(msg)) {
            router.delete(route('saas.vehicle-master.makes.destroy', make.id), {
                preserveScroll: true,
            });
        }
    };

    // Delete Model (Super Admin only)
    const handleDeleteModel = (model) => {
        if (!isSuperAdmin) return;
        if (window.confirm(`Are you sure you want to delete model "${model.name}"?`)) {
            router.delete(route('saas.vehicle-master.models.destroy', model.id), {
                preserveScroll: true,
            });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('saas.vehicle-master.index'), { search }, { preserveState: true, replace: true });
    };

    const handleClearSearch = () => {
        setSearch('');
        router.get(route('saas.vehicle-master.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Makes & Models Catalog</h1>
                    <p className="text-xs md:text-sm font-bold text-blue-600 mt-1">
                        Master automotive brands and models catalog &bull; Super Admin exclusive control
                    </p>
                </div>
                {isSuperAdmin && (
                    <div className="flex flex-wrap gap-2.5">
                        <button 
                            onClick={() => openMakeModal()} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-extrabold transition-all text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                        >
                            <span>+ Add Make</span>
                        </button>
                        <button 
                            onClick={() => openModelModal()} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-extrabold transition-all text-xs shadow-md shadow-blue-500/20"
                        >
                            <span>+ Add Model</span>
                        </button>
                    </div>
                )}
            </div>
        }>
            <Head title="Makes & Models Catalog" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search by Brand / Make or Model name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-sm transition-colors whitespace-nowrap">
                            Search
                        </button>
                        {search && (
                            <button type="button" onClick={handleClearSearch} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-colors whitespace-nowrap">
                                Clear
                            </button>
                        )}
                    </form>
                    <div className="text-xs font-bold text-slate-500 whitespace-nowrap">
                        Total: <span className="text-indigo-600 font-black">{makes?.length || 0}</span> Brands &bull; <span className="text-blue-600 font-black">{makes?.reduce((acc, m) => acc + (m.models?.length || 0), 0) || 0}</span> Models
                    </div>
                </div>

                {/* Makes & Models Catalog Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 w-52">Make / Brand</th>
                                    <th className="px-6 py-4">Available Models</th>
                                    <th className="px-6 py-4 text-right w-64">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {makes && makes.length > 0 ? (
                                    makes.map((make) => (
                                        <tr key={make.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-black text-slate-800 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                    <span>{make.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {make.models && make.models.length > 0 ? make.models.map(model => (
                                                        <span
                                                            key={model.id}
                                                            className="group/badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300 transition-all"
                                                        >
                                                            <span>{model.name}</span>
                                                            {model.type && (
                                                                <span className="text-[10px] text-blue-500 font-semibold">({model.type})</span>
                                                            )}
                                                            
                                                            {/* Super Admin Edit / Delete options for Model */}
                                                            {isSuperAdmin && (
                                                                <span className="opacity-0 group-hover/badge:opacity-100 flex items-center gap-1 ml-1 pl-1 border-l border-blue-200 transition-opacity">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            openModelModal(make, model);
                                                                        }}
                                                                        title="Edit Model"
                                                                        className="text-slate-400 hover:text-blue-700 transition-colors"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteModel(model);
                                                                        }}
                                                                        title="Delete Model"
                                                                        className="text-slate-400 hover:text-rose-600 transition-colors"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                </span>
                                                            )}
                                                        </span>
                                                    )) : (
                                                        <span className="text-slate-400 font-medium text-xs">No models registered</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {isSuperAdmin && (
                                                        <>
                                                            <button
                                                                onClick={() => openModelModal(make)}
                                                                className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                                                title="Add Model to this Brand"
                                                            >
                                                                + Model
                                                            </button>

                                                            <button
                                                                onClick={() => openMakeModal(make)}
                                                                className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                                                                title="Edit Brand Name"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                                <span>Edit</span>
                                                            </button>

                                                            <button
                                                                onClick={() => handleDeleteMake(make)}
                                                                className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                                                                title="Delete Brand & Models"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                <span>Delete</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No vehicle makes found. Click "+ Add Make / Brand" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Modal: Add / Edit Make */}
            <Modal show={isMakeModalOpen} onClose={() => setIsMakeModalOpen(false)}>
                <form onSubmit={submitMake} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-1">
                        {editingMake ? 'Edit Vehicle Make / Brand' : 'Add Vehicle Make / Brand'}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 mb-4">
                        {editingMake
                            ? `Update brand name for "${editingMake.name}".`
                            : 'Add a new automotive brand to the global catalog.'}
                    </p>

                    <div>
                        <InputLabel htmlFor="name" value="Make Name" />
                        <TextInput
                            id="name"
                            type="text"
                            className="w-full mt-1"
                            placeholder="e.g. Toyota, Honda, Suzuki, Nissan"
                            value={makeForm.data.name}
                            onChange={(e) => makeForm.setData('name', e.target.value)}
                            required
                        />
                        <InputError message={makeForm.errors.name} className="mt-1" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsMakeModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={makeForm.processing}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-colors disabled:opacity-50"
                        >
                            {makeForm.processing ? 'Saving...' : editingMake ? 'Update Brand' : 'Save Brand'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Add / Edit Model */}
            <Modal show={isModelModalOpen} onClose={() => setIsModelModalOpen(false)}>
                <form onSubmit={submitModel} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-1">
                        {editingModel ? 'Edit Vehicle Model' : 'Add Vehicle Model'}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 mb-4">
                        {editingModel
                            ? `Update details for model "${editingModel.name}".`
                            : 'Add a specific model under a vehicle make / brand.'}
                    </p>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="make_id" value="Select Make / Brand" />
                            <select
                                id="make_id"
                                className="w-full mt-1 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm text-sm"
                                value={modelForm.data.make_id}
                                onChange={(e) => modelForm.setData('make_id', e.target.value)}
                                required
                            >
                                <option value="">-- Choose Make --</option>
                                {makes.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={modelForm.errors.make_id} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="model_name" value="Model Name" />
                            <TextInput
                                id="model_name"
                                type="text"
                                className="w-full mt-1"
                                placeholder="e.g. Prius, Axio, Swift, Civic"
                                value={modelForm.data.name}
                                onChange={(e) => modelForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={modelForm.errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="type" value="Body / Vehicle Type (Optional)" />
                            <TextInput
                                id="type"
                                type="text"
                                className="w-full mt-1"
                                placeholder="e.g. Sedan, SUV, Hatchback, Hybrid, Van, 4x4"
                                value={modelForm.data.type}
                                onChange={(e) => modelForm.setData('type', e.target.value)}
                            />
                            <InputError message={modelForm.errors.type} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModelModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={modelForm.processing}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition-colors disabled:opacity-50"
                        >
                            {modelForm.processing ? 'Saving...' : editingModel ? 'Update Model' : 'Save Model'}
                        </button>
                    </div>
                </form>
            </Modal>

        </AuthenticatedLayout>
    );
}
