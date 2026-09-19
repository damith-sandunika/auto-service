import React from 'react';

export default function DataTable({ columns, children, emptyMessage = "No records found.", isEmpty = false }) {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            {columns.map((col, index) => (
                                <th key={index} className={`p-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''}`}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isEmpty ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center">
                                    <div className="inline-flex flex-col items-center justify-center text-slate-400">
                                        <svg className="w-12 h-12 mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p className="text-sm font-bold tracking-wide">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            children
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
