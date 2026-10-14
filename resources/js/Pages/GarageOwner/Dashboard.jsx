import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BriefcaseIcon, CheckBadgeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import StatCard from '@/Components/StatCard';
import ShiftOpenCard from './Partials/ShiftOpenCard';
import RecentJobsTable from './Partials/RecentJobsTable';
import RevenueChart from './Partials/RevenueChart';
import ShiftRegisterPanel from './Partials/ShiftRegisterPanel';
import CloseShiftModal from './Partials/CloseShiftModal';
import OnboardingCard from './Partials/OnboardingCard';

export default function Dashboard({ stats, charts, recentJobs, shift, mechanics, garage }) {
    const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);

    const formatPrice = (price) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price);

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
                {!garage ? (
                    <div className="bg-white rounded-3xl p-10 sm:p-14 text-center shadow-sm border border-slate-200/80 max-w-2xl mx-auto my-8 animate-fade-in">
                        <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20 ring-8 ring-blue-50">
                            <BriefcaseIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">You haven't added any branches yet</h3>
                        <p className="text-slate-500 text-sm font-medium mb-8 max-w-md mx-auto leading-relaxed">
                            Your company profile is active! To start managing jobs, POS terminals, inventory, and staff, set up your first workshop or garage branch.
                        </p>
                        <Link 
                            href={route('owner.branches.index')} 
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <span>Click here to add your first branch</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                        </Link>
                    </div>
                ) : !shift.active ? (
                    <ShiftOpenCard mechanics={mechanics} />
                ) : (
                    <div className="space-y-6 mt-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {[
                                { title: 'Active Jobs', value: stats.activeJobs, sub: 'Processing now', color: 'blue', icon: BriefcaseIcon },
                                { title: 'Completed Today', value: stats.completedJobsToday, sub: 'Delivered', color: 'emerald', icon: CheckBadgeIcon },
                                { title: 'Cash on Drawer', value: formatPrice(shift.current_balance || 0), sub: 'Current', color: 'amber', icon: CurrencyDollarIcon },
                                { title: 'Total Revenue', value: formatPrice(stats.todayRevenue), sub: `Cash: ${formatPrice(shift.cash_sales || 0)} | Card: ${formatPrice(shift.card_sales || 0)}`, color: 'violet', icon: CurrencyDollarIcon },
                            ].map((card) => (
                                <StatCard key={card.title} title={card.title} value={card.value} sub={card.sub} color={card.color} icon={card.icon} />
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <RecentJobsTable recentJobs={recentJobs} />
                            <RevenueChart charts={charts} />
                        </div>

                        <ShiftRegisterPanel shift={shift} mechanics={mechanics} />
                    </div>
                )}
            </div>

            <CloseShiftModal show={isCloseShiftModalOpen} onClose={() => setIsCloseShiftModalOpen(false)} shift={shift} />
        </AuthenticatedLayout>
    );
}
