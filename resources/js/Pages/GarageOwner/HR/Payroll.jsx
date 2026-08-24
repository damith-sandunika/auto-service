import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function PayrollIndex({ staff, selectedMonth }) {
    const { post, processing } = useForm({});

    const handleProcessPayroll = (mechanic) => {
        if (!confirm(`Are you sure you want to process payroll for ${mechanic.name}? This will mark it as paid and log an expense.`)) {
            return;
        }

        const calc = mechanic.calculated;
        const form = useForm({
            user_id: mechanic.id,
            month: calc.month,
            basic_pay: calc.basic_pay,
            ot_pay: calc.ot_pay,
            commission_pay: calc.commission_pay,
            deductions: calc.deductions,
            net_pay: calc.net_pay,
        });

        form.post(route('owner.payroll.store'));
    };

    const handleMonthChange = (e) => {
        window.location.href = route('owner.payroll.index', { month: e.target.value });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Payroll Processing</h2>}
        >
            <Head title="Payroll" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center">
                            <Link href={route('owner.hr.index')} className="text-slate-500 hover:text-slate-700 mr-4">
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Link>
                            <h3 className="text-lg font-bold text-slate-700">Process Salary for:</h3>
                            <input 
                                type="month" 
                                value={selectedMonth} 
                                onChange={handleMonthChange}
                                className="ml-3 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {staff.map(mechanic => (
                            <div key={mechanic.id} className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-shadow">
                                <div className="mb-4 md:mb-0">
                                    <h4 className="font-bold text-slate-800 text-lg">{mechanic.name}</h4>
                                    <p className="text-sm text-slate-500 capitalize">{mechanic.role.replace('_', ' ')}</p>
                                </div>
                                
                                {mechanic.is_processed ? (
                                    <div className="flex items-center space-x-8">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Net Paid</p>
                                            <p className="font-bold text-lg text-green-600">Rs. {Number(mechanic.payroll.net_pay).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full flex items-center text-sm font-medium">
                                            <CheckCircleIcon className="h-5 w-5 mr-1" />
                                            Processed
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
                                        <div className="flex space-x-6">
                                            <div className="text-center">
                                                <p className="text-xs text-slate-500">Basic</p>
                                                <p className="font-medium text-slate-700">Rs. {Number(mechanic.calculated.basic_pay).toLocaleString()}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-slate-500">OT ({mechanic.calculated.ot_hours}h)</p>
                                                <p className="font-medium text-slate-700">+ Rs. {Number(mechanic.calculated.ot_pay).toLocaleString()}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-slate-500">Commission</p>
                                                <p className="font-medium text-slate-700">+ Rs. {Number(mechanic.calculated.commission_pay).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="text-right border-l pl-8 border-slate-200">
                                            <p className="text-xs text-slate-500">Net Pay</p>
                                            <p className="font-bold text-xl text-blue-600">Rs. {Number(mechanic.calculated.net_pay).toLocaleString()}</p>
                                        </div>

                                        <button 
                                            onClick={() => handleProcessPayroll(mechanic)}
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                                        >
                                            Pay & Log Expense
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {staff.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                No staff members found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
