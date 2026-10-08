import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ charts }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price);
    };

    return (
        <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-sm p-6 flex flex-col animate-slide-up">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Revenue Performance</h3>
                    <p className="text-[12px] font-semibold text-slate-500">7-Day Trend</p>
                </div>
            </div>
            <div className="relative flex-1 min-h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts?.revenue || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `Rs.${value/1000}k`} />
                        <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) => [formatPrice(value), 'Revenue']}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
