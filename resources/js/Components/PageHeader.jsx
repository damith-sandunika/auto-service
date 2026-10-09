import React from 'react';
import { Link } from '@inertiajs/react';

export default function PageHeader({ title, subtitle, actions, backUrl }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                {backUrl && (
                    <Link href={backUrl} className="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl shadow-sm border border-slate-200 transition-all flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                )}
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{title}</h2>
                    {subtitle && <p className="text-[13px] font-bold text-slate-500 mt-1">{subtitle}</p>}
                </div>
            </div>
            {actions && (
                <div className="flex flex-row items-center gap-3 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    {actions}
                </div>
            )}
        </div>
    );
}
