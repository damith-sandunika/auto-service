import React, { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';

export default function StaffProfileModal({ show, onClose, selectedStaff, garages, roles }) {
    const { auth } = usePage().props;

    const profileForm = useForm({
        name: '',
        email: '',
        phone: '',
        role: '',
        garage_id: '',
        tenant_role_id: '',
        tenant_garage_ids: [],
        nic: '',
        dob: '',
        address: '',
        emergency_contact: '',
        standard_working_hours: 8.0,
        basic_salary: 0,
        ot_rate_per_hour: 0,
        commission_rate: 0,
        casual_leaves_allowed: 14,
        medical_leaves_allowed: 7,
        vacation_leaves_allowed: 14,
        password: '',
    });

    useEffect(() => {
        if (selectedStaff) {
            profileForm.setData({
                name: selectedStaff.name || '',
                email: selectedStaff.email || '',
                phone: selectedStaff.phone || '',
                role: selectedStaff.role || '',
                garage_id: selectedStaff.garage_id || '',
                tenant_role_id: selectedStaff.tenant_roles?.[0]?.id?.toString() || '',
                tenant_garage_ids: selectedStaff.tenant_garages?.map(g => g.id.toString()) || [],
                nic: selectedStaff.staff_profile?.nic || '',
                dob: selectedStaff.staff_profile?.dob || '',
                address: selectedStaff.staff_profile?.address || '',
                emergency_contact: selectedStaff.staff_profile?.emergency_contact || '',
                standard_working_hours: selectedStaff.staff_profile?.standard_working_hours ?? 8.0,
                basic_salary: selectedStaff.staff_profile?.basic_salary ?? 0,
                ot_rate_per_hour: selectedStaff.staff_profile?.ot_rate_per_hour ?? 0,
                commission_rate: selectedStaff.staff_profile?.commission_rate ?? 0,
                casual_leaves_allowed: selectedStaff.staff_profile?.casual_leaves_allowed ?? 14,
                medical_leaves_allowed: selectedStaff.staff_profile?.medical_leaves_allowed ?? 7,
                vacation_leaves_allowed: selectedStaff.staff_profile?.vacation_leaves_allowed ?? 14,
                password: '',
            });
        }
    }, [selectedStaff]);

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
        <Modal show={show} onClose={onClose} maxWidth="3xl">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Edit Profile: {selectedStaff?.name}</h2>
                <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
                    
                    {/* User Account Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 border-b pb-2 mb-4">Account Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Name</label>
                                <input type="text" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                                <InputError message={profileForm.errors.name} className="mt-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Email</label>
                                <input type="email" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                                <InputError message={profileForm.errors.email} className="mt-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Change Password (Optional)</label>
                                <input type="password" placeholder="Leave blank to keep current" value={profileForm.data.password} onChange={e => profileForm.setData('password', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                <InputError message={profileForm.errors.password} className="mt-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">System Level</label>
                                <select value={profileForm.data.role} onChange={e => profileForm.setData('role', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    <option value="staff">Basic User (Staff)</option>
                                    <option value="branch_admin">Branch Admin</option>
                                    <option value="accountant">Accountant</option>
                                    <option value="hr_manager">HR Manager</option>
                                </select>
                                <InputError message={profileForm.errors.role} className="mt-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Custom Role (Permissions)</label>
                                <select value={profileForm.data.tenant_role_id} onChange={e => profileForm.setData('tenant_role_id', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    <option value="">-- Select Custom Role --</option>
                                    {roles?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                <InputError message={profileForm.errors.tenant_role_id} className="mt-2" />
                            </div>
                            {auth.user.role === 'company_owner' && (
                                <div className="col-span-2 mt-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Assign Branches (Access)</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border p-2 rounded-md border-slate-200">
                                        {garages?.map(g => (
                                            <label key={g.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-50 rounded">
                                                <input 
                                                    type="checkbox" 
                                                    value={g.id}
                                                    checked={profileForm.data.tenant_garage_ids.includes(g.id.toString())}
                                                    onChange={(e) => {
                                                        const id = e.target.value;
                                                        let newIds = [...profileForm.data.tenant_garage_ids];
                                                        if (e.target.checked) {
                                                            newIds.push(id);
                                                        } else {
                                                            newIds = newIds.filter(i => i !== id);
                                                        }
                                                        if (newIds.length > 0 && !profileForm.data.garage_id) {
                                                            profileForm.setData({ tenant_garage_ids: newIds, garage_id: id });
                                                        } else {
                                                            profileForm.setData('tenant_garage_ids', newIds);
                                                        }
                                                    }}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-slate-700">{g.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={profileForm.errors.tenant_garage_ids} className="mt-2" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Personal & Contact Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 border-b pb-2 mb-4">Personal & Contact Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Phone</label>
                                <input type="text" value={profileForm.data.phone} onChange={e => profileForm.setData('phone', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">NIC</label>
                                <input type="text" value={profileForm.data.nic} onChange={e => profileForm.setData('nic', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                                <input type="date" value={profileForm.data.dob} onChange={e => profileForm.setData('dob', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Emergency Contact</label>
                                <input type="text" value={profileForm.data.emergency_contact} onChange={e => profileForm.setData('emergency_contact', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700">Address</label>
                            <textarea value={profileForm.data.address} onChange={e => profileForm.setData('address', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" rows="2"></textarea>
                        </div>
                    </div>

                    {/* Payroll & Attendance Rules */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 border-b pb-2 mb-4">Payroll & Attendance</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Basic Salary (Rs.)</label>
                                <input type="number" value={profileForm.data.basic_salary} onChange={e => profileForm.setData('basic_salary', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" min="0" step="0.01" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">OT Rate/Hour (Rs.)</label>
                                <input type="number" value={profileForm.data.ot_rate_per_hour} onChange={e => profileForm.setData('ot_rate_per_hour', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" min="0" step="0.01" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Commission Rate (%)</label>
                                <input type="number" value={profileForm.data.commission_rate} onChange={e => profileForm.setData('commission_rate', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" min="0" max="100" step="0.01" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Standard Work Hours</label>
                                <input type="number" value={profileForm.data.standard_working_hours} onChange={e => profileForm.setData('standard_working_hours', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" min="0" step="0.1" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500">Casual Leaves Allowed</label>
                                <input type="number" value={profileForm.data.casual_leaves_allowed} onChange={e => profileForm.setData('casual_leaves_allowed', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500">Medical Leaves Allowed</label>
                                <input type="number" value={profileForm.data.medical_leaves_allowed} onChange={e => profileForm.setData('medical_leaves_allowed', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500">Vacation Leaves Allowed</label>
                                <input type="number" value={profileForm.data.vacation_leaves_allowed} onChange={e => profileForm.setData('vacation_leaves_allowed', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t flex justify-end">
                    <button type="button" onClick={onClose} className="mr-3 px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={profileForm.processing} className="bg-blue-600 text-white px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700">Save Changes</button>
                </div>
            </form>
        </Modal>
    );
}
