import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InvoicePreview from '@/Components/Invoice/InvoicePreview';

export default function InvoiceSettings({ settings }) {
    let parsedHeadingSize = parseInt(settings.heading_size) || 24;
    if (settings.heading_size === 'text-xl') parsedHeadingSize = 20;
    if (settings.heading_size === 'text-2xl') parsedHeadingSize = 24;
    if (settings.heading_size === 'text-3xl') parsedHeadingSize = 30;
    if (settings.heading_size === 'text-4xl') parsedHeadingSize = 36;

    let parsedTextSize = parseInt(settings.text_size) || 14;
    if (settings.text_size === 'text-xs') parsedTextSize = 12;
    if (settings.text_size === 'text-sm') parsedTextSize = 14;
    if (settings.text_size === 'text-base') parsedTextSize = 16;

    let parsedLogoSize = parseInt(settings.logo_size) || 100;
    if (settings.logo_size === 'small') parsedLogoSize = 60;
    if (settings.logo_size === 'medium') parsedLogoSize = 100;
    if (settings.logo_size === 'large') parsedLogoSize = 140;

    const { data, setData, post, processing, recentlySuccessful } = useForm({
        business_name: settings.business_name || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        tax_number: settings.tax_number || '',
        primary_color: settings.primary_color || '#2563eb',
        secondary_color: settings.secondary_color || '#f8fafc',
        text_color: settings.text_color || '#334155',
        heading_size: parsedHeadingSize,
        text_size: parsedTextSize,
        footer_text: settings.footer_text || '',
        terms_and_conditions: settings.terms_and_conditions || '',
        paper_size: settings.paper_size || 'A4',
        logo_size: parsedLogoSize,
        logo: null,
    });

    const logoPreviewUrl = data.logo ? URL.createObjectURL(data.logo) : settings.logo_url;

    const submit = (e) => {
        e.preventDefault();
        post(route('owner.settings.invoice.update'), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout 
            header={
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Invoice Template Settings</h1>
                        <p className="text-xs md:text-sm font-bold text-blue-600 mt-1">Configure your invoice design and appearance</p>
                    </div>
                </div>
            }
            headerActions={
                <button type="submit" form="invoice-settings-form" disabled={processing} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]">
                    {recentlySuccessful ? '✓ Saved Successfully' : 'Save Settings'}
                </button>
            }
        >
            <Head title="Invoice Settings" />
            <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-10">
                
                {/* Editor Settings (Left) */}
                <div className="w-full lg:w-5/12 xl:w-1/2 shrink-0">
                    <form id="invoice-settings-form" onSubmit={submit} className="space-y-8 pr-4">
                        
                        <div>
                            <h3 className="font-black text-xl text-slate-800 mb-4">Business Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Business Name</label>
                                    <input type="text" className="w-full text-sm border-slate-300 rounded-lg mt-1" value={data.business_name} onChange={e => setData('business_name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                                    <textarea className="w-full text-sm border-slate-300 rounded-lg mt-1" rows="2" value={data.address} onChange={e => setData('address', e.target.value)}></textarea>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Phone & Email</label>
                                    <div className="flex gap-2 mt-1">
                                        <input type="text" className="w-1/2 text-sm border-slate-300 rounded-lg" placeholder="Phone" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                        <input type="email" className="w-1/2 text-sm border-slate-300 rounded-lg" placeholder="Email" value={data.email} onChange={e => setData('email', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tax / Reg Number</label>
                                    <input type="text" className="w-full text-sm border-slate-300 rounded-lg mt-1" value={data.tax_number} onChange={e => setData('tax_number', e.target.value)} />
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-black text-xl text-slate-800 mb-4">Design & Colors</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Primary Color</label>
                                    <input type="color" className="w-full h-10 rounded-lg cursor-pointer mt-1" value={data.primary_color} onChange={e => setData('primary_color', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Text Color</label>
                                    <input type="color" className="w-full h-10 rounded-lg cursor-pointer mt-1" value={data.text_color} onChange={e => setData('text_color', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                                        <span>Heading Size</span>
                                        <span className="text-blue-600">{data.heading_size}px</span>
                                    </label>
                                    <input type="range" min="16" max="60" className="w-full mt-2 accent-blue-600" value={data.heading_size} onChange={e => setData('heading_size', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                                        <span>Text Size</span>
                                        <span className="text-blue-600">{data.text_size}px</span>
                                    </label>
                                    <input type="range" min="10" max="24" className="w-full mt-2 accent-blue-600" value={data.text_size} onChange={e => setData('text_size', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Custom Logo</label>
                                    <input type="file" accept="image/*" className="w-full text-sm border border-slate-300 rounded-lg mt-1 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer" onChange={e => setData('logo', e.target.files[0])} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                                        <span>Logo Size</span>
                                        <span className="text-blue-600">{data.logo_size}px</span>
                                    </label>
                                    <input type="range" min="30" max="300" className="w-full mt-2 accent-blue-600" value={data.logo_size} onChange={e => setData('logo_size', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-black text-xl text-slate-800 mb-4">Footer & Policies</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Terms & Conditions</label>
                                    <textarea className="w-full text-sm border-slate-300 rounded-lg mt-1" rows="3" value={data.terms_and_conditions} onChange={e => setData('terms_and_conditions', e.target.value)}></textarea>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Footer Note</label>
                                    <input type="text" className="w-full text-sm border-slate-300 rounded-lg mt-1" placeholder="e.g. Thank you for your business!" value={data.footer_text} onChange={e => setData('footer_text', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Live Preview (Right) */}
                <div className="w-full lg:w-7/12 xl:w-1/2 flex justify-center items-start pt-6 lg:pt-0 pb-20">
                    <div className="transform scale-[0.6] xl:scale-[0.65] origin-top mt-4 mb-[-20%] xl:mb-[-25%]">
                        <InvoicePreview settings={data} originalLogo={logoPreviewUrl} />
                    </div>
                </div>
                
            </div>
        </AuthenticatedLayout>
    );
}
