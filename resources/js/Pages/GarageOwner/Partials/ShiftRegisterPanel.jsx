import React from 'react';
import { Link } from '@inertiajs/react';
import { BuildingStorefrontIcon, UsersIcon } from '@heroicons/react/24/outline';

export default function ShiftRegisterPanel({ shift, mechanics }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shift Register */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/20 animate-slide-up">
                <div className="px-6 py-5 border-b border-slate-700/50 flex items-center gap-4 bg-slate-800/50">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <BuildingStorefrontIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white tracking-tight">Shift Register</h3>
                        <p className="text-[12px] font-medium text-slate-400">Current session metrics</p>
                    </div>
                </div>
                <div className="p-6 flex flex-col gap-0 divide-y divide-slate-800">
                    <div className="flex justify-between items-center py-4">
                        <span className="text-[13px] font-semibold text-slate-400">Opening Balance</span>
                        <span className="text-xl font-black text-white tracking-tight">Rs. {(shift.opening_cash || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                        <span className="text-[13px] font-semibold text-slate-400">Cash Sales</span>
                        <span className="text-[14px] font-bold text-emerald-400">+ Rs. {(shift.cash_sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                        <span className="text-[13px] font-semibold text-slate-400">Expenses Logged</span>
                        <span className="text-[14px] font-bold text-rose-400">- Rs. {(shift.expenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 bg-slate-800/30 px-3 rounded-xl mt-2">
                        <span className="text-[13px] font-semibold text-slate-300">Expected Drawer Balance</span>
                        <span className="text-[16px] font-black text-blue-400">Rs. {(shift.current_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Staff Attendance */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 animate-slide-up">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                        <UsersIcon className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">Staff Attendance</h3>
                        <p className="text-[12px] font-medium text-slate-500">Manage shift check-ins</p>
                    </div>
                </div>
                <div className="p-0 overflow-y-auto max-h-[350px]">
                    <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-slate-50/50">
                            {mechanics?.map((mechanic) => {
                                const att = mechanic.attendance;
                                const isPresent = att && att.arrival_time && !att.departure_time;
                                const isOff = att && att.departure_time;
                                return (
                                    <tr key={mechanic.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-[13px] font-black text-slate-800">{mechanic.name}</div>
                                            {att ? (
                                                <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                                                    In: {att.arrival_time} {isOff && `| Out: ${att.departure_time}`}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-bold text-slate-400 mt-0.5">Not marked</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {isOff ? (
                                                <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100">Off Shift</span>
                                            ) : isPresent ? (
                                                <Link href={route('owner.dashboard.staff-out', mechanic.id)} method="post" as="button" preserveScroll className="inline-block px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-[11px] font-bold transition-all">Mark Off</Link>
                                            ) : (
                                                <Link href={route('owner.dashboard.staff-in', mechanic.id)} method="post" as="button" preserveScroll className="inline-block px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-[11px] font-bold transition-all">Mark In</Link>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!mechanics || mechanics.length === 0) && (
                                <tr>
                                    <td colSpan="2" className="px-6 py-10 text-center text-[13px] font-semibold text-slate-400">No staff members found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
