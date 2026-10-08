import React from 'react';

export default function ReportStatCards({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-md border border-gray-100 shadow-sm">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Sales Revenue</h4>
                <p className="text-2xl font-bold text-gray-900">Rs.{stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white p-5 rounded-md border border-gray-100 shadow-sm">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Done Payments (Collected)</h4>
                <p className="text-2xl font-bold text-green-600">Rs.{stats.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <div className="mt-2 text-[11px] font-bold text-gray-500 flex justify-between">
                    <span>💵 Cash: Rs.{stats.collectedCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span>💳 Card: Rs.{stats.collectedCard.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
            <div className="bg-white p-5 rounded-md border border-gray-100 shadow-sm">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Pending Payments</h4>
                <p className="text-2xl font-bold text-red-500">Rs.{stats.totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
        </div>
    );
}
