import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function LocationsModal({ show, onClose, locations = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        status: 'active'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('owner.inventory-locations.store'), {
            onSuccess: () => {
                reset();
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this location?')) {
            router.delete(route('owner.inventory-locations.destroy', id));
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-slate-800">Manage Stock Locations</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Add New Location */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4">Add New Location</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="loc_name" value="Location Name (e.g. Rack A1)" />
                                <TextInput id="loc_name" type="text" className="mt-1 block w-full bg-white border-slate-200" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                <InputError message={errors.name} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="loc_desc" value="Description (Optional)" />
                                <TextInput id="loc_desc" type="text" className="mt-1 block w-full bg-white border-slate-200" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                <InputError message={errors.description} className="mt-2" />
                            </div>
                            <button type="submit" disabled={processing} className="w-full mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50">
                                {processing ? 'Adding...' : 'Add Location'}
                            </button>
                        </form>
                    </div>

                    {/* Existing Locations */}
                    <div>
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4">Existing Locations</h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {locations.length === 0 ? (
                                <p className="text-sm font-bold text-slate-400 text-center py-4">No locations added yet.</p>
                            ) : (
                                locations.map(loc => (
                                    <div key={loc.id} className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center shadow-sm">
                                        <div>
                                            <p className="font-bold text-slate-800">{loc.name}</p>
                                            {loc.description && <p className="text-xs font-medium text-slate-500">{loc.description}</p>}
                                        </div>
                                        <button onClick={() => handleDelete(loc.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors" title="Delete Location">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
