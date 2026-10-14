import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { BellIcon, CheckCircleIcon, PhoneIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Pagination from '@/Components/Pagination';

dayjs.extend(relativeTime);

export default function RemindersIndex({ reminders, filters = {} }) {
    const { put, processing } = useForm({});

    const reminderList = reminders?.data || (Array.isArray(reminders) ? reminders : []);
    const totalCount = reminders?.total ?? reminderList.length;

    const handleFilterStatus = (status) => {
        router.get(route('owner.reminders.index'), { status }, { preserveState: true, replace: true });
    };

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
            fullWidth={true}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                    <div>
                        <h2 className="text-xl font-black text-black">Service Reminders</h2>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            Total: <span className="text-indigo-600 font-black">{totalCount}</span> Reminders
                            {reminders?.current_page && (
                                <span className="ml-2 text-slate-400">
                                    • Page {reminders.current_page} of {reminders.last_page} (15 per page)
                                </span>
                            )}
                        </p>
                    </div>
                    {/* Status Tabs */}
                    <div className="flex items-center gap-2">
                        {['', 'pending', 'notified', 'completed'].map((st) => (
                            <button
                                key={st}
                                onClick={() => handleFilterStatus(st)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                    (filters?.status || '') === st
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                {st === '' ? 'All' : st.charAt(0).toUpperCase() + st.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            }
        >
            <Head title="Service Reminders" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6">

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
                                    {reminderList.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                                No service reminders found matching criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        reminderList.map((reminder) => {
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
                        {reminders?.links && (
                            <div className="p-4 border-t border-slate-100">
                                <Pagination paginator={reminders} />
                            </div>
                        )}
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
