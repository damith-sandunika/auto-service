import React from 'react';

export default function InvoicePreview({ settings, originalLogo, realData = null, isPreview = true }) {
    // A sample preview data
    const data = realData || {
        invoice_no: '10204',
        date: new Date().toLocaleDateString(),
        customer_name: 'John Doe',
        vehicle_no: 'WP ABC-1234',
        items: [
            { desc: 'Engine Oil Change', qty: 1, price: 5500 },
            { desc: 'Brake Pads Replacement', qty: 1, price: 8500 },
            { desc: 'Labor Charge', qty: 1, price: 3000 },
        ],
        subtotal: 17000,
        discount: 1000,
        tax: 500,
        total: 16500
    };

    return (
        <div className={`bg-white relative mx-auto ${isPreview ? 'shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-200 rounded-xl mb-8' : 'print:m-0 print:p-0'}`} style={{ width: '210mm', minHeight: isPreview ? 'auto' : '297mm', padding: '15mm', color: settings?.text_color || '#333' }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 pb-6" style={{ borderColor: settings.primary_color }}>
                <div className="flex gap-4 items-center">
                    {originalLogo && (
                        <img src={originalLogo} alt="Logo" className="object-contain" style={{ 
                            width: settings?.logo_size && !isNaN(settings.logo_size) ? `${settings.logo_size}px` : 
                                   settings?.logo_size === 'small' ? '48px' : 
                                   settings?.logo_size === 'large' ? '128px' : '80px',
                            maxHeight: settings?.logo_size && !isNaN(settings.logo_size) ? `${settings.logo_size}px` : '128px'
                        }} />
                    )}
                    <div>
                        <h1 className="font-black" style={{ color: settings.primary_color, fontSize: `${parseInt(settings.heading_size) || 24}px` }}>
                            {settings.business_name || 'Your Garage Name'}
                        </h1>
                        <p className="font-semibold opacity-80 mt-1 whitespace-pre-wrap" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>{settings.address}</p>
                        <p className="font-semibold opacity-80" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>{settings.phone} | {settings.email}</p>
                        {settings.tax_number && <p className="font-semibold opacity-80" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>Tax No: {settings.tax_number}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-black uppercase tracking-widest" style={{ color: settings?.primary_color || '#2563eb' }}>ORDER</h2>
                    <p className="font-bold mt-2" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>#{data.invoice_no}</p>
                    <p style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>Date: {data.date}</p>
                </div>
            </div>

            {/* Bill To */}
            <div className="mt-8 flex justify-between">
                <div>
                    <p className="font-bold uppercase tracking-wider mb-2 opacity-60" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>Bill To:</p>
                    <p className="font-bold" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>{data.customer_name}</p>
                    <p style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>Vehicle: {data.vehicle_no}</p>
                </div>
            </div>

            {/* Items Table */}
            <div className="mt-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: settings.primary_color, color: '#fff' }}>
                            <th className="p-3 font-bold w-12 text-center" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>#</th>
                            <th className="p-3 font-bold" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>Description</th>
                            <th className="p-3 font-bold text-center" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>Qty</th>
                            <th className="p-3 font-bold text-right" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>Price</th>
                            <th className="p-3 font-bold text-right" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, i) => (
                            <tr key={i} className="border-b" style={{ borderColor: '#eee' }}>
                                <td className="p-3 font-medium text-center text-slate-500" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>{i + 1}</td>
                                <td className="p-3 font-medium" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>{item.desc}</td>
                                <td className="p-3 font-medium text-center" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>{item.qty}</td>
                                <td className="p-3 font-medium text-right" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>{parseFloat(item.price).toFixed(2)}</td>
                                <td className="p-3 font-bold text-right" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>{(item.qty * parseFloat(item.price)).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
                <div className="w-1/2 p-4 rounded-xl border flex flex-col gap-2" style={{ backgroundColor: settings?.secondary_color || '#f8fafc', borderColor: '#eee' }}>
                    
                    {(data.discount > 0 || data.tax > 0 || data.subtotal) && (
                        <div className="flex justify-between items-center font-bold text-slate-600 border-b pb-2 mb-1" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                            <span>Subtotal</span>
                            <span>{parseFloat(data.subtotal || data.total).toFixed(2)}</span>
                        </div>
                    )}
                    
                    {data.discount > 0 && (
                        <div className="flex justify-between items-center font-bold text-slate-500">
                            <span>Discount</span>
                            <span className="text-red-500">- {parseFloat(data.discount).toFixed(2)}</span>
                        </div>
                    )}

                    {data.tax > 0 && (
                        <div className="flex justify-between items-center font-bold text-slate-500">
                            <span>Tax</span>
                            <span>+ {parseFloat(data.tax).toFixed(2)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center font-black text-xl pt-1" style={{ color: settings?.primary_color || '#2563eb' }}>
                        <span>TOTAL</span>
                        <span>LKR {parseFloat(data.total).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16">
                <div className="border-t-2 pt-4 flex justify-between items-start" style={{ borderColor: settings.primary_color }}>
                    <div className="w-2/3 pr-4">
                        <p className="font-bold" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>Terms & Conditions:</p>
                        <p className="font-medium opacity-80 whitespace-pre-wrap mt-1" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>
                            {settings.terms_and_conditions || 'Thank you for your business. Please process payment within the stipulated timeframe.'}
                        </p>
                    </div>
                    <div className="w-1/3 text-right flex flex-col justify-between h-full min-h-[60px]">
                        <p className="font-bold opacity-60" style={{ fontSize: `${parseInt(settings.text_size) || 14}px` }}>{settings.footer_text || 'System generated invoice.'}</p>
                        <p className="text-[10px] font-black text-slate-400 tracking-wider mt-auto pt-4">POWERED BY DSRZONE</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
