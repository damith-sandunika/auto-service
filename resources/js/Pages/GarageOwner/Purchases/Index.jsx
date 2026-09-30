import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { DocumentTextIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';
import DataTable from '@/Components/DataTable';
import Badge from '@/Components/Badge';
import StatCard from '@/Components/StatCard';

export default function PurchasesIndex({ purchases, suppliers, inventories, totalGRNAmount, totalPaidAmount, totalBalanceDue }) {
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

    return (
        <AuthenticatedLayout
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black tracking-tight">Purchases & GRNs</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Manage your incoming stock and purchase orders.</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5">
                        <PlusIcon className="w-5 h-5" />
                        Create New GRN
                    </button>
                </div>
            }
        >
            <Head title="Purchases" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6">

                <div className="animate-fade-in-up">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Total GRN Amount"
                            value={`Rs. ${totalGRNAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                            color="blue"
                            icon={DocumentTextIcon}
                        />
                        <StatCard
                            title="Total Payments"
                            value={`Rs. ${totalPaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                            color="emerald"
                            icon={DocumentTextIcon}
                        />
                        <StatCard
                            title="Total Balance Due"
                            value={`Rs. ${totalBalanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                            color="rose"
                            icon={DocumentTextIcon}
                        />
                    </div>

                    {/* Purchases List */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <DataTable
                                columns={[
                                    { label: 'ID / Ref' },
                                    { label: 'Date' },
                                    { label: 'Supplier' },
                                    { label: 'Items' },
                                    { label: 'Total Amount', align: 'right' },
                                    { label: 'Balance Due', align: 'right' },
                                    { label: 'Status', align: 'center' },
                                ]}
                                isEmpty={!purchases.data || purchases.data.length === 0}
                                emptyMessage="No purchases recorded yet."
                            >
                                {purchases.data?.map(purchase => (
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
                                            <Badge variant={purchase.status === 'paid' ? 'success' : purchase.status === 'partial' ? 'warning' : 'danger'}>
                                                {purchase.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </DataTable>
                            {purchases.links && <Pagination links={purchases.links} />}
                        </div>
                    </div>
                </div>

            </div>

            {/* Create GRN Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="3xl">
                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Record Purchase (GRN)</h2>
                            <p className="text-xs font-bold text-slate-500 mt-1">Add items to your inventory and update supplier balance.</p>
                        </div>
                        <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <form onSubmit={submitCreate}>
                        {/* Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Supplier *</label>
                                <select required value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} className="w-full text-sm border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 shadow-sm">
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
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

                        {/* Items Table */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Purchase Items</h3>
                                <button type="button" onClick={addItemRow} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                    <PlusIcon className="w-4 h-4" /> Add Row
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {data.items.map((item, index) => (
                                    <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative group">
                                        
                                        <div className="absolute -left-2 -top-2 w-5 h-5 bg-slate-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                            {index + 1}
                                        </div>

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

        </AuthenticatedLayout>
    );
}
