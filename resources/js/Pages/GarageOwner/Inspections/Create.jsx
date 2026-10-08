import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import SearchableSelect from '@/Components/SearchableSelect';

export default function InspectionsCreate({ vehicles }) {
    const { data, setData, post, processing, errors } = useForm({
        vehicle_id: '',
        inspection_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: [
            { category: 'Exterior', item_name: 'Body Panels', condition: 'good', remarks: '' },
            { category: 'Exterior', item_name: 'Glass & Mirrors', condition: 'good', remarks: '' },
            { category: 'Tires & Brakes', item_name: 'Front Tires', condition: 'good', remarks: '' },
            { category: 'Tires & Brakes', item_name: 'Rear Tires', condition: 'good', remarks: '' },
            { category: 'Tires & Brakes', item_name: 'Brake Pads', condition: 'good', remarks: '' },
            { category: 'Under Hood', item_name: 'Engine Oil Level', condition: 'good', remarks: '' },
            { category: 'Under Hood', item_name: 'Battery Health', condition: 'good', remarks: '' },
            { category: 'Under Hood', item_name: 'Coolant Level', condition: 'good', remarks: '' },
            { category: 'Interior', item_name: 'Dashboard Lights', condition: 'good', remarks: '' },
            { category: 'Interior', item_name: 'AC / Heating', condition: 'good', remarks: '' },
        ],
    });

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const submitForm = (e) => {
        e.preventDefault();
        post(route('owner.inspections.store'));
    };

    // Group items by category
    const groupedItems = data.items.reduce((acc, item, index) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push({ ...item, originalIndex: index });
        return acc;
    }, {});

    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">New Vehicle Inspection</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Complete the digital checklist</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <Link href={route('owner.inspections.index')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg font-black transition-all text-xs whitespace-nowrap">
                        Cancel & Back
                    </Link>
                </div>
            }
        >
            <Head title="New Inspection" />

            <div className="w-full max-w-4xl mx-auto py-6 px-2 sm:px-4 lg:px-6">
                <form onSubmit={submitForm} className="space-y-6">
                    
                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel value="Vehicle" />
                                <SearchableSelect 
                                    className="mt-1"
                                    value={data.vehicle_id}
                                    onChange={e => setData('vehicle_id', e.target.value)}
                                    options={vehicles.map(v => ({ value: v.id, label: `${v.vehicle_number} - ${v.make} ${v.model}` }))}
                                    placeholder="Select Vehicle"
                                />
                                <InputError message={errors.vehicle_id} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel value="Inspection Date" />
                                <TextInput 
                                    type="date"
                                    className="w-full mt-1"
                                    value={data.inspection_date}
                                    onChange={e => setData('inspection_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.inspection_date} className="mt-1" />
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel value="General Notes (Optional)" />
                                <TextInput 
                                    className="w-full mt-1"
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    placeholder="Customer complaints, overall condition, etc."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Checklist */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Digital Checklist</h3>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {Object.entries(groupedItems).map(([category, items]) => (
                                <div key={category} className="p-6">
                                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">{category}</h4>
                                    <div className="space-y-4">
                                        {items.map((item) => (
                                            <div key={item.originalIndex} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-3 bg-slate-50 rounded-xl">
                                                <div className="w-48 font-bold text-sm text-slate-700">{item.item_name}</div>
                                                
                                                <div className="flex flex-wrap gap-2">
                                                    <label className={`px-3 py-1.5 rounded cursor-pointer text-xs font-black transition-colors ${item.condition === 'good' ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                                        <input type="radio" className="hidden" checked={item.condition === 'good'} onChange={() => updateItem(item.originalIndex, 'condition', 'good')} />
                                                        Good
                                                    </label>
                                                    <label className={`px-3 py-1.5 rounded cursor-pointer text-xs font-black transition-colors ${item.condition === 'monitor' ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                                        <input type="radio" className="hidden" checked={item.condition === 'monitor'} onChange={() => updateItem(item.originalIndex, 'condition', 'monitor')} />
                                                        Monitor
                                                    </label>
                                                    <label className={`px-3 py-1.5 rounded cursor-pointer text-xs font-black transition-colors ${item.condition === 'repair' ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                                        <input type="radio" className="hidden" checked={item.condition === 'repair'} onChange={() => updateItem(item.originalIndex, 'condition', 'repair')} />
                                                        Repair
                                                    </label>
                                                    <label className={`px-3 py-1.5 rounded cursor-pointer text-xs font-black transition-colors ${item.condition === 'replace' ? 'bg-red-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                                        <input type="radio" className="hidden" checked={item.condition === 'replace'} onChange={() => updateItem(item.originalIndex, 'condition', 'replace')} />
                                                        Replace
                                                    </label>
                                                </div>

                                                <div className="flex-1 w-full sm:w-auto">
                                                    <TextInput 
                                                        className="w-full text-xs h-8 bg-white"
                                                        placeholder="Remarks (Optional)"
                                                        value={item.remarks}
                                                        onChange={(e) => updateItem(item.originalIndex, 'remarks', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={processing} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm tracking-wide transition-all shadow-lg shadow-blue-500/30">
                            Save Inspection Report
                        </button>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
