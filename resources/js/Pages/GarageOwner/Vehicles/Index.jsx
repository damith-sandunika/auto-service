import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function VehiclesIndex({ customers, vehicles }) {
    const { auth } = usePage().props;
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length > 2) {
            setIsSearching(true);
            try {
                const res = await fetch(route('owner.vehicles.search') + '?q=' + e.target.value);
                const data = await res.json();
                setSearchResults(data);
            } catch (error) {
                console.error("Search failed", error);
            }
            setIsSearching(false);
        } else {
            setSearchResults([]);
        }
    };

    // Customer Form
    const { data: customerData, setData: setCustomerData, post: postCustomer, processing: customerProcessing, errors: customerErrors, reset: customerReset } = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
    });

    const submitCustomer = (e) => {
        e.preventDefault();
        postCustomer(route('owner.customers.store'), {
            onSuccess: () => {
                setIsCustomerModalOpen(false);
                customerReset();
            },
        });
    };

    // Vehicle Form
    const { data: vehicleData, setData: setVehicleData, post: postVehicle, processing: vehicleProcessing, errors: vehicleErrors, reset: vehicleReset } = useForm({
        owner_id: '',
        vehicle_number: '',
        make: '',
        model: '',
        year: '',
    });

    const submitVehicle = (e) => {
        e.preventDefault();
        postVehicle(route('owner.vehicles.store'), {
            onSuccess: () => {
                setIsVehicleModalOpen(false);
                vehicleReset();
            },
        });
    };

    const { delete: destroy } = useForm();
    const deleteVehicle = (id) => {
        if (confirm('Are you sure you want to remove this vehicle?')) {
            destroy(route('owner.vehicles.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">Customer & Vehicle Directory</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Manage all registered customers and their vehicles</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end gap-2">
                    <button onClick={() => setIsCustomerModalOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-black transition-all text-xs whitespace-nowrap">
                        + New Customer
                    </button>
                    <button onClick={() => setIsVehicleModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-black transition-all text-xs shadow-sm shadow-blue-500/20 whitespace-nowrap">
                        + Add Vehicle
                    </button>
                </div>
            }
        >
            <Head title="Vehicles Directory" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6">
                
                {/* Global Search Bar */}
                <div className="mb-8 relative">
                    <div className="relative max-w-2xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search Global Vehicle Registry by Number Plate..."
                            className="block w-full pl-10 pr-3 py-4 border border-slate-200 rounded-2xl leading-5 bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-lg uppercase transition-all"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        {isSearching && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full max-w-2xl mx-auto left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                            <ul className="divide-y divide-slate-100">
                                {searchResults.map(v => (
                                    <li key={v.id}>
                                        <a href={route('owner.vehicles.profile', v.id)} className="block hover:bg-slate-50 p-4 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-lg font-black text-slate-800 uppercase">{v.vehicle_number}</p>
                                                    <p className="text-sm text-slate-500">{v.make} {v.model}</p>
                                                </div>
                                                <div className="text-blue-600 font-bold text-sm flex items-center gap-1">
                                                    View Profile
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Vehicle Number</th>
                                    <th className="px-6 py-4">Make & Model</th>
                                    <th className="px-6 py-4">Owner (Customer)</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {vehicles.data && vehicles.data.length > 0 ? (
                                    vehicles.data.map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-black text-slate-800 text-base">{vehicle.vehicle_number}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-700">{vehicle.make || '-'}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">{vehicle.model || '-'} {vehicle.year ? `(${vehicle.year})` : ''}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{vehicle.owner?.name}</div>
                                                <div className="text-[10px] text-slate-500">{vehicle.owner?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-600">
                                                {vehicle.owner?.phone || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <a href={route('owner.vehicles.profile', vehicle.id)} className="text-blue-600 hover:text-blue-800 font-bold text-[11px] uppercase tracking-wider">Profile</a>
                                                <button onClick={() => deleteVehicle(vehicle.id)} className="text-red-500 hover:text-red-700 font-bold text-[11px] uppercase tracking-wider">Remove</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold">No vehicles registered yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {vehicles.links && <Pagination links={vehicles.links} />}
                </div>
            </div>

            {/* New Customer Modal */}
            <Modal show={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} maxWidth="md">
                <form onSubmit={submitCustomer} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Register New Customer</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Full Name" />
                            <TextInput className="w-full mt-1" value={customerData.name} onChange={e => setCustomerData('name', e.target.value)} required />
                            <InputError message={customerErrors.name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Phone Number (Optional)" />
                            <TextInput className="w-full mt-1" value={customerData.phone} onChange={e => setCustomerData('phone', e.target.value)} />
                            <InputError message={customerErrors.phone} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Email Address (Optional)" />
                            <TextInput type="email" className="w-full mt-1" value={customerData.email} onChange={e => setCustomerData('email', e.target.value)} />
                            <InputError message={customerErrors.email} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Address (Optional)" />
                            <TextInput className="w-full mt-1" value={customerData.address} onChange={e => setCustomerData('address', e.target.value)} />
                            <InputError message={customerErrors.address} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase">Cancel</button>
                        <button type="submit" disabled={customerProcessing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase disabled:opacity-50">Save Customer</button>
                    </div>
                </form>
            </Modal>

            {/* New Vehicle Modal */}
            <Modal show={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} maxWidth="md">
                <form onSubmit={submitVehicle} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Register New Vehicle</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Owner (Customer)" />
                            <select className="w-full mt-1 bg-slate-50 border-slate-200 rounded-lg text-sm" value={vehicleData.owner_id} onChange={e => setVehicleData('owner_id', e.target.value)} required>
                                <option value="">Select Owner</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
                            </select>
                            <InputError message={vehicleErrors.owner_id} className="mt-1" />
                            <p className="text-[10px] text-blue-600 mt-1 cursor-pointer font-bold" onClick={() => { setIsVehicleModalOpen(false); setIsCustomerModalOpen(true); }}>+ Add new customer instead</p>
                        </div>
                        <div>
                            <InputLabel value="Vehicle Number (Reg No)" />
                            <TextInput className="w-full mt-1 font-black uppercase" value={vehicleData.vehicle_number} onChange={e => setVehicleData('vehicle_number', e.target.value)} required placeholder="e.g. WP CAA-1234" />
                            <InputError message={vehicleErrors.vehicle_number} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Make (Optional)" />
                                <TextInput className="w-full mt-1" value={vehicleData.make} onChange={e => setVehicleData('make', e.target.value)} placeholder="e.g. Toyota" />
                                <InputError message={vehicleErrors.make} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel value="Model (Optional)" />
                                <TextInput className="w-full mt-1" value={vehicleData.model} onChange={e => setVehicleData('model', e.target.value)} placeholder="e.g. Corolla" />
                                <InputError message={vehicleErrors.model} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <InputLabel value="Year (Optional)" />
                            <TextInput type="number" className="w-full mt-1" value={vehicleData.year} onChange={e => setVehicleData('year', e.target.value)} placeholder="e.g. 2018" />
                            <InputError message={vehicleErrors.year} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsVehicleModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase">Cancel</button>
                        <button type="submit" disabled={vehicleProcessing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase disabled:opacity-50">Save Vehicle</button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
