import React from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SearchableSelect from '@/Components/SearchableSelect';
import InputError from '@/Components/InputError';

export default function EstimateItemsEditor({ items, services, inventory, errors, onAdd, onUpdate, onRemove }) {
    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100 p-6 sm:p-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">2. Estimate Items</h3>
                <button type="button" onClick={onAdd} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">+ Add Item</button>
            </div>
            {items.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-sm font-bold text-slate-400">No items added yet. Click &quot;+ Add Item&quot; to start.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                            <div className="col-span-12 lg:col-span-2">
                                <InputLabel value="Type" className="text-[10px] text-slate-500 uppercase tracking-wider" />
                                <SearchableSelect className="mt-1" value={item.type} onChange={e => { onUpdate(index, 'type', e.target.value); onUpdate(index, 'item_id', ''); }} options={[{ value: 'service', label: 'Service' }, { value: 'part', label: 'Part' }]} isClearable={false} />
                            </div>
                            <div className="col-span-12 lg:col-span-3">
                                <InputLabel value={item.type === 'service' ? 'Select Service' : 'Select Part'} className="text-[10px] text-slate-500 uppercase tracking-wider" />
                                <SearchableSelect className="mt-1" value={item.item_id} onChange={e => onUpdate(index, 'item_id', e.target.value)} options={item.type === 'service' ? services.map(s => ({ value: s.id, label: s.service_name })) : inventory.map(i => ({ value: i.id, label: i.item_name }))} placeholder="Custom Item" />
                            </div>
                            <div className="col-span-12 lg:col-span-3">
                                <InputLabel value="Description" className="text-[10px] text-slate-500 uppercase tracking-wider" />
                                <TextInput className="w-full mt-1 bg-white text-xs h-9" value={item.description} onChange={e => onUpdate(index, 'description', e.target.value)} required />
                            </div>
                            <div className="col-span-6 lg:col-span-1">
                                <InputLabel value="Qty" className="text-[10px] text-slate-500 uppercase tracking-wider" />
                                <TextInput type="number" step="0.01" className="w-full mt-1 bg-white text-xs font-black h-9 text-center" value={item.quantity} onChange={e => onUpdate(index, 'quantity', e.target.value)} required />
                            </div>
                            <div className="col-span-6 lg:col-span-2">
                                <InputLabel value="Price" className="text-[10px] text-slate-500 uppercase tracking-wider" />
                                <TextInput type="number" step="0.01" className="w-full mt-1 bg-white text-xs font-black h-9 text-right" value={item.unit_price} onChange={e => onUpdate(index, 'unit_price', e.target.value)} required />
                            </div>
                            <div className="col-span-12 lg:col-span-1 flex items-end justify-end pb-1">
                                <button type="button" onClick={() => onRemove(index)} className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <InputError message={errors.items} className="mt-2" />
        </div>
    );
}
