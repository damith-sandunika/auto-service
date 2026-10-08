import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function CloseShiftModal({ show, onClose, shift }) {
    const closeShiftForm = useForm({});

    const submitCloseShift = (e) => {
        e.preventDefault();
        closeShiftForm.post(route('owner.dashboard.close-shift'), {
            onSuccess: () => onClose()
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-2xl font-black text-slate-800 mb-2">End of Shift Report</h2>
                <p className="text-sm text-slate-500 mb-6">Review the cash drawer summary before closing the shift.</p>
                
                <div className="space-y-1 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="font-bold text-slate-600">Opening Balance:</span>
                        <span className="font-bold text-slate-800">Rs. {(shift?.opening_cash || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="font-bold text-slate-600">Cash Sales Collected:</span>
                        <span className="font-bold text-emerald-600">+ Rs. {(shift?.cash_sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="font-bold text-slate-600">Expenses Logged:</span>
                        <span className="font-bold text-rose-500">- Rs. {(shift?.expenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-3 mt-1 border-t border-slate-300">
                        <span className="font-black text-indigo-900 text-base">Expected Cash Drawer:</span>
                        <span className="font-black text-indigo-600 text-lg">Rs. {(shift?.current_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-sm flex justify-between">
                    <span className="font-bold text-blue-800">Card Sales (Bank):</span>
                    <span className="font-bold text-blue-600">Rs. {(shift?.card_sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                <form onSubmit={submitCloseShift} className="flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                        Keep Open
                    </button>
                    <button type="submit" disabled={closeShiftForm.processing} className="flex-[2] py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black transition-colors disabled:opacity-50">
                        Confirm &amp; Close Shift
                    </button>
                </form>
            </div>
        </Modal>
    );
}
