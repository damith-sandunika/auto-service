import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import InputError from '@/Components/InputError';

export default function Settings({ company, garage, auth }) {
    const target = company || garage;
    const { data, setData, post, processing, errors } = useForm({
        name: target?.name || '',
        address: target?.address || '',
        phone: target?.phone || '',
        tagline: target?.tagline || '',
        logo: null
    });

    const [previewUrl, setPreviewUrl] = useState(target?.logo_path ? `/tenant-media/${target.logo_path}` : null);
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
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Company Settings</h1>
                        <p className="text-xs md:text-sm font-bold text-blue-600 mt-1">Configure corporate organization details, contact info, and branding</p>
                    </div>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <button type="button" onClick={submit} disabled={processing} className="px-5 py-2 bg-blue-600 text-white text-xs font-black rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-50 whitespace-nowrap">
                        {processing ? 'Saving...' : 'Save Company Settings'}
                    </button>
                </div>
            }
        >
            <Head title="Company Settings" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6">

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8">
                        <form onSubmit={submit} className="flex flex-col lg:flex-row gap-10">
                            {/* Left Column: Text Inputs */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 uppercase mb-2">Company / Organization Name</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className="w-full text-sm font-medium border-slate-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 shadow-sm px-4 py-2.5" />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-700 uppercase mb-2">Company Tagline (Optional)</label>
                                    <input type="text" value={data.tagline} onChange={e => setData('tagline', e.target.value)} className="w-full text-sm font-medium border-slate-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 shadow-sm px-4 py-2.5" placeholder="e.g. Total Automobile Solutions" />
                                    <InputError message={errors.tagline} className="mt-1" />
                                </div>
                            </div>

                            {/* Right Column: Logo Upload */}
                            <div className="w-full lg:w-1/3 xl:w-1/4 shrink-0">
                                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Company Corporate Logo</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 h-[230px] flex flex-col">
                                    <div
                                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current.click()}
                                        className={`relative flex-1 flex flex-col items-center justify-center w-full border-2 rounded-xl cursor-pointer transition-colors group ${dragOver ? 'border-blue-500 bg-blue-100/50' : 'border-dashed border-slate-300 bg-white hover:bg-slate-100'}`}
                                    >
                                        <input ref={fileInputRef} type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleLogoChange} />

                                        {!previewUrl ? (
                                            <div className="flex flex-col items-center justify-center p-4 text-center">
                                                <svg className="w-8 h-8 mb-3 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="mb-1 text-xs text-slate-500"><span className="font-bold text-slate-700">Click to upload</span> or drag</p>
                                                <p className="text-[10px] font-bold text-slate-400">PNG, JPG (B&W recommended)</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4 h-full w-full">
                                                <img src={previewUrl} alt="Preview" className="h-24 object-contain mb-3 drop-shadow-sm" style={{ filter: 'grayscale(100%) contrast(1.2)' }} />
                                                <p className="text-xs font-bold text-blue-600 truncate w-[90%] text-center">{fileName || 'Current Active Logo'}</p>
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.logo} className="mt-1 text-center" />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

