import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function DangerZone() {
    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-red-600 tracking-tight flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Danger Zone
                        </h1>
                        <p className="text-xs md:text-sm font-bold text-red-500 mt-1">Irreversible actions and database wiping</p>
                    </div>
                </div>
            }
        >
            <Head title="Danger Zone" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6">
                <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden mb-6">
                    <div className="p-4 border-b border-red-100 bg-red-50">
                        <h3 className="text-lg font-black text-red-700">Database & Branch Reset</h3>
                    </div>
                    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                            <h4 className="text-base font-bold text-gray-900 mb-1">Remove All Database & Branch</h4>
                            <p className="text-sm text-gray-600">
                                This will permanently remove all your branch data (Inventory, Jobs, Customers, Invoices, Expenses, Users). 
                                <span className="font-bold text-red-600 block mt-1">Note: Vehicle history records are preserved globally, but your branch access and data will be wiped. This action cannot be undone!</span>
                            </p>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                if(confirm('Are you absolutely sure you want to remove all database and branch? This action CANNOT be undone!')) {
                                    router.delete(route('settings.wipe'));
                                }
                            }}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl transition-colors shadow-md shadow-red-500/20 whitespace-nowrap flex-shrink-0"
                        >
                            Remove All Database
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
