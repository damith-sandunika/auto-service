import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Billing({ billings, stats, garages }) {
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        garage_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        status: 'approved',
        reference_number: ''
    });

    const openModal = () => {
        clearErrors();
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.billings.store'), {
            onSuccess: () => closeModal()
        });
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center w-full">
                <span>SaaS Billing & Subscriptions</span>
                <button onClick={openModal} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-emerald-500/20">
                    <span className="text-lg leading-none mb-0.5">+</span> Register Payment
                </button>
            </div>
        }>
            <Head title="SaaS Billing" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Monthly Revenue</p>
                            <h4 className="text-2xl font-black text-slate-800">Rs. {stats?.monthly_revenue?.toLocaleString() || '0'}</h4>
                        </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Subscriptions</p>
                            <h4 className="text-2xl font-black text-slate-800">{stats?.active_subscriptions || 0} Branches</h4>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Payments</p>
                            <h4 className="text-2xl font-black text-slate-800">{stats?.pending_payments || 0} Records</h4>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-lg font-black text-slate-800">Recent Branch Payments</h3>
                        <button onClick={openModal} className="text-xs font-extrabold text-blue-600 bg-blue-100 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors uppercase tracking-wider">Register Payment</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Garage Branch</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Billing Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Ref No</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {billings && billings.length > 0 ? billings.map((bill, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-black text-slate-800">#{bill.id}</td>
                                        <td className="px-6 py-4 font-bold text-slate-600">{bill.garage?.name}</td>
                                        <td className="px-6 py-4 font-black text-emerald-600">Rs. {parseFloat(bill.amount).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-medium">{new Date(bill.payment_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                                                bill.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
                                            }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-500 text-xs">
                                            {bill.reference_number || '-'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500 font-medium">
                                            No payment records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Register Manual Payment</h2>
                    
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="garage_id" value="Select Branch" />
                            <SearchableSelect
                                value={data.garage_id}
                                onChange={(e) => setData('garage_id', e.target.value)}
                                options={garages || []}
                                placeholder="-- Choose Branch --"
                            />
                            <InputError message={errors.garage_id} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="amount" value="Amount (Rs.)" />
                            <TextInput
                                id="amount"
                                type="number"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                            />
                            <InputError message={errors.amount} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="payment_date" value="Payment Date" />
                            <TextInput
                                id="payment_date"
                                type="date"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800"
                                value={data.payment_date}
                                onChange={(e) => setData('payment_date', e.target.value)}
                            />
                            <InputError message={errors.payment_date} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="status" value="Status" />
                            <SearchableSelect
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                options={[
                                    { value: 'approved', label: 'Approved' },
                                    { value: 'pending', label: 'Pending' }
                                ]}
                                placeholder="-- Status --"
                            />
                            <InputError message={errors.status} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="reference_number" value="Reference Number (Optional)" />
                            <TextInput
                                id="reference_number"
                                type="text"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800"
                                value={data.reference_number}
                                onChange={(e) => setData('reference_number', e.target.value)}
                            />
                            <InputError message={errors.reference_number} className="mt-2" />
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">Cancel</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50">
                                Save Payment
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
