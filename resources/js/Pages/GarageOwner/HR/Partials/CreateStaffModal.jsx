import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';

export default function CreateStaffModal({ show, onClose }) {
    const createStaffForm = useForm({ name: '', email: '', password: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        createStaffForm.post(route('owner.hr.staff.store'), {
            onSuccess: () => { createStaffForm.reset(); onClose(); }
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Add New Staff Member</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Name</label>
                        <input type="text" value={createStaffForm.data.name} onChange={e => createStaffForm.setData('name', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                        <InputError message={createStaffForm.errors.name} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email (Used for login)</label>
                        <input type="email" value={createStaffForm.data.email} onChange={e => createStaffForm.setData('email', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                        <InputError message={createStaffForm.errors.email} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input type="password" value={createStaffForm.data.password} onChange={e => createStaffForm.setData('password', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                        <InputError message={createStaffForm.errors.password} className="mt-2" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={createStaffForm.processing} className="px-4 py-2 bg-emerald-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none disabled:opacity-50">Add Staff</button>
                </div>
            </form>
        </Modal>
    );
}
