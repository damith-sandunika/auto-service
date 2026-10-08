import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BanknotesIcon, BriefcaseIcon, CalendarDaysIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { useState } from 'react';
import SalaryAdvanceModal from './Partials/SalaryAdvanceModal';

export default function ShowProfile({ staff }) {
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

    const pendingAdvancesTotal = staff.salary_advances?.filter(a => a.status === 'pending')?.reduce((sum, a) => sum + Number(a.amount), 0) || 0;
    const basicSalary = staff.staff_profile ? Number(staff.staff_profile.basic_salary) : 0;
    const pendingBalance = Math.max(0, basicSalary - pendingAdvancesTotal);

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Staff Profile: {staff.name}</h2>}>
            <Head title={`${staff.name} - Profile`} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4">
                            <div className="bg-indigo-100 p-4 rounded-full text-indigo-600"><BriefcaseIcon className="h-8 w-8" /></div>
                            <div><p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{staff.role.replace('_', ' ')}</p><p className="text-2xl font-black text-slate-800">{staff.name}</p></div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4">
                            <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><BanknotesIcon className="h-8 w-8" /></div>
                            <div><p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Basic Salary</p><p className="text-2xl font-black text-slate-800">Rs. {staff.staff_profile ? Number(staff.staff_profile.basic_salary).toLocaleString() : '0'}</p></div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-sm flex flex-col justify-center">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Pending Advances</p>
                            <p className="text-3xl font-black text-rose-600">Rs. {pendingAdvancesTotal.toLocaleString()}</p>
                            <p className="text-xs font-medium text-slate-400 mt-1">Will be deducted</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm flex flex-col justify-center">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pending Balance</p>
                            <p className="text-3xl font-black text-emerald-600">Rs. {pendingBalance.toLocaleString()}</p>
                            <p className="text-xs font-medium text-slate-400 mt-1">Remaining to be paid</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Salary Advances */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-lg font-black text-slate-800 flex items-center"><BanknotesIcon className="h-5 w-5 mr-2 text-rose-500" />Salary Advances</h3>
                                <button onClick={() => setIsAdvanceModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">Issue Advance</button>
                            </div>
                            <div className="p-6 flex-1 overflow-auto max-h-[500px]">
                                {staff.salary_advances?.length > 0 ? (
                                    <div className="space-y-4">
                                        {[...staff.salary_advances].reverse().map(advance => (
                                            <div key={advance.id} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div><p className="font-bold text-slate-800">Rs. {Number(advance.amount).toLocaleString()}</p><p className="text-xs text-slate-500 mt-1">{dayjs(advance.date).format('MMM D, YYYY')} - {advance.reason || 'No reason provided'}</p></div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${advance.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{advance.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-400"><BanknotesIcon className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>No salary advances recorded.</p></div>
                                )}
                            </div>
                        </div>

                        {/* Job History */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50"><h3 className="text-lg font-black text-slate-800 flex items-center"><WrenchScrewdriverIcon className="h-5 w-5 mr-2 text-indigo-500" />Job History</h3></div>
                            <div className="p-0 flex-1 overflow-auto max-h-[500px]">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest"><tr><th className="px-6 py-3">Job ID</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Revenue</th></tr></thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {staff.jobs?.length > 0 ? staff.jobs.map(job => (
                                            <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-800"><Link href={route('owner.orders.index')} className="text-blue-600 hover:underline">#JOB-{job.id}</Link></td>
                                                <td className="px-6 py-4">{dayjs(job.created_at).format('MMM D, YYYY')}</td>
                                                <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase">{job.status}</span></td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-700">Rs. {Number(job.total_cost).toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" className="text-center py-12 text-slate-400"><WrenchScrewdriverIcon className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>No jobs assigned or completed yet.</p></td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Attendance History */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-6">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50"><h3 className="text-lg font-black text-slate-800 flex items-center"><CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-500" />Attendance History</h3></div>
                        <div className="p-0 overflow-auto max-h-[400px]">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest"><tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Arrival Time</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">
                                    {staff.attendances?.length > 0 ? [...staff.attendances].reverse().map(att => (
                                        <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-800">{dayjs(att.date).format('MMM D, YYYY')}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${att.status === 'present' ? 'bg-green-100 text-green-700' : att.status === 'absent' ? 'bg-red-100 text-red-700' : att.status === 'leave' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{att.status}</span></td>
                                            <td className="px-6 py-4">{att.arrival_time ? dayjs(att.date + ' ' + att.arrival_time).format('h:mm A') : '-'}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" className="text-center py-12 text-slate-400"><CalendarDaysIcon className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>No attendance records found.</p></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <SalaryAdvanceModal show={isAdvanceModalOpen} onClose={() => setIsAdvanceModalOpen(false)} staffId={staff.id} />
        </AuthenticatedLayout>
    );
}
