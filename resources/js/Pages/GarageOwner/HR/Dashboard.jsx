import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';

export default function HRDashboard({ totalStaff, totalSalaryPay, totalOtPay, totalWorkingHours, branches, branchId, month, year, staffSummary }) {
    const [sortCol, setSortCol] = useState('name');
    const [sortAsc, setSortAsc] = useState(true);

    const handleFilterChange = (key, value) => {
        router.get(route('owner.hr.dashboard'), {
            branch_id: key === 'branch_id' ? value : branchId,
            month: key === 'month' ? value : month,
            year: key === 'year' ? value : year,
        }, { preserveState: true });
    };

    const sortedStaff = useMemo(() => {
        return [...staffSummary].sort((a, b) => {
            let valA = a[sortCol];
            let valB = b[sortCol];
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            if (valA < valB) return sortAsc ? -1 : 1;
            if (valA > valB) return sortAsc ? 1 : -1;
            return 0;
        });
    }, [staffSummary, sortCol, sortAsc]);

    const sortBy = (col) => {
        if (sortCol === col) setSortAsc(!sortAsc);
        else { setSortCol(col); setSortAsc(true); }
    };

    const formatHM = (val) => {
        if (!val || val <= 0) return '0h';
        let totalMins = Math.round(val * 60);
        let h = Math.floor(totalMins / 60);
        let m = totalMins % 60;
        if (h > 0 && m > 0) return `${h}h ${m}m`;
        if (h > 0) return `${h}h`;
        return `${m}m`;
    };

    const formatCurr = (val) => Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <AuthenticatedLayout
            fullWidth={true}
            header={
                <div className="flex flex-wrap justify-between items-center gap-3 w-full text-left">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">HR &amp; Payroll Dashboard</h2>
                        <p className="text-xs font-bold text-slate-500 mt-1">Company-wide Staff Performance, Working Hours &amp; Salary Overview</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={branchId || ''} onChange={(e) => handleFilterChange('branch_id', e.target.value)} className="text-sm border-slate-200 rounded-lg focus:ring-blue-500 font-semibold bg-white py-2 px-3 shadow-sm">
                            <option value="">🌍 All Branches (Global)</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <select value={month} onChange={(e) => handleFilterChange('month', e.target.value)} className="text-sm border-slate-200 rounded-lg focus:ring-blue-500 font-semibold bg-white py-2 px-3 shadow-sm">
                            {monthNames.map((mName, index) => (
                                <option key={index + 1} value={index + 1}>{mName}</option>
                            ))}
                        </select>
                        <select value={year} onChange={(e) => handleFilterChange('year', e.target.value)} className="text-sm border-slate-200 rounded-lg focus:ring-blue-500 font-semibold bg-white py-2 px-3 shadow-sm">
                            {[0, 1, 2].map(offset => {
                                const y = new Date().getFullYear() - offset;
                                return <option key={y} value={y}>{y}</option>;
                            })}
                        </select>
                        <Link href={route('owner.hr.index')} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition whitespace-nowrap">
                            Staff Management
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="HR Dashboard" />
            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6 space-y-6">
                
                {/* Top Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-center shadow-sm relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full opacity-50"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Staff</p>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-slate-800">{totalStaff}</span>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-1">Active</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-center shadow-sm relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full opacity-50"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Salary Pay</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-emerald-700">Rs. {formatCurr(totalSalaryPay)}</span>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-600 mt-2">{monthNames[month - 1]} {year} Net Payable</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-center shadow-sm relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-50 rounded-full opacity-50"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total OT Pay</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-indigo-600">Rs. {formatCurr(totalOtPay)}</span>
                        </div>
                        <p className="text-[10px] font-bold text-indigo-500 mt-2">Overtime Expenses</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-center shadow-sm relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full opacity-50"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Working Hours</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-amber-600">{Number(totalWorkingHours).toFixed(1)}</span>
                            <span className="text-xs font-bold text-amber-500 mb-1">Hours</span>
                        </div>
                        <p className="text-[10px] font-bold text-amber-500 mt-2">Total Hours Worked</p>
                    </div>
                </div>

                {/* Monthly Staff Attendance Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-3">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">Monthly Staff Performance Summary</h3>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Calculated based on attendance, working hours, free leaves, and overtime</p>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                                    <th onClick={() => sortBy('name')} className="p-4 cursor-pointer hover:bg-slate-200 transition">
                                        Staff Member {sortCol === 'name' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => sortBy('branch')} className="p-4 cursor-pointer hover:bg-slate-200 transition">
                                        Branch {sortCol === 'branch' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => sortBy('present_days')} className="p-4 text-center cursor-pointer hover:bg-slate-200 transition text-emerald-700">
                                        Present {sortCol === 'present_days' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => sortBy('leave_days')} className="p-4 text-center cursor-pointer hover:bg-slate-200 transition text-rose-600">
                                        Leaves {sortCol === 'leave_days' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => sortBy('total_worked_hours')} className="p-4 text-center cursor-pointer hover:bg-slate-200 transition text-blue-700">
                                        Full Work Hrs {sortCol === 'total_worked_hours' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => sortBy('day_hours')} className="p-4 text-center cursor-pointer hover:bg-slate-200 transition text-slate-700">
                                        Day Hrs {sortCol === 'day_hours' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => sortBy('ot_hours')} className="p-4 text-center cursor-pointer hover:bg-slate-200 transition text-indigo-600">
                                        OT Hrs {sortCol === 'ot_hours' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => sortBy('adjusted_basic_salary')} className="p-4 text-right cursor-pointer hover:bg-slate-200 transition text-slate-800">
                                        Regular Pay {sortCol === 'adjusted_basic_salary' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => sortBy('ot_amount')} className="p-4 text-right cursor-pointer hover:bg-slate-200 transition text-indigo-600">
                                        OT Pay {sortCol === 'ot_amount' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => sortBy('net_adjustments')} className="p-4 text-right cursor-pointer hover:bg-slate-200 transition text-purple-600">
                                        Allowance/Ded. {sortCol === 'net_adjustments' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => sortBy('net_salary')} className="p-4 text-right cursor-pointer hover:bg-slate-200 transition text-emerald-800">
                                        Total Net {sortCol === 'net_salary' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedStaff.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/80 transition">
                                        <td className="p-4 font-bold text-slate-800">
                                            {user.name}
                                            <p className="text-[10px] text-slate-400 font-semibold">{user.role}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{user.branch}</span>
                                        </td>
                                        <td className="p-4 text-center text-sm font-black text-emerald-600">{user.present_days} d</td>
                                        <td className="p-4 text-center text-sm font-black text-rose-600">{user.leave_days} d</td>
                                        <td className="p-4 text-center text-sm font-black text-blue-700">{formatHM(user.total_worked_hours)}</td>
                                        <td className="p-4 text-center text-sm font-black text-slate-700">{formatHM(user.day_hours)}</td>
                                        <td className="p-4 text-center text-sm font-black text-indigo-600">{formatHM(user.ot_hours)}</td>
                                        <td className="p-4 text-right text-xs font-bold text-slate-800">Rs. {formatCurr(user.adjusted_basic_salary)}</td>
                                        <td className="p-4 text-right text-xs font-bold text-indigo-600">Rs. {formatCurr(user.ot_amount)}</td>
                                        <td className={`p-4 text-right text-xs font-bold ${user.net_adjustments >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {user.net_adjustments > 0 ? '+' : ''}Rs. {formatCurr(user.net_adjustments)}
                                        </td>
                                        <td className="p-4 text-right text-sm font-black text-emerald-800 bg-emerald-50/40">Rs. {formatCurr(user.net_salary)}</td>
                                    </tr>
                                ))}
                                {sortedStaff.length === 0 && (
                                    <tr>
                                        <td colSpan="11" className="p-8 text-center text-slate-500 font-medium">No staff members found for the selected criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-50 text-slate-800 font-black border-t-2 border-slate-200">
                                    <td colSpan="2" className="p-4 text-right text-xs uppercase tracking-wider">Grand Totals:</td>
                                    <td className="p-4 text-center text-sm text-emerald-700">{staffSummary.reduce((a, u) => a + u.present_days, 0)} d</td>
                                    <td className="p-4 text-center text-sm text-rose-600">{staffSummary.reduce((a, u) => a + u.leave_days, 0)} d</td>
                                    <td className="p-4 text-center text-sm text-blue-700">{formatHM(staffSummary.reduce((a, u) => a + u.total_worked_hours, 0))}</td>
                                    <td className="p-4 text-center text-sm text-slate-700">{formatHM(staffSummary.reduce((a, u) => a + u.day_hours, 0))}</td>
                                    <td className="p-4 text-center text-sm text-indigo-600">{formatHM(staffSummary.reduce((a, u) => a + u.ot_hours, 0))}</td>
                                    <td className="p-4 text-right text-sm text-slate-800">Rs. {formatCurr(staffSummary.reduce((a, u) => a + u.adjusted_basic_salary, 0))}</td>
                                    <td className="p-4 text-right text-sm text-indigo-600">Rs. {formatCurr(staffSummary.reduce((a, u) => a + u.ot_amount, 0))}</td>
                                    <td className="p-4 text-right text-sm text-purple-600">Rs. {formatCurr(staffSummary.reduce((a, u) => a + u.net_adjustments, 0))}</td>
                                    <td className="p-4 text-right text-base text-emerald-800 bg-emerald-100/50">Rs. {formatCurr(totalSalaryPay)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
