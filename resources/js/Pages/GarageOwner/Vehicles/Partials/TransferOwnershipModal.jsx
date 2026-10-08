import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SearchableSelect from '@/Components/SearchableSelect';

export default function TransferOwnershipModal({ show, onClose, vehicle, myCustomers }) {
    const { data, setData, patch, processing, errors } = useForm({ customer_id: vehicle.owner_id || '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('owner.vehicles.owner.update', vehicle.id), { onSuccess: () => onClose() });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-bold mb-3 text-slate-800">Transfer Ownership</h2>
                <p className="text-sm text-slate-500 mb-5">Assign this vehicle to another customer registered in your garage.</p>
                <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select New Owner</label>
                    <SearchableSelect value={data.customer_id} onChange={e => setData('customer_id', e.target.value)} options={myCustomers.map(c => ({ value: c.id, label: `${c.name} (${c.phone || c.email})` }))} placeholder="-- Select Customer --" />
                    {errors.customer_id && <p className="text-red-500 text-xs mt-1">{errors.customer_id}</p>}
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                    <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">{processing ? 'Transferring...' : 'Transfer'}</button>
                </div>
            </form>
        </Modal>
    );
}
