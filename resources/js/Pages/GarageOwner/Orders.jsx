import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function Orders({ invoices, jobs }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [deletingInvoice, setDeletingInvoice] = useState(null);
    const [payingInvoice, setPayingInvoice] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        job_id: '',
        total_amount: '',
        status: 'pending',
    });

    const { data: payData, setData: setPayData, post: postPay, processing: payProcessing, errors: payErrors, reset: resetPay, clearErrors: clearPayErrors } = useForm({
        amount: '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingInvoice(null);
        setIsModalOpen(true);
    };

    const openEditModal = (invoice) => {
        clearErrors();
        setData({
            job_id: invoice.job_id,
            total_amount: invoice.total_amount,
            status: invoice.status,
        });
        setEditingInvoice(invoice);
        setIsModalOpen(true);
    };

    const openDeleteModal = (invoice) => {
        setDeletingInvoice(invoice);
        setIsDeleteModalOpen(true);
    };

    const openPaymentModal = (inv) => {
        setPayingInvoice(inv);
        clearPayErrors();
        
        const totalPaid = inv.payments?.reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;
        const balance = parseFloat(inv.total_amount) - totalPaid;
        
        setPayData({
            amount: balance > 0 ? balance.toString() : '0',
            payment_method: 'cash',
            payment_date: new Date().toISOString().split('T')[0],
        });
        setIsPaymentModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => { reset(); clearErrors(); }, 200);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTimeout(() => setDeletingInvoice(null), 200);
    };

    const closePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setTimeout(() => { resetPay(); setPayingInvoice(null); }, 200);
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (editingInvoice) {
            put(route('owner.orders.update', editingInvoice.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('owner.orders.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = () => {
        destroy(route('owner.orders.destroy', deletingInvoice.id), {
            onSuccess: () => closeDeleteModal(),
        });
    };

    const submitPayment = (e) => {
        e.preventDefault();
        postPay(route('owner.orders.payments.store', payingInvoice.id), {
            onSuccess: () => closePaymentModal(),
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price);
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center w-full">
                <span>Orders & Invoices</span>
                <button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-indigo-500/20">
                    <span className="text-lg leading-none mb-0.5">+</span> New Job Invoice
                </button>
            </div>
        }>
            <Head title="Orders" />

            <div className="max-w-7xl mx-auto space-y-6">

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Invoice ID</th>
                                    <th className="px-6 py-4">Vehicle / Job</th>
                                    <th className="px-6 py-4">Amount & Balance</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices && invoices.length > 0 ? (
                                    invoices.map((inv) => {
                                        const totalPaid = inv.payments?.reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;
                                        const balance = parseFloat(inv.total_amount) - totalPaid;
                                        const isPaid = balance <= 0 || inv.status === 'paid';

                                        return (
                                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-black text-slate-800">INV-{inv.id.toString().padStart(4, '0')}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{inv.job?.vehicle?.license_plate || 'Unknown Vehicle'}</div>
                                                <div className="text-xs text-slate-500 font-medium mt-0.5">Job #{inv.job_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-slate-700">{formatPrice(inv.total_amount)}</div>
                                                {balance > 0 && (
                                                    <div className="text-xs font-bold text-rose-500 mt-0.5">Due: {formatPrice(balance)}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                                                    isPaid ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                }`}>
                                                    {isPaid ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {!isPaid && (
                                                        <button onClick={() => openPaymentModal(inv)} className="text-white hover:bg-emerald-700 transition-colors px-3 py-1.5 bg-emerald-600 rounded-lg font-bold text-xs shadow-sm">
                                                            Pay
                                                        </button>
                                                    )}
                                                    <a href={route('owner.orders.print', inv.id)} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors p-1.5 bg-slate-50 hover:bg-slate-200 rounded-lg border border-slate-200" title="Print Thermal Bill">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                                                    </a>
                                                    <button onClick={() => openEditModal(inv)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                                    </button>
                                                    <button onClick={() => openDeleteModal(inv)} className="text-slate-400 hover:text-red-600 transition-colors p-1.5 bg-slate-50 hover:bg-red-50 rounded-lg border border-slate-200">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                                            No invoices created yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Payment Modal */}
            <Modal show={isPaymentModalOpen} onClose={closePaymentModal} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-2">Record Payment</h2>
                    <p className="text-sm text-slate-500 mb-6 font-medium">Add a payment for INV-{payingInvoice?.id.toString().padStart(4, '0')}</p>
                    <form onSubmit={submitPayment} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="amount" value="Amount (Rs.)" />
                            <TextInput
                                id="amount"
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full bg-slate-50 border-slate-200"
                                value={payData.amount}
                                onChange={(e) => setPayData('amount', e.target.value)}
                                required
                            />
                            <InputError message={payErrors.amount} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment_method" value="Payment Method" />
                            <select
                                id="payment_method"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-md"
                                value={payData.payment_method}
                                onChange={(e) => setPayData('payment_method', e.target.value)}
                            >
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="credit">Credit (To be paid later)</option>
                            </select>
                            <InputError message={payErrors.payment_method} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment_date" value="Date" />
                            <TextInput
                                id="payment_date"
                                type="date"
                                className="mt-1 block w-full bg-slate-50 border-slate-200"
                                value={payData.payment_date}
                                onChange={(e) => setPayData('payment_date', e.target.value)}
                                required
                            />
                            <InputError message={payErrors.payment_date} className="mt-2" />
                        </div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closePaymentModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm">
                                Cancel
                            </button>
                            <button type="submit" disabled={payProcessing} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50">
                                Add Payment
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Add / Edit Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">
                        {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                    </h2>
                    
                    <form onSubmit={submitForm} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="job_id" value="Select Job" />
                            <select
                                id="job_id"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-md"
                                value={data.job_id}
                                onChange={(e) => setData('job_id', e.target.value)}
                            >
                                <option value="">-- Select a Job --</option>
                                {jobs && jobs.map((job) => (
                                    <option key={job.id} value={job.id}>
                                        Job #{job.id} - {job.vehicle?.license_plate || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.job_id} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="total_amount" value="Total Amount (Rs.)" />
                            <TextInput
                                id="total_amount"
                                type="number"
                                min="0"
                                step="0.01"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800"
                                value={data.total_amount}
                                onChange={(e) => setData('total_amount', e.target.value)}
                            />
                            <InputError message={errors.total_amount} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="status" value="Payment Status" />
                            <select
                                id="status"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-md"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </select>
                            <InputError message={errors.status} className="mt-2" />
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm">
                                Cancel
                            </button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm disabled:opacity-50">
                                {processing ? 'Saving...' : 'Save Invoice'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-4 text-red-600">Delete Invoice</h2>
                    <p className="text-sm text-slate-600 mb-6 font-medium">
                        Are you sure you want to delete Invoice INV-{deletingInvoice?.id.toString().padStart(4, '0')}?
                    </p>
                    <div className="flex justify-end gap-3">
                        <button onClick={closeDeleteModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm">Cancel</button>
                        <button onClick={confirmDelete} disabled={processing} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm disabled:opacity-50">Yes, Delete</button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
