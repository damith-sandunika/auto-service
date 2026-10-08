import React from 'react';
import { Link } from '@inertiajs/react';
import { BriefcaseIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function StaffGrid({ staff, onEditProfile, onMarkAttendance }) {
    return (
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
                        <button onClick={() => onEditProfile(mechanic)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors">
                            Edit Profile
                        </button>
                        <button onClick={() => onMarkAttendance(mechanic)} className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors">
                            <ClockIcon className="h-4 w-4 mr-1" /> Attendance
                        </button>
                    </div>
                    <div className="mt-2">
                        <Link href={route('owner.hr.show', mechanic.id)} className="block w-full text-center bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 py-2 rounded-lg text-sm font-medium transition-colors">
                            View Full Profile
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
