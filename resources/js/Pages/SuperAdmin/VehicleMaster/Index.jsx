import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Pagination from '@/Components/Pagination';

export default function VehicleMasterIndex({
    makes = { data: [] },
    allMakes = [],
    totalMakes = 0,
    totalModels = 0,
    filters = {},
}) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.user?.role === 'saas_admin';

    const [search, setSearch] = useState(filters?.search || '');
    const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
    const [editingMake, setEditingMake] = useState(null);
    const [editingModel, setEditingModel] = useState(null);

    // Accordion / Lazy Loading State for Models
    const [expandedMakes, setExpandedMakes] = useState({});
    const [modelsByMake, setModelsByMake] = useState({});
    const [loadingMakeId, setLoadingMakeId] = useState(null);

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

    // Toggle Brand Accordion & Fetch Models On-Demand from Database
    const toggleExpandMake = async (makeId) => {
        if (expandedMakes[makeId]) {
            setExpandedMakes((prev) => ({ ...prev, [makeId]: false }));
            return;
        }

        // If models are already loaded in memory, just expand
        if (modelsByMake[makeId]) {
            setExpandedMakes((prev) => ({ ...prev, [makeId]: true }));
            return;
        }

        // Fetch models from database only on demand
        try {
            setLoadingMakeId(makeId);
            const response = await fetch(route('saas.vehicle-master.makes.models', makeId));
            const data = await response.json();
            setModelsByMake((prev) => ({ ...prev, [makeId]: data }));
            setExpandedMakes((prev) => ({ ...prev, [makeId]: true }));
        } catch (error) {
            console.error('Error fetching models for make:', makeId, error);
        } finally {
            setLoadingMakeId(null);
        }
    };

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
        const makeId = modelForm.data.make_id;

        if (editingModel) {
            modelForm.put(route('saas.vehicle-master.models.update', editingModel.id), {
                onSuccess: () => {
                    setIsModelModalOpen(false);
                    setEditingModel(null);
                    // Refresh loaded models for this make if already expanded
                    if (modelsByMake[makeId]) {
                        fetch(route('saas.vehicle-master.makes.models', makeId))
                            .then((res) => res.json())
                            .then((data) => setModelsByMake((prev) => ({ ...prev, [makeId]: data })));
                    }
                },
            });
        } else {
            modelForm.post(route('saas.vehicle-master.models.store'), {
                onSuccess: () => {
                    setIsModelModalOpen(false);
                    // Refresh loaded models for this make
                    fetch(route('saas.vehicle-master.makes.models', makeId))
                        .then((res) => res.json())
                        .then((data) => {
                            setModelsByMake((prev) => ({ ...prev, [makeId]: data }));
                            setExpandedMakes((prev) => ({ ...prev, [makeId]: true }));
                        });
                },
            });
        }
    };

    // Delete Make (Super Admin only)
    const handleDeleteMake = (make) => {
        if (!isSuperAdmin) return;
        const count = make.models_count || 0;
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
    const handleDeleteModel = (makeId, model) => {
        if (!isSuperAdmin) return;
        if (window.confirm(`Are you sure you want to delete model "${model.name}"?`)) {
            router.delete(route('saas.vehicle-master.models.destroy', model.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setModelsByMake((prev) => ({
                        ...prev,
                        [makeId]: (prev[makeId] || []).filter((m) => m.id !== model.id),
                    }));
                },
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

    const makeList = makes?.data || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Makes & Models Catalog</h1>
                        <p className="text-xs md:text-sm font-bold text-blue-600 mt-1">
                            Master automotive brands and models &bull; On-demand lazy loaded models &bull; 15 items per page
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
            }
        >
            <Head title="Makes & Models Catalog" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Search Bar & Catalog Statistics */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search Brand / Make name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
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
                        Total: <span className="text-indigo-600 font-black">{totalMakes}</span> Brands &bull;{' '}
                        <span className="text-blue-600 font-black">{totalModels}</span> Models
                    </div>
                </div>

                {/* Makes Table with On-Demand Model Expanders */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 w-12 text-center"></th>
                                    <th className="px-6 py-4">Brand / Make</th>
                                    <th className="px-6 py-4 text-center">Models in Catalog</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {makeList && makeList.length > 0 ? (
                                    makeList.map((make) => {
                                        const isExpanded = !!expandedMakes[make.id];
                                        const isLoading = loadingMakeId === make.id;
                                        const loadedModels = modelsByMake[make.id] || [];

                                        return (
                                            <React.Fragment key={make.id}>
                                                {/* Brand Header Row */}
                                                <tr
                                                    onClick={() => toggleExpandMake(make.id)}
                                                    className={`cursor-pointer transition-colors ${
                                                        isExpanded ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                                                    }`}
                                                >
                                                    {/* Expand Arrow Icon */}
                                                    <td className="px-4 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleExpandMake(make.id);
                                                            }}
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                                                isExpanded
                                                                    ? 'bg-blue-600 text-white rotate-90 shadow-sm'
                                                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                            }`}
                                                            title={isExpanded ? 'Collapse Models' : 'Click to Load Models'}
                                                        >
                                                            {isLoading ? (
                                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </td>

                                                    {/* Brand Name */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-black text-xs flex items-center justify-center border border-slate-300/60 shadow-2xs">
                                                                {make.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <span className="font-black text-slate-900 text-base">
                                                                    {make.name}
                                                                </span>
                                                                <span className="block text-[11px] font-semibold text-slate-400">
                                                                    Click arrow or row to {isExpanded ? 'hide' : 'load'} models
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Models Count Badge */}
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                                                            <span>{make.models_count ?? 0}</span>
                                                            <span className="text-[10px] font-bold text-blue-500">Models</span>
                                                        </span>
                                                    </td>

                                                    {/* Row Actions */}
                                                    <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {isSuperAdmin && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openModelModal(make)}
                                                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                                        title="Add Model to this Brand"
                                                                    >
                                                                        + Add Model
                                                                    </button>

                                                                    <button
                                                                        type="button"
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
                                                                        type="button"
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

                                                {/* Expanded Models Section (Loaded On-Demand from DB) */}
                                                {isExpanded && (
                                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                                        <td colSpan="4" className="p-4 sm:p-6 pl-14 sm:pl-20">
                                                            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                                                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                                                            Registered Models for {make.name}
                                                                        </h3>
                                                                        <span className="text-xs font-bold text-slate-400">
                                                                            ({loadedModels.length} models)
                                                                        </span>
                                                                    </div>
                                                                    {isSuperAdmin && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openModelModal(make)}
                                                                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md transition-colors"
                                                                        >
                                                                            + Add Another Model
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {/* Models List */}
                                                                {isLoading ? (
                                                                    <div className="py-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                                                                        <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                                                        </svg>
                                                                        <span>Loading {make.name} models from database...</span>
                                                                    </div>
                                                                ) : loadedModels && loadedModels.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                                        {loadedModels.map((model) => (
                                                                            <span
                                                                                key={model.id}
                                                                                className="group/badge inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-50 text-slate-800 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all shadow-2xs"
                                                                            >
                                                                                <span className="font-black text-slate-900">{model.name}</span>
                                                                                {model.type && (
                                                                                    <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded">
                                                                                        {model.type}
                                                                                    </span>
                                                                                )}

                                                                                {/* Super Admin Quick Actions on Model */}
                                                                                {isSuperAdmin && (
                                                                                    <span className="flex items-center gap-1 pl-1.5 border-l border-slate-200">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                openModelModal(make, model);
                                                                                            }}
                                                                                            title="Edit Model"
                                                                                            className="text-slate-400 hover:text-blue-700 transition-colors"
                                                                                        >
                                                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                                            </svg>
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleDeleteModel(make.id, model);
                                                                                            }}
                                                                                            title="Delete Model"
                                                                                            className="text-slate-400 hover:text-rose-600 transition-colors"
                                                                                        >
                                                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                                            </svg>
                                                                                        </button>
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="py-4 text-center text-xs text-slate-400 font-medium">
                                                                        No models registered for {make.name}. Click "+ Add Model" to register the first model.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No vehicle makes found. Click "+ Add Make" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Standard 15 Items Server-Side Pagination */}
                    {makes?.links && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                            <Pagination paginator={makes} />
                        </div>
                    )}
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
                                {(allMakes.length > 0 ? allMakes : makeList).map((m) => (
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
