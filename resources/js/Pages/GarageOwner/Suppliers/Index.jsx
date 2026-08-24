import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { UserGroupIcon, PlusIcon, BanknotesIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function SuppliersIndex({ suppliers }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: ''
    });

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('owner.suppliers.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Suppliers</h2>}>
            <Head title="Suppliers" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Suppliers & Creditors</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Manage your vendors and payable balances.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={route('owner.purchases.index')} className="flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
                            View Purchase Orders
                        </Link>
                        <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5">
                            <PlusIcon className="w-5 h-5" />
                            Add Supplier
                        </button>
                    </div>
                </div>

                {/* Suppliers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map(supplier => (
                        <div key={supplier.id} className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                            {/* Decorative Accent */}
                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-10 transition-transform group-hover:scale-110 ${supplier.balance_due > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 leading-tight">{supplier.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-bold flex items-center gap-1">
                                        <UserGroupIcon className="w-3 h-3" />
                                        {supplier.contact_person || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                {supplier.phone && (
                                    <div className="text-sm font-semibold text-slate-600">📞 {supplier.phone}</div>
                                )}
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payable Balance</span>
                                    <span className={`text-lg font-black ${supplier.balance_due > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        Rs. {Number(supplier.balance_due).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                <Link 
                                    href={route('owner.suppliers.show', supplier.id)}
                                    className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    View Ledger & Pay &rarr;
                                </Link>
                                <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                    {supplier.purchase_orders_count} Orders
                                </span>
                            </div>
                        </div>
                    ))}

                    {suppliers.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white border border-slate-100 rounded-3xl border-dashed">
                            <UserGroupIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">No Suppliers Yet</h3>
                            <p className="text-sm text-slate-500 mt-1">Add your first supplier to start tracking purchases and payables.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                        <PlusIcon className="w-5 h-5 text-blue-600" />
                        Add New Supplier
                    </h2>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Company/Supplier Name *</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" placeholder="E.g., Auto Parts Dist." />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Person</label>
                            <input type="text" value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" placeholder="E.g., John Doe" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
                            <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Address</label>
                            <textarea value={data.address} onChange={e => setData('address', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" rows="2"></textarea>
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                            <button type="submit" disabled={processing} className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50">Save Supplier</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
