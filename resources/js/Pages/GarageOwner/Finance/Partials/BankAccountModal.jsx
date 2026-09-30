import React from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

export default function BankAccountModal({ isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        bank_name: '',
        account_name: '',
        account_number: '',
        branch: '',
        initial_balance: 0,
    });

    const submitBank = (e) => {
        e.preventDefault();
        post(route('owner.finance.bank-accounts.store'), {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-xl font-black text-slate-800 mb-6">Add Bank Account</h2>
                <form onSubmit={submitBank} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="bank_name" value="Bank Name" />
                        <TextInput type="text" className="mt-1 block w-full" value={data.bank_name} onChange={(e) => setData('bank_name', e.target.value)} required />
                        <InputError message={errors.bank_name} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="account_name" value="Account Name (e.g., Garage Business)" />
                        <TextInput type="text" className="mt-1 block w-full" value={data.account_name} onChange={(e) => setData('account_name', e.target.value)} required />
                        <InputError message={errors.account_name} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="account_number" value="Account Number" />
                        <TextInput type="text" className="mt-1 block w-full font-mono" value={data.account_number} onChange={(e) => setData('account_number', e.target.value)} required />
                        <InputError message={errors.account_number} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="branch" value="Branch Name" />
                        <TextInput type="text" className="mt-1 block w-full" value={data.branch} onChange={(e) => setData('branch', e.target.value)} />
                        <InputError message={errors.branch} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="initial_balance" value="Initial Opening Balance (Rs.)" />
                        <TextInput type="number" step="0.01" className="mt-1 block w-full" value={data.initial_balance} onChange={(e) => setData('initial_balance', e.target.value)} required />
                        <InputError message={errors.initial_balance} className="mt-2" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors text-sm">Cancel</button>
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm disabled:opacity-50">Save Account</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
