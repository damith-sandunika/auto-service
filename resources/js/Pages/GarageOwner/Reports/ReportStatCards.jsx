import React from 'react';

const fmt = (val) => parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

export default function ReportStatCards({ stats, activeTab = 'sales' }) {

    // ===== SALES TAB =====
    if (activeTab === 'sales') {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 md:mb-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">💵 Cash Collected</p>
                    <p className="text-lg md:text-2xl font-black text-emerald-600">Rs.{fmt(stats.collectedCash)}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">💳 Card Collected</p>
                    <p className="text-lg md:text-2xl font-black text-blue-600">Rs.{fmt(stats.collectedCard)}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">🏦 Bank Transfer</p>
                    <p className="text-lg md:text-2xl font-black text-violet-600">Rs.{fmt(stats.collectedBankTransfer)}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm col-span-2 md:col-span-1 flex flex-col justify-center">
                    <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">⚡ Total Collected</p>
                    <p className="text-lg md:text-2xl font-black text-white">Rs.{fmt(stats.totalCollected)}</p>
                </div>
            </div>
        );
    }

    // ===== PENDING TAB =====
    if (activeTab === 'pending') {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 md:mb-6">
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">⏱️ Active / Pending Jobs</p>
                    <p className="text-2xl font-black text-orange-600">{(stats.pendingJobsCount || 0).toLocaleString('en-US')}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">💸 Total Pending Amount</p>
                    <p className="text-2xl font-black text-red-600">Rs.{fmt(stats.totalPending)}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm col-span-2 md:col-span-1">
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">✅ Already Collected</p>
                    <p className="text-2xl font-black text-emerald-600">Rs.{fmt(stats.totalCollected)}</p>
                </div>
            </div>
        );
    }

    // ===== CREDIT TAB =====
    if (activeTab === 'credit') {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 md:mb-6">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">📋 Total Outstanding Credit</p>
                    <p className="text-2xl font-black text-red-600">Rs.{fmt(stats.totalCreditValue)}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">✅ Total Collected</p>
                    <p className="text-2xl font-black text-emerald-600">Rs.{fmt(stats.totalCollected)}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm col-span-2 md:col-span-1 flex flex-col justify-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">⚡ Total Orders</p>
                    <p className="text-2xl font-black text-white">Rs.{fmt(stats.totalSales)}</p>
                </div>
            </div>
        );
    }

    // ===== EXPENSES TAB =====
    if (activeTab === 'expenses') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 md:mb-6">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">📉 Total Expenses</p>
                    <p className="text-2xl font-black text-red-600">Rs.{fmt(stats.totalExpenses)}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">⚡ Total Sales vs Expenses</p>
                    <p className="text-2xl font-black text-white">Rs.{fmt(stats.totalSales - stats.totalExpenses)}</p>
                </div>
            </div>
        );
    }

    // Default fallback (should not hit normally)
    return null;
}
