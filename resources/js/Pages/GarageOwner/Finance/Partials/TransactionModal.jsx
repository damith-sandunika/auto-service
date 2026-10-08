import React from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import SearchableSelect from '@/Components/SearchableSelect';
import { useForm } from '@inertiajs/react';

export default function TransactionModal({ isOpen, onClose, bankAccounts }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        bank_account_id: '',
        type: 'out',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    const submitTrx = (e) => {
        e.preventDefault();
        post(route('owner.finance.transactions.store'), {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-xl font-black text-slate-800 mb-6">Record Transaction</h2>
                <form onSubmit={submitTrx} className="space-y-4">
                    <div>
                        <InputLabel value="Transaction Type" />
                        <div className="flex gap-4 mt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="type" value="in" checked={data.type === 'in'} onChange={(e) => setData('type', e.target.value)} className="text-emerald-600 focus:ring-emerald-500" />
                                <span className="font-bold text-sm text-slate-700">Money In (Income)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="type" value="out" checked={data.type === 'out'} onChange={(e) => setData('type', e.target.value)} className="text-rose-600 focus:ring-rose-500" />
                                <span className="font-bold text-sm text-slate-700">Money Out (Expense)</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <InputLabel htmlFor="bank_account_id" value="Account" />
                        <SearchableSelect 
                            className="mt-1"
                            value={data.bank_account_id}
                            onChange={(e) => setData('bank_account_id', e.target.value)}
                            options={[
                                { value: '', label: 'Cash in Hand (Default)' },
                                ...bankAccounts.map(b => ({ value: b.id, label: `${b.bank_name} - ${b.account_number}` }))
                            ]}
                        />
                        <InputError message={errors.bank_account_id} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="amount" value="Amount (Rs.)" />
                        <TextInput type="number" step="0.01" className="mt-1 block w-full text-lg font-bold" value={data.amount} onChange={(e) => setData('amount', e.target.value)} required />
                        <InputError message={errors.amount} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="description" value="Description / Reference" />
                        <TextInput type="text" className="mt-1 block w-full" value={data.description} onChange={(e) => setData('description', e.target.value)} required />
                        <InputError message={errors.description} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="date" value="Date" />
                        <TextInput type="date" className="mt-1 block w-full" value={data.date} onChange={(e) => setData('date', e.target.value)} required />
                        <InputError message={errors.date} className="mt-2" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors text-sm">Cancel</button>
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm disabled:opacity-50">Save Transaction</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
