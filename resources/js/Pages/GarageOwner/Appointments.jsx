import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function Appointments({ appointments, customers, vehicles }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingAppt, setEditingAppt] = useState(null);
    const [deletingAppt, setDeletingAppt] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        customer_id: '',
        vehicle_id: '',
        appointment_date: '',
        appointment_time: '',
        status: 'pending',
        notes: ''
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingAppt(null);
        setIsModalOpen(true);
    };

    const openEditModal = (appt) => {
        clearErrors();
        setData({
            customer_id: appt.customer_id,
            vehicle_id: appt.vehicle_id || '',
            appointment_date: appt.appointment_date,
            appointment_time: appt.appointment_time,
            status: appt.status,
            notes: appt.notes || ''
        });
        setEditingAppt(appt);
        setIsModalOpen(true);
    };

    const openDeleteModal = (appt) => {
        setDeletingAppt(appt);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => { reset(); clearErrors(); }, 200);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTimeout(() => setDeletingAppt(null), 200);
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (editingAppt) {
            put(route('owner.appointments.update', editingAppt.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('owner.appointments.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = () => {
        destroy(route('owner.appointments.destroy', deletingAppt.id), {
            onSuccess: () => closeDeleteModal(),
        });
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center w-full">
                <span>Appointments (Manual Entry)</span>
                <button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-indigo-500/20">
                    <span className="text-lg leading-none mb-0.5">+</span> Add Appointment
                </button>
            </div>
        }>
            <Head title="Appointments" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Vehicle</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {appointments && appointments.length > 0 ? (
                                    appointments.map((appt) => (
                                        <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-black text-slate-800">{appt.appointment_date}</div>
                                                <div className="text-xs text-slate-500 font-medium">{appt.appointment_time}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800">{appt.customer?.name || 'Unknown'}</td>
                                            <td className="px-6 py-4 font-bold text-slate-800">{appt.vehicle?.license_plate || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                                                    appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                }`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(appt)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-200">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => openDeleteModal(appt)} className="text-slate-400 hover:text-red-600 transition-colors p-2 bg-slate-50 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200">
                                                        Del
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                                            No appointments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">
                        {editingAppt ? 'Edit Appointment' : 'New Appointment'}
                    </h2>
                    <form onSubmit={submitForm} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="customer_id" value="Select Customer" />
                            <select
                                id="customer_id"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-md"
                                value={data.customer_id}
                                onChange={(e) => setData('customer_id', e.target.value)}
                            >
                                <option value="">-- Select --</option>
                                {customers?.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.customer_id} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="vehicle_id" value="Select Vehicle (Optional)" />
                            <select
                                id="vehicle_id"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-md"
                                value={data.vehicle_id}
                                onChange={(e) => setData('vehicle_id', e.target.value)}
                            >
                                <option value="">-- None --</option>
                                {vehicles?.map((v) => (
                                    <option key={v.id} value={v.id}>{v.license_plate}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <InputLabel htmlFor="appointment_date" value="Date" />
                                <TextInput
                                    id="appointment_date"
                                    type="date"
                                    className="mt-1 block w-full bg-slate-50 border-slate-200"
                                    value={data.appointment_date}
                                    onChange={(e) => setData('appointment_date', e.target.value)}
                                />
                                <InputError message={errors.appointment_date} className="mt-2" />
                            </div>
                            <div className="w-1/2">
                                <InputLabel htmlFor="appointment_time" value="Time" />
                                <TextInput
                                    id="appointment_time"
                                    type="time"
                                    className="mt-1 block w-full bg-slate-50 border-slate-200"
                                    value={data.appointment_time}
                                    onChange={(e) => setData('appointment_time', e.target.value)}
                                />
                                <InputError message={errors.appointment_time} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="status" value="Status" />
                            <select
                                id="status"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-md"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold">Cancel</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold disabled:opacity-50">Save</button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-4">Delete Appointment</h2>
                    <p className="text-sm text-slate-600 mb-6 font-medium">Are you sure? This cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={closeDeleteModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold">Cancel</button>
                        <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold">Yes, Delete</button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
