import React from 'react';

export default function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{title}</h2>
                {subtitle && <p className="text-[13px] font-bold text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {actions && (
                <div className="flex flex-row items-center gap-3 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    {actions}
                </div>
            )}
        </div>
    );
}
