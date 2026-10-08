import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import SearchableSelect from '@/Components/SearchableSelect';

export default function EstimatesIndex({ estimates }) {
    const { auth } = usePage().props;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingEstimate, setDeletingEstimate] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [updatingEstimate, setUpdatingEstimate] = useState(null);

    const { data: statusData, setData: setStatusData, patch, processing: statusProcessing, reset: statusReset } = useForm({
        status: '',
    });

    const { delete: destroy, processing: deleteProcessing } = useForm();

    const openDeleteModal = (estimate) => {
        setDeletingEstimate(estimate);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTimeout(() => setDeletingEstimate(null), 200);
    };

    const confirmDelete = () => {
        destroy(route('owner.estimates.destroy', deletingEstimate.id), {
            onSuccess: () => closeDeleteModal(),
        });
    };

    const openStatusModal = (estimate) => {
        setUpdatingEstimate(estimate);
        setStatusData('status', estimate.status);
        setIsStatusModalOpen(true);
    };

    const closeStatusModal = () => {
        setIsStatusModalOpen(false);
        setTimeout(() => { setUpdatingEstimate(null); statusReset(); }, 200);
    };

    const confirmStatusUpdate = (e) => {
        e.preventDefault();
        patch(route('owner.estimates.status', updatingEstimate.id), {
            onSuccess: () => closeStatusModal(),
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft': return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-black uppercase">Draft</span>;
            case 'sent': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase">Sent</span>;
            case 'accepted': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black uppercase">Accepted</span>;
            case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-black uppercase">Rejected</span>;
            case 'expired': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-black uppercase">Expired</span>;
            default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-black uppercase">{status}</span>;
        }
    };

    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">Estimates & Quotations</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Create and manage repair estimates for customers</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <Link href={route('owner.estimates.create')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black transition-all text-xs shadow-sm shadow-blue-500/20 inline-flex items-center whitespace-nowrap">
                        <span className="text-base leading-none mb-0.5 mr-1">+</span> New Estimate
                    </Link>
                </div>
            }
        >
            <Head title="Estimates" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6 space-y-6">
                
                {/* Estimates Table */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Estimate No</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Total Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {estimates.data && estimates.data.length > 0 ? (
                                    estimates.data.map((estimate) => (
                                        <tr key={estimate.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{estimate.estimate_number}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{estimate.customer?.name || 'Unknown'}</div>
                                                <div className="text-xs font-bold text-slate-500 mt-0.5">{estimate.customer?.email || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{estimate.estimate_date}</div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase">Expires: {estimate.expiry_date || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-slate-800">Rs. {Number(estimate.total).toFixed(2)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(estimate.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <Link href={route('owner.estimates.show', estimate.id)} className="text-blue-600 hover:text-blue-800 font-bold text-[11px] uppercase tracking-wider mr-2">View</Link>
                                                <button onClick={() => openStatusModal(estimate)} className="text-amber-600 hover:text-amber-800 font-bold text-[11px] uppercase tracking-wider">Status</button>
                                                <button onClick={() => openDeleteModal(estimate)} className="text-red-500 hover:text-red-700 font-bold text-[11px] uppercase tracking-wider">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="text-slate-400 font-bold mb-2">No Estimates Found</div>
                                            <p className="text-xs text-slate-500">Create your first estimate by clicking the button above.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {estimates.links && <Pagination links={estimates.links} />}
                </div>
            </div>

            {/* Status Update Modal */}
            <Modal show={isStatusModalOpen} onClose={closeStatusModal} maxWidth="sm">
                <form onSubmit={confirmStatusUpdate} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-4">Update Status</h2>
                    <p className="text-sm text-slate-600 font-medium mb-4">Select the current status of this estimate:</p>
                    
                    <div className="mb-6">
                        <SearchableSelect
                            value={statusData.status}
                            onChange={(e) => setStatusData('status', e.target.value)}
                            options={[
                                { value: 'draft', label: 'Draft' },
                                { value: 'sent', label: 'Sent to Customer' },
                                { value: 'accepted', label: 'Accepted' },
                                { value: 'rejected', label: 'Rejected' },
                                { value: 'expired', label: 'Expired' }
                            ]}
                            isClearable={false}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={closeStatusModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors">
                            Close
                        </button>
                        <button type="submit" disabled={statusProcessing} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md shadow-blue-500/20">
                            {statusProcessing ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-4">Delete Estimate</h2>
                    <p className="text-sm text-slate-600 font-medium mb-6">Are you sure you want to delete this estimate? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={closeDeleteModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors">
                            Close
                        </button>
                        <button onClick={confirmDelete} disabled={deleteProcessing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md shadow-red-500/20">
                            {deleteProcessing ? 'Deleting...' : 'Yes, Delete It'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
