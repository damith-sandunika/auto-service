import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import InvoicePreview from '@/Components/Invoice/InvoicePreview';

export default function PrintInvoice({ invoice, settings }) {
    useEffect(() => { setTimeout(() => window.print(), 500); }, []);

    const garage = invoice.garage;
    const items = invoice.job?.items || [];
    const payments = invoice.payments || [];
    const totalPaid = payments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const balance = parseFloat(invoice.total_amount) - totalPaid;
    const isA4 = settings?.paper_size === 'A4';

    if (isA4) {
        const realData = {
            invoice_no: invoice.invoice_number || invoice.id,
            date: new Date(invoice.created_at).toLocaleDateString(), customer_name: invoice.job?.vehicle?.owner?.name || 'Walk-in Customer',
            vehicle_no: invoice.job?.vehicle?.vehicle_number || '-', items: items.map(i => ({ desc: i.description, qty: i.quantity, price: parseFloat(i.price) })),
            subtotal: parseFloat(invoice.total_amount) + parseFloat(invoice.discount || 0), discount: parseFloat(invoice.discount || 0), tax: parseFloat(invoice.tax || 0), total: parseFloat(invoice.total_amount)
        };
        return (
            <>
                <Head title={`Print Invoice #${invoice.id}`} />
                <div className="print:m-0 print:p-0 flex justify-center py-10 print:py-0"><InvoicePreview settings={settings} originalLogo={settings.logo_url || (garage?.logo_path ? '/tenant-media/'+garage.logo_path : null)} realData={realData} isPreview={false} /></div>
                <div className="no-print" style={{ marginTop: '24px', textAlign: 'center', paddingBottom: '40px' }}>
                    <button onClick={() => window.print()} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>🖨 Print Invoice</button>
                    <button onClick={() => window.close()} style={{ padding: '10px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', marginLeft: '12px' }}>Close Tab</button>
                </div>
                <style dangerouslySetInnerHTML={{__html: `@page { size: auto; margin: 0; } body { background: #f8fafc; } @media print { body { background: #fff; margin: 0; padding: 0; } nav, header, footer, aside, .no-print { display: none !important; } }`}} />
            </>
        );
    }

    return (
        <>
            <Head title={`Print Invoice #${invoice.id}`} />
            <div className="mx-auto bg-white text-black print:m-0 print:p-0 relative shadow-[0_10px_30px_rgba(0,0,0,0.1)] print:shadow-none" style={{ width: settings?.paper_width || '80mm', padding: '4mm 3mm', fontFamily: settings?.font_family === 'sans-serif' ? "'Inter', system-ui, -apple-system, sans-serif" : "'Courier New', Courier, monospace", fontSize: '12px', lineHeight: settings?.line_height || '1.4', minHeight: '400px' }} id="thermal-bill">
                <div className="absolute top-0 left-0 right-0 h-2 no-print" style={{ backgroundImage: 'linear-gradient(135deg, transparent 50%, #fff 50%), linear-gradient(45deg, #fff 50%, transparent 50%)', backgroundSize: '8px 8px', backgroundPosition: '0 -4px', transform: 'rotate(180deg)', marginTop: '-8px' }}></div>
                <div className="text-center" style={{ marginBottom: '12px' }}>{settings?.logo_url ? <img src={settings.logo_url} alt="Logo" style={{ maxWidth: `${settings?.logo_size || 140}px`, height: 'auto', display: 'inline-block' }} /> : garage?.logo_path ? <img src={`/tenant-media/${garage.logo_path}`} alt="Logo" style={{ maxWidth: `${settings?.logo_size || 140}px`, height: 'auto', display: 'inline-block' }} /> : null}</div>
                <div className="text-center" style={{ fontSize: '18px', letterSpacing: '-0.03em', fontWeight: 800, marginBottom: '2px' }}>{garage?.name || 'AUTO SERVICE'}</div>
                {garage?.tagline && <div className="text-center" style={{ fontSize: '10px', marginBottom: '2px' }}>{garage.tagline}</div>}
                {garage?.phone && <div className="text-center" style={{ fontSize: '10px' }}>📞 {garage.phone}</div>}
                {garage?.address && <div className="text-center whitespace-pre-wrap" style={{ fontSize: '10px' }}>{garage.address}</div>}
                <div style={{ borderTop: '1.5px dashed #000', margin: '8px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', fontSize: '12px' }}><span style={{ flex: 1, textAlign: 'left' }}>Order No:</span><span style={{ fontWeight: 800, textAlign: 'right' }}>{invoice.invoice_number || invoice.id}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', fontSize: '12px' }}><span style={{ flex: 1, textAlign: 'left' }}>Date:</span><span style={{ fontWeight: 800, textAlign: 'right' }}>{new Date(invoice.created_at).toLocaleDateString()} {new Date(invoice.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', fontSize: '12px' }}><span style={{ flex: 1, textAlign: 'left' }}>Vehicle:</span><span style={{ fontWeight: 800, textAlign: 'right' }}>{invoice.job?.vehicle?.vehicle_number || '-'}</span></div>
                <div style={{ borderTop: '1.5px dashed #000', margin: '8px 0' }}></div>
                {items.map(item => (
                    <div key={item.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', marginBottom: '2px' }}><span style={{ fontWeight: 700, fontSize: '12px', display: 'block', wordBreak: 'break-word' }}>{item.description}</span><span style={{ fontWeight: 800 }}>Rs.{(item.quantity * item.price).toFixed(2)}</span></div>
                        <div style={{ fontSize: '12px', marginBottom: '6px' }}>{item.quantity} x Rs.{parseFloat(item.price).toFixed(2)}</div>
                    </div>
                ))}
                {items.length === 0 && <div className="text-center text-xs my-2 italic">Standard Service Job</div>}
                <div style={{ borderTop: '1.5px dashed #000', margin: '8px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', fontWeight: 700, fontSize: '13px', borderTop: '2px solid #000', paddingTop: '6px', marginTop: '6px' }}><span>Subtotal</span><span>Rs.{(parseFloat(invoice.total_amount) + parseFloat(invoice.discount)).toFixed(2)}</span></div>
                {invoice.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', fontWeight: 700, fontSize: '13px', color: '#666' }}><span>Discount</span><span>- Rs.{parseFloat(invoice.discount).toFixed(2)}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', fontWeight: 900, fontSize: '15px', borderTop: '1px solid #000', paddingTop: '4px', marginTop: '2px' }}><span>TOTAL</span><span>Rs.{parseFloat(invoice.total_amount).toFixed(2)}</span></div>
                {payments.length > 0 ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontSize: '12px' }}><span>Payment ({payments[0].payment_method.toUpperCase()})</span><span>Rs.{totalPaid.toFixed(2)}</span></div>
                        {invoice.tendered_amount > 0 && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontSize: '12px' }}><span>Cash Tendered</span><span>Rs.{parseFloat(invoice.tendered_amount).toFixed(2)}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontSize: '12px', fontWeight: 800 }}><span>Change</span><span>Rs.{parseFloat(invoice.balance_amount).toFixed(2)}</span></div>
                            </>
                        )}
                        {balance > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontSize: '12px', fontWeight: 800 }}><span>Balance Due</span><span>Rs.{balance.toFixed(2)}</span></div>}
                    </>
                ) : <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontSize: '12px', fontWeight: 800 }}><span>Balance Due</span><span>Rs.{balance.toFixed(2)}</span></div>}
                <div style={{ textAlign: 'center', margin: '12px 0' }}><span style={{ display: 'inline-block', border: '1.5px solid #000', padding: '4px 10px', fontSize: '12px', fontWeight: 800, borderRadius: '6px' }}>{balance <= 0 ? '✓ PAID IN FULL' : '🕒 BALANCE DUE'}</span></div>
                <div style={{ borderTop: '1.5px dashed #000', margin: '8px 0' }}></div>
                {settings?.show_email && garage?.email && <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '4px' }}>{garage.email}</div>}
                <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', marginTop: '8px' }}>Thank you! Drive safely</div>
                <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>Powered by DSRZone</div>
                <div className="absolute bottom-0 left-0 right-0 h-2 no-print" style={{ backgroundImage: 'linear-gradient(135deg, transparent 50%, #fff 50%), linear-gradient(45deg, #fff 50%, transparent 50%)', backgroundSize: '8px 8px', marginBottom: '-8px' }}></div>
            </div>
            <div className="no-print" style={{ marginTop: '24px', textAlign: 'center' }}>
                <button onClick={() => window.print()} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>🖨 Print Bill</button>
                <button onClick={() => window.close()} style={{ padding: '10px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', marginLeft: '12px' }}>Close Tab</button>
            </div>
            <style dangerouslySetInnerHTML={{__html: `@page { margin: 0; size: 80mm auto; } body { margin: 0; background: #f8fafc; } @media print { body { background: #fff; } nav, header, footer, aside, .no-print { display: none !important; } #thermal-bill { width: 100% !important; margin: 0 !important; box-shadow: none !important; } }`}} />
        </>
    );
}

