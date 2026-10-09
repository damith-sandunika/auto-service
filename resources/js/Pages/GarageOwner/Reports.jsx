import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import ReportFilterBar from './Reports/ReportFilterBar';
import ReportStatCards from './Reports/ReportStatCards';
import ReportTables from './Reports/ReportTables';

const TABS_META = {
    'sales': { title: 'Sales Log', subtitle: 'Detailed breakdown of sales and transactions' },
    'pending': { title: 'Pending Orders', subtitle: 'Active jobs and unpaid invoices' },
    'credit': { title: 'Credit Customers', subtitle: 'Customers with outstanding credit balances' },
    'customers': { title: 'Top Customers', subtitle: 'Most valuable customers by revenue' },
    'expenses': { title: 'Expenses & Salaries', subtitle: 'Track operational costs and payroll' },
    'deleted_orders': { title: 'Deleted Orders', subtitle: 'Log of cancelled or deleted orders' }
};

export default function Reports({ activeTab, branches = [], branchId = '', startDate, endDate, stats, orders, services, expenses, creditOrders, pendingJobs, topCustomers, shiftReports, deletedOrders }) {
    const [activeReport, setActiveReport] = useState(activeTab || 'sales');

    useEffect(() => {
        if (activeTab) {
            setActiveReport(activeTab);
        }
    }, [activeTab]);

    const currentMeta = TABS_META[activeReport] || TABS_META['sales'];

    return (
        <AuthenticatedLayout
            fullWidth={true}
            header={
                <div className="flex justify-between items-center w-full flex-wrap gap-4">
                    <div className="text-left">
                        <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">{currentMeta.title}</h2>
                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{currentMeta.subtitle}</p>
                    </div>
                </div>
            }
            headerActions={
                <div className="flex gap-2 sm:gap-3">
                    <a href={route('owner.reports.export', { start_date: startDate, end_date: endDate, tab: activeReport, branch_id: branchId, format: 'pdf' })} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-colors flex items-center shadow-md shadow-slate-800/20" target="_blank" rel="noreferrer">
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        Export PDF
                    </a>
                    <a href={route('owner.reports.export', { start_date: startDate, end_date: endDate, tab: activeReport, branch_id: branchId, format: 'csv' })} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center shadow-md shadow-emerald-600/20" target="_blank" rel="noreferrer">
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        Export CSV
                    </a>
                </div>
            }
        >
            <Head title={currentMeta.title} />
            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6 space-y-6">
                <ReportFilterBar startDate={startDate} endDate={endDate} activeTab={activeReport} branches={branches} branchId={branchId} />
                {['sales', 'pending', 'credit', 'expenses'].includes(activeReport) && (
                    <ReportStatCards stats={stats} activeTab={activeReport} />
                )}

                <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
                    <ReportTables 
                        activeReport={activeReport} 
                        services={services} 
                        orders={orders} 
                        expenses={expenses} 
                        creditOrders={creditOrders} 
                        pendingJobs={pendingJobs} 
                        topCustomers={topCustomers} 
                        shiftReports={shiftReports} 
                        deletedOrders={deletedOrders}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
