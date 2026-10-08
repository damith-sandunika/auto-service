import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

export default function SalaryAdvanceModal({ show, onClose, staffId }) {
    const advanceForm = useForm({ amount: '', date: dayjs().format('YYYY-MM-DD'), reason: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        advanceForm.post(route('owner.hr.advance.store', staffId), {
            onSuccess: () => { setIsAdvanceModalOpen(false); advanceForm.reset(); onClose(); }
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center">
                    <BanknotesIcon className="h-6 w-6 mr-2 text-rose-500" /> Issue Salary Advance
                </h2>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Amount (Rs.)</label>
                        <input type="number" value={advanceForm.data.amount} onChange={e => advanceForm.setData('amount', e.target.value)} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium" min="1" required placeholder="Enter amount..." />
                        <InputError message={advanceForm.errors.amount} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                        <input type="date" value={advanceForm.data.date} onChange={e => advanceForm.setData('date', e.target.value)} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium" required />
                        <InputError message={advanceForm.errors.date} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Reason (Optional)</label>
                        <input type="text" value={advanceForm.data.reason} onChange={e => advanceForm.setData('reason', e.target.value)} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium" placeholder="e.g. Medical emergency" />
                        <InputError message={advanceForm.errors.reason} className="mt-2" />
                    </div>
                </div>
                <div className="mt-8 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={advanceForm.processing} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-colors disabled:opacity-50 shadow-sm">Save Advance</button>
                </div>
            </form>
        </Modal>
    );
}
