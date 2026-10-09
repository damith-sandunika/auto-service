import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Create({ modules }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: {},
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('owner.roles.store'));
    };

    const handlePermissionChange = (module, action, isChecked) => {
        const currentModulePerms = data.permissions[module] || [];
        let newModulePerms;

        if (isChecked) {
            newModulePerms = [...currentModulePerms, action];
        } else {
            newModulePerms = currentModulePerms.filter(p => p !== action);
        }

        setData('permissions', {
            ...data.permissions,
            [module]: newModulePerms
        });
    };

    const moduleNames = {
        pos: 'Point of Sale (POS)',
        invoices: 'Invoices & Billing',
        inventory: 'Inventory & Parts',
        purchases: 'Purchases & POs',
        suppliers: 'Suppliers',
        expenses: 'Expenses',
        reports: 'Reports & Analytics',
        vehicles: 'Vehicle Directory',
        inspections: 'Digital Inspections',
        warranties: 'Warranties',
        hr: 'HR & Payroll',
        roles: 'Authentication & Roles',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Create New Role</h2>
                        <p className="text-xs md:text-sm font-bold text-blue-600 mt-1">Define access levels for your team members</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Role" />

            <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 md:p-8 space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Role Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full md:w-1/2 border-slate-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                                placeholder="e.g., Junior Mechanic, Assistant Manager"
                                required
                            />
                            {errors.name && <div className="text-red-500 text-xs mt-2 font-bold">{errors.name}</div>}
                        </div>

                        <div>
                            <div className="border-b border-slate-100 pb-4 mb-6">
                                <h3 className="text-lg font-black text-slate-800">Module Permissions</h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">Select the actions this role can perform in each section of the app.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-6">
                                {Object.keys(modules).map(module => (
                                    <div key={module} className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 flex flex-col md:flex-row md:items-center gap-4 hover:border-blue-100 hover:bg-blue-50/10 transition-all">
                                        <div className="md:w-1/3">
                                            <div className="font-black text-slate-800 text-sm">
                                                {moduleNames[module] || module}
                                            </div>
                                        </div>
                                        <div className="md:w-2/3 flex flex-wrap gap-4">
                                            {modules[module].map(action => {
                                                const isChecked = data.permissions[module]?.includes(action) || false;
                                                return (
                                                    <label key={`${module}-${action}`} className="flex items-center gap-2.5 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-slate-300 text-blue-600 shadow-sm focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                                            checked={isChecked}
                                                            onChange={(e) => handlePermissionChange(module, action, e.target.checked)}
                                                        />
                                                        <span className={`text-sm font-bold capitalize ${isChecked ? 'text-blue-700' : 'text-slate-600'}`}>{action}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
                        <Link
                            href={route('owner.roles.index')}
                            className="px-6 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-bold shadow-sm transition-all"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {processing && (
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            )}
                            Create Role
                        </button>
                    </div>
                </form>
        </AuthenticatedLayout>
    );
}
