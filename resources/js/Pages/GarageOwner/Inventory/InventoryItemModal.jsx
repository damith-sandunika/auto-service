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

    const generateSku = (itemName = '') => {
        const cleaned = (itemName || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const prefix = cleaned.length >= 3 ? cleaned.slice(0, 3) : 'SKU';
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${randomSuffix}`;
    };

    React.useEffect(() => {
        if (editingItem) {
            setData({ 
                sku: editingItem.sku || '', 
                item_name: editingItem.item_name, 
                quantity: editingItem.quantity, 
                price: editingItem.price,
                inventory_location_id: editingItem.inventory_location_id || '',
                job_id: '',
                isSkuAuto: false
            });
        } else if (show) {
            reset();
            const initialSku = generateSku('');
            setData(prev => ({
                ...prev,
                sku: initialSku,
                isSkuAuto: true
            }));
        }
    }, [editingItem, show]);

    const handleAutoGenerateClick = () => {
        setData(prev => ({
            ...prev,
            sku: generateSku(prev.item_name),
            isSkuAuto: true
        }));
    };

    const handleItemNameChange = (e) => {
        const newName = e.target.value;
        setData(prev => {
            const shouldAutoUpdateSku = !editingItem && (!prev.sku || prev.isSkuAuto);
            return {
                ...prev,
                item_name: newName,
                sku: shouldAutoUpdateSku ? generateSku(newName) : prev.sku,
                isSkuAuto: shouldAutoUpdateSku ? true : prev.isSkuAuto
            };
        });
    };

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
                        <div className="flex items-center justify-between mb-1">
                            <InputLabel htmlFor="sku" value="SKU" />
                            <button
                                type="button"
                                onClick={handleAutoGenerateClick}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                                title="Click to automatically generate a SKU"
                            >
                                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Auto Generate
                            </button>
                        </div>
                        <TextInput
                            id="sku"
                            type="text"
                            placeholder="e.g. CAS-4819 or Auto Generated"
                            className="block w-full bg-slate-50 border-slate-200 text-slate-800 font-mono text-sm uppercase placeholder-slate-400 focus:bg-white"
                            value={data.sku}
                            onChange={(e) => setData(prev => ({ ...prev, sku: e.target.value.toUpperCase(), isSkuAuto: false }))}
                        />
                        <InputError message={errors.sku} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="item_name" value="Item Name" />
                        <TextInput
                            id="item_name"
                            type="text"
                            placeholder="e.g. Castrol EDGE 5W-30 (1L)"
                            className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 focus:bg-white"
                            value={data.item_name}
                            onChange={handleItemNameChange}
                        />
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
