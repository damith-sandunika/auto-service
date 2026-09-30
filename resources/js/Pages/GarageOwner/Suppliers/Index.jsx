import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { DocumentTextIcon, PlusIcon, TrashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import Badge from '@/Components/Badge';

export default function SuppliersIndex({ suppliers }) {
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

    const supplierForm = useForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: ''
    });

    const submitSupplier = (e) => {
        e.preventDefault();
        supplierForm.post(route('owner.suppliers.store'), {
            onSuccess: () => {
                setIsSupplierModalOpen(false);
                supplierForm.reset();
            }
        });
    };

    return (
        <AuthenticatedLayout
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black tracking-tight">Suppliers Directory</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Manage your vendors and monitor outstanding balances.</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <button onClick={() => setIsSupplierModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5">
                        <PlusIcon className="w-5 h-5" />
                        Add New Supplier
                    </button>
                </div>
            }
        >
            <Head title="Suppliers Directory" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6">
                <div className="animate-fade-in-up">

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <DataTable
                                columns={[
                                    { label: 'Name' },
                                    { label: 'Contact Person' },
                                    { label: 'Phone' },
                                    { label: 'Balance Due', align: 'right' },
                                    { label: 'Total Orders', align: 'center' },
                                    { label: '', align: 'right' }, // Action
                                ]}
                                isEmpty={!suppliers.data || suppliers.data.length === 0}
                                emptyMessage="No suppliers found."
                            >
                                {suppliers.data?.map(supplier => (
                                    <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-black text-slate-800">{supplier.name}</td>
                                        <td className="p-4 text-sm font-semibold text-slate-600">{supplier.contact_person || '-'}</td>
                                        <td className="p-4 text-sm font-mono text-slate-500">{supplier.phone || '-'}</td>
                                        <td className="p-4 text-right">
                                            <div className={`font-black ${supplier.balance_due > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                                                Rs. {Number(supplier.balance_due).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-sm font-bold text-slate-600">
                                            {supplier.purchase_orders_count || 0}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link href={route('owner.suppliers.show', supplier.id)} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                                View <ArrowRightIcon className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </DataTable>
                            {suppliers.links && <Pagination links={suppliers.links} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Supplier Modal */}
            <Modal show={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight mb-6">Add New Supplier</h2>
                    <form onSubmit={submitSupplier} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Company Name</label>
                            <input type="text" className="w-full border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500" value={supplierForm.data.name} onChange={e => supplierForm.setData('name', e.target.value)} required />
                            <InputError message={supplierForm.errors.name} className="mt-2" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Contact Person</label>
                            <input type="text" className="w-full border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500" value={supplierForm.data.contact_person} onChange={e => supplierForm.setData('contact_person', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Phone</label>
                            <input type="text" className="w-full border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500" value={supplierForm.data.phone} onChange={e => supplierForm.setData('phone', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Email</label>
                            <input type="email" className="w-full border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500" value={supplierForm.data.email} onChange={e => supplierForm.setData('email', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Address</label>
                            <textarea className="w-full border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500" rows="2" value={supplierForm.data.address} onChange={e => supplierForm.setData('address', e.target.value)}></textarea>
                        </div>
                        
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors text-sm">Cancel</button>
                            <button type="submit" disabled={supplierForm.processing} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm disabled:opacity-50">Save Supplier</button>
                        </div>
                    </form>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
