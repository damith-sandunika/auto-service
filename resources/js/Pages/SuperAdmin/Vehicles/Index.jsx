import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Pagination from '@/Components/Pagination';

export default function VehiclesIndex({ vehicles = { data: [] }, makes = [], filters = {}, totalVehicles = 0 }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

    // Form for Adding Vehicle directly into Central Database
    const vehicleForm = useForm({
        vehicle_number: '',
        make: '',
        model: '',
        year: '',
    });

    const openVehicleModal = () => {
        vehicleForm.clearErrors();
        vehicleForm.reset();
        setIsVehicleModalOpen(true);
    };

    const submitVehicle = (e) => {
        e.preventDefault();
        vehicleForm.post(route('saas.vehicles.store'), {
            onSuccess: () => setIsVehicleModalOpen(false),
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('saas.vehicles.index'), { search }, { preserveState: true, replace: true });
    };

    const handleClearSearch = () => {
        setSearch('');
        router.get(route('saas.vehicles.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Global Vehicles Database</h1>
                    <p className="text-xs md:text-sm font-bold text-blue-600 mt-1">
                        Central Database ({totalVehicles || vehicles.total || 0} registered vehicles across all tenant garages)
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <button 
                        onClick={openVehicleModal} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-extrabold transition-all text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        <span>Register Vehicle</span>
                    </button>
                    <Link
                        href={route('saas.vehicle-master.index')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5"
                    >
                        <span>Manage Makes & Models →</span>
                    </Link>
                </div>
            </div>
        }>
            <Head title="Global Vehicles Database" />

            <div className="max-w-7xl mx-auto space-y-6">

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
                        Central DB: <span className="text-indigo-600 font-black">{totalVehicles || vehicles.total || 0}</span> total vehicles
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
                                            No vehicles found in the central database.
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

            {/* Modal: Register Vehicle directly into Central Database */}
            <Modal show={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)}>
                <form onSubmit={submitVehicle} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-1">Register Vehicle into Central Database</h2>
                    <p className="text-xs font-semibold text-slate-500 mb-6">
                        This vehicle will be stored in the central database and immediately accessible across all tenant garages.
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
        </AuthenticatedLayout>
    );
}
