import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Payroll({ mechanics }) {
    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mechanic Payroll & Commissions</h2>}>
            <Head title="Payroll" />
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase">Mechanic Name</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase">Comm. %</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase">Jobs Handled</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-right">Total Commission Earned</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {mechanics && mechanics.length > 0 ? mechanics.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800">{m.name}</td>
                                    <td className="px-6 py-4 font-medium text-slate-600">{m.commission_percentage || 0}%</td>
                                    <td className="px-6 py-4">{m.jobs_completed}</td>
                                    <td className="px-6 py-4 text-right font-black text-emerald-600">
                                        Rs. {parseFloat(m.total_commission_earned).toFixed(2)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500 font-medium">No mechanics found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
