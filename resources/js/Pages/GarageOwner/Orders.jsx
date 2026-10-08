import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import OrdersTable from './Orders/OrdersTable';
import OrderPaymentModal from './Orders/OrderPaymentModal';
import OrderFormModal from './Orders/OrderFormModal';

export default function Orders({ invoices, jobs }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [deletingInvoice, setDeletingInvoice] = useState(null);
    const [payingInvoice, setPayingInvoice] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const openEdit = (inv) => { setEditingInvoice(inv); setIsModalOpen(true); };
    const openCreate = () => { setEditingInvoice(null); setIsModalOpen(true); };
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
                    <h2 className="text-xl font-black text-black">Orders &amp; Invoices</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Manage customer billing and payments</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black transition-all text-xs shadow-sm shadow-blue-500/20 whitespace-nowrap">
                        <span className="text-base leading-none mb-0.5 mr-1">+</span> New Job Invoice
                    </button>
                </div>
            }
        >
            <Head title="Orders" />
            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6 space-y-6">
                <OrdersTable invoices={invoices} onPay={openPay} onEdit={openEdit} onDelete={openDelete} />
            </div>

            <OrderPaymentModal show={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} payingInvoice={payingInvoice} />
            <OrderFormModal show={isModalOpen} onClose={() => setIsModalOpen(false)} editingInvoice={editingInvoice} jobs={jobs} />

            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-black text-red-600 mb-4">Delete Invoice</h2>
                    <p className="text-sm text-slate-600 mb-6 font-medium">Are you sure you want to delete Invoice {deletingInvoice?.invoice_number}?</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm">Cancel</button>
                        <button onClick={confirmDelete} disabled={deleteProcessing} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm disabled:opacity-50">Yes, Delete</button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
