import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function VehicleMasterIndex({ makes = [], filters = {} }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);

    // Form for Adding Make
    const makeForm = useForm({
        name: '',
    });

    // Form for Adding Model
    const modelForm = useForm({
        make_id: '',
        name: '',
        type: '',
    });

    const openMakeModal = () => {
        makeForm.clearErrors();
        makeForm.reset();
        setIsMakeModalOpen(true);
    };

    const openModelModal = (make = null) => {
        modelForm.clearErrors();
        modelForm.reset();
        if (make) {
            modelForm.setData('make_id', make.id);
        }
        setIsModelModalOpen(true);
    };

    const submitMake = (e) => {
        e.preventDefault();
        makeForm.post(route('saas.vehicle-master.makes.store'), {
            onSuccess: () => setIsMakeModalOpen(false),
        });
    };

    const submitModel = (e) => {
        e.preventDefault();
        modelForm.post(route('saas.vehicle-master.models.store'), {
            onSuccess: () => setIsModelModalOpen(false),
        });
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
                        Master automotive brands and models used across all tenant garages
                    </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <button 
                        onClick={openMakeModal} 
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
                        Total Brands: <span className="text-indigo-600 font-black">{makes.length}</span> makes
                    </div>
                </div>

                {/* Makes & Models Catalog Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Make / Brand</th>
                                    <th className="px-6 py-4">Available Models</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {makes && makes.length > 0 ? (
                                    makes.map((make) => (
                                        <tr key={make.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-black text-slate-800 whitespace-nowrap">
                                                {make.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {make.models && make.models.length > 0 ? make.models.map(model => (
                                                        <span key={model.id} className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                            {model.name} {model.type ? `(${model.type})` : ''}
                                                        </span>
                                                    )) : (
                                                        <span className="text-slate-400 font-medium text-xs">No models registered</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openModelModal(make)}
                                                    className="text-xs font-extrabold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    + Add Model
                                                </button>
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

            {/* Modal: Add Make */}
            <Modal show={isMakeModalOpen} onClose={() => setIsMakeModalOpen(false)}>
                <form onSubmit={submitMake} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-1">Add Vehicle Make / Brand</h2>
                    <p className="text-xs font-semibold text-slate-500 mb-4">Add a new automotive brand to the global catalog.</p>

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
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
                        >
                            {makeForm.processing ? 'Saving...' : 'Save Make'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Add Model */}
            <Modal show={isModelModalOpen} onClose={() => setIsModelModalOpen(false)}>
                <form onSubmit={submitModel} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-1">Add Vehicle Model</h2>
                    <p className="text-xs font-semibold text-slate-500 mb-4">Add a specific model under a brand.</p>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="make_id" value="Select Make / Brand" />
                            <select
                                id="make_id"
                                className="w-full mt-1 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                value={modelForm.data.make_id}
                                onChange={(e) => modelForm.setData('make_id', e.target.value)}
                                required
                            >
                                <option value="">Select a Make</option>
                                {makes.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
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
                                placeholder="e.g. Corolla, Civic, Wagon R, Axio"
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
                                placeholder="e.g. Sedan, SUV, Hatchback, Van"
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
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
                        >
                            {modelForm.processing ? 'Saving...' : 'Save Model'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
