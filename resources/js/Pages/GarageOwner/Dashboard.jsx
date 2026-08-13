import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { BriefcaseIcon, UsersIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
    const stats = [
        { name: 'Active Jobs', value: '8', icon: BriefcaseIcon, change: '+2 from yesterday', changeType: 'positive', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', borderColor: 'border-blue-200' },
        { name: 'Today Revenue', value: 'Rs. 45,000', icon: CurrencyDollarIcon, change: '+15% from last week', changeType: 'positive', bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', borderColor: 'border-emerald-200' },
        { name: 'Available Staff', value: '5/7', icon: UsersIcon, change: '2 on leave', changeType: 'negative', bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', borderColor: 'border-indigo-200' },
        { name: 'Avg. Turnaround', value: '3.5 Hrs', icon: ClockIcon, change: '-30m improved', changeType: 'positive', bgColor: 'bg-amber-100', iconColor: 'text-amber-600', borderColor: 'border-amber-200' },
    ];

    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center w-full">
                <span>Dashboard Overview</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-blue-500/20">
                    <span className="text-lg leading-none mb-0.5">+</span> Create New Job
                </button>
            </div>
        }>
            <Head title="Garage Owner Dashboard" />

            <div className="max-w-7xl mx-auto space-y-8">
                

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((item) => (
                        <div key={item.name} className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md group`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bgColor} border ${item.borderColor} group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`h-6 w-6 ${item.iconColor}`} aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">{item.name}</p>
                                    <h3 className="text-2xl font-black text-slate-800">{item.value}</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                {item.changeType === 'positive' ? (
                                    <span className="text-emerald-500 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                                    </span>
                                ) : (
                                    <span className="text-rose-500 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>
                                    </span>
                                )}
                                <span className="text-xs font-bold text-slate-500">{item.change}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Jobs Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                <BriefcaseIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">Recent Active Jobs</h3>
                        </div>
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 shadow-sm">
                            View All Jobs
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Vehicle</th>
                                    <th className="px-6 py-4">Assigned To</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Est. Cost</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[1, 2, 3].map((job, index) => (
                                    <tr key={job} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-black text-xs">
                                                CAB
                                            </div>
                                            <div>
                                                Toyota Prius
                                                <div className="text-xs text-slate-500 font-medium">CAB 123{index}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-600">Nimal Silva</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                                                In Progress
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-slate-700">Rs. 12,500</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">Manage</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
