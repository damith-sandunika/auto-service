import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import SearchableSelect from '@/Components/SearchableSelect';
import { BanknotesIcon } from '@heroicons/react/24/outline';

export default function SupplierPaymentModal({ show, onClose, supplier }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '', payment_method: 'cash', reference_no: '', payment_date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('owner.suppliers.payments.store', supplier.id), { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><BanknotesIcon className="w-5 h-5 text-emerald-600" />Settle Payment for {supplier.name}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4 text-sm text-blue-800"><strong>Note:</strong> Making a "Cash" payment will automatically create a branch Expense and reduce your active cash drawer shift balance.</div>
                    <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Amount to Pay (Rs.) *</label><input type="number" step="0.01" min="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} required className="w-full text-lg font-bold border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" placeholder="0.00" /><InputError message={errors.amount} className="mt-1" /></div>
                    <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Method</label><SearchableSelect value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} options={[{ value: 'cash', label: 'Cash (Deducts from Drawer)' }, { value: 'cheque', label: 'Cheque' }, { value: 'bank_transfer', label: 'Bank Transfer' }]} /></div>
                    <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Reference No (e.g. Cheque No)</label><input type="text" value={data.reference_no} onChange={e => setData('reference_no', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" /></div>
                    <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Date</label><input type="date" value={data.payment_date} onChange={e => setData('payment_date', e.target.value)} required className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" /></div>
                    {data.payment_method === 'cheque' && (<div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Cheque Due Date *</label><input type="date" value={data.cheque_due_date} onChange={e => setData('cheque_due_date', e.target.value)} required className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" /><InputError message={errors.cheque_due_date} className="mt-1" /></div>)}
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50">Record Payment</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
