import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function POS({ auth, jobs, customers, vehicles, mechanics }) {
    const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
    
    // UI state toggles
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [isNewVehicle, setIsNewVehicle] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        customer_id: '',
        new_customer_name: '',
        new_customer_phone: '',
        
        vehicle_id: '',
        new_vehicle_number: '',
        new_vehicle_make: '',
        new_vehicle_model: '',
        
        mechanic_id: '',
        description: ''
    });

    const submitNewJob = (e) => {
        e.preventDefault();
        post(route('owner.pos.storeJob'), {
            onSuccess: () => {
                setIsNewJobModalOpen(false);
                reset();
                setIsNewCustomer(false);
                setIsNewVehicle(false);
            }
        });
    };

    // Filter vehicles based on selected customer if it's an existing customer
    const availableVehicles = (data.customer_id && !isNewCustomer)
        ? (customers.find(c => c.id == data.customer_id)?.vehicles || [])
        : [];

    return (
        <AuthenticatedLayout
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">Jobs Dashboard</h2>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <button onClick={() => setIsNewJobModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-blue-500/20 whitespace-nowrap">
                        <span className="text-lg leading-none mb-0.5">+</span> New Job
                    </button>
                </div>
            }
        >
            <Head title="Jobs Dashboard" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No active jobs found. Click "New Job" to start.
                        </div>
                    ) : (
                        jobs.map(job => (
                            <Link key={job.id} href={route('owner.jobs.workspace', job.id)} className="block bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{job.vehicle?.vehicle_number}</h3>
                                        <p className="text-sm text-slate-500">{job.vehicle?.owner?.name}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg uppercase">
                                        {job.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-slate-500">Total</span>
                                    <span className="text-lg font-black text-blue-600">LKR {parseFloat(job.total_cost).toFixed(2)}</span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            <Modal show={isNewJobModalOpen} onClose={() => setIsNewJobModalOpen(false)}>
                <form onSubmit={submitNewJob} className="p-6">
                    <h2 className="text-xl font-bold mb-4">Start New Job</h2>
                    
                    <div className="space-y-6">
                        {/* CUSTOMER SECTION */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-slate-700">1. Customer Details</label>
                                <button type="button" onClick={() => {
                                    setIsNewCustomer(!isNewCustomer);
                                    setData('customer_id', '');
                                }} className="text-xs text-blue-600 font-bold hover:underline">
                                    {isNewCustomer ? 'Select Existing' : 'Add New Customer'}
                                </button>
                            </div>

                            {!isNewCustomer ? (
                                <select 
                                    className="w-full rounded-lg border-slate-300 text-sm" 
                                    value={data.customer_id} 
                                    onChange={e => {
                                        setData(prev => ({ ...prev, customer_id: e.target.value, vehicle_id: '' }));
                                    }} 
                                    required={!isNewCustomer}
                                >
                                    <option value="">Search & Select Customer...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.phone || c.email})</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" placeholder="Full Name" className="w-full rounded-lg border-slate-300 text-sm" value={data.new_customer_name} onChange={e => setData('new_customer_name', e.target.value)} required={isNewCustomer} />
                                    <input type="text" placeholder="Phone Number" className="w-full rounded-lg border-slate-300 text-sm" value={data.new_customer_phone} onChange={e => setData('new_customer_phone', e.target.value)} />
                                </div>
                            )}
                            {errors.customer_id && <p className="text-red-500 text-xs mt-1">{errors.customer_id}</p>}
                        </div>

                        {/* VEHICLE SECTION */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-slate-700">2. Vehicle Details</label>
                                <button type="button" onClick={() => {
                                    setIsNewVehicle(!isNewVehicle);
                                    setData('vehicle_id', '');
                                }} className="text-xs text-blue-600 font-bold hover:underline">
                                    {isNewVehicle ? 'Select Existing' : 'Add New Vehicle'}
                                </button>
                            </div>

                            {!isNewVehicle ? (
                                <select 
                                    className="w-full rounded-lg border-slate-300 text-sm" 
                                    value={data.vehicle_id} 
                                    onChange={e => setData('vehicle_id', e.target.value)} 
                                    required={!isNewVehicle}
                                    disabled={!data.customer_id && !isNewCustomer}
                                >
                                    <option value="">Select a vehicle...</option>
                                    {availableVehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.vehicle_number} ({v.make} {v.model})</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    <input type="text" placeholder="Plate Number (e.g. CAA-1234)" className="w-full rounded-lg border-slate-300 text-sm" value={data.new_vehicle_number} onChange={e => setData('new_vehicle_number', e.target.value)} required={isNewVehicle} />
                                    <input type="text" placeholder="Make (e.g. Toyota)" className="w-full rounded-lg border-slate-300 text-sm" value={data.new_vehicle_make} onChange={e => setData('new_vehicle_make', e.target.value)} />
                                    <input type="text" placeholder="Model (e.g. Prius)" className="w-full rounded-lg border-slate-300 text-sm" value={data.new_vehicle_model} onChange={e => setData('new_vehicle_model', e.target.value)} />
                                </div>
                            )}
                            {errors.vehicle_id && <p className="text-red-500 text-xs mt-1">{errors.vehicle_id}</p>}
                            {errors.new_vehicle_number && <p className="text-red-500 text-xs mt-1">{errors.new_vehicle_number}</p>}
                        </div>

                        {/* JOB DETAILS */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">Assign Mechanic (Optional)</label>
                            <select className="w-full rounded-lg border-slate-300 text-sm" value={data.mechanic_id} onChange={e => setData('mechanic_id', e.target.value)}>
                                <option value="">None</option>
                                {mechanics.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Description / Notes</label>
                            <textarea className="w-full rounded-lg border-slate-300 text-sm" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Initial inspection notes..."></textarea>
                        </div>
                        
                        <div className="pt-2 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsNewJobModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg text-sm">Cancel</button>
                            <button type="submit" disabled={processing} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 text-sm">Start Job</button>
                        </div>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
