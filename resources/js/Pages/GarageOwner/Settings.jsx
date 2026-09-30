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
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">System Settings</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Configure garage details and thermal bill appearance.</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <button type="button" onClick={submit} disabled={processing} className="px-5 py-2 bg-blue-600 text-white text-xs font-black rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-50 whitespace-nowrap">
                        {processing ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            }
        >
            <Head title="System Settings" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6">

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
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Garage System Logo</label>

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

                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
