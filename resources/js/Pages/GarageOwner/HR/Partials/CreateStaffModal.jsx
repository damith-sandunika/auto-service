import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';

export default function CreateStaffModal({ show, onClose, garages, roles }) {
    const { auth } = usePage().props;
    const createStaffForm = useForm({ 
        name: '', email: '', password: '', role: 'staff', garage_id: '',
        tenant_role_id: '', tenant_garage_ids: [],
        phone: '', nic: '', dob: '', address: '', emergency_contact: '',
        standard_working_hours: 8, basic_salary: 0, ot_rate_per_hour: 0, casual_leaves_allowed: 14
    });

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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">System Level</label>
                            <select value={createStaffForm.data.role} onChange={e => createStaffForm.setData('role', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="staff">Basic User (Staff)</option>
                                <option value="branch_admin">Branch Admin</option>
                                <option value="accountant">Accountant</option>
                                <option value="hr_manager">HR Manager</option>
                            </select>
                            <InputError message={createStaffForm.errors.role} className="mt-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Custom Role (Permissions)</label>
                            <select value={createStaffForm.data.tenant_role_id} onChange={e => createStaffForm.setData('tenant_role_id', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="">-- Select Custom Role --</option>
                                {roles?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            <InputError message={createStaffForm.errors.tenant_role_id} className="mt-2" />
                        </div>
                    </div>
                    {auth.user.role === 'company_owner' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Assign Branches (Access)</label>
                            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border p-2 rounded-md border-slate-200">
                                {garages?.map(g => (
                                    <label key={g.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-50 rounded">
                                        <input 
                                            type="checkbox" 
                                            value={g.id}
                                            checked={createStaffForm.data.tenant_garage_ids.includes(g.id.toString())}
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                let newIds = [...createStaffForm.data.tenant_garage_ids];
                                                if (e.target.checked) {
                                                    newIds.push(id);
                                                } else {
                                                    newIds = newIds.filter(i => i !== id);
                                                }
                                                // If it's the first garage they check, set it as their default garage_id too
                                                if (newIds.length === 1 && !createStaffForm.data.garage_id) {
                                                    createStaffForm.setData({ tenant_garage_ids: newIds, garage_id: id });
                                                } else {
                                                    createStaffForm.setData('tenant_garage_ids', newIds);
                                                }
                                            }}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">{g.name}</span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={createStaffForm.errors.tenant_garage_ids} className="mt-2" />
                            <InputError message={createStaffForm.errors.garage_id} className="mt-2" />
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Phone</label>
                            <input type="text" value={createStaffForm.data.phone} onChange={e => createStaffForm.setData('phone', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            <InputError message={createStaffForm.errors.phone} className="mt-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">NIC</label>
                            <input type="text" value={createStaffForm.data.nic} onChange={e => createStaffForm.setData('nic', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            <InputError message={createStaffForm.errors.nic} className="mt-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                            <input type="date" value={createStaffForm.data.dob} onChange={e => createStaffForm.setData('dob', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            <InputError message={createStaffForm.errors.dob} className="mt-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Emergency Contact</label>
                            <input type="text" value={createStaffForm.data.emergency_contact} onChange={e => createStaffForm.setData('emergency_contact', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            <InputError message={createStaffForm.errors.emergency_contact} className="mt-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Address</label>
                        <textarea value={createStaffForm.data.address} onChange={e => createStaffForm.setData('address', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" rows="2"></textarea>
                        <InputError message={createStaffForm.errors.address} className="mt-2" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Basic Salary</label>
                            <input type="number" step="0.01" value={createStaffForm.data.basic_salary} onChange={e => createStaffForm.setData('basic_salary', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">OT Rate/Hour</label>
                            <input type="number" step="0.01" value={createStaffForm.data.ot_rate_per_hour} onChange={e => createStaffForm.setData('ot_rate_per_hour', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Work Hours/Day</label>
                            <input type="number" step="0.1" value={createStaffForm.data.standard_working_hours} onChange={e => createStaffForm.setData('standard_working_hours', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Casual Leaves</label>
                            <input type="number" value={createStaffForm.data.casual_leaves_allowed} onChange={e => createStaffForm.setData('casual_leaves_allowed', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
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
