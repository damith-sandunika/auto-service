import React from 'react';
import { useForm } from '@inertiajs/react';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import SearchableSelect from '@/Components/SearchableSelect';

export default function ShiftOpenCard({ mechanics }) {
    const openShiftForm = useForm({
        opening_cash: '',
        attendance: mechanics ? mechanics.map(m => ({ user_id: m.id, name: m.name, status: 'present' })) : []
    });

    const submitOpenShift = (e) => {
        e.preventDefault();
        openShiftForm.post(route('owner.dashboard.open-shift'), {
            onSuccess: () => {
                openShiftForm.reset();
            }
        });
    };

    return (
        <div className="flex justify-center py-10 px-4 animate-slide-up">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 p-8 md:p-12 w-full max-w-lg text-center shadow-xl shadow-slate-200/50 mt-10">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6 ring-8 ring-blue-50/50">
                    <BuildingStorefrontIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Shift is Closed</h3>
                <p className="text-[13px] font-medium text-slate-500 mb-8 leading-relaxed">Open the branch shift register with your starting cash to begin processing jobs today.</p>
                
                <form onSubmit={submitOpenShift}>
                    <div className="text-left mb-5">
                        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-widest mb-2">Opening Cash (Rs.)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            required
                            min="0"
                            value={openShiftForm.data.opening_cash}
                            onChange={(e) => openShiftForm.setData('opening_cash', e.target.value)}
                            placeholder="e.g. 5000" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>

                    {mechanics && mechanics.length > 0 && (
                        <div className="text-left mb-6">
                            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-widest mb-2">Staff Attendance</label>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <tbody className="divide-y divide-slate-200">
                                        {openShiftForm.data.attendance.map((att, index) => (
                                            <tr key={att.user_id} className="hover:bg-slate-100/50">
                                                <td className="px-4 py-3 font-bold text-slate-800 text-xs">{att.name}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <SearchableSelect
                                                        value={att.status}
                                                        onChange={(e) => {
                                                            const newAttendance = [...openShiftForm.data.attendance];
                                                            newAttendance[index].status = e.target.value;
                                                            openShiftForm.setData('attendance', newAttendance);
                                                        }}
                                                        options={[
                                                            { value: 'present', label: 'Present' },
                                                            { value: 'half_day', label: 'Half Day' },
                                                            { value: 'absent', label: 'Absent' },
                                                            { value: 'casual_leave', label: 'Casual Leave' },
                                                            { value: 'medical_leave', label: 'Medical Leave' },
                                                            { value: 'vacation_leave', label: 'Vacation Leave' }
                                                        ]}
                                                        isClearable={false}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={openShiftForm.processing}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                    >
                        Open Shift Register
                    </button>
                </form>
            </div>
        </div>
    );
}
