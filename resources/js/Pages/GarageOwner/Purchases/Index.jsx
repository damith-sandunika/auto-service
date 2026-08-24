import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { DocumentTextIcon, PlusIcon, TrashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function PurchasesIndex({ purchases, suppliers, inventories }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        supplier_id: '',
        reference_no: '',
        date: new Date().toISOString().split('T')[0],
        paid_amount: 0,
        items: [
            { inventory_id: '', quantity: 1, unit_cost: 0 }
        ]
    });

    const calculateTotal = () => {
        return data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_cost)), 0);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const addItemRow = () => {
        setData('items', [...data.items, { inventory_id: '', quantity: 1, unit_cost: 0 }]);
    };

    const removeItemRow = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('owner.purchases.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        });
    };

    const [activeTab, setActiveTab] = useState('grn');
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

    const supplierForm = useForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: ''
    });

    const submitSupplier = (e) => {
        e.preventDefault();
        supplierForm.post(route('owner.suppliers.store'), {
            onSuccess: () => {
                setIsSupplierModalOpen(false);
                supplierForm.reset();
            }
        });
    };

    const totalGRNAmount = purchases.reduce((sum, p) => sum + Number(p.total_amount), 0);
    const totalPaidAmount = purchases.reduce((sum, p) => sum + Number(p.paid_amount), 0);
    const totalBalanceDue = purchases.reduce((sum, p) => sum + Number(p.balance_amount), 0);

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Purchases & Suppliers</h2>}>
            <Head title="Purchases & Suppliers" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                
                {/* Header & Tabs */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Purchases & Suppliers</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Manage your incoming stock, GRNs, and vendor balances.</p>
                    </div>
                    
                    <div className="flex bg-slate-200/60 p-1 rounded-xl w-full md:w-auto">
                        <button 
                            onClick={() => setActiveTab('grn')}
                            className={`flex-1 md:flex-none px-6 py-2 text-sm font-black rounded-lg transition-all ${activeTab === 'grn' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            GRN & Purchases
                        </button>
                        <button 
                            onClick={() => setActiveTab('suppliers')}
                            className={`flex-1 md:flex-none px-6 py-2 text-sm font-black rounded-lg transition-all ${activeTab === 'suppliers' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Suppliers Directory
                        </button>
                    </div>
                </div>

                {activeTab === 'grn' && (
                    <div className="animate-fade-in-up">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total GRN Amount</p>
                                    <h3 className="text-2xl font-black text-slate-800">Rs. {totalGRNAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <DocumentTextIcon className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Payments</p>
                                    <h3 className="text-2xl font-black text-emerald-600">Rs. {totalPaidAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Balance Due</p>
                                    <h3 className="text-2xl font-black text-rose-500">Rs. {totalBalanceDue.toLocaleString('en-US', {minimumFractionDigits: 2})}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mb-6">
                            <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5">
                                <PlusIcon className="w-5 h-5" />
                                Create New GRN
                            </button>
                        </div>

                        {/* Purchases List */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">ID / Ref</th>
                                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Date</th>
                                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Supplier</th>
                                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Items</th>
                                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Total Amount</th>
                                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Balance Due</th>
                                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {purchases.map(purchase => (
                                            <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-black text-slate-800">#{purchase.id}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{purchase.reference_no || '-'}</div>
                                                </td>
                                                <td className="p-4 text-sm font-semibold text-slate-600">
                                                    {new Date(purchase.date).toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    <Link href={route('owner.suppliers.show', purchase.supplier_id)} className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
                                                        {purchase.supplier?.name}
                                                    </Link>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 font-medium">
                                                    {purchase.items?.length || 0} items
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="font-black text-slate-800">Rs. {Number(purchase.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className={`font-black ${purchase.balance_amount > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                        Rs. {Number(purchase.balance_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                        purchase.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                                                        purchase.status === 'partial' ? 'bg-amber-100 text-amber-700' : 
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {purchase.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                        {purchases.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="p-12 text-center text-slate-400">
                                                    <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                    <p className="font-medium">No purchases recorded yet.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'suppliers' && (
                    <div className="animate-fade-in-up">
                        <div className="flex justify-end mb-6">
                            <button onClick={() => setIsSupplierModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5">
                                <PlusIcon className="w-5 h-5" />
                                Add Supplier
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {suppliers.map(supplier => (
                                <div key={supplier.id} className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                                    {/* Decorative Accent */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-10 transition-transform group-hover:scale-110 ${supplier.balance_due > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 leading-tight">{supplier.name}</h3>
                                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-bold flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                {supplier.contact_person || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6 relative z-10">
                                        {supplier.phone && (
                                            <div className="text-sm font-semibold text-slate-600">📞 {supplier.phone}</div>
                                        )}
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payable Balance</span>
                                            <span className={`text-lg font-black ${supplier.balance_due > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                Rs. {Number(supplier.balance_due).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 relative z-10">
                                        <Link 
                                            href={route('owner.suppliers.show', supplier.id)}
                                            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            View Ledger & Pay &rarr;
                                        </Link>
                                        <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                            {supplier.purchase_orders_count || 0} Orders
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {suppliers.length === 0 && (
                                <div className="col-span-full py-12 text-center bg-white border border-slate-100 rounded-3xl border-dashed">
                                    <h3 className="text-lg font-bold text-slate-700">No Suppliers Yet</h3>
                                    <p className="text-sm text-slate-500 mt-1">Add your first supplier to start tracking purchases and payables.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Create GRN Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <PlusIcon className="w-6 h-6 text-blue-600" />
                        Record New Purchase (GRN)
                    </h2>
                    
                    <form onSubmit={submitCreate}>
                        {/* Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Supplier *</label>
                                <select value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} required className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500">
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <InputError message={errors.supplier_id} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reference/Invoice No</label>
                                <input type="text" value={data.reference_no} onChange={e => setData('reference_no', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" placeholder="Optional" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date *</label>
                                <input type="date" value={data.date} onChange={e => setData('date', e.target.value)} required className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" />
                            </div>
                        </div>

                        {/* Items */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Items Received</h3>
                                <button type="button" onClick={addItemRow} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    <PlusIcon className="w-3 h-3" /> Add Item Row
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {data.items.map((item, index) => (
                                    <div key={index} className="flex flex-wrap md:flex-nowrap items-end gap-3 p-3 bg-white border border-slate-200 rounded-2xl relative group">
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Inventory Item</label>
                                            <select required value={item.inventory_id} onChange={e => handleItemChange(index, 'inventory_id', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl py-2">
                                                <option value="">Select Item</option>
                                                {inventories.map(inv => <option key={inv.id} value={inv.id}>{inv.item_name} (Stock: {inv.quantity})</option>)}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Qty</label>
                                            <input type="number" required min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl py-2" />
                                        </div>
                                        <div className="w-32">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unit Cost (Rs.)</label>
                                            <input type="number" required min="0" step="0.01" value={item.unit_cost} onChange={e => handleItemChange(index, 'unit_cost', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl py-2" />
                                        </div>
                                        <div className="w-32 text-right py-2">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Line Total</label>
                                            <div className="text-sm font-black text-slate-800">
                                                {Number(item.quantity * item.unit_cost).toLocaleString()}
                                            </div>
                                        </div>
                                        {data.items.length > 1 && (
                                            <button type="button" onClick={() => removeItemRow(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors mb-0.5">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Totals & Payment */}
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
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                                    <button type="submit" disabled={processing || data.items.length === 0} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50">
                                        Save Purchase & Update Stock
                                    </button>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>
            </Modal>

            {/* Create Supplier Modal */}
            <Modal show={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                        <PlusIcon className="w-5 h-5 text-blue-600" />
                        Add New Supplier
                    </h2>
                    <form onSubmit={submitSupplier} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Company/Supplier Name *</label>
                            <input type="text" value={supplierForm.data.name} onChange={e => supplierForm.setData('name', e.target.value)} required className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" placeholder="E.g., Auto Parts Dist." />
                            <InputError message={supplierForm.errors.name} className="mt-1" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Person</label>
                            <input type="text" value={supplierForm.data.contact_person} onChange={e => supplierForm.setData('contact_person', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" placeholder="E.g., John Doe" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
                            <input type="text" value={supplierForm.data.phone} onChange={e => supplierForm.setData('phone', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Address</label>
                            <textarea value={supplierForm.data.address} onChange={e => supplierForm.setData('address', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" rows="2"></textarea>
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                            <button type="submit" disabled={supplierForm.processing} className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50">Save Supplier</button>
                        </div>
                    </form>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
