import React from 'react';

export default function StatCard({ title, value, sub, icon: Icon, color = 'blue' }) {
    const colorClasses = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-500', valueText: 'text-slate-900', labelText: 'text-slate-500' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500', valueText: 'text-slate-900', labelText: 'text-slate-500' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-500', valueText: 'text-slate-900', labelText: 'text-slate-500' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-500', valueText: 'text-slate-900', labelText: 'text-slate-500' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-500', valueText: 'text-slate-900', labelText: 'text-slate-500' },
        violet: { bg: 'bg-violet-50', text: 'text-violet-600', valueText: 'text-slate-900', labelText: 'text-slate-500' },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 p-5 flex justify-between items-center shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
            <div>
                <p className={`text-[9px] sm:text-[10.5px] font-extrabold ${colors.labelText} uppercase tracking-widest mb-1 leading-tight sm:leading-normal whitespace-normal`}>{title}</p>
                <h3 className={`text-lg sm:text-2xl font-black ${colors.valueText} tracking-tight leading-none mb-1 sm:mb-2`}>{value}</h3>
                {sub && (
                    <p className={`inline-block px-1.5 sm:px-2.5 py-0.5 text-[8px] sm:text-[10px] font-bold ${colors.text} ${colors.bg} rounded-md uppercase tracking-wide leading-tight`}>{sub}</p>
                )}
            </div>
            <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
                {Icon ? <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${colors.text}`} /> : null}
            </div>
        </div>
    );
}
