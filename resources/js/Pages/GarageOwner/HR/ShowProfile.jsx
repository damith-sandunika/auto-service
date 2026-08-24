import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, BanknotesIcon, BriefcaseIcon, CalendarDaysIcon, DocumentTextIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import Modal from '@/Components/Modal';
import { useState } from 'react';
import InputError from '@/Components/InputError';

export default function ShowProfile({ staff }) {
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

    const advanceForm = useForm({
        amount: '',
        date: dayjs().format('YYYY-MM-DD'),
        reason: ''
    });

    const handleAdvanceSubmit = (e) => {
        e.preventDefault();
        advanceForm.post(route('owner.hr.advance.store', staff.id), {
            onSuccess: () => {
                setIsAdvanceModalOpen(false);
                advanceForm.reset();
            }
        });
    };

    const pendingAdvancesTotal = staff.salary_advances
        ?.filter(a => a.status === 'pending')
        ?.reduce((sum, a) => sum + Number(a.amount), 0) || 0;

    const basicSalary = staff.staff_profile ? Number(staff.staff_profile.basic_salary) : 0;
    const pendingBalance = Math.max(0, basicSalary - pendingAdvancesTotal);

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Staff Profile: {staff.name}</h2>}
        >
            <Head title={`${staff.name} - Profile`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4">
                            <div className="bg-indigo-100 p-4 rounded-full text-indigo-600">
                                <BriefcaseIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{staff.role.replace('_', ' ')}</p>
                                <p className="text-2xl font-black text-slate-800">{staff.name}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4">
                            <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
                                <BanknotesIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Basic Salary</p>
                                <p className="text-2xl font-black text-slate-800">
                                    Rs. {staff.staff_profile ? Number(staff.staff_profile.basic_salary).toLocaleString() : '0'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-sm flex flex-col justify-center">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Pending Advances</p>
                            <p className="text-3xl font-black text-rose-600">
                                Rs. {pendingAdvancesTotal.toLocaleString()}
                            </p>
                            <p className="text-xs font-medium text-slate-400 mt-1">Will be deducted</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm flex flex-col justify-center">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pending Balance</p>
                            <p className="text-3xl font-black text-emerald-600">
                                Rs. {pendingBalance.toLocaleString()}
                            </p>
                            <p className="text-xs font-medium text-slate-400 mt-1">Remaining to be paid</p>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Salary Advances Column */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-lg font-black text-slate-800 flex items-center">
                                    <BanknotesIcon className="h-5 w-5 mr-2 text-rose-500" />
                                    Salary Advances
                                </h3>
                                <button 
                                    onClick={() => setIsAdvanceModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                                >
                                    Issue Advance
                                </button>
                            </div>
                            <div className="p-6 flex-1 overflow-auto max-h-[500px]">
                                {staff.salary_advances && staff.salary_advances.length > 0 ? (
                                    <div className="space-y-4">
                                        {[...staff.salary_advances].reverse().map(advance => (
                                            <div key={advance.id} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div>
                                                    <p className="font-bold text-slate-800">Rs. {Number(advance.amount).toLocaleString()}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{dayjs(advance.date).format('MMM D, YYYY')} - {advance.reason || 'No reason provided'}</p>
                                                </div>
                                                <div>
                                                    {advance.status === 'pending' ? (
                                                        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Pending</span>
                                                    ) : (
                                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Settled</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        <BanknotesIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p>No salary advances recorded.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Job History Column */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-lg font-black text-slate-800 flex items-center">
                                    <WrenchScrewdriverIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                    Job History
                                </h3>
                            </div>
                            <div className="p-0 flex-1 overflow-auto max-h-[500px]">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-3">Job ID</th>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {staff.jobs && staff.jobs.length > 0 ? (
                                            staff.jobs.map(job => (
                                                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-800">
                                                        <Link href={route('owner.orders.index')} className="text-blue-600 hover:underline">
                                                            #JOB-{job.id}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4">{dayjs(job.created_at).format('MMM D, YYYY')}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase">{job.status}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                                                        Rs. {Number(job.total_cost).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-12 text-slate-400">
                                                    <WrenchScrewdriverIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                    <p>No jobs assigned or completed yet.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* Attendance History */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-6">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-black text-slate-800 flex items-center">
                                <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-500" />
                                Attendance History
                            </h3>
                        </div>
                        <div className="p-0 overflow-auto max-h-[400px]">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Arrival Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {staff.attendances && staff.attendances.length > 0 ? (
                                        [...staff.attendances].reverse().map(attendance => (
                                            <tr key={attendance.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-800">
                                                    {dayjs(attendance.date).format('MMM D, YYYY')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                        attendance.status === 'present' ? 'bg-green-100 text-green-700' :
                                                        attendance.status === 'absent' ? 'bg-red-100 text-red-700' :
                                                        attendance.status === 'leave' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {attendance.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {attendance.arrival_time ? dayjs(attendance.date + ' ' + attendance.arrival_time).format('h:mm A') : '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-12 text-slate-400">
                                                <CalendarDaysIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                <p>No attendance records found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* Advance Salary Modal */}
            <Modal show={isAdvanceModalOpen} onClose={() => setIsAdvanceModalOpen(false)}>
                <form onSubmit={handleAdvanceSubmit} className="p-6">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center">
                        <BanknotesIcon className="h-6 w-6 mr-2 text-rose-500" />
                        Issue Salary Advance
                    </h2>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Amount (Rs.)</label>
                            <input
                                type="number"
                                value={advanceForm.data.amount}
                                onChange={e => advanceForm.setData('amount', e.target.value)}
                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                                min="1"
                                required
                                placeholder="Enter amount..."
                            />
                            <InputError message={advanceForm.errors.amount} className="mt-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={advanceForm.data.date}
                                onChange={e => advanceForm.setData('date', e.target.value)}
                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                                required
                            />
                            <InputError message={advanceForm.errors.date} className="mt-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Reason (Optional)</label>
                            <input
                                type="text"
                                value={advanceForm.data.reason}
                                onChange={e => advanceForm.setData('reason', e.target.value)}
                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                                placeholder="e.g. Medical emergency"
                            />
                            <InputError message={advanceForm.errors.reason} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button type="button" onClick={() => setIsAdvanceModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={advanceForm.processing} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-colors disabled:opacity-50 shadow-sm">
                            Save Advance
                        </button>
                    </div>
                </form>
            </Modal>

        </AuthenticatedLayout>
    );
}
