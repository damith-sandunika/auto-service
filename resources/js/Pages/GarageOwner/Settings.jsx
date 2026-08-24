import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import InputError from '@/Components/InputError';

export default function Settings({ garage, auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: garage?.name || '',
        address: garage?.address || '',
        phone: garage?.phone || '',
        tagline: garage?.tagline || '',
        logo_size: garage?.logo_size || 140,
        logo: null
    });
    
    const [previewUrl, setPreviewUrl] = useState(garage?.logo_path ? `/storage/${garage.logo_path}` : null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState('');

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setFileName(file.name);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            fileInputRef.current.files = e.dataTransfer.files;
            setData('logo', file);
            setFileName(file.name);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('owner.settings.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">System Settings</h2>} fullWidth={true}>
            <Head title="System Settings" />
            
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">System Settings</h2>
                        <p className="text-sm text-gray-500 mt-1">Configure garage details and thermal bill appearance.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Premium Horizontally Scrollable Tab Header */}
                    <div className="p-3 border-b border-gray-100 bg-gray-50/50 overflow-x-auto scrollbar-hide">
                        <div className="flex gap-2 w-max bg-gray-200/50 p-1 rounded-xl">
                            <button className="px-5 py-2 text-sm font-bold rounded-lg bg-white text-blue-700 shadow-sm ring-1 ring-gray-200/50 transition-all duration-200">
                                General Settings
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={submit} className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 space-y-5 max-w-xl">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Garage / Business Name</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className="w-full text-sm border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500" />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Address</label>
                                    <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} required className="w-full text-sm border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500" />
                                    <InputError message={errors.address} className="mt-1" />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Telephone Number</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} required className="w-full text-sm border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500" />
                                    <InputError message={errors.phone} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tagline (Will appear on print bills)</label>
                                    <input type="text" value={data.tagline} onChange={e => setData('tagline', e.target.value)} className="w-full text-sm border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500" />
                                    <InputError message={errors.tagline} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Thermal Bill Logo</label>
                                    
                                    <div 
                                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current.click()}
                                        className={`relative flex flex-col items-center justify-center w-full h-36 border-2 rounded-xl cursor-pointer transition-colors group mb-4 ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                                    >
                                        <input ref={fileInputRef} type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleLogoChange} />
                                        
                                        {!previewUrl ? (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="w-8 h-8 mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="mb-1 text-sm text-gray-500"><span className="font-bold text-gray-700">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-gray-400">PNG, JPG (Recommended: Black & White)</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-2 h-full w-full">
                                                <img src={previewUrl} alt="Preview" className="h-20 object-contain mb-2" style={{ filter: 'grayscale(100%) contrast(1.2)' }} />
                                                <p className="text-xs font-bold text-blue-600 truncate max-w-[80%]">{fileName || 'Current Active Logo'}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5 group-hover:text-gray-500">Click or drag to replace</p>
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.logo} className="mt-1" />

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-semibold text-gray-700 uppercase">Logo Size</label>
                                            <span className="text-xs font-bold text-blue-600">{data.logo_size}px</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            value={data.logo_size} 
                                            onChange={e => setData('logo_size', e.target.value)} 
                                            min="20" max="300" 
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Adjust to scale the logo appropriately on the thermal bill.</p>
                                    </div>
                                </div>

                                <button type="submit" disabled={processing} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 mt-4">
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>

                            {/* Thermal Bill Preview */}
                            <div className="flex-1 max-w-sm ml-0 lg:ml-12">
                                <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">Live Thermal Bill Preview</h4>
                                
                                <div className="bg-white mx-auto shadow-[0_10px_30px_rgba(0,0,0,0.1)] relative" style={{ width: '74mm', padding: '4mm 3mm', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", fontSize: '12px', color: '#000', minHeight: '400px' }}>
                                    {/* Jagged top edge effect */}
                                    <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundImage: 'linear-gradient(135deg, transparent 50%, #fff 50%), linear-gradient(45deg, #fff 50%, transparent 50%)', backgroundSize: '8px 8px', backgroundPosition: '0 -4px', transform: 'rotate(180deg)', marginTop: '-8px' }}></div>
                                    
                                    {/* Header */}
                                    <div className="text-center" style={{ marginBottom: '12px' }}>
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Logo" style={{ maxWidth: `${data.logo_size}px`, height: 'auto', filter: 'grayscale(100%) contrast(1.2)', display: 'inline-block' }} />
                                        ) : (
                                            <div className="text-xs text-gray-400 italic py-2">No Logo</div>
                                        )}
                                    </div>
                                    
                                    <div className="text-center" style={{ fontSize: '18px', letterSpacing: '-0.03em', fontWeight: 800, marginBottom: '2px' }}>
                                        {data.name || 'AUTO SERVICE'}
                                    </div>
                                    
                                    {data.tagline && (
                                        <div className="text-center" style={{ fontSize: '10px', marginBottom: '2px' }}>{data.tagline}</div>
                                    )}
                                    
                                    {data.phone && (
                                        <div className="text-center" style={{ fontSize: '10px' }}>📞 {data.phone}</div>
                                    )}
                                    
                                    {data.address && (
                                        <div className="text-center" style={{ fontSize: '10px' }}>{data.address}</div>
                                    )}

                                    <div style={{ borderTop: '1.5px dashed #000', margin: '8px 0' }}></div>

                                    {/* Details */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', fontSize: '12px' }}>
                                        <span style={{ flex: 1, textAlign: 'left' }}>Bill No:</span>
                                        <span style={{ fontWeight: 800, textAlign: 'right' }}>ORD-9999</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', fontSize: '12px' }}>
                                        <span style={{ flex: 1, textAlign: 'left' }}>Date:</span>
                                        <span style={{ fontWeight: 800, textAlign: 'right' }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', fontSize: '12px' }}>
                                        <span style={{ flex: 1, textAlign: 'left' }}>Vehicle:</span>
                                        <span style={{ fontWeight: 800, textAlign: 'right' }}>XYZ-1234</span>
                                    </div>

                                    <div style={{ borderTop: '1.5px dashed #000', margin: '8px 0' }}></div>

                                    {/* Sample Items */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', marginBottom: '2px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '12px', display: 'block', wordBreak: 'break-word' }}>Full Engine Service</span>
                                        <span style={{ fontWeight: 800 }}>Rs.12,000.00</span>
                                    </div>
                                    <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                                        1 x Rs.12,000.00
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', marginBottom: '2px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '12px', display: 'block', wordBreak: 'break-word' }}>Engine Oil</span>
                                        <span style={{ fontWeight: 800 }}>Rs.4,500.00</span>
                                    </div>
                                    <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                                        3 x Rs.1,500.00
                                    </div>

                                    <div style={{ borderTop: '1.5px dashed #000', margin: '8px 0' }}></div>

                                    {/* Totals */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: '4px', fontWeight: 900, fontSize: '15px', borderTop: '2px solid #000', paddingTop: '6px', marginTop: '6px' }}>
                                        <span>TOTAL</span>
                                        <span>Rs.16,500.00</span>
                                    </div>

                                    <div style={{ textAlign: 'center', margin: '8px 0' }}>
                                        <span style={{ display: 'inline-block', border: '1.5px solid #000', padding: '4px 10px', marginTop: '6px', fontSize: '12px', fontWeight: 800, borderRadius: '6px' }}>
                                            ✓ PAID IN FULL
                                        </span>
                                    </div>

                                    <div style={{ borderTop: '1.5px dashed #000', margin: '8px 0' }}></div>
                                    
                                    <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', marginTop: '8px' }}>
                                        Thank you! Drive safely
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '8px' }}>
                                        Powered by DSRZone
                                    </div>

                                    {/* Jagged bottom edge effect */}
                                    <div className="absolute bottom-0 left-0 right-0 h-2" style={{ backgroundImage: 'linear-gradient(135deg, transparent 50%, #fff 50%), linear-gradient(45deg, #fff 50%, transparent 50%)', backgroundSize: '8px 8px', marginBottom: '-8px' }}></div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
