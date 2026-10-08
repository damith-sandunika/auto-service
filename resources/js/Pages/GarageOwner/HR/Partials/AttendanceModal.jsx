import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import SearchableSelect from '@/Components/SearchableSelect';

export default function AttendanceModal({ show, onClose, selectedStaff }) {
    const attendanceForm = useForm({
        user_id: selectedStaff?.id ?? '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        ot_hours: 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        attendanceForm.post(route('owner.hr.attendance.store'), {
            onSuccess: () => { attendanceForm.reset(); onClose(); }
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Mark Attendance: {selectedStaff?.name}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Date</label>
                        <input type="date" value={attendanceForm.data.date} onChange={e => attendanceForm.setData('date', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                        <InputError message={attendanceForm.errors.date} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Status</label>
                        <SearchableSelect
                            className="mt-1"
                            value={attendanceForm.data.status}
                            onChange={e => attendanceForm.setData('status', e.target.value)}
                            options={[
                                { value: 'present', label: 'Present' },
                                { value: 'absent', label: 'Absent' },
                                { value: 'half_day', label: 'Half Day' },
                                { value: 'casual_leave', label: 'Casual Leave' },
                                { value: 'medical_leave', label: 'Medical Leave' },
                                { value: 'vacation_leave', label: 'Vacation Leave' }
                            ]}
                            isClearable={false}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">OT Hours (Optional)</label>
                        <input type="number" value={attendanceForm.data.ot_hours} onChange={e => attendanceForm.setData('ot_hours', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" min="0" step="0.5" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="button" onClick={onClose} className="mr-3 text-sm text-slate-600 font-medium">Cancel</button>
                    <button type="submit" disabled={attendanceForm.processing} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Mark Attendance</button>
                </div>
            </form>
        </Modal>
    );
}
