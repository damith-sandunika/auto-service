import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Pagination from '@/Components/Pagination';
import SearchableSelect from '@/Components/SearchableSelect';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_BADGE = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function AppointmentsIndex({ appointments }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [deletingAppointment, setDeletingAppointment] = useState(null);

    const { data, setData, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        appointment_date: '', appointment_time: '', status: 'pending', notes: '',
    });

    const openEditModal = (apt) => {
        clearErrors();
        setData({ appointment_date: apt.appointment_date, appointment_time: apt.appointment_time, status: apt.status, notes: apt.notes || '' });
        setEditingAppointment(apt);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (apt) => { setDeletingAppointment(apt); setIsDeleteModalOpen(true); };
    const closeModal = () => { setIsEditModalOpen(false); setTimeout(() => { reset(); clearErrors(); }, 200); };
    const closeDeleteModal = () => { setIsDeleteModalOpen(false); setTimeout(() => setDeletingAppointment(null), 200); };
    const submitForm = (e) => { e.preventDefault(); put(route('owner.appointments.update', editingAppointment.id), { onSuccess: () => closeModal() }); };
    const confirmDelete = () => destroy(route('owner.appointments.destroy', deletingAppointment.id), { onSuccess: () => closeDeleteModal() });

    return (
        <AuthenticatedLayout
            fullWidth={true}
            header={<div className="text-left w-full"><h2 className="text-xl font-black text-black">Appointments</h2><p className="text-xs font-bold text-blue-600 mt-1">Manage customer bookings and schedule jobs</p></div>}
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <Link href={route('owner.appointments.create')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black transition-all text-xs shadow-sm shadow-blue-500/20 inline-flex items-center whitespace-nowrap">
                        <span className="text-base leading-none mb-0.5 mr-1">+</span> New Appointment
                    </Link>
                </div>
            }
        >
            <Head title="Appointments" />
            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6 space-y-6">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider"><tr><th className="px-6 py-4">Date &amp; Time</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Notes</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {appointments.data?.length > 0 ? appointments.data.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4"><div className="font-bold text-slate-800">{apt.appointment_date}</div><div className="text-xs font-bold text-slate-500 mt-0.5">{apt.appointment_time}</div></td>
                                        <td className="px-6 py-4"><div className="font-bold text-slate-800">{apt.customer?.name || 'Unknown'}</div><div className="text-xs font-bold text-slate-500 mt-0.5">{apt.customer?.email || '-'}</div></td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${STATUS_BADGE[apt.status] || 'bg-slate-100 text-slate-700'}`}>{apt.status}</span></td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-600 truncate max-w-xs">{apt.notes || '-'}</td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => openEditModal(apt)} className="text-blue-600 hover:text-blue-800 font-bold text-[11px] uppercase tracking-wider">Edit</button>
                                            <button onClick={() => openDeleteModal(apt)} className="text-red-500 hover:text-red-700 font-bold text-[11px] uppercase tracking-wider">Cancel</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center"><div className="text-slate-400 font-bold mb-2">No Appointments Found</div><p className="text-xs text-slate-500">Schedule your first appointment by clicking the button above.</p></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {appointments.links && <Pagination links={appointments.links} />}
                </div>
            </div>

            <Modal show={isEditModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Edit Appointment</h2>
                    <form onSubmit={submitForm} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><InputLabel htmlFor="appointment_date" value="Date" /><TextInput id="appointment_date" type="date" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 text-sm font-medium" value={data.appointment_date} onChange={(e) => setData('appointment_date', e.target.value)} required /><InputError message={errors.appointment_date} className="mt-2" /></div>
                            <div><InputLabel htmlFor="appointment_time" value="Time" /><TextInput id="appointment_time" type="time" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 text-sm font-medium" value={data.appointment_time} onChange={(e) => setData('appointment_time', e.target.value)} required /><InputError message={errors.appointment_time} className="mt-2" /></div>
                        </div>
                        <div><InputLabel htmlFor="status" value="Status" /><SearchableSelect className="mt-1" value={data.status} onChange={(e) => setData('status', e.target.value)} options={STATUS_OPTIONS} isClearable={false} /><InputError message={errors.status} className="mt-2" /></div>
                        <div><InputLabel htmlFor="notes" value="Notes" /><textarea id="notes" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500" value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows="3"></textarea><InputError message={errors.notes} className="mt-2" /></div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider">Close</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-xs uppercase tracking-wider disabled:opacity-50">{processing ? 'Saving...' : 'Save Appointment'}</button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-4">Cancel Appointment</h2>
                    <p className="text-sm text-slate-600 font-medium mb-6">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={closeDeleteModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider">Close</button>
                        <button onClick={confirmDelete} disabled={processing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-xs uppercase tracking-wider disabled:opacity-50">{processing ? 'Cancelling...' : 'Yes, Cancel It'}</button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
