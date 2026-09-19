import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function EstimateCreate({ customers, vehicles, inventory, services, nextEstimateNumber }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        vehicle_id: '',
        estimate_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        discount: 0,
        tax: 0,
        notes: '',
        terms: 'This estimate is valid for 14 days from the date of issue. Prices may vary slightly based on actual parts required.',
        items: [],
    });

    // Subtotal Calculation
    const subtotal = data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
    const total = subtotal - Number(data.discount) + Number(data.tax);

    const addItem = () => {
        setData('items', [
            ...data.items, 
            { type: 'service', item_id: '', description: '', quantity: 1, unit_price: 0 }
        ]);
    };

    const removeItem = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;

        // Auto-fill description and price if service or part selected
        if (field === 'item_id' && value !== '') {
            if (newItems[index].type === 'service') {
                const srv = services.find(s => s.id == value);
                if (srv) {
                    newItems[index].description = srv.service_name;
                    newItems[index].unit_price = srv.price;
                }
            } else if (newItems[index].type === 'part') {
                const part = inventory.find(i => i.id == value);
                if (part) {
                    newItems[index].description = part.item_name;
                    newItems[index].unit_price = part.price;
                }
            }
        }
        
        setData('items', newItems);
    };

    const submitForm = (e) => {
        e.preventDefault();
        post(route('owner.estimates.store'));
    };

    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">Create Estimate</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Generate a quotation for a customer</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <Link href={route('owner.estimates.index')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg font-black transition-all text-xs whitespace-nowrap">
                        Cancel & Back
                    </Link>
                </div>
            }
        >
            <Head title="Create Estimate" />

            <div className="w-full max-w-6xl mx-auto py-8 px-2 sm:px-4 lg:px-6">
                <form onSubmit={submitForm} className="space-y-6">
                    
                    {/* Header Details */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100 p-6 sm:p-8">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex justify-between">
                            <span>1. Basic Information</span>
                            <span className="text-blue-600">No: {nextEstimateNumber}</span>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-2">
                                <InputLabel htmlFor="customer_id" value="Select Customer" className="font-bold text-slate-700" />
                                <select
                                    id="customer_id"
                                    className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500"
                                    value={data.customer_id}
                                    onChange={(e) => setData('customer_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Customer --</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                                    ))}
                                </select>
                                <InputError message={errors.customer_id} className="mt-2" />
                            </div>

                            <div className="lg:col-span-2">
                                <InputLabel htmlFor="vehicle_id" value="Select Vehicle" className="font-bold text-slate-700" />
                                <select
                                    id="vehicle_id"
                                    className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500"
                                    value={data.vehicle_id}
                                    onChange={(e) => setData('vehicle_id', e.target.value)}
                                >
                                    <option value="">-- No Vehicle Selected --</option>
                                    {vehicles.filter(v => v.owner_id == data.customer_id || !data.customer_id).map(v => (
                                        <option key={v.id} value={v.id}>{v.vehicle_number} - {v.make} {v.model}</option>
                                    ))}
                                </select>
                                <InputError message={errors.vehicle_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="estimate_date" value="Estimate Date" className="font-bold text-slate-700" />
                                <TextInput
                                    id="estimate_date"
                                    type="date"
                                    className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 text-sm font-medium"
                                    value={data.estimate_date}
                                    onChange={(e) => setData('estimate_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.estimate_date} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="expiry_date" value="Expiry Date" className="font-bold text-slate-700" />
                                <TextInput
                                    id="expiry_date"
                                    type="date"
                                    className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 text-sm font-medium"
                                    value={data.expiry_date}
                                    onChange={(e) => setData('expiry_date', e.target.value)}
                                />
                                <InputError message={errors.expiry_date} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Estimate Items */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100 p-6 sm:p-8">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">2. Estimate Items</h3>
                            <button type="button" onClick={addItem} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">+ Add Item</button>
                        </div>
                        
                        {data.items.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-sm font-bold text-slate-400">No items added yet. Click "+ Add Item" to start.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                                        <div className="col-span-12 lg:col-span-2">
                                            <InputLabel value="Type" className="text-[10px] text-slate-500 uppercase tracking-wider" />
                                            <select 
                                                className="w-full mt-1 bg-white border-slate-200 rounded text-xs font-bold h-9"
                                                value={item.type}
                                                onChange={e => {
                                                    updateItem(index, 'type', e.target.value);
                                                    updateItem(index, 'item_id', '');
                                                }}
                                            >
                                                <option value="service">Service</option>
                                                <option value="part">Part</option>
                                            </select>
                                        </div>

                                        <div className="col-span-12 lg:col-span-3">
                                            <InputLabel value={item.type === 'service' ? 'Select Service' : 'Select Part'} className="text-[10px] text-slate-500 uppercase tracking-wider" />
                                            <select 
                                                className="w-full mt-1 bg-white border-slate-200 rounded text-xs h-9"
                                                value={item.item_id}
                                                onChange={e => updateItem(index, 'item_id', e.target.value)}
                                            >
                                                <option value="">Custom Item</option>
                                                {item.type === 'service' && services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                                {item.type === 'part' && inventory.map(i => <option key={i.id} value={i.id}>{i.item_name}</option>)}
                                            </select>
                                        </div>

                                        <div className="col-span-12 lg:col-span-3">
                                            <InputLabel value="Description" className="text-[10px] text-slate-500 uppercase tracking-wider" />
                                            <TextInput 
                                                className="w-full mt-1 bg-white text-xs h-9" 
                                                value={item.description}
                                                onChange={e => updateItem(index, 'description', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-span-6 lg:col-span-1">
                                            <InputLabel value="Qty" className="text-[10px] text-slate-500 uppercase tracking-wider" />
                                            <TextInput 
                                                type="number" step="0.01"
                                                className="w-full mt-1 bg-white text-xs font-black h-9 text-center" 
                                                value={item.quantity}
                                                onChange={e => updateItem(index, 'quantity', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-span-6 lg:col-span-2">
                                            <InputLabel value="Price" className="text-[10px] text-slate-500 uppercase tracking-wider" />
                                            <TextInput 
                                                type="number" step="0.01"
                                                className="w-full mt-1 bg-white text-xs font-black h-9 text-right" 
                                                value={item.unit_price}
                                                onChange={e => updateItem(index, 'unit_price', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-span-12 lg:col-span-1 flex items-end justify-end pb-1">
                                            <button type="button" onClick={() => removeItem(index)} className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <InputError message={errors.items} className="mt-2" />
                    </div>

                    {/* Footer Totals */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100 p-6 sm:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Notes and Terms */}
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="notes" value="Internal Notes (Not visible on print)" className="font-bold text-slate-700 text-xs" />
                                    <textarea
                                        id="notes"
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500 p-3"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows="2"
                                    ></textarea>
                                </div>
                                <div>
                                    <InputLabel htmlFor="terms" value="Terms & Conditions (Visible to Customer)" className="font-bold text-slate-700 text-xs" />
                                    <textarea
                                        id="terms"
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500 p-3"
                                        value={data.terms}
                                        onChange={(e) => setData('terms', e.target.value)}
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-end space-y-3">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                    <span>Subtotal:</span>
                                    <span>Rs. {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                    <span>Discount (Rs):</span>
                                    <TextInput 
                                        type="number" step="0.01" 
                                        className="w-32 text-right bg-white text-xs h-8"
                                        value={data.discount}
                                        onChange={e => setData('discount', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                    <span>Tax (Rs):</span>
                                    <TextInput 
                                        type="number" step="0.01" 
                                        className="w-32 text-right bg-white text-xs h-8"
                                        value={data.tax}
                                        onChange={e => setData('tax', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-2">
                                    <span className="text-lg font-black text-slate-800">Grand Total:</span>
                                    <span className="text-xl font-black text-blue-600">Rs. {total.toFixed(2)}</span>
                                </div>
                            </div>

                        </div>
                        
                        <div className="flex justify-end pt-6 border-t border-slate-100 mt-6">
                            <button type="submit" disabled={processing || data.items.length === 0} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm tracking-wide transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30">
                                {processing ? 'Saving...' : 'Save Estimate'}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
