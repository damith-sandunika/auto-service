import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import OrdersTable from './Orders/OrdersTable';
import OrderPaymentModal from './Orders/OrderPaymentModal';

export default function Orders({ invoices, jobs, branches, selectedBranchId, deletedOrders, activeCount, deletedCount, currentTab }) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [deletingInvoice, setDeletingInvoice] = useState(null);
    const [payingInvoice, setPayingInvoice] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const openDelete = (inv) => { setDeletingInvoice(inv); setIsDeleteModalOpen(true); };
    const openPay = (inv) => { setPayingInvoice(inv); setIsPaymentModalOpen(true); };

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('owner.orders.destroy', deletingInvoice.id), {
            onSuccess: () => { setIsDeleteModalOpen(false); setDeletingInvoice(null); setDeleteProcessing(false); }
        });
    };

    return (
        <AuthenticatedLayout
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">Orders</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Manage customer billing and payments</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end gap-3 items-center">
                    {branches && branches.length > 0 && (
                        <select 
                            className="bg-white border border-slate-200 text-sm font-bold rounded-xl px-4 py-2 text-slate-700 h-[38px]"
                            value={selectedBranchId || ''}
                            onChange={(e) => {
                                window.location.href = route('owner.orders.index') + (e.target.value ? '?branch_id=' + e.target.value : '');
                            }}
                        >
                            <option value="">All Branches</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    )}
                </div>
            }
        >
            <Head title="Orders" />
            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6 space-y-6">
                <OrdersTable 
                    invoices={invoices} 
                    deletedOrders={deletedOrders} 
                    activeCount={activeCount}
                    deletedCount={deletedCount}
                    currentTab={currentTab}
                    onPay={openPay} 
                    onDelete={openDelete} 
                />
            </div>

            <OrderPaymentModal show={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} payingInvoice={payingInvoice} />

            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-black text-red-600 mb-4">Delete Order</h2>
                    <p className="text-sm text-slate-600 mb-6 font-medium">Are you sure you want to delete Order #{deletingInvoice?.invoice_number || deletingInvoice?.id}?</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm">Cancel</button>
                        <button onClick={confirmDelete} disabled={deleteProcessing} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm disabled:opacity-50">Yes, Delete</button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
