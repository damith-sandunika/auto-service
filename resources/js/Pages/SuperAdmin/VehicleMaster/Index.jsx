import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Pagination from '@/Components/Pagination';

export default function VehicleMasterIndex({ makes = [], vehicles = { data: [] }, filters = {}, totalVehicles = 0 }) {
    const [activeTab, setActiveTab] = useState(filters?.tab || 'vehicles');
    const [search, setSearch] = useState(filters?.search || '');

    const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

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

    // Form for Adding Vehicle directly into Central Database
    const vehicleForm = useForm({
        vehicle_number: '',
        make: '',
        model: '',
        year: '',
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

    const openVehicleModal = () => {
        vehicleForm.clearErrors();
        vehicleForm.reset();
        setIsVehicleModalOpen(true);
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

    const submitVehicle = (e) => {
        e.preventDefault();
        vehicleForm.post(route('saas.vehicle-master.vehicles.store'), {
            onSuccess: () => setIsVehicleModalOpen(false),
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('saas.vehicle-master.index'), { search, tab: 'vehicles' }, { preserveState: true, replace: true });
    };

    const handleClearSearch = () => {
        setSearch('');
        router.get(route('saas.vehicle-master.index'), { tab: 'vehicles' }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Vehicle Master & Global Vehicles</h1>
                    <p className="text-xs md:text-sm font-bold text-blue-600 mt-1">
                        Central Database ({totalVehicles} registered vehicles across all tenant garages)
                    </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <button 
                        onClick={openVehicleModal} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-extrabold transition-all text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        <span>Register Vehicle</span>
                    </button>
                    <button 
                        onClick={openMakeModal} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-extrabold transition-all text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                        <span>+ Add Make</span>
                    </button>
                    <button 
                        onClick={() => openModelModal()} 
                        className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl font-extrabold transition-all text-xs shadow-md transition-colors"
                    >
                        <span>+ Add Model</span>
                    </button>
                </div>
            </div>
        }>
            <Head title="Vehicle Master & Central Vehicles" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('vehicles')}
                        className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${activeTab === 'vehicles' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        <span>Registered Vehicles</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'vehicles' ? 'bg-blue-800/80 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            {totalVehicles}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('makes')}
                        className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${activeTab === 'makes' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        <span>Makes & Models Catalog</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'makes' ? 'bg-blue-800/80 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            {makes.length}
                        </span>
                    </button>
                </div>

                {/* TAB 1: REGISTERED VEHICLES (CENTRAL DATABASE) */}
                {activeTab === 'vehicles' && (
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                            <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search by Vehicle Number, Make, or Model..."
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
                                Central DB: <span className="text-indigo-600 font-black">{totalVehicles}</span> total vehicles
                            </div>
                        </div>

                        {/* Vehicles Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Vehicle Number</th>
                                            <th className="px-6 py-4">Make</th>
                                            <th className="px-6 py-4">Model</th>
                                            <th className="px-6 py-4">Year</th>
                                            <th className="px-6 py-4">Registered Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {vehicles?.data?.length > 0 ? vehicles.data.map((vehicle) => (
                                            <tr key={vehicle.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-4 font-black text-slate-900">
                                                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                                                        {vehicle.vehicle_number}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-700">
                                                    {vehicle.make || '—'}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-600">
                                                    {vehicle.model || '—'}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-500">
                                                    {vehicle.year || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-400">
                                                    {new Date(vehicle.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                                                    No vehicles found matching your query.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Standard 15 Items Pagination */}
                            {vehicles?.links && (
                                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                                    <Pagination paginator={vehicles} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: MAKES & MODELS CATALOG */}
                {activeTab === 'makes' && (
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
                                    {makes && makes.length > 0 ? makes.map((make) => (
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
                                    )) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-slate-500 font-medium">
                                                No vehicle makes found. Click "+ Add Make" to start adding brands.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* Modal: Register Vehicle directly into Central Database */}
            <Modal show={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)}>
                <form onSubmit={submitVehicle} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-1">Register Vehicle into Central Database</h2>
                    <p className="text-xs font-semibold text-slate-500 mb-6">
                        This vehicle will be stored in the central database and immediately accessible by all tenant garages.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="vehicle_number" value="Vehicle Number (License Plate)" />
                            <TextInput
                                id="vehicle_number"
                                type="text"
                                className="w-full mt-1 uppercase"
                                placeholder="e.g. WP CAB-1234"
                                value={vehicleForm.data.vehicle_number}
                                onChange={(e) => vehicleForm.setData('vehicle_number', e.target.value.toUpperCase())}
                                required
                            />
                            <InputError message={vehicleForm.errors.vehicle_number} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="make" value="Make / Brand" />
                                <TextInput
                                    id="make"
                                    type="text"
                                    className="w-full mt-1"
                                    placeholder="e.g. Toyota"
                                    value={vehicleForm.data.make}
                                    onChange={(e) => vehicleForm.setData('make', e.target.value)}
                                />
                                <InputError message={vehicleForm.errors.make} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="model" value="Model" />
                                <TextInput
                                    id="model"
                                    type="text"
                                    className="w-full mt-1"
                                    placeholder="e.g. Corolla"
                                    value={vehicleForm.data.model}
                                    onChange={(e) => vehicleForm.setData('model', e.target.value)}
                                />
                                <InputError message={vehicleForm.errors.model} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="year" value="Manufacture Year" />
                            <TextInput
                                id="year"
                                type="number"
                                className="w-full mt-1"
                                placeholder="e.g. 2020"
                                value={vehicleForm.data.year}
                                onChange={(e) => vehicleForm.setData('year', e.target.value)}
                            />
                            <InputError message={vehicleForm.errors.year} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsVehicleModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={vehicleForm.processing}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
                        >
                            {vehicleForm.processing ? 'Saving...' : 'Register Vehicle'}
                        </button>
                    </div>
                </form>
            </Modal>

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
                            placeholder="e.g. Toyota, Honda, Suzuki"
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
                                placeholder="e.g. Corolla, Civic, Wagon R"
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
