import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SearchableSelect from '@/Components/SearchableSelect';

export default function JobItemModals({ job, inventory, services, suppliers, isAddPartOpen, isAddServiceOpen, isAddOutsourceOpen, onClose }) {
    const { data, setData, post, processing, reset } = useForm({
        item_type: '', description: '', quantity: 1, price: '', cost_price: '', payment_method: 'cash', item_id: null, supplier_id: ''
    });

    const submit = (type, closeFn) => (e) => {
        e.preventDefault();
        post(route('owner.jobs.items.store', job.id), { onSuccess: () => { closeFn(); reset(); } });
    };

    return (
        <>
            <Modal show={isAddPartOpen} onClose={() => onClose('part')}>
                <form onSubmit={submit('part', () => onClose('part'))} className="p-6">
                    <h2 className="text-xl font-bold mb-4">Add Part</h2>
                    <div className="space-y-4">
                        <SearchableSelect onChange={e => {
                            const part = inventory.find(i => i.id == e.target.value);
                            if (part) setData({ ...data, item_type: 'part', item_id: part.id, description: part.item_name, price: part.price });
                        }} options={inventory.map(i => ({ value: i.id, label: `${i.item_name} (Qty: ${i.quantity}) - LKR ${i.price}` }))} placeholder="Select Part..." />
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg mt-4" disabled={!data.item_id || processing}>Add Part to Job</button>
                    </div>
                </form>
            </Modal>

            <Modal show={isAddServiceOpen} onClose={() => onClose('service')}>
                <form onSubmit={submit('service', () => onClose('service'))} className="p-6">
                    <h2 className="text-xl font-bold mb-4">Add Service</h2>
                    <div className="space-y-4">
                        <SearchableSelect onChange={e => {
                            const service = services.find(s => s.id == e.target.value);
                            if (service) setData({ ...data, item_type: 'service', item_id: service.id, description: service.name, price: service.price });
                        }} options={services.map(s => ({ value: s.id, label: `${s.name} - LKR ${s.price}` }))} placeholder="Select Service..." />
                        <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2.5 rounded-lg mt-4" disabled={!data.item_id || processing}>Add Service to Job</button>
                    </div>
                </form>
            </Modal>

            <Modal show={isAddOutsourceOpen} onClose={() => onClose('outsource')}>
                <form onSubmit={submit('outsource', () => onClose('outsource'))} className="p-6">
                    <h2 className="text-xl font-bold mb-4">Add Outsource Work</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Select Supplier</label>
                            <SearchableSelect value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} options={suppliers?.map(s => ({ value: s.id, label: `${s.name} (${s.phone || 'No Phone'})` }))} placeholder="Select Supplier..." />
                        </div>
                        <div><label className="block text-sm font-semibold mb-1">Description</label><input type="text" className="w-full rounded-lg border-slate-300" value={data.description} onChange={e => setData('description', e.target.value)} required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold mb-1">Customer Price</label><input type="number" step="0.01" className="w-full rounded-lg border-slate-300" value={data.price} onChange={e => setData('price', e.target.value)} required /></div>
                            <div><label className="block text-sm font-semibold mb-1">Our Cost (Payable)</label><input type="number" step="0.01" className="w-full rounded-lg border-slate-300" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} required /></div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Payment Method</label>
                            <SearchableSelect value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} options={[{ value: 'cash', label: 'Cash (Deduct Today)' }, { value: 'credit', label: 'Credit (Pay Later)' }]} isClearable={false} />
                        </div>
                        <button type="submit" disabled={processing} className="w-full bg-purple-600 text-white font-bold py-2.5 rounded-lg mt-4">Add Outsource Item</button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
