import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import SearchableSelect from '@/Components/SearchableSelect';

export default function OrderPaymentModal({ show, onClose, payingInvoice }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
    });

    // Auto-fill remaining balance when invoice changes
    React.useEffect(() => {
        if (payingInvoice) {
            const totalPaid = payingInvoice.payments?.reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;
            const balance = parseFloat(payingInvoice.total_amount) - totalPaid;
            setData('amount', balance > 0 ? balance.toString() : '0');
        }
    }, [payingInvoice]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('owner.orders.payments.store', payingInvoice.id), {
            onSuccess: () => { reset(); onClose(); }
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                <h2 className="text-lg font-black text-slate-800 mb-2">Record Payment</h2>
                <p className="text-sm text-slate-500 mb-6 font-medium">Add a payment for {payingInvoice?.invoice_number}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="amount" value="Amount (Rs.)" />
                        <TextInput id="amount" type="number" step="0.01" className="mt-1 block w-full bg-slate-50 border-slate-200" value={data.amount} onChange={(e) => setData('amount', e.target.value)} required />
                        <InputError message={errors.amount} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="payment_method" value="Payment Method" />
                        <SearchableSelect className="mt-1" value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)} options={[{ value: 'cash', label: 'Cash' }, { value: 'card', label: 'Card' }, { value: 'credit', label: 'Credit (To be paid later)' }]} isClearable={false} />
                        <InputError message={errors.payment_method} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="payment_date" value="Date" />
                        <TextInput id="payment_date" type="date" className="mt-1 block w-full bg-slate-50 border-slate-200" value={data.payment_date} onChange={(e) => setData('payment_date', e.target.value)} required />
                        <InputError message={errors.payment_date} className="mt-2" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm">Cancel</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50">Add Payment</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
