import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const JOB_STATUSES = ['checking', 'working', 'completed', 'done'];
const STATUS_COLORS = {
    checking: 'bg-amber-100 text-amber-700 border-amber-200',
    working: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};
const PAYMENT_STATUS_COLORS = {
    no_pay: 'bg-slate-100 text-slate-600',
    partial: 'bg-orange-100 text-orange-700',
    paid: 'bg-emerald-100 text-emerald-700',
    credit: 'bg-rose-100 text-rose-700',
};

export default function Show({ invoice, timeline = [] }) {
    const formatPrice = (price) =>
        new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price || 0);

    const totalPaid = invoice.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
    const fullAmount = parseFloat(invoice.total_amount) || 0;
    const balance = fullAmount - totalPaid;

    let paymentStatus = 'no_pay';
    if (totalPaid >= fullAmount) paymentStatus = 'paid';
    else if (totalPaid > 0) paymentStatus = 'partial';
    const hasCreditPayment = invoice.payments?.some(p => p.payment_method === 'credit');
    if (hasCreditPayment) paymentStatus = 'credit';

    const jobStatus = invoice.job?.status || 'checking';
    const customerName = invoice.job?.owner?.name || invoice.job?.vehicle?.owner?.name || 'Walk-in Customer';
    const vehicle = invoice.job?.vehicle;

    const paymentStatusLabel = {
        no_pay: 'No Payment',
        partial: 'Partial Payment',
        paid: 'Fully Paid',
        credit: 'Credit',
    }[paymentStatus];

    const pdfUrl     = route('owner.orders.print', invoice.id);
    const thermalUrl = route('owner.orders.print', invoice.id) + '?type=thermal';

    // Edit Payment State
    const [editingPayment, setEditingPayment] = useState(null);
    const { data: payData, setData: setPayData, patch: payPatch, processing: payProcessing, reset: payReset } = useForm({
        amount: '',
        payment_method: '',
        payment_date: ''
    });

    const renderCorrection = (desc) => {
        try {
            if (desc?.trim().startsWith('{')) {
                const data = JSON.parse(desc);
                return (
                    <div className="bg-white border border-rose-100 rounded-xl p-4 mt-2 mb-2 shadow-sm">
                        <h4 className="font-black text-slate-800 text-sm mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            {data.title}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            {data.type === 'item_added' && (
                                <>
                                    <div><p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-0.5">Item Name</p><p className="font-bold text-sm text-slate-700">{data.item}</p></div>
                                    <div><p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-0.5">Added Qty & Price</p><p className="font-bold text-sm text-emerald-600">{data.quantity} @ {formatPrice(data.price)}</p></div>
                                </>
                            )}
                            {data.type === 'item_removed' && (
                                <>
                                    <div><p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-0.5">Item Name</p><p className="font-bold text-sm text-rose-600">{data.item}</p></div>
                                    <div><p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-0.5">Removed Qty</p><p className="font-bold text-sm line-through text-slate-400">{data.old_quantity}</p></div>
                                </>
                            )}
                            {data.type === 'quantity_updated' && (
                                <>
                                    <div><p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-0.5">Item Name</p><p className="font-bold text-sm text-slate-700">{data.item}</p></div>
                                    <div>
                                        <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-0.5">Quantity Change</p>
                                        <p className="font-bold text-sm text-slate-800">
                                            <span className="line-through text-slate-400 mr-2">{data.old_quantity}</span> 
                                            <span className="text-blue-600">➔ {data.new_quantity}</span>
                                        </p>
                                    </div>
                                </>
                            )}
                            {data.type === 'discount_updated' && (
                                <>
                                    <div><p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-0.5">Old Discount</p><p className="font-bold text-sm line-through text-slate-400">{formatPrice(data.old_discount)}</p></div>
                                    <div><p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-0.5">New Discount</p><p className="font-bold text-sm text-blue-600">{formatPrice(data.new_discount)}</p></div>
                                </>
                            )}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Order Total Change</p>
                            <p className="font-black text-sm">
                                <span className="line-through text-slate-400 mr-2">{formatPrice(data.old_total)}</span> 
                                <span className="text-slate-800">➔ {formatPrice(data.new_total)}</span>
                            </p>
                        </div>
                    </div>
                );
            }
        } catch (e) {
            console.error(e);
        }
        return <p className="text-sm font-bold text-slate-800 whitespace-pre-wrap leading-relaxed">{desc}</p>;
    };

    const openEditPayment = (payment) => {
        setEditingPayment(payment);
        setPayData({
            amount: payment.amount,
            payment_method: payment.payment_method,
            payment_date: payment.payment_date || dayjs(payment.created_at).format('YYYY-MM-DD')
        });
    };

    const submitEditPayment = (e) => {
        e.preventDefault();
        payPatch(route('owner.orders.payments.update', { order: invoice.id, payment: editingPayment.id }), {
            onSuccess: () => {
                setEditingPayment(null);
                payReset();
            }
        });
    };

    const corrections = timeline.filter(t => t.action === 'correction');
    const normalTimeline = timeline.filter(t => t.action !== 'correction');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 w-full min-w-0">
                    <div className="min-w-0">
                        <h2 className="text-xl font-black text-black truncate">Order #{invoice.invoice_number || invoice.id}</h2>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">{dayjs(invoice.created_at).format('MMM D, YYYY h:mm A')}</p>
                    </div>
                </div>
            }
            headerActions={
                <div className="flex items-center gap-2">
                    {/* PDF Print */}
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="PDF / A4 Print"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl font-bold text-sm shadow-sm transition-colors whitespace-nowrap"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                        <span className="hidden sm:inline">PDF</span>
                    </a>
                    {/* Thermal Print */}
                    <a
                        href={thermalUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Thermal / 80mm Print"
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl font-bold text-sm shadow-sm transition-colors whitespace-nowrap"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        <span className="hidden sm:inline">Thermal</span>
                    </a>
                </div>
            }
        >
            <Head title={`Order #${invoice.invoice_number || invoice.id}`} />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Decorated Summary Header */}
                <div className="relative bg-gradient-to-br from-indigo-950 via-blue-900 to-blue-950 rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-900/20 overflow-hidden">
                    {/* Background Decorations */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl"></div>
                    
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {/* Col 1: Vehicle & Order */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Vehicle</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/5">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-white">{vehicle?.vehicle_number || vehicle?.license_plate || '—'}</p>
                                        {(vehicle?.make || vehicle?.model) && (
                                            <p className="text-sm font-medium text-slate-300">{[vehicle?.make, vehicle?.model].filter(Boolean).join(' ')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Order Status</p>
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border backdrop-blur-sm ${STATUS_COLORS[jobStatus] ? STATUS_COLORS[jobStatus].replace('bg-', 'bg-').replace('text-', 'text-').replace('border-', 'border-') : 'bg-white/10 text-white border-white/20'}`}>
                                    {jobStatus}
                                </span>
                            </div>
                        </div>

                        {/* Col 2: Customer & Team */}
                        <div className="space-y-5 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-12">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                                <p className="text-lg font-bold text-white">{customerName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Mechanic</p>
                                <p className="text-base font-medium text-slate-300">{invoice.job?.mechanic?.name || '— Not Assigned'}</p>
                            </div>
                            {invoice.job?.description && (
                                <div className="pt-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description / Notes</p>
                                    <p className="text-sm text-slate-300 bg-white/5 rounded-xl p-3 border border-white/5 leading-relaxed">{invoice.job.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Col 3: Financials */}
                        <div className="space-y-5 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-12">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Amount</p>
                                    <p className="text-2xl font-black text-white">{formatPrice(fullAmount)}</p>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider ${PAYMENT_STATUS_COLORS[paymentStatus]} shadow-sm`}>
                                    {paymentStatusLabel}
                                </span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 backdrop-blur-sm flex justify-between items-center mt-2">
                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Balance Due</p>
                                <p className={`text-xl font-black ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {formatPrice(Math.max(0, balance))}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Vertical Stack */}
                <div className="flex flex-col gap-6">

                        {/* Cart Items */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-black text-slate-800">Items & Services</h3>
                                    <span className="text-xs font-black text-slate-400">{invoice.job?.items?.length || 0} items</span>
                                </div>
                                <a href={route('owner.orders.edit', invoice.id)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors shadow-sm">
                                    Edit Order
                                </a>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3">Item / Service</th>
                                        <th className="px-6 py-3 text-center">Qty</th>
                                        <th className="px-6 py-3 text-right">Unit Price</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {invoice.job?.items?.length > 0 ? (
                                        invoice.job.items.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50/60">
                                                <td className="px-6 py-3 font-bold text-slate-800">
                                                    <div>{item.description}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-slate-400 capitalize">{item.item_type}</span>
                                                        {item.location && (
                                                            <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                                                Stored at: {item.location.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-center text-slate-600 font-bold">{item.quantity}</td>
                                                <td className="px-6 py-3 text-right text-slate-600 font-bold">{formatPrice(item.price)}</td>
                                                <td className="px-6 py-3 text-right font-black text-slate-800">{formatPrice(item.price * item.quantity)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-bold">No items in this order.</td></tr>
                                    )}
                                </tbody>
                                {invoice.job?.items?.length > 0 && (
                                    <tfoot className="border-t-2 border-slate-200 bg-slate-50/80">
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-right font-black text-slate-500 uppercase text-[10px] tracking-widest">Total Amount</td>
                                            <td className="px-6 py-4 text-right font-black text-slate-900 text-base">{formatPrice(fullAmount)}</td>
                                        </tr>
                                        {totalPaid > 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-2 text-right font-black text-emerald-600 uppercase text-[10px] tracking-widest">Paid</td>
                                                <td className="px-6 py-2 text-right font-black text-emerald-600 text-base">{formatPrice(totalPaid)}</td>
                                            </tr>
                                        )}
                                        {balance > 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-4 text-right font-black text-rose-500 uppercase text-[10px] tracking-widest border-t border-slate-200">Balance Due</td>
                                                <td className="px-6 py-4 text-right font-black text-rose-600 text-lg border-t border-slate-200">{formatPrice(balance)}</td>
                                            </tr>
                                        )}
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        {/* Notes */}
                        {invoice.job?.notes?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                    <h3 className="font-black text-slate-800">Internal Notes</h3>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {invoice.job.notes.map(note => (
                                        <div key={note.id} className={`p-4 ${note.is_important ? 'bg-amber-50' : ''}`}>
                                            <p className="text-slate-700 text-sm font-medium">{note.content || note.note}</p>
                                            <p className="text-xs text-slate-400 font-bold mt-1">{dayjs(note.created_at).format('MMM D, YYYY h:mm A')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Payment History */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-black text-slate-800">Payment History</h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {invoice.payments?.length > 0 ? (
                                    invoice.payments.map(payment => (
                                        <div key={payment.id} className="p-4 flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                                        payment.payment_method === 'cash' ? 'bg-emerald-100 text-emerald-700' :
                                                        payment.payment_method === 'card' ? 'bg-blue-100 text-blue-700' :
                                                        payment.payment_method === 'credit' ? 'bg-rose-100 text-rose-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>{payment.payment_method}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-bold">{dayjs(payment.payment_date || payment.created_at).format('MMM D, YYYY')}</p>
                                                {payment.received_by && (
                                                    <p className="text-xs text-slate-400 font-medium mt-0.5">By: {payment.received_by?.name || payment.received_by}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="font-black text-emerald-600 text-base whitespace-nowrap">{formatPrice(payment.amount)}</p>
                                                <button type="button" onClick={() => openEditPayment(payment)} className="text-blue-500 hover:text-blue-700 font-bold text-xs uppercase tracking-wider">Edit</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-5 py-8 text-center text-slate-400 font-bold text-sm">No payments recorded.</div>
                                )}
                            </div>
                            {invoice.payments?.length > 0 && (
                                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Paid</span>
                                    <span className="font-black text-emerald-600">{formatPrice(totalPaid)}</span>
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-black text-slate-800">Order Timeline</h3>
                            </div>
                            <div className="p-5">
                                        {normalTimeline.length > 0 ? (
                                            <ol className="relative border-l-2 border-slate-200 space-y-4 ml-2">
                                                {normalTimeline.map(event => (
                                            <li key={event.id} className="ml-4">
                                                <div className="absolute -left-[7px] w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full"></div>
                                                <p className="text-sm font-bold text-slate-800">{event.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs font-black text-slate-400">{event.user?.name || 'System'}</p>
                                                    <span className="text-slate-200">•</span>
                                                    <p className="text-xs text-slate-400">{dayjs(event.created_at).format('MMM D, YYYY h:mm A')}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <div className="text-center py-4 text-slate-400 text-sm font-bold">No activity recorded yet.</div>
                                )}

                                {/* Always show creation as the final event */}
                                <div className="ml-4 mt-4 relative border-l-2 border-slate-200 pl-0">
                                    <div className="ml-4">
                                        <div className="absolute -left-[7px] w-3.5 h-3.5 bg-slate-200 border-2 border-slate-300 rounded-full"></div>
                                        <p className="text-sm font-bold text-slate-600">Order Created</p>
                                        <p className="text-xs text-slate-400">{dayjs(invoice.created_at).format('MMM D, YYYY h:mm A')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/* Order Corrections Log */}
                    {corrections.length > 0 && (
                        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden mb-6">
                            <div className="px-5 py-4 border-b border-rose-100 bg-rose-50 flex items-center gap-2">
                                <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <h3 className="font-black text-rose-800">Order Corrections</h3>
                            </div>
                            <div className="p-5">
                                <ol className="relative border-l-2 border-rose-200 space-y-4 ml-2">
                                    {corrections.map(event => (
                                        <li key={event.id} className="ml-4">
                                            <div className="absolute -left-[7px] w-3.5 h-3.5 bg-white border-2 border-rose-500 rounded-full"></div>
                                            {renderCorrection(event.description)}
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs font-black text-slate-400">{event.user?.name || 'System'}</p>
                                                <span className="text-slate-200">•</span>
                                                <p className="text-xs text-slate-400">{dayjs(event.created_at).format('MMM D, YYYY h:mm A')}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Edit Payment Modal */}
            <Modal show={!!editingPayment} onClose={() => { setEditingPayment(null); payReset(); }} maxWidth="sm">
                <form onSubmit={submitEditPayment} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-4">Edit Payment</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Amount</label>
                            <input type="number" min="0" step="0.01" className="w-full border-slate-200 rounded-xl font-bold text-sm focus:ring-blue-500 focus:border-blue-500" value={payData.amount} onChange={e => setPayData('amount', e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Payment Method</label>
                            <select className="w-full border-slate-200 rounded-xl font-bold text-sm focus:ring-blue-500 focus:border-blue-500" value={payData.payment_method} onChange={e => setPayData('payment_method', e.target.value)} required>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="credit">Credit / To-Pay</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Payment Date</label>
                            <input type="date" className="w-full border-slate-200 rounded-xl font-bold text-sm focus:ring-blue-500 focus:border-blue-500" value={payData.payment_date} onChange={e => setPayData('payment_date', e.target.value)} />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => { setEditingPayment(null); payReset(); }} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={payProcessing} className="px-4 py-2 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors disabled:opacity-50">Save Payment</button>
                    </div>
                </form>
            </Modal>

        </AuthenticatedLayout>
    );
}
