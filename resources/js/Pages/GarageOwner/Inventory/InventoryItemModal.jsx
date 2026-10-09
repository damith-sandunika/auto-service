import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function InventoryItemModal({ show, onClose, editingItem, locations = [], activeOrders = [] }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        sku: editingItem?.sku || '',
        item_name: editingItem?.item_name || '',
        quantity: editingItem?.quantity ?? 0,
        price: editingItem?.price || '',
        inventory_location_id: editingItem?.inventory_location_id || '',
        job_id: '' // Only used when creating
    });

    React.useEffect(() => {
        if (editingItem) {
            setData({ 
                sku: editingItem.sku || '', 
                item_name: editingItem.item_name, 
                quantity: editingItem.quantity, 
                price: editingItem.price,
                inventory_location_id: editingItem.inventory_location_id || '',
                job_id: ''
            });
        } else {
            reset();
        }
    }, [editingItem]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(route('owner.inventory.update', editingItem.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('owner.inventory.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-black text-slate-800 mb-6">{editingItem ? 'Edit Inventory Item' : 'Add New Item (Receive Stock)'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="sku" value="SKU (Optional)" />
                        <TextInput id="sku" type="text" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 font-mono text-sm" value={data.sku} onChange={(e) => setData('sku', e.target.value)} />
                        <InputError message={errors.sku} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="item_name" value="Item Name" />
                        <TextInput id="item_name" type="text" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800" value={data.item_name} onChange={(e) => setData('item_name', e.target.value)} />
                        <InputError message={errors.item_name} className="mt-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="quantity" value="Quantity" />
                            <TextInput id="quantity" type="number" min="0" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} />
                            <InputError message={errors.quantity} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="price" value="Unit Price (Rs.)" />
                            <TextInput id="price" type="number" min="0" step="0.01" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800" value={data.price} onChange={(e) => setData('price', e.target.value)} />
                            <InputError message={errors.price} className="mt-2" />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="inventory_location_id" value="Stock Location" />
                        <select 
                            id="inventory_location_id" 
                            className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-lg shadow-sm" 
                            value={data.inventory_location_id} 
                            onChange={(e) => setData('inventory_location_id', e.target.value)}
                        >
                            <option value="">-- No Location Assigned --</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.inventory_location_id} className="mt-2" />
                    </div>

                    {!editingItem && (
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <InputLabel htmlFor="job_id" value="Assign to Order / Vehicle (Optional)" className="text-blue-900" />
                            <select 
                                id="job_id" 
                                className="mt-1 block w-full bg-white border-blue-200 text-blue-900 font-bold rounded-lg shadow-sm text-sm" 
                                value={data.job_id} 
                                onChange={(e) => setData('job_id', e.target.value)}
                            >
                                <option value="">-- Do Not Assign --</option>
                                {activeOrders.map(order => (
                                    <option key={order.id} value={order.id}>
                                        Order #{order.id} - {order.vehicle?.license_plate || order.vehicle?.vehicle_number || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[10px] text-blue-600 font-bold mt-1.5">Selecting an order will automatically add this item to their bill.</p>
                            <InputError message={errors.job_id} className="mt-2" />
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">Cancel</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 shadow-md shadow-blue-500/20">{processing ? 'Saving...' : 'Save Item'}</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
