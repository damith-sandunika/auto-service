import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';
import DataTable from '@/Components/DataTable';
import Badge from '@/Components/Badge';
import StatCard from '@/Components/StatCard';
import CreateGRNModal from './Partials/CreateGRNModal';

export default function PurchasesIndex({ purchases, suppliers, inventories, totalGRNAmount, totalPaidAmount, totalBalanceDue }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <AuthenticatedLayout
            fullWidth={true}
            header={<div className="text-left w-full"><h2 className="text-xl font-black text-black tracking-tight">Purchases &amp; GRNs</h2><p className="text-xs font-bold text-blue-600 mt-1">Manage your incoming stock and purchase orders.</p></div>}
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all">
                        <PlusIcon className="w-5 h-5" /> Create New GRN
                    </button>
                </div>
            }
        >
            <Head title="Purchases" />
            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total GRN Amount" value={`Rs. ${totalGRNAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="blue" icon={DocumentTextIcon} />
                    <StatCard title="Total Payments" value={`Rs. ${totalPaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="emerald" icon={DocumentTextIcon} />
                    <StatCard title="Total Balance Due" value={`Rs. ${totalBalanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="rose" icon={DocumentTextIcon} />
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <DataTable columns={[{ label: 'ID / Ref' }, { label: 'Date' }, { label: 'Supplier' }, { label: 'Items' }, { label: 'Total Amount', align: 'right' }, { label: 'Balance Due', align: 'right' }, { label: 'Status', align: 'center' }]} isEmpty={!purchases.data?.length} emptyMessage="No purchases recorded yet.">
                            {purchases.data?.map(purchase => (
                                <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4"><div className="font-black text-slate-800">#{purchase.id}</div><div className="text-[10px] text-slate-500 font-mono mt-0.5">{purchase.reference_no || '-'}</div></td>
                                    <td className="p-4 text-sm font-semibold text-slate-600">{new Date(purchase.date).toLocaleDateString()}</td>
                                    <td className="p-4"><Link href={route('owner.suppliers.show', purchase.supplier_id)} className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">{purchase.supplier?.name}</Link></td>
                                    <td className="p-4 text-sm text-slate-600 font-medium">{purchase.items?.length || 0} items</td>
                                    <td className="p-4 text-right"><div className="font-black text-slate-800">Rs. {Number(purchase.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></td>
                                    <td className="p-4 text-right"><div className={`font-black ${purchase.balance_amount > 0 ? 'text-red-500' : 'text-slate-400'}`}>Rs. {Number(purchase.balance_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></td>
                                    <td className="p-4 text-center"><Badge variant={purchase.status === 'paid' ? 'success' : purchase.status === 'partial' ? 'warning' : 'danger'}>{purchase.status}</Badge></td>
                                </tr>
                            ))}
                        </DataTable>
                        {purchases.links && <Pagination paginator={purchases} />}
                    </div>
                </div>
            </div>

            <CreateGRNModal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} suppliers={suppliers} inventories={inventories} />
        </AuthenticatedLayout>
    );
}
