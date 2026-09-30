import React from 'react';

export default function ThermalPreview({ settings, originalLogo, realData = null, isPreview = true }) {
    // Sample preview data
    const data = realData || {
        invoice_no: 'INV-10204',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        customer_name: 'John Doe',
        vehicle_no: 'WP ABC-1234',
        items: [
            { desc: 'Engine Oil Change', qty: 1, price: 5500 },
            { desc: 'Brake Pads', qty: 1, price: 8500 },
            { desc: 'Labor Charge', qty: 1, price: 3000 },
        ],
        subtotal: 17000,
        discount: 0,
        total: 17000,
        paid: 17000,
        balance: 0,
        payment_method: 'CASH'
    };

    const width = settings?.paper_width || '80mm';

    return (
        <div 
            className={`mx-auto bg-white text-black relative ${isPreview ? 'shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-200 mb-8 rounded-t-lg' : 'print:m-0 print:p-0'}`}
            style={{ width: width, padding: '4mm 4mm 10mm 4mm', fontSize: '12px', minHeight: isPreview ? 'auto' : '100vh', fontFamily: "Arial, Helvetica, sans-serif", lineHeight: '1.4' }}
        >
            {/* Header & Logo */}
            <div className="text-center mb-3">
                {settings?.show_logo && originalLogo && (
                    <img src={originalLogo} alt="Logo" style={{ 
                        maxWidth: settings?.logo_size && !isNaN(settings.logo_size) ? `${settings.logo_size}px` : 
                                  settings?.logo_size === 'small' ? (width === '58mm' ? '60px' : '80px') : 
                                  settings?.logo_size === 'large' ? (width === '58mm' ? '140px' : '200px') : 
                                  (width === '58mm' ? '100px' : '140px'), 
                        height: 'auto', display: 'inline-block', marginBottom: '8px' 
                    }} />
                )}
                
                <div style={{ fontSize: '18px', letterSpacing: '-0.03em', fontWeight: 900, marginBottom: '2px' }}>
                    {settings?.store_name || 'AUTO SERVICE'}
                </div>
                
                {settings?.tagline && (
                    <div style={{ fontSize: '11px', marginBottom: '2px', fontWeight: 600 }}>{settings.tagline}</div>
                )}
                
                {settings?.phone && (
                    <div style={{ fontSize: '11px' }}>📞 {settings.phone}</div>
                )}
                
                {settings?.email && (
                    <div style={{ fontSize: '11px' }}>✉️ {settings.email}</div>
                )}
                
                {settings?.address && (
                    <div className="whitespace-pre-wrap" style={{ fontSize: '11px' }}>{settings.address}</div>
                )}
            </div>

            <div style={{ borderTop: '1.5px dashed #000', margin: '8px 0' }}></div>

            {/* Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2.5px 0', gap: '4px', fontSize: '12px' }}>
                <span style={{ flex: 1, textAlign: 'left' }}>INV No:</span>
                <span style={{ fontWeight: 800, textAlign: 'right' }}>#{data.invoice_no}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2.5px 0', gap: '4px', fontSize: '12px' }}>
                <span style={{ flex: 1, textAlign: 'left' }}>Date:</span>
                <span style={{ fontWeight: 800, textAlign: 'right' }}>{data.date} {data.time}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2.5px 0', gap: '4px', fontSize: '12px' }}>
                <span style={{ flex: 1, textAlign: 'left' }}>Vehicle:</span>
                <span style={{ fontWeight: 800, textAlign: 'right' }}>{data.vehicle_no || '-'}</span>
            </div>
            {data.customer_name && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2.5px 0', gap: '4px', fontSize: '12px' }}>
                    <span style={{ flex: 1, textAlign: 'left' }}>Customer:</span>
                    <span style={{ fontWeight: 800, textAlign: 'right' }}>{data.customer_name}</span>
                </div>
            )}

            <div style={{ borderTop: '1.5px dashed #000', margin: '8px 0' }}></div>

            {/* Items */}
            {data.items.map((item, i) => (
                <div key={i} style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 700, fontSize: '12px', display: 'block', wordBreak: 'break-word' }}>{item.desc}</span>
                        <span style={{ fontWeight: 800 }}>Rs.{(item.qty * parseFloat(item.price)).toFixed(2)}</span>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                        {item.qty} x Rs.{parseFloat(item.price).toFixed(2)}
                    </div>
                </div>
            ))}
            
            {data.items.length === 0 && (
                <div className="text-center text-xs my-1 italic">No Items</div>
            )}

            <div style={{ borderTop: '1.5px dashed #000', margin: '8px 0' }}></div>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', fontWeight: 700, fontSize: '13px', borderTop: '2px solid #000', paddingTop: '6px', marginTop: '4px' }}>
                <span>Subtotal</span>
                <span>Rs.{parseFloat(data.subtotal).toFixed(2)}</span>
            </div>
            
            {data.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', fontWeight: 700, fontSize: '13px', color: '#666' }}>
                    <span>Discount</span>
                    <span>- Rs.{parseFloat(data.discount).toFixed(2)}</span>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', gap: '4px', fontWeight: 900, fontSize: '16px', borderTop: '1px solid #000', paddingTop: '4px', marginTop: '2px' }}>
                <span>TOTAL</span>
                <span>Rs.{parseFloat(data.total).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontSize: '12px' }}>
                <span>Payment ({data.payment_method})</span>
                <span>Rs.{parseFloat(data.paid).toFixed(2)}</span>
            </div>

            {data.balance > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontSize: '12px', fontWeight: 800 }}>
                    <span>Balance Due</span>
                    <span>Rs.{parseFloat(data.balance).toFixed(2)}</span>
                </div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontSize: '12px', fontWeight: 800 }}>
                    <span>Change</span>
                    <span>Rs.{Math.abs(parseFloat(data.balance)).toFixed(2)}</span>
                </div>
            )}

            <div style={{ textAlign: 'center', margin: '12px 0' }}>
                <span style={{ display: 'inline-block', border: '1.5px solid #000', padding: '4px 10px', fontSize: '12px', fontWeight: 800, borderRadius: '4px' }}>
                    {data.balance <= 0 ? '✓ PAID IN FULL' : '🕒 BALANCE DUE'}
                </span>
            </div>

            <div style={{ borderTop: '1.5px dashed #000', margin: '8px 0' }}></div>
            
            {settings?.footer_message_1 && (
                <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', marginTop: '8px' }}>
                    {settings.footer_message_1}
                </div>
            )}
            
            <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 900, marginTop: '10px', color: '#555' }}>
                Powered by DSRZone
            </div>

            {isPreview && (
                <div className="absolute bottom-0 left-0 right-0 h-3" style={{ backgroundImage: 'linear-gradient(135deg, transparent 50%, #fff 50%), linear-gradient(45deg, #fff 50%, transparent 50%)', backgroundSize: '10px 10px', marginBottom: '-10px' }}></div>
            )}
        </div>
    );
}
