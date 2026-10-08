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
                    <OnboardingCard />
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
