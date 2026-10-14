import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SearchableSelect from '@/Components/SearchableSelect';
import Pagination from '@/Components/Pagination';
import SafeButton from '@/Components/SafeButton';
import useFormDraft from '@/Hooks/useFormDraft';

// Tab config — NO "done" tab on the board
const TABS = [
    {
        key: 'checking',
        label: 'Checking',
        activeClasses: 'bg-amber-500 text-white shadow-amber-200 shadow-md',
        inactiveClasses: 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100',
        cardBorder: 'border-amber-200 hover:border-amber-400',
        cardBg: 'bg-amber-50/30',
        badgeBg: 'bg-amber-100 text-amber-700',
        moveBtnClasses: 'border-amber-300 text-amber-700 hover:border-amber-500 hover:bg-amber-50',
    },
    {
        key: 'working',
        label: 'Working',
        activeClasses: 'bg-blue-600 text-white shadow-blue-200 shadow-md',
        inactiveClasses: 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100',
        cardBorder: 'border-blue-200 hover:border-blue-400',
        cardBg: 'bg-blue-50/30',
        badgeBg: 'bg-blue-100 text-blue-700',
        moveBtnClasses: 'border-blue-300 text-blue-700 hover:border-blue-500 hover:bg-blue-50',
    },
    {
        key: 'completed',
        label: 'Completed',
        activeClasses: 'bg-indigo-600 text-white shadow-indigo-200 shadow-md',
        inactiveClasses: 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100',
        cardBorder: 'border-indigo-200 hover:border-indigo-400',
        cardBg: 'bg-indigo-50/30',
        badgeBg: 'bg-indigo-100 text-indigo-700',
        moveBtnClasses: 'border-emerald-400 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-600 bg-emerald-50',
    },
];

