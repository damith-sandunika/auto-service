import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import ThermalPreview from '@/Components/Invoice/ThermalPreview';

export default function ThermalSettings({ settings }) {
    let parsedLogoSize = parseInt(settings.logo_size) || 100;
    if (settings.logo_size === 'small') parsedLogoSize = 60;
    if (settings.logo_size === 'medium') parsedLogoSize = 100;
    if (settings.logo_size === 'large') parsedLogoSize = 140;

    const { data, setData, post, processing, recentlySuccessful } = useForm({
        store_name: settings.store_name || '',
        tagline: settings.tagline || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        show_logo: settings.show_logo ?? true,
        logo_size: parsedLogoSize,
        paper_width: settings.paper_width || '80mm',
        footer_message_1: settings.footer_message_1 || '',
        logo: null,
    });

    const logoPreviewUrl = data.logo ? URL.createObjectURL(data.logo) : settings.logo_url;

    const submit = (e) => {
        e.preventDefault();
        post(route('owner.settings.thermal.update'), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout 
            header={<h2 className="text-xl font-black">Thermal Bill Settings</h2>}
            headerActions={
                <button type="submit" form="thermal-settings-form" disabled={processing} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]">
                    {recentlySuccessful ? '✓ Saved Successfully' : 'Save Settings'}
                </button>
            }
        >
            <Head title="Thermal Settings" />
            <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-10">
                
                {/* Editor Settings (Left) */}
                <div className="w-full lg:w-5/12 xl:w-1/2 shrink-0">
                    <form id="thermal-settings-form" onSubmit={submit} className="space-y-8 pr-4">
                        
                        <div>
                            <h3 className="font-black text-xl text-slate-800 mb-4">Store Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Store / Garage Name</label>
                                    <input type="text" className="w-full text-sm border-slate-300 rounded-lg mt-1" value={data.store_name} onChange={e => setData('store_name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tagline (Optional)</label>
                                    <input type="text" className="w-full text-sm border-slate-300 rounded-lg mt-1" value={data.tagline} onChange={e => setData('tagline', e.target.value)} />
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
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-black text-xl text-slate-800 mb-4">Print Options</h3>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-lg bg-white shadow-sm hover:bg-slate-50 transition-colors">
                                    <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={data.show_logo} onChange={e => setData('show_logo', e.target.checked)} />
                                    <span className="text-sm font-bold text-slate-700">Print Logo on top of the bill</span>
                                </label>
                                {data.show_logo && (
                                    <div className="grid grid-cols-2 gap-4">
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
                                )}
                                <div className="pt-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Paper Width</label>
                                    <select className="w-full text-sm rounded-lg mt-1" value={data.paper_width} onChange={e => setData('paper_width', e.target.value)}>
                                        <option value="80mm">80mm (Standard POS Receipt)</option>
                                        <option value="58mm">58mm (Small POS Receipt)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-black text-xl text-slate-800 mb-4">Footer Message</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Thank You Note</label>
                                    <input type="text" className="w-full text-sm border-slate-300 rounded-lg mt-1" value={data.footer_message_1} onChange={e => setData('footer_message_1', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Live Preview (Right) */}
                <div className="w-full lg:w-7/12 xl:w-1/2 flex justify-center items-start pt-6 lg:pt-0 overflow-x-auto pb-10">
                    <div className="mt-8 flex justify-center">
                        <ThermalPreview settings={data} originalLogo={logoPreviewUrl} />
                    </div>
                </div>
                
            </div>
        </AuthenticatedLayout>
    );
}
