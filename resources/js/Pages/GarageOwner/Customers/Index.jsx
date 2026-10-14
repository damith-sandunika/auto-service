import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

export default function Index({ customers, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const customerList = customers?.data || (Array.isArray(customers) ? customers : []);
    const totalCount = customers?.total ?? customerList.length;

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('owner.customers.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        router.get(route('owner.customers.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div>
                    <h2 className="font-black text-xl text-slate-800 leading-tight">Customers CRM</h2>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        Total: <span className="text-indigo-600 font-black">{totalCount}</span> Registered Customers
                        {customers?.current_page && (
                            <span className="ml-2 text-slate-400">
                                • Page {customers.current_page} of {customers.last_page} (15 per page)
                            </span>
                        )}
                    </p>
                </div>
            </div>
        }>
            <Head title="Customers" />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:max-w-md">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search customer name, email, phone..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap">
                            Search
                        </button>
                        {filters?.search && (
                            <button type="button" onClick={handleClearSearch} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors whitespace-nowrap">
                                Clear
                            </button>
                        )}
                    </form>
                    <div className="text-xs font-bold text-slate-500">
                        Showing {customerList.length} of {totalCount} results
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">Customer Name</th>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">Email</th>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">Vehicles Owned</th>
                                    <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase text-xs">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customerList && customerList.length > 0 ? customerList.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{c.name}</td>
                                        <td className="px-6 py-4 font-medium">{c.email}</td>
                                        <td className="px-6 py-4 font-black text-indigo-600">{c.vehicles_count ?? 0}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={route('owner.customers.show', c.id)} className="text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors text-xs">
                                                View History
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500 font-medium">No customers found matching your search.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {customers?.links && (
                        <div className="p-4 border-t border-slate-100">
                            <Pagination paginator={customers} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
