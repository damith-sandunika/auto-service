import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function StaffProfileModal({ show, onClose, selectedStaff }) {
    const profileForm = useForm({
        basic_salary: selectedStaff?.staff_profile?.basic_salary ?? 0,
        ot_rate_per_hour: selectedStaff?.staff_profile?.ot_rate_per_hour ?? 0,
        commission_rate: selectedStaff?.staff_profile?.commission_rate ?? 0,
        casual_leaves_allowed: selectedStaff?.staff_profile?.casual_leaves_allowed ?? 14,
        medical_leaves_allowed: selectedStaff?.staff_profile?.medical_leaves_allowed ?? 7,
        vacation_leaves_allowed: selectedStaff?.staff_profile?.vacation_leaves_allowed ?? 14,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        profileForm.put(route('owner.hr.update', selectedStaff.id), {
            onSuccess: () => {
                profileForm.reset();
                onClose();
            }
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Edit Profile: {selectedStaff?.name}</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Basic Salary (Rs.)</label>
                            <input type="number" value={profileForm.data.basic_salary} onChange={e => profileForm.setData('basic_salary', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" min="0" step="0.01" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Commission Rate (%)</label>
                            <input type="number" value={profileForm.data.commission_rate} onChange={e => profileForm.setData('commission_rate', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" min="0" max="100" step="0.01" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">OT Rate per Hour (Rs.)</label>
                        <input type="number" value={profileForm.data.ot_rate_per_hour} onChange={e => profileForm.setData('ot_rate_per_hour', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" min="0" step="0.01" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t pt-4 mt-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500">Casual Leaves</label>
                            <input type="number" value={profileForm.data.casual_leaves_allowed} onChange={e => profileForm.setData('casual_leaves_allowed', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500">Medical Leaves</label>
                            <input type="number" value={profileForm.data.medical_leaves_allowed} onChange={e => profileForm.setData('medical_leaves_allowed', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500">Vacation Leaves</label>
                            <input type="number" value={profileForm.data.vacation_leaves_allowed} onChange={e => profileForm.setData('vacation_leaves_allowed', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="button" onClick={onClose} className="mr-3 text-sm text-slate-600 font-medium">Cancel</button>
                    <button type="submit" disabled={profileForm.processing} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Save Profile</button>
                </div>
            </form>
        </Modal>
    );
}
