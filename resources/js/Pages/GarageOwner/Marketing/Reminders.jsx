import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { BellIcon, CheckCircleIcon, PhoneIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function RemindersIndex({ reminders }) {
    const { put, processing } = useForm({});

    const handleStatusChange = (reminder, status) => {
        put(route('owner.reminders.update', reminder.id), {
            data: { status: status },
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">Pending</span>;
            case 'notified': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">Notified</span>;
            case 'completed': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Completed</span>;
            default: return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-medium">{status}</span>;
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Marketing & Reminders</h2>}
        >
            <Head title="Service Reminders" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-slate-700 flex items-center">
                                <BellIcon className="h-6 w-6 mr-2 text-blue-600" />
                                Upcoming & Overdue Service Reminders
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">Automatically generated after checkout. Call these customers to increase repeat business.</p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer / Vehicle</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Service Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {reminders.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                                No service reminders found. Complete a POS checkout to auto-generate reminders.
                                            </td>
                                        </tr>
                                    ) : (
                                        reminders.map((reminder) => {
                                            const isOverdue = dayjs(reminder.due_date).isBefore(dayjs());
                                            
                                            return (
                                                <tr key={reminder.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-slate-900">{reminder.vehicle?.owner?.name || 'Unknown'}</div>
                                                        <div className="text-sm text-slate-500 mt-1">{reminder.vehicle?.vehicle_number} - {reminder.vehicle?.make} {reminder.vehicle?.model}</div>
                                                        {reminder.vehicle?.owner?.email && (
                                                            <div className="text-xs text-blue-600 mt-1 flex items-center">
                                                                <PhoneIcon className="h-3 w-3 mr-1" />
                                                                {reminder.vehicle.owner.email /* Assuming email field holds contact for now or similar */}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-slate-900 font-medium">{reminder.service_type}</div>
                                                        <div className="text-xs text-slate-500 mt-1">{reminder.notes}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className={`text-sm font-bold ${isOverdue && reminder.status === 'pending' ? 'text-red-600' : 'text-slate-900'}`}>
                                                            {dayjs(reminder.due_date).format('MMM D, YYYY')}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {dayjs(reminder.due_date).fromNow()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(reminder.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {reminder.status === 'pending' && (
                                                            <button 
                                                                onClick={() => handleStatusChange(reminder, 'notified')}
                                                                disabled={processing}
                                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-lg mr-2"
                                                            >
                                                                Mark Notified
                                                            </button>
                                                        )}
                                                        {reminder.status !== 'completed' && (
                                                            <button 
                                                                onClick={() => handleStatusChange(reminder, 'completed')}
                                                                disabled={processing}
                                                                className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-lg"
                                                            >
                                                                <CheckCircleIcon className="h-5 w-5 inline mr-1" />
                                                                Done
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
