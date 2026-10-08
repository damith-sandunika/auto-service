import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SearchableSelect from '@/Components/SearchableSelect';

export default function VehicleMasterIndex({ makes }) {
    const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
    const [selectedMake, setSelectedMake] = useState(null);

    const makeForm = useForm({
        name: '',
    });

    const modelForm = useForm({
        make_id: '',
        name: '',
        type: '',
    });

    const openMakeModal = () => {
        makeForm.clearErrors();
        makeForm.reset();
        setIsMakeModalOpen(true);
    };

    const openModelModal = (make = null) => {
        modelForm.clearErrors();
        modelForm.reset();
        if (make) {
            modelForm.setData('make_id', make.id);
        }
        setIsModelModalOpen(true);
    };

    const closeMakeModal = () => setIsMakeModalOpen(false);
    const closeModelModal = () => setIsModelModalOpen(false);

    const submitMake = (e) => {
        e.preventDefault();
        makeForm.post(route('admin.vehicle-master.makes.store'), {
            onSuccess: () => closeMakeModal(),
        });
    };

    const submitModel = (e) => {
        e.preventDefault();
        modelForm.post(route('admin.vehicle-master.models.store'), {
            onSuccess: () => closeModelModal(),
        });
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center w-full">
                <span>Vehicle Master Data (Makes & Models)</span>
                <div className="flex gap-3">
                    <button onClick={openMakeModal} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-emerald-500/20">
                        + Add Make
                    </button>
                    <button onClick={() => openModelModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-blue-500/20">
                        + Add Model
                    </button>
                </div>
            </div>
        }>
            <Head title="Vehicle Master Data" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Make / Brand</th>
                                    <th className="px-6 py-4">Models</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {makes && makes.length > 0 ? makes.map((make) => (
                                    <tr key={make.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-black text-slate-800">
                                            {make.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {make.models && make.models.length > 0 ? make.models.map(model => (
                                                    <span key={model.id} className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                        {model.name} {model.type ? `(${model.type})` : ''}
                                                    </span>
                                                )) : (
                                                    <span className="text-slate-400 font-medium">No models added</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openModelModal(make)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">+ Add Model</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-500 font-medium">
                                            No vehicle makes defined yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Make Modal */}
            <Modal show={isMakeModalOpen} onClose={closeMakeModal} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Add Vehicle Make</h2>
                    <form onSubmit={submitMake} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="make_name" value="Make / Brand Name" />
                            <TextInput
                                id="make_name"
                                type="text"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800"
                                value={makeForm.data.name}
                                onChange={(e) => makeForm.setData('name', e.target.value)}
                                placeholder="e.g. Toyota, Honda, Ford"
                            />
                            <InputError message={makeForm.errors.name} className="mt-2" />
                        </div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeMakeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">Cancel</button>
                            <button type="submit" disabled={makeForm.processing} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50">Save Make</button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Add Model Modal */}
            <Modal show={isModelModalOpen} onClose={closeModelModal} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Add Vehicle Model</h2>
                    <form onSubmit={submitModel} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="make_id" value="Select Make / Brand" />
                            <SearchableSelect
                                value={modelForm.data.make_id}
                                onChange={(e) => modelForm.setData('make_id', e.target.value)}
                                options={makes || []}
                                placeholder="-- Select Make --"
                            />
                            <InputError message={modelForm.errors.make_id} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="model_name" value="Model Name" />
                            <TextInput
                                id="model_name"
                                type="text"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800"
                                value={modelForm.data.name}
                                onChange={(e) => modelForm.setData('name', e.target.value)}
                                placeholder="e.g. Corolla, Civic, Ranger"
                            />
                            <InputError message={modelForm.errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="model_type" value="Vehicle Type (Optional)" />
                            <TextInput
                                id="model_type"
                                type="text"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800"
                                value={modelForm.data.type}
                                onChange={(e) => modelForm.setData('type', e.target.value)}
                                placeholder="e.g. Sedan, SUV, Truck"
                            />
                            <InputError message={modelForm.errors.type} className="mt-2" />
                        </div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeModelModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">Cancel</button>
                            <button type="submit" disabled={modelForm.processing} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50">Save Model</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
