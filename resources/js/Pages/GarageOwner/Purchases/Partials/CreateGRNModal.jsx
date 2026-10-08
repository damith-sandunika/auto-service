import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import SearchableSelect from '@/Components/SearchableSelect';

export default function CreateGRNModal({ show, onClose, suppliers, inventories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        supplier_id: '', reference_no: '',
        date: new Date().toISOString().split('T')[0],
        paid_amount: 0, items: [{ inventory_id: '', quantity: 1, unit_cost: 0 }]
    });

    const calculateTotal = () => data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_cost)), 0);
    const handleItemChange = (index, field, value) => { const ni = [...data.items]; ni[index][field] = value; setData('items', ni); };
    const addRow = () => setData('items', [...data.items, { inventory_id: '', quantity: 1, unit_cost: 0 }]);
    const removeRow = (index) => { const ni = [...data.items]; ni.splice(index, 1); setData('items', ni); };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('owner.purchases.store'), { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="3xl">
            <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <div><h2 className="text-xl font-black text-slate-800 tracking-tight">Record Purchase (GRN)</h2><p className="text-xs font-bold text-slate-500 mt-1">Add items to your inventory and update supplier balance.</p></div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Supplier *</label>
                            <SearchableSelect value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} options={suppliers || []} placeholder="Select Supplier" />
                            <InputError message={errors.supplier_id} className="mt-1" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reference / Invoice No</label>
                            <input type="text" value={data.reference_no} onChange={e => setData('reference_no', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 shadow-sm" placeholder="Optional" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Date *</label>
                            <input type="date" required value={data.date} onChange={e => setData('date', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 shadow-sm" />
                        </div>
                    </div>
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Purchase Items</h3>
                            <button type="button" onClick={addRow} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"><PlusIcon className="w-4 h-4" /> Add Row</button>
                        </div>
                        <div className="space-y-3">
                            {data.items.map((item, index) => (
                                <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative group">
                                    <div className="absolute -left-2 -top-2 w-5 h-5 bg-slate-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">{index + 1}</div>
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Inventory Item</label>
                                        <SearchableSelect value={item.inventory_id} onChange={e => handleItemChange(index, 'inventory_id', e.target.value)} options={inventories ? inventories.map(inv => ({ value: inv.id, label: `${inv.item_name} (Stock: ${inv.quantity})` })) : []} placeholder="Select Item" />
                                    </div>
                                    <div className="w-24"><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Qty</label><input type="number" required min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl py-2" /></div>
                                    <div className="w-32"><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unit Cost (Rs.)</label><input type="number" required min="0" step="0.01" value={item.unit_cost} onChange={e => handleItemChange(index, 'unit_cost', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl py-2" /></div>
                                    <div className="w-32 text-right py-2"><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Line Total</label><div className="text-sm font-black text-slate-800">{Number(item.quantity * item.unit_cost).toLocaleString()}</div></div>
                                    {data.items.length > 1 && <button type="button" onClick={() => removeRow(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors mb-0.5"><TrashIcon className="w-4 h-4" /></button>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="w-full md:w-64">
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Immediate Paid Amount (Rs.)</label>
                            <input type="number" min="0" step="0.01" value={data.paid_amount} onChange={e => setData('paid_amount', e.target.value)} className="w-full text-lg font-bold border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500" />
                            <p className="text-[10px] text-slate-500 mt-1">Cash payments automatically create an expense.</p>
                        </div>
                        <div className="text-right w-full md:w-auto">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Bill Amount</div>
                            <div className="text-3xl font-black text-slate-800 mb-4">Rs. {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" disabled={processing || data.items.length === 0} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50">Save Purchase &amp; Update Stock</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
