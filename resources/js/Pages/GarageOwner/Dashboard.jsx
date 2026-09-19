import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { BriefcaseIcon, CheckBadgeIcon, CurrencyDollarIcon, BuildingStorefrontIcon, ArrowRightIcon, UsersIcon } from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import { useState } from 'react';
import StatCard from '@/Components/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard({ stats, charts, recentJobs, shift, mechanics }) {
    
    const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
    const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);

    const openShiftForm = useForm({
        opening_cash: '',
        attendance: mechanics ? mechanics.map(m => ({ user_id: m.id, name: m.name, status: 'present' })) : []
    });

    const submitOpenShift = (e) => {
        e.preventDefault();
        openShiftForm.post(route('owner.dashboard.open-shift'), {
            onSuccess: () => {
                setIsOpenShiftModalOpen(false);
                openShiftForm.reset();
            }
        });
    };

    const closeShiftForm = useForm({});

    const submitCloseShift = (e) => {
        e.preventDefault();
        closeShiftForm.post(route('owner.dashboard.close-shift'), {
            onSuccess: () => setIsCloseShiftModalOpen(false)
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price);
    };

    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">Dashboard</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Today's updates and key metrics</p>
                </div>
            }
            headerActions={
                shift.active && (
                    <div className="w-full sm:w-auto flex justify-end gap-3">
                        <div className="hidden sm:flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg shadow-sm whitespace-nowrap">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-green-700 tracking-wider uppercase">Shift Active</span>
                        </div>
                        <Link href={route('owner.pos.index')} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-lg shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-all whitespace-nowrap">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
                            New Job / POS
                        </Link>
                        <button onClick={() => setIsCloseShiftModalOpen(true)} className="flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 text-xs font-black rounded-lg hover:bg-slate-200 transition-colors shadow-sm whitespace-nowrap">
                            Close Shift
                        </button>
                    </div>
                )
            }
        >
            <Head title="Garage Owner Dashboard" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6">
                
                {!shift.active ? (
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
                                                                <select
                                                                    className="text-xs rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1"
                                                                    value={att.status}
                                                                    onChange={(e) => {
                                                                        const newAttendance = [...openShiftForm.data.attendance];
                                                                        newAttendance[index].status = e.target.value;
                                                                        openShiftForm.setData('attendance', newAttendance);
                                                                    }}
                                                                >
                                                                    <option value="present">Present</option>
                                                                    <option value="half_day">Half Day</option>
                                                                    <option value="absent">Absent</option>
                                                                    <option value="casual_leave">Casual Leave</option>
                                                                    <option value="medical_leave">Medical Leave</option>
                                                                    <option value="vacation_leave">Vacation Leave</option>
                                                                </select>
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
                ) : (
                    <div className="space-y-6 mt-6">
                        {/* STAT CARDS */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {[
                                { title: 'Active Jobs', value: stats.activeJobs, sub: 'Processing now', color: 'blue', icon: BriefcaseIcon },
                                { title: 'Completed Today', value: stats.completedJobsToday, sub: 'Delivered', color: 'emerald', icon: CheckBadgeIcon },
                                { title: 'Cash on Drawer', value: formatPrice(shift.current_balance || 0), sub: 'Current', color: 'amber', icon: CurrencyDollarIcon },
                                { title: 'Total Revenue', value: formatPrice(stats.todayRevenue), sub: `Cash: ${formatPrice(shift.cash_sales || 0)} | Card: ${formatPrice(shift.card_sales || 0)}`, color: 'violet', icon: CurrencyDollarIcon },
                            ].map((card, index) => (
                                <StatCard
                                    key={card.title}
                                    title={card.title}
                                    value={card.value}
                                    sub={card.sub}
                                    color={card.color}
                                    icon={card.icon}
                                />
                            ))}
                        </div>

                        {/* MAIN GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Recent Orders Table */}
                            <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden animate-slide-up flex flex-col">
                                <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 tracking-tight">Recent Jobs</h3>
                                        <p className="text-[12px] font-semibold text-slate-500">Currently processing</p>
                                    </div>
                                    <Link href={route('owner.orders.index')} className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors">
                                        View All
                                        <ArrowRightIcon className="w-3 h-3" />
                                    </Link>
                                </div>
                                <div className="overflow-x-auto flex-1 p-0">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Job</th>
                                                <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Customer / Vehicle</th>
                                                <th className="px-4 py-3.5 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50/50">
                                            {recentJobs.map((job) => {
                                                return (
                                                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="text-[13px] font-black text-slate-800">JOB-{job.id}</div>
                                                            <div className="text-[10px] font-bold text-slate-500 mt-0.5">{job.mechanic}</div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="text-[13px] font-bold text-slate-700">{job.customer}</div>
                                                            <div className="text-[11px] font-semibold text-slate-500 mt-0.5 bg-slate-100 inline-block px-1.5 rounded">{job.vehicle_number}</div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                                            <Link href={route('owner.orders.index')} className="inline-block px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 rounded-lg text-[11px] font-bold transition-all">
                                                                View
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {recentJobs.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-10 text-center text-[13px] font-semibold text-slate-400">No active jobs</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-sm p-6 flex flex-col animate-slide-up">
                                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 tracking-tight">Revenue Performance</h3>
                                        <p className="text-[12px] font-semibold text-slate-500">7-Day Trend</p>
                                    </div>
                                </div>
                                <div className="relative flex-1 min-h-[260px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={charts?.revenue || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `Rs.${value/1000}k`} />
                                            <RechartsTooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value) => [formatPrice(value), 'Revenue']}
                                            />
                                            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>

                        {/* Shift Register */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                                                <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100">
                                                                    Off Shift
                                                                </span>
                                                            ) : isPresent ? (
                                                                <Link href={route('owner.dashboard.staff-out', mechanic.id)} method="post" as="button" preserveScroll className="inline-block px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-[11px] font-bold transition-all">
                                                                    Mark Off
                                                                </Link>
                                                            ) : (
                                                                <Link href={route('owner.dashboard.staff-in', mechanic.id)} method="post" as="button" preserveScroll className="inline-block px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-[11px] font-bold transition-all">
                                                                    Mark In
                                                                </Link>
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

                    </div>
                )}
                
            </div>

            {/* Close Shift Modal */}
            <Modal show={isCloseShiftModalOpen} onClose={() => setIsCloseShiftModalOpen(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-2xl font-black text-slate-800 mb-2">End of Shift Report</h2>
                    <p className="text-sm text-slate-500 mb-6">Review the cash drawer summary before closing the shift.</p>
                    
                    <div className="space-y-1 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm">
                        <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="font-bold text-slate-600">Opening Balance:</span>
                            <span className="font-bold text-slate-800">Rs. {(shift?.opening_cash || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="font-bold text-slate-600">Cash Sales Collected:</span>
                            <span className="font-bold text-emerald-600">+ Rs. {(shift?.cash_sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="font-bold text-slate-600">Expenses Logged:</span>
                            <span className="font-bold text-rose-500">- Rs. {(shift?.expenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between py-3 mt-1 border-t border-slate-300">
                            <span className="font-black text-indigo-900 text-base">Expected Cash Drawer:</span>
                            <span className="font-black text-indigo-600 text-lg">Rs. {(shift?.current_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-sm flex justify-between">
                        <span className="font-bold text-blue-800">Card Sales (Bank):</span>
                        <span className="font-bold text-blue-600">Rs. {(shift?.card_sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <form onSubmit={submitCloseShift} className="flex gap-3">
                        <button type="button" onClick={() => setIsCloseShiftModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                            Keep Open
                        </button>
                        <button type="submit" disabled={closeShiftForm.processing} className="flex-[2] py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black transition-colors disabled:opacity-50">
                            Confirm & Close Shift
                        </button>
                    </form>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
