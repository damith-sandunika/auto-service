import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import ReportFilterBar from './Reports/ReportFilterBar';
import ReportStatCards from './Reports/ReportStatCards';
import ReportTables from './Reports/ReportTables';

const TABS = [
    { key: 'services', label: 'Service Breakdown' },
    { key: 'sales', label: 'Sales Log' },
    { key: 'expenses', label: 'Expenses / Salaries Log' },
    { key: 'credit', label: 'Credit Customers' },
];

export default function Reports({ startDate, endDate, stats, orders, services, expenses, creditOrders }) {
    const [activeReport, setActiveReport] = useState('services');

    return (
        <AuthenticatedLayout
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">Business Reports</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Analyze sales, revenue, and payroll</p>
                </div>
            }
        >
            <Head title="Reports" />
            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6 space-y-6">
                <ReportFilterBar startDate={startDate} endDate={endDate} />
                <ReportStatCards stats={stats} />

                <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-3 border-b border-gray-100 bg-gray-50/50 overflow-x-auto scrollbar-hide">
                        <div className="flex gap-2 w-max bg-gray-200/50 p-1 rounded-xl">
                            {TABS.map(tab => (
                                <button key={tab.key} onClick={() => setActiveReport(tab.key)}
                                    className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${activeReport === tab.key ? 'bg-white text-blue-700 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ReportTables activeReport={activeReport} services={services} orders={orders} expenses={expenses} creditOrders={creditOrders} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