// Simple payment modal for marking a job as done
function DonePaymentModal({ job, onClose, onSubmit, processing }) {
    const invoice    = job?.invoice;
    const totalAmount = parseFloat(invoice?.total_amount || 0);
    const totalPaid   = invoice?.payments?.reduce((s, p) => s + parseFloat(p.amount), 0) || 0;
    const balance     = Math.max(0, totalAmount - totalPaid);

    const [amount, setAmount] = useState(balance > 0 ? balance.toFixed(2) : '');
    const [method, setMethod] = useState('cash');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(job.id, parseFloat(amount) || 0, method);
    };

    const fmt = (v) => `Rs. ${parseFloat(v || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-black text-lg">Mark as Done</h3>
                        <p className="text-emerald-100 text-sm font-medium mt-0.5">
                            {job?.vehicle?.vehicle_number} — Order #{invoice?.invoice_number || invoice?.id || job?.id}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* ── Payment breakdown (only when invoice exists) ── */}
                    {invoice ? (
                        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-sm">
                            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
                                <span className="font-bold text-slate-600">Total Order Amount</span>
                                <span className="font-black text-slate-900">{fmt(totalAmount)}</span>
                            </div>
                            {totalPaid > 0 && (
                                <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
                                    <span className="font-bold text-emerald-600">Already Paid</span>
                                    <span className="font-black text-emerald-600">- {fmt(totalPaid)}</span>
                                </div>
                            )}
                            <div className={`flex justify-between items-center px-4 py-3 ${balance > 0 ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                                <span className={`font-black text-sm uppercase tracking-wider ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {balance > 0 ? 'Balance Due' : '✓ Fully Paid'}
                                </span>
                                <span className={`font-black text-base ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {fmt(balance)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm font-bold text-amber-700">
                            ⚠️ No invoice attached to this job. Job will be marked done without a payment record.
                        </div>
                    )}

                    {/* ── Payment fields: only shown when there's a balance remaining ── */}
                    {balance > 0 && (
                        <>
                            <div>
                                <label className="block text-sm font-black text-slate-700 mb-2">
                                    Payment Amount (Rs.)
                                    <span className="ml-2 text-xs font-bold text-rose-500">Balance due: {fmt(balance)}</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                                />
                                <p className="text-xs text-slate-400 mt-1.5 font-medium">Enter 0 to mark done without recording a payment now.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-700 mb-2">Payment Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: 'cash',          label: 'Cash',          icon: '💵' },
                                        { value: 'card',          label: 'Card',          icon: '💳' },
                                        { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
                                        { value: 'credit',        label: 'Credit',        icon: '📋' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setMethod(opt.value)}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                                                method === opt.value
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span>{opt.icon}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Fully paid: just show confirmation message ── */}
                    {invoice && balance <= 0 && (
                        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <p className="text-sm font-bold text-emerald-700">This order is fully paid. Click "Mark as Done" to close it.</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm">
                            Cancel
                        </button>
                        <SafeButton type="submit" loading={processing} loadingText="Processing..." className="flex-1 py-2.5 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md text-sm">
                            ✓ Mark as Done
                        </SafeButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function POS({ auth, jobs, customers, mechanics, branches, selectedBranchId, activeTab, tabCounts }) {
    const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
    const [doneJob, setDoneJob] = useState(null); // job being marked as done
    const [doneProcessing, setDoneProcessing] = useState(false);

    // New job form
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [isNewVehicle, setIsNewVehicle] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        customer_id: '',
        new_customer_name: '',
        new_customer_phone: '',
        vehicle_id: '',
        new_vehicle_number: '',
        new_vehicle_make: '',
        new_vehicle_model: '',
        mechanic_id: '',
        description: ''
    });

    const { hasDraft, clearDraft } = useFormDraft('pos_new_job_draft', data, setData);

    const submitNewJob = (e) => {
        e.preventDefault();
        post(route('owner.pos.storeJob') + (selectedBranchId ? '?branch_id=' + selectedBranchId : ''), {
            onSuccess: () => {
                clearDraft();
                setIsNewJobModalOpen(false);
                reset();
                setIsNewCustomer(false);
                setIsNewVehicle(false);
            }
        });
    };

    const handleMarkDone = (jobId, amount, method) => {
        setDoneProcessing(true);
        router.post(route('owner.pos.markDone', jobId), { amount, payment_method: method }, {
            preserveScroll: true,
            onSuccess: () => {
                setDoneJob(null);
                setDoneProcessing(false);
            },
            onError: () => setDoneProcessing(false),
        });
    };

    const availableVehicles = (data.customer_id && !isNewCustomer)
        ? (customers.find(c => c.id == data.customer_id)?.vehicles || [])
        : [];

    const currentTab = TABS.find(t => t.key === activeTab) || TABS[0];

    const tabUrl = (tabKey) =>
        route('owner.pos.index') + `?tab=${tabKey}` + (selectedBranchId ? `&branch_id=${selectedBranchId}` : '');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Jobs Board</h1>
                        <p className="text-xs md:text-sm font-bold text-blue-600 mt-1">Manage ongoing repairs — POS</p>
                    </div>
                </div>
            }
            headerActions={
                <div className="flex flex-row justify-end items-center gap-2 sm:gap-3">
                    {branches && branches.length > 0 && (
                        <select
                            className="bg-white border border-slate-200 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-4 sm:py-2 text-slate-700 shadow-sm max-w-[120px] sm:max-w-none"
                            value={selectedBranchId || ''}
                            onChange={(e) => { window.location.href = route('owner.pos.index') + '?branch_id=' + e.target.value; }}
                        >
                            <option value="" disabled>Select Branch</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    )}
                    {auth.user.role !== 'company_owner' && auth.user.role !== 'garage_owner' && auth.user.role !== 'owner' && (
                        <button
                            onClick={() => setIsNewJobModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-extrabold transition-colors text-xs sm:text-sm shadow-md shadow-blue-500/20 whitespace-nowrap flex items-center gap-1 sm:gap-2"
                        >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            <span className="hidden sm:inline">New Job</span>
                            <span className="sm:hidden">New</span>
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Jobs Board" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Tabs ── */}
                <div className="flex flex-wrap gap-3">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.key;
                        const count = tabCounts?.[tab.key] ?? 0;
                        return (
                            <a
                                key={tab.key}
                                href={tabUrl(tab.key)}
                                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${isActive ? tab.activeClasses : tab.inactiveClasses}`}
                            >
                                {tab.label}
                                <span className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-black ${
                                    isActive ? 'bg-white/25 text-white' : 'bg-white/80 text-slate-700 border border-slate-200'
                                }`}>
                                    {count}
                                </span>
                            </a>
                        );
                    })}
                </div>

                {/* ── Cards Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {(!jobs?.data || jobs.data.length === 0) ? (
                        <div className="col-span-full text-center py-14 text-slate-400 bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl">
                            <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                            <p className="font-black text-base">No jobs in <span className="capitalize">{activeTab}</span></p>
                            <p className="text-sm mt-1">Start a new job or check another tab.</p>
                        </div>
                    ) : (
                        jobs.data.map(job => {
                            const tab = currentTab;
                            const orderNum = job.invoice?.invoice_number || job.invoice?.id || job.id;
                            // Next state for non-completed tabs (simple advance)
                            const advanceStateMap = { checking: 'working', working: 'completed' };
                            const nextState = advanceStateMap[job.status];

                            return (
                                <div
                                    key={job.id}
                                    className={`bg-white rounded-2xl border-2 ${tab.cardBorder} shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden`}
                                >
                                    {/* Card top strip */}
                                    <div className={`px-1 py-0.5 ${tab.cardBg}`} />

                                    {/* Card body */}
                                    <Link href={route('owner.jobs.show', job.id)} className="p-5 flex-1 block group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Order #{orderNum}</p>
                                                <h3 className="font-black text-xl text-slate-900 leading-tight truncate">{job.vehicle?.vehicle_number}</h3>
                                                <p className="text-sm font-bold text-slate-500 truncate mt-0.5">{job.owner?.name || 'Walk-in Customer'}</p>
                                            </div>
                                            <span className={`flex-shrink-0 px-2.5 py-1 text-[11px] font-black rounded-lg uppercase tracking-wider ${tab.badgeBg}`}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <div className="border-t border-slate-100 pt-3 w-full">
                                            {/* Cost Summary */}
                                            <div className="flex flex-col gap-1 w-full">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-slate-400">Total</span>
                                                    <span className="font-black text-slate-800">LKR {parseFloat(job.total_cost || 0).toFixed(2)}</span>
                                                </div>
                                                {(() => {
                                                    const validInvoicePayments = job.invoice?.payments?.filter(p => p.payment_method !== 'credit') || [];
                                                    const invoicePaid = validInvoicePayments.reduce((s, p) => s + parseFloat(p.amount), 0);
                                                    const advancePaid = job.payments?.reduce((s, p) => s + parseFloat(p.amount), 0) || 0;
                                                    const totalPaid = invoicePaid + advancePaid;
                                                    
                                                    const balance = Math.max(0, parseFloat(job.total_cost || 0) - totalPaid);
                                                    return (
                                                        <>
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="font-bold text-emerald-500">Paid</span>
                                                                <span className="font-black text-emerald-600">LKR {totalPaid.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-xs border-t border-slate-50 pt-1 mt-0.5">
                                                                <span className="font-bold text-red-500">Due</span>
                                                                <span className="font-black text-red-600">LKR {balance.toFixed(2)}</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        {job.mechanic && (
                                            <p className="mt-2 text-xs font-bold text-slate-400 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                                {job.mechanic.name}
                                            </p>
                                        )}
                                    </Link>

                                    {/* Card footer actions */}
                                    <div className="px-4 pb-4 pt-1 space-y-2">
                                        {/* checking → working / working → completed: simple advance */}
                                        {nextState && (
                                            <Link
                                                href={route('owner.pos.updateState', job.id)}
                                                method="patch"
                                                data={{ status: nextState }}
                                                preserveScroll
                                                className={`w-full flex items-center justify-center gap-1.5 py-2 bg-white border-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${tab.moveBtnClasses}`}
                                            >
                                                Move to {nextState}
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                                            </Link>
                                        )}

                                        {/* completed → done: opens payment popup */}
                                        {job.status === 'completed' && (
                                            <button
                                                onClick={() => setDoneJob(job)}
                                                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-colors shadow-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                                Pay &amp; Mark Done
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {jobs?.links && (
                    <div className="mt-4">
                        <Pagination links={jobs.links} />
                    </div>
                )}
            </div>

            {/* ── Done Payment Modal ── */}
            {doneJob && (
                <DonePaymentModal
                    job={doneJob}
                    onClose={() => setDoneJob(null)}
                    onSubmit={handleMarkDone}
                    processing={doneProcessing}
                />
            )}

            {/* ── New Job Modal ── */}
            <Modal show={isNewJobModalOpen} onClose={() => setIsNewJobModalOpen(false)}>
                <form onSubmit={submitNewJob} className="p-6">
                    <h2 className="text-xl font-bold mb-4">Start New Job</h2>

                    {hasDraft && (
                        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900 font-bold">
                            <span>⚡ Unsaved draft auto-restored after reload/power cut.</span>
                            <button type="button" onClick={() => { clearDraft(); reset(); }} className="text-rose-600 hover:underline font-black ml-2 uppercase text-[10px]">
                                Discard Draft
                            </button>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* CUSTOMER SECTION */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-slate-700">1. Customer Details</label>
                                <button type="button" onClick={() => { setIsNewCustomer(!isNewCustomer); setData('customer_id', ''); }} className="text-xs text-blue-600 font-bold hover:underline">
                                    {isNewCustomer ? 'Select Existing' : 'Add New Customer'}
                                </button>
                            </div>
                            {!isNewCustomer ? (
                                <SearchableSelect
                                    options={customers.map(c => ({ value: c.id, label: `${c.name} (${c.phone || c.email})` }))}
                                    value={data.customer_id}
                                    onChange={e => { setData(prev => ({ ...prev, customer_id: e.target.value, vehicle_id: '' })); }}
                                    placeholder="Search & Select Customer..."
                                    isClearable
                                />
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" placeholder="Full Name" className="w-full rounded-lg border-slate-300 text-sm" value={data.new_customer_name} onChange={e => setData('new_customer_name', e.target.value)} required={isNewCustomer} />
                                    <input type="text" placeholder="Phone Number" className="w-full rounded-lg border-slate-300 text-sm" value={data.new_customer_phone} onChange={e => setData('new_customer_phone', e.target.value)} />
                                </div>
                            )}
                            {errors.customer_id && <p className="text-red-500 text-xs mt-1">{errors.customer_id}</p>}
                        </div>

                        {/* VEHICLE SECTION */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-slate-700">2. Vehicle Details</label>
                                <button type="button" onClick={() => { setIsNewVehicle(!isNewVehicle); setData('vehicle_id', ''); }} className="text-xs text-blue-600 font-bold hover:underline">
                                    {isNewVehicle ? 'Select Existing' : 'Add New Vehicle'}
                                </button>
                            </div>
                            {!isNewVehicle ? (
                                <SearchableSelect
                                    options={availableVehicles.map(v => ({ value: v.id, label: `${v.vehicle_number} (${v.make} ${v.model})` }))}
                                    value={data.vehicle_id}
                                    onChange={e => setData('vehicle_id', e.target.value)}
                                    placeholder="Select a vehicle..."
                                    isDisabled={!data.customer_id && !isNewCustomer}
                                    isClearable
                                />
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    <input type="text" placeholder="Plate (e.g. CAA-1234)" className="w-full rounded-lg border-slate-300 text-sm" value={data.new_vehicle_number} onChange={e => setData('new_vehicle_number', e.target.value)} required={isNewVehicle} />
                                    <input type="text" placeholder="Make (Toyota)" className="w-full rounded-lg border-slate-300 text-sm" value={data.new_vehicle_make} onChange={e => setData('new_vehicle_make', e.target.value)} />
                                    <input type="text" placeholder="Model (Prius)" className="w-full rounded-lg border-slate-300 text-sm" value={data.new_vehicle_model} onChange={e => setData('new_vehicle_model', e.target.value)} />
                                </div>
                            )}
                            {errors.vehicle_id && <p className="text-red-500 text-xs mt-1">{errors.vehicle_id}</p>}
                            {errors.new_vehicle_number && <p className="text-red-500 text-xs mt-1">{errors.new_vehicle_number}</p>}
                        </div>

                        {/* MECHANIC + DESCRIPTION */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">Assign Mechanic (Optional)</label>
                            <SearchableSelect
                                options={mechanics.map(m => ({ value: m.id, label: m.name }))}
                                value={data.mechanic_id}
                                onChange={e => setData('mechanic_id', e.target.value)}
                                placeholder="None"
                                isClearable
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Description / Notes</label>
                            <textarea className="w-full rounded-lg border-slate-300 text-sm" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Initial inspection notes..." />
                        </div>

                        <div className="pt-2 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsNewJobModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg text-sm">Cancel</button>
                            <SafeButton type="submit" loading={processing} loadingText="Creating..." className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 text-sm">
                                Start Job
                            </SafeButton>
                        </div>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
