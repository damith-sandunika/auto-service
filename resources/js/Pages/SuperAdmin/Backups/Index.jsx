import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import SearchableSelect from '@/Components/SearchableSelect';

export default function BackupsIndex({ backups, garages }) {
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        type: 'full',
        garage_id: ''
    });

    const openModal = () => {
        clearErrors();
        reset();
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.backups.store'), {
            onSuccess: () => setIsModalOpen(false)
        });
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center w-full">
                <span>System Backups (MySQL & JSON Dumps)</span>
                <button 
                    onClick={openModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-blue-500/20"
                >
                    <span className="text-lg leading-none mb-0.5">+</span> Create Backup
                </button>
            </div>
        }>
            <Head title="System Backups" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">File Name</th>
                                    <th className="px-6 py-4">Size</th>
                                    <th className="px-6 py-4">Created At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {backups && backups.length > 0 ? backups.map((backup, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-black text-slate-800">
                                            {backup.name}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-600">
                                            {backup.size}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-500">
                                            {backup.created_at}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a href={route('admin.backups.download', backup.name)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">
                                                Download
                                            </a>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500 font-medium">
                                            No backups found. Generate one now!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Backup Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Create New Backup</h2>
                    
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="type" value="Backup Type" />
                            <SearchableSelect
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                options={[
                                    { value: 'full', label: 'Full Database (MySQL Dump)' },
                                    { value: 'branch', label: 'Branch Specific (JSON Export)' }
                                ]}
                                placeholder="-- Backup Type --"
                            />
                            <InputError message={errors.type} className="mt-2" />
                        </div>

                        {data.type === 'branch' && (
                            <div className="animate-fade-in">
                                <InputLabel htmlFor="garage_id" value="Select Branch" />
                                <SearchableSelect
                                    value={data.garage_id}
                                    onChange={(e) => setData('garage_id', e.target.value)}
                                    options={garages || []}
                                    placeholder="-- Choose Branch --"
                                />
                                <InputError message={errors.garage_id} className="mt-2" />
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">Cancel</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50">
                                {processing ? 'Generating...' : 'Start Backup'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
