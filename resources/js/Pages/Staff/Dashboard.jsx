import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { WrenchIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold leading-tight text-white">
                    Mechanic Dashboard
                </h2>
            }
        >
            <Head title="Staff Dashboard" />

            <div className="py-12 bg-gray-900 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Banner */}
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 shadow-xl sm:rounded-3xl mb-8">
                        <div className="px-6 py-10 sm:p-14">
                            <h3 className="text-3xl font-extrabold text-white">
                                My Workspace
                            </h3>
                            <p className="mt-4 text-lg text-teal-100">
                                View your assigned jobs, add service items, and update repair statuses.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Assigned Jobs List */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-xl font-bold text-white">Current Assignments</h3>
                            
                            {/* Job Card */}
                            <div className="rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-lg hover:border-teal-500 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 uppercase tracking-wider">In Progress</span>
                                            <span className="text-gray-400 text-sm"><ClockIcon className="w-4 h-4 inline mr-1" />Started 2h ago</span>
                                        </div>
                                        <h4 className="text-2xl font-bold text-white mb-1">Honda Civic - WP CAX 4567</h4>
                                        <p className="text-gray-400">Full Service & Brake Pad Replacement</p>
                                    </div>
                                    <button className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        <WrenchIcon className="w-4 h-4" />
                                        Update Job
                                    </button>
                                </div>
                                
                                <div className="mt-6 pt-6 border-t border-gray-700">
                                    <h5 className="text-sm font-medium text-gray-300 mb-3">Items Added:</h5>
                                    <ul className="space-y-2 text-sm text-gray-400">
                                        <li className="flex justify-between"><span>Mobil 1 Engine Oil (4L)</span> <span>x1</span></li>
                                        <li className="flex justify-between"><span>Oil Filter (Genuine)</span> <span>x1</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats & Actions */}
                        <div className="space-y-6">
                            <div className="rounded-2xl bg-gray-800 border border-gray-700 p-6">
                                <h3 className="text-lg font-medium text-white mb-4">Today's Progress</h3>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-gray-400">Completed Jobs</span>
                                    <span className="text-2xl font-bold text-teal-400">2</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Pending Jobs</span>
                                    <span className="text-2xl font-bold text-yellow-400">1</span>
                                </div>
                            </div>
                            
                            <button className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-xl font-medium transition-colors">
                                <CheckCircleIcon className="w-6 h-6 text-teal-400" />
                                Mark Day as Complete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
