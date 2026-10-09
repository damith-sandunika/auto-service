import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ roles }) {
    const deleteRole = (id) => {
        if (confirm('Are you sure you want to delete this role?')) {
            router.delete(route('owner.roles.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Authentication & Roles</h2>
                        <p className="text-xs md:text-sm font-bold text-blue-600 mt-1">Manage user roles and granular permissions</p>
                    </div>
                    <Link
                        href={route('owner.roles.create')}
                        className="px-4 py-2 md:px-5 md:py-2.5 bg-blue-600 text-white rounded-lg md:rounded-xl hover:bg-blue-700 font-bold shadow-sm shadow-blue-500/20 text-xs md:text-sm transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        <span className="hidden md:inline">Create New Role</span>
                        <span className="md:hidden">New</span>
                    </Link>
                </div>
            }
        >
            <Head title="Roles & Permissions" />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-2">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b font-extrabold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Role Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-center">Assigned Users</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {roles.map((role) => (
                                <tr key={role.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-900">{role.name}</td>
                                    <td className="px-6 py-4">
                                        {role.is_system ? (
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-wider">System Default</span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black uppercase tracking-wider">Custom Role</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                                        {role.users_count}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <Link
                                            href={route('owner.roles.edit', role.id)}
                                            className="text-blue-600 hover:text-blue-800 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                        >
                                            Edit Role
                                        </Link>
                                        {!role.is_system && (
                                            <button
                                                onClick={() => deleteRole(role.id)}
                                                className="text-red-500 hover:text-red-700 font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {roles.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-medium">No roles found.</td></tr>
                            )}
                        </tbody>
                    </table>
            </div>
        </AuthenticatedLayout>
    );
}
