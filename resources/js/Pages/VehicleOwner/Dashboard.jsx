import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { WrenchScrewdriverIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function History() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold leading-tight text-white">
                    My Vehicle History
                </h2>
            }
        >
            <Head title="Vehicle History" />

            <div className="py-12 bg-gray-900 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Garage Privacy Banner */}
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 shadow-xl mb-8">
                        <div className="px-6 py-8 sm:p-10 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Suzuki Swift - WP CBF 9090
                                </h3>
                                <p className="text-orange-100">
                                    Complete service history and modifications. Powered by Garage SaaS.
                                </p>
                            </div>
                            <div className="hidden sm:block">
                                <DocumentTextIcon className="w-16 h-16 text-white/50" />
                            </div>
                        </div>
                    </div>

                    <div className="relative border-l border-gray-700 ml-3 md:ml-6 space-y-12 pb-12">
                        {/* Timeline Item 1 */}
                        <div className="relative pl-8 md:pl-0">
                            <div className="md:flex items-center justify-between w-full">
                                <div className="absolute left-[-41px] md:left-1/2 md:-translate-x-1/2 md:translate-y-0 w-8 h-8 rounded-full bg-gray-800 border-4 border-orange-500 flex items-center justify-center z-10 shadow-lg">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                </div>
                                <div className="md:w-[45%] mb-2 md:mb-0 md:text-right md:pr-12">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-orange-400 border border-orange-500/30">August 10, 2026</span>
                                </div>
                                <div className="md:w-[45%] md:pl-12">
                                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                                        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                            <WrenchScrewdriverIcon className="w-5 h-5 text-gray-400" />
                                            10,000 KM Full Service
                                        </h4>
                                        <p className="text-sm text-gray-400 mb-4">
                                            Done at: <span className="text-white font-medium">AutoCare Colombo</span> (Visible to you only)
                                        </p>
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Services & Parts</h5>
                                            <ul className="text-sm text-gray-300 space-y-1">
                                                <li>• Engine Oil Replacement</li>
                                                <li>• Oil Filter Replacement</li>
                                                <li>• Brake Inspection & Cleaning</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Item 2 */}
                        <div className="relative pl-8 md:pl-0">
                            <div className="md:flex items-center justify-between w-full flex-row-reverse">
                                <div className="absolute left-[-41px] md:left-1/2 md:-translate-x-1/2 md:translate-y-0 w-8 h-8 rounded-full bg-gray-800 border-4 border-gray-600 flex items-center justify-center z-10 shadow-lg">
                                </div>
                                <div className="md:w-[45%] mb-2 md:mb-0 md:pl-12">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-gray-400 border border-gray-700">January 15, 2026</span>
                                </div>
                                <div className="md:w-[45%] md:text-right md:pr-12">
                                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg text-left md:text-right">
                                        <h4 className="text-lg font-bold text-white mb-2 md:justify-end flex items-center gap-2">
                                            <WrenchScrewdriverIcon className="w-5 h-5 text-gray-400 md:order-last" />
                                            Battery Replacement
                                        </h4>
                                        <p className="text-sm text-gray-400 mb-4">
                                            Done at: <span className="text-white font-medium">QuickFix Garage</span>
                                        </p>
                                        <div className="bg-gray-900/50 rounded-lg p-4 text-left md:text-right">
                                            <ul className="text-sm text-gray-300 space-y-1">
                                                <li>• Exide 12V Battery</li>
                                                <li>• Terminal Cleaning</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
