import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import SearchableSelect from '@/Components/SearchableSelect';

export default function OrderFormModal({ show, onClose, editingInvoice, jobs }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        job_id: editingInvoice?.job_id ?? '',
        total_amount: editingInvoice?.total_amount ?? '',
        status: editingInvoice?.status ?? 'pending',
    });

    React.useEffect(() => {
        if (editingInvoice) {
            setData({ job_id: editingInvoice.job_id, total_amount: editingInvoice.total_amount, status: editingInvoice.status });
        } else {
            reset();
        }
    }, [editingInvoice]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingInvoice) {
            put(route('owner.orders.update', editingInvoice.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('owner.orders.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-black text-slate-800 mb-6">{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="job_id" value="Select Job" />
                        <SearchableSelect className="mt-1" value={data.job_id} onChange={(e) => setData('job_id', e.target.value)} options={jobs?.data?.map(job => ({ value: job.id, label: `Job #${job.id} - ${job.vehicle?.license_plate || 'Unknown'}` })) || []} placeholder="-- Select a Job --" />
                        <InputError message={errors.job_id} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="total_amount" value="Total Amount (Rs.)" />
                        <TextInput id="total_amount" type="number" min="0" step="0.01" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800" value={data.total_amount} onChange={(e) => setData('total_amount', e.target.value)} />
                        <InputError message={errors.total_amount} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="status" value="Payment Status" />
                        <SearchableSelect className="mt-1" value={data.status} onChange={(e) => setData('status', e.target.value)} options={[{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }]} isClearable={false} />
                        <InputError message={errors.status} className="mt-2" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm">Cancel</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm disabled:opacity-50">{processing ? 'Saving...' : 'Save Invoice'}</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
