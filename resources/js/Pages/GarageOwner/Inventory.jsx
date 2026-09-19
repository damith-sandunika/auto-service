import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Pagination from '@/Components/Pagination';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import Badge from '@/Components/Badge';

export default function Inventory({ inventory, lowStockCount }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        sku: '',
        item_name: '',
        quantity: 0,
        price: '',
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        clearErrors();
        setData({
            sku: item.sku || '',
            item_name: item.item_name,
            quantity: item.quantity,
            price: item.price,
        });
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const openDeleteModal = (item) => {
        setDeletingItem(item);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => { reset(); clearErrors(); }, 200);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTimeout(() => setDeletingItem(null), 200);
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(route('owner.inventory.update', editingItem.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('owner.inventory.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = () => {
        destroy(route('owner.inventory.destroy', deletingItem.id), {
            onSuccess: () => closeDeleteModal(),
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price);
    };

    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">Inventory Management</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Manage your stock levels and pricing</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black transition-all text-xs shadow-sm shadow-blue-500/20 whitespace-nowrap">
                        <span className="text-base leading-none mb-0.5 mr-1">+</span> Add New Item
                    </button>
                </div>
            }
        >
            <Head title="Inventory" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6 space-y-6">

                {/* Low Stock Alert */}
                {lowStockCount > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                        <svg className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <div>
                            <h4 className="text-rose-700 font-black">Low Stock Warning</h4>
                            <p className="text-rose-600/80 text-sm mt-1 font-medium">
                                {lowStockCount} items are running low or out of stock. Please restock soon to avoid service delays.
                            </p>
                        </div>
                    </div>
                )}

                <DataTable
                    columns={[
                        { label: 'SKU' },
                        { label: 'Item Name' },
                        { label: 'Quantity', align: 'center' },
                        { label: 'Unit Price', align: 'right' },
                        { label: 'Status' },
                        { label: 'Actions', align: 'right' },
                    ]}
                    isEmpty={!inventory || !inventory.data || inventory.data.length === 0}
                    emptyMessage="Inventory is empty."
                >
                    {inventory?.data?.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{item.sku || '-'}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{item.item_name}</td>
                            <td className="px-6 py-4 text-center">
                                <span className={`text-lg font-black ${item.quantity === 0 ? 'text-rose-500' : 'text-slate-700'}`}>{item.quantity}</span>
                            </td>
                            <td className="px-6 py-4 text-right font-black text-slate-700">{formatPrice(item.price)}</td>
                            <td className="px-6 py-4">
                                <Badge variant={item.quantity > 5 ? 'success' : item.quantity > 0 ? 'warning' : 'danger'}>
                                    {item.quantity > 5 ? 'In Stock' : item.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-right space-x-3">
                                <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">Edit</button>
                                <button onClick={() => openDeleteModal(item)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider">Delete</button>
                            </td>
                        </tr>
                    ))}
                </DataTable>
                {inventory && inventory.links && <Pagination links={inventory.links} />}
            </div>

            {/* Add / Edit Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">
                        {editingItem ? 'Edit Inventory Item' : 'Add New Item'}
                    </h2>

                    <form onSubmit={submitForm} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="sku" value="SKU (Optional)" />
                            <TextInput
                                id="sku"
                                type="text"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 font-mono text-sm"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                            />
                            <InputError message={errors.sku} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="item_name" value="Item Name" />
                            <TextInput
                                id="item_name"
                                type="text"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800"
                                value={data.item_name}
                                onChange={(e) => setData('item_name', e.target.value)}
                            />
                            <InputError message={errors.item_name} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="quantity" value="Quantity" />
                                <TextInput
                                    id="quantity"
                                    type="number"
                                    min="0"
                                    className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                />
                                <InputError message={errors.quantity} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="price" value="Unit Price (Rs.)" />
                                <TextInput
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                />
                                <InputError message={errors.price} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 shadow-md shadow-blue-500/20">
                                {processing ? 'Saving...' : 'Save Item'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h2 className="text-lg font-black text-slate-800">
                            Delete Item
                        </h2>
                    </div>
                    <p className="text-sm text-slate-600 mb-6 font-medium">
                        Are you sure you want to delete <span className="font-bold text-slate-800">{deletingItem?.item_name}</span>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button onClick={closeDeleteModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">
                            Cancel
                        </button>
                        <button onClick={confirmDelete} disabled={processing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 shadow-md shadow-red-500/20">
                            {processing ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                    </div>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
