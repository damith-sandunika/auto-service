import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import DataTable from '@/Components/DataTable';
import Badge from '@/Components/Badge';
import { useForm } from '@inertiajs/react';
import InventoryItemModal from './Inventory/InventoryItemModal';
import LocationsModal from './Inventory/LocationsModal';

const formatPrice = (price) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price);

export default function Inventory({ inventory, lowStockCount, locations, activeOrders }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const { delete: destroy, processing } = useForm();

    const openEdit = (item) => { setEditingItem(item); setIsModalOpen(true); };
    const openCreate = () => { setEditingItem(null); setIsModalOpen(true); };
    const openDelete = (item) => { setDeletingItem(item); setIsDeleteModalOpen(true); };
    const confirmDelete = () => destroy(route('owner.inventory.destroy', deletingItem.id), { onSuccess: () => { setIsDeleteModalOpen(false); setDeletingItem(null); } });

    return (
        <AuthenticatedLayout
            fullWidth={true}
            header={<div className="text-left w-full"><h2 className="text-xl font-black text-black">Inventory Management</h2><p className="text-xs font-bold text-blue-600 mt-1">Manage your stock levels and pricing</p></div>}
            headerActions={
                <div className="w-full sm:w-auto flex justify-end gap-3 items-center">
                    <button onClick={() => setIsLocationsModalOpen(true)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-2 rounded-lg font-black transition-all text-xs border border-indigo-200 shadow-sm whitespace-nowrap">
                        Manage Locations
                    </button>
                    <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black transition-all text-xs shadow-sm shadow-blue-500/20 whitespace-nowrap">
                        <span className="text-base leading-none mb-0.5 mr-1">+</span> Receive External Stock
                    </button>
                </div>
            }
        >
            <Head title="Inventory" />
            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6 space-y-6">
                {lowStockCount > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                        <svg className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <div><h4 className="text-rose-700 font-black">Low Stock Warning</h4><p className="text-rose-600/80 text-sm mt-1 font-medium">{lowStockCount} items are running low or out of stock.</p></div>
                    </div>
                )}
                <DataTable columns={[{ label: 'SKU' }, { label: 'Item Name' }, { label: 'Location' }, { label: 'Quantity', align: 'center' }, { label: 'Unit Price', align: 'right' }, { label: 'Status' }, { label: 'Actions', align: 'right' }]} isEmpty={!inventory?.data?.length} emptyMessage="Inventory is empty.">
                    {inventory?.data?.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{item.sku || '-'}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{item.item_name}</td>
                            <td className="px-6 py-4 font-bold text-indigo-600 text-xs">{item.location ? item.location.name : <span className="text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">Unassigned</span>}</td>
                            <td className="px-6 py-4 text-center"><span className={`text-lg font-black ${item.quantity === 0 ? 'text-rose-500' : 'text-slate-700'}`}>{item.quantity}</span></td>
                            <td className="px-6 py-4 text-right font-black text-slate-700">{formatPrice(item.price)}</td>
                            <td className="px-6 py-4"><Badge variant={item.quantity > 5 ? 'success' : item.quantity > 0 ? 'warning' : 'danger'}>{item.quantity > 5 ? 'In Stock' : item.quantity > 0 ? 'Low Stock' : 'Out of Stock'}</Badge></td>
                            <td className="px-6 py-4 text-right space-x-3">
                                <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">Edit</button>
                                <button onClick={() => openDelete(item)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider">Delete</button>
                            </td>
                        </tr>
                    ))}
                </DataTable>
                {inventory?.links && <Pagination paginator={inventory} />}
            </div>

            <LocationsModal show={isLocationsModalOpen} onClose={() => setIsLocationsModalOpen(false)} locations={locations} />

            <InventoryItemModal show={isModalOpen} onClose={() => setIsModalOpen(false)} editingItem={editingItem} locations={locations} activeOrders={activeOrders} />

            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                        <h2 className="text-lg font-black text-slate-800">Delete Item</h2>
                    </div>
                    <p className="text-sm text-slate-600 mb-6 font-medium">Are you sure you want to delete <span className="font-bold text-slate-800">{deletingItem?.item_name}</span>? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm">Cancel</button>
                        <button onClick={confirmDelete} disabled={processing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm disabled:opacity-50">{processing ? 'Deleting...' : 'Yes, Delete'}</button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
