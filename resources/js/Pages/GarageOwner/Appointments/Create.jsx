import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function AppointmentCreate({ customers, vehicles }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        vehicle_id: '',
        appointment_date: '',
        appointment_time: '',
        status: 'pending',
        notes: '',
    });

    const submitForm = (e) => {
        e.preventDefault();
        post(route('owner.appointments.store'));
    };

    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-black text-black">Schedule Appointment</h2>
                        <p className="text-xs font-bold text-blue-600 mt-1">Book a new service appointment</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Link href={route('owner.appointments.index')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg font-black transition-all text-xs">
                            Cancel & Back
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Schedule Appointment" />

            <div className="w-full max-w-4xl mx-auto py-8 px-2 sm:px-4 lg:px-6">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100">
                    <form onSubmit={submitForm} className="p-6 sm:p-10 space-y-8">
                        
                        {/* Section 1: Customer Details */}
                        <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">1. Customer Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="customer_id" value="Select Customer" className="font-bold text-slate-700" />
                                    <select
                                        id="customer_id"
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500"
                                        value={data.customer_id}
                                        onChange={(e) => setData('customer_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose an existing customer --</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.customer_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="vehicle_id" value="Select Vehicle (Optional)" className="font-bold text-slate-700" />
                                    <select
                                        id="vehicle_id"
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500"
                                        value={data.vehicle_id}
                                        onChange={(e) => setData('vehicle_id', e.target.value)}
                                    >
                                        <option value="">-- No Vehicle Selected --</option>
                                        {vehicles.filter(v => v.owner_id == data.customer_id || !data.customer_id).map(v => (
                                            <option key={v.id} value={v.id}>{v.vehicle_number} - {v.make} {v.model}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.vehicle_id} className="mt-2" />
                                    <p className="text-[10px] text-slate-400 mt-1 font-bold">Select a customer first to filter their vehicles.</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Scheduling */}
                        <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">2. Scheduling</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="appointment_date" value="Date" className="font-bold text-slate-700" />
                                    <TextInput
                                        id="appointment_date"
                                        type="date"
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 text-sm font-medium"
                                        value={data.appointment_date}
                                        onChange={(e) => setData('appointment_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.appointment_date} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="appointment_time" value="Time" className="font-bold text-slate-700" />
                                    <TextInput
                                        id="appointment_time"
                                        type="time"
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 text-sm font-medium"
                                        value={data.appointment_time}
                                        onChange={(e) => setData('appointment_time', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.appointment_time} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Additional Details */}
                        <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">3. Additional Details</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="status" value="Initial Status" className="font-bold text-slate-700" />
                                    <select
                                        id="status"
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        required
                                    >
                                        <option value="pending">Pending Confirmation</option>
                                        <option value="confirmed">Confirmed</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="notes" value="Internal Notes / Issues Described" className="font-bold text-slate-700" />
                                    <textarea
                                        id="notes"
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500 p-3"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows="4"
                                        placeholder="e.g. Customer reported strange noise from engine..."
                                    ></textarea>
                                    <InputError message={errors.notes} className="mt-2" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end pt-6 border-t border-slate-100">
                            <button type="submit" disabled={processing} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm tracking-wide transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30 flex items-center gap-2">
                                {processing ? 'Scheduling...' : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        Schedule Appointment
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
