import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import PageHeader from '@/Components/PageHeader';
import { UserGroupIcon, CurrencyDollarIcon, ClockIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';

export default function HRIndex({ staff }) {
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [isCreateStaffModalOpen, setIsCreateStaffModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const createStaffForm = useForm({
        name: '',
        email: '',
        password: '',
    });

    const profileForm = useForm({
        basic_salary: 0,
        ot_rate_per_hour: 0,
        commission_rate: 0,
        casual_leaves_allowed: 14,
        medical_leaves_allowed: 7,
        vacation_leaves_allowed: 14,
    });

    const attendanceForm = useForm({
        user_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        ot_hours: 0,
    });

    const openProfileModal = (mechanic) => {
        setSelectedStaff(mechanic);
        if (mechanic.staff_profile) {
            profileForm.setData({
                basic_salary: mechanic.staff_profile.basic_salary,
                ot_rate_per_hour: mechanic.staff_profile.ot_rate_per_hour,
                commission_rate: mechanic.staff_profile.commission_rate,
                casual_leaves_allowed: mechanic.staff_profile.casual_leaves_allowed,
                medical_leaves_allowed: mechanic.staff_profile.medical_leaves_allowed,
                vacation_leaves_allowed: mechanic.staff_profile.vacation_leaves_allowed,
            });
        } else {
            profileForm.reset();
        }
        setIsProfileModalOpen(true);
    };

    const openAttendanceModal = (mechanic) => {
        setSelectedStaff(mechanic);
        attendanceForm.setData('user_id', mechanic.id);
        setIsAttendanceModalOpen(true);
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileForm.put(route('owner.hr.update', selectedStaff.id), {
            onSuccess: () => {
                setIsProfileModalOpen(false);
                profileForm.reset();
            }
        });
    };

    const handleAttendanceSubmit = (e) => {
        e.preventDefault();
        attendanceForm.post(route('owner.hr.attendance.store'), {
            onSuccess: () => {
                setIsAttendanceModalOpen(false);
                attendanceForm.reset();
            }
        });
    };

    const handleCreateStaffSubmit = (e) => {
        e.preventDefault();
        createStaffForm.post(route('owner.hr.staff.store'), {
            onSuccess: () => {
                setIsCreateStaffModalOpen(false);
                createStaffForm.reset();
            }
        });
    };

    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">HR & Staff Management</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Manage staff profiles, roles, and attendance</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end gap-3">
                    <button onClick={() => setIsCreateStaffModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black transition-all text-xs shadow-sm shadow-blue-500/20 whitespace-nowrap">
                        <span className="text-base leading-none mb-0.5 mr-1">+</span> Add Staff Member
                    </button>
                    <Link href={route('owner.payroll.index')} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg font-black flex items-center transition-all text-xs shadow-sm whitespace-nowrap">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1.5" />
                        Process Payroll
                    </Link>
                </div>
            }
        >
            <Head title="HR Management" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6 space-y-6">

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {staff.data && staff.data.map(mechanic => (
                                    <div key={mechanic.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="bg-blue-100 p-3 rounded-full">
                                                <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{mechanic.name}</h4>
                                                <p className="text-sm text-slate-500 capitalize">{mechanic.role.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 mb-6">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Basic Salary:</span>
                                                <span className="font-medium">Rs. {mechanic.staff_profile ? Number(mechanic.staff_profile.basic_salary).toLocaleString() : 'Not Set'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Commission Rate:</span>
                                                <span className="font-medium">{mechanic.staff_profile ? `${mechanic.staff_profile.commission_rate}%` : 'Not Set'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">OT Rate:</span>
                                                <span className="font-medium">Rs. {mechanic.staff_profile ? Number(mechanic.staff_profile.ot_rate_per_hour).toLocaleString() : 'Not Set'}/hr</span>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => openProfileModal(mechanic)}
                                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Edit Profile
                                            </button>
                                            <button 
                                                onClick={() => openAttendanceModal(mechanic)}
                                                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
                                            >
                                                <ClockIcon className="h-4 w-4 mr-1" />
                                                Attendance
                                            </button>
                                        </div>
                                        <div className="mt-2">
                                            <Link 
                                                href={route('owner.hr.show', mechanic.id)}
                                                className="block w-full text-center bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 py-2 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                View Full Profile
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {staff.links && <Pagination links={staff.links} />}
                        </div>
                    </div>
                </div>

            {/* Profile Modal */}
            <Modal show={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)}>
                <form onSubmit={handleProfileSubmit} className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Edit Profile: {selectedStaff?.name}</h2>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Basic Salary (Rs.)</label>
                                <input
                                    type="number"
                                    value={profileForm.data.basic_salary}
                                    onChange={e => profileForm.setData('basic_salary', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Commission Rate (%)</label>
                                <input
                                    type="number"
                                    value={profileForm.data.commission_rate}
                                    onChange={e => profileForm.setData('commission_rate', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">OT Rate per Hour (Rs.)</label>
                            <input
                                type="number"
                                value={profileForm.data.ot_rate_per_hour}
                                onChange={e => profileForm.setData('ot_rate_per_hour', e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t pt-4 mt-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500">Casual Leaves</label>
                                <input
                                    type="number"
                                    value={profileForm.data.casual_leaves_allowed}
                                    onChange={e => profileForm.setData('casual_leaves_allowed', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500">Medical Leaves</label>
                                <input
                                    type="number"
                                    value={profileForm.data.medical_leaves_allowed}
                                    onChange={e => profileForm.setData('medical_leaves_allowed', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500">Vacation Leaves</label>
                                <input
                                    type="number"
                                    value={profileForm.data.vacation_leaves_allowed}
                                    onChange={e => profileForm.setData('vacation_leaves_allowed', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button type="button" onClick={() => setIsProfileModalOpen(false)} className="mr-3 text-sm text-slate-600 font-medium">Cancel</button>
                        <button type="submit" disabled={profileForm.processing} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                            Save Profile
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Attendance Modal */}
            <Modal show={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)}>
                <form onSubmit={handleAttendanceSubmit} className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Mark Attendance: {selectedStaff?.name}</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Date</label>
                            <input
                                type="date"
                                value={attendanceForm.data.date}
                                onChange={e => attendanceForm.setData('date', e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                            <InputError message={attendanceForm.errors.date} className="mt-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Status</label>
                            <select
                                value={attendanceForm.data.status}
                                onChange={e => attendanceForm.setData('status', e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="half_day">Half Day</option>
                                <option value="casual_leave">Casual Leave</option>
                                <option value="medical_leave">Medical Leave</option>
                                <option value="vacation_leave">Vacation Leave</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">OT Hours (Optional)</label>
                            <input
                                type="number"
                                value={attendanceForm.data.ot_hours}
                                onChange={e => attendanceForm.setData('ot_hours', e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                min="0"
                                step="0.5"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button type="button" onClick={() => setIsAttendanceModalOpen(false)} className="mr-3 text-sm text-slate-600 font-medium">Cancel</button>
                        <button type="submit" disabled={attendanceForm.processing} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Mark Attendance
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Create Staff Modal */}
            <Modal show={isCreateStaffModalOpen} onClose={() => setIsCreateStaffModalOpen(false)}>
                <form onSubmit={handleCreateStaffSubmit} className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Add New Staff Member</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Name</label>
                            <input
                                type="text"
                                value={createStaffForm.data.name}
                                onChange={e => createStaffForm.setData('name', e.target.value)}
                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                            <InputError message={createStaffForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email (Used for login)</label>
                            <input
                                type="email"
                                value={createStaffForm.data.email}
                                onChange={e => createStaffForm.setData('email', e.target.value)}
                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                            <InputError message={createStaffForm.errors.email} className="mt-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <input
                                type="password"
                                value={createStaffForm.data.password}
                                onChange={e => createStaffForm.setData('password', e.target.value)}
                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                            <InputError message={createStaffForm.errors.password} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsCreateStaffModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={createStaffForm.processing} className="px-4 py-2 bg-emerald-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none disabled:opacity-50">
                            Add Staff
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
