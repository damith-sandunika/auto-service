import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';
import StaffGrid from './Partials/StaffGrid';
import StaffProfileModal from './Partials/StaffProfileModal';
import AttendanceModal from './Partials/AttendanceModal';
import CreateStaffModal from './Partials/CreateStaffModal';

export default function HRIndex({ staff, garages, roles }) {
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [isCreateStaffModalOpen, setIsCreateStaffModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const openProfileModal = (mechanic) => { setSelectedStaff(mechanic); setIsProfileModalOpen(true); };
    const openAttendanceModal = (mechanic) => { setSelectedStaff(mechanic); setIsAttendanceModalOpen(true); };

    return (
        <AuthenticatedLayout
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">HR &amp; Staff Management</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Manage staff profiles, roles, and attendance</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end gap-3">
                    <button onClick={() => setIsCreateStaffModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black transition-all text-xs shadow-sm shadow-blue-500/20 whitespace-nowrap">
                        <span className="text-base leading-none mb-0.5 mr-1">+</span> Add Staff Member
                    </button>
                    <Link href={route('owner.payroll.index')} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg font-black flex items-center transition-all text-xs shadow-sm whitespace-nowrap">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1.5" /> Process Payroll
                    </Link>
                </div>
            }
        >
            <Head title="HR Management" />
            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6 space-y-6">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100">
                    <div className="p-6">
                        <StaffGrid staff={staff} onEditProfile={openProfileModal} onMarkAttendance={openAttendanceModal} />
                        {staff.links && <Pagination paginator={staff} />}
                    </div>
                </div>
            </div>

            <StaffProfileModal show={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} selectedStaff={selectedStaff} garages={garages} roles={roles} />
            <AttendanceModal show={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} selectedStaff={selectedStaff} />
            <CreateStaffModal show={isCreateStaffModalOpen} onClose={() => setIsCreateStaffModalOpen(false)} garages={garages} roles={roles} />
        </AuthenticatedLayout>
    );
}
