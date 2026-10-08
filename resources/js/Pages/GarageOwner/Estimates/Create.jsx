import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SearchableSelect from '@/Components/SearchableSelect';
import EstimateItemsEditor from './Partials/EstimateItemsEditor';
import EstimateTotalsPanel from './Partials/EstimateTotalsPanel';

export default function EstimateCreate({ customers, vehicles, inventory, services, nextEstimateNumber }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '', vehicle_id: '',
        estimate_date: new Date().toISOString().split('T')[0],
        expiry_date: '', discount: 0, tax: 0, notes: '',
        terms: 'This estimate is valid for 14 days from the date of issue. Prices may vary slightly based on actual parts required.',
        items: [],
    });

    const subtotal = data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
    const total = subtotal - Number(data.discount) + Number(data.tax);

    const addItem = () => setData('items', [...data.items, { type: 'service', item_id: '', description: '', quantity: 1, unit_price: 0 }]);

    const removeItem = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        if (field === 'item_id' && value !== '') {
            if (newItems[index].type === 'service') {
                const srv = services.find(s => s.id == value);
                if (srv) { newItems[index].description = srv.service_name; newItems[index].unit_price = srv.price; }
            } else if (newItems[index].type === 'part') {
                const part = inventory.find(i => i.id == value);
                if (part) { newItems[index].description = part.item_name; newItems[index].unit_price = part.price; }
            }
        }
        setData('items', newItems);
    };

    return (
        <AuthenticatedLayout
            fullWidth={true}
            header={<div className="text-left w-full"><h2 className="text-xl font-black text-black">Create Estimate</h2><p className="text-xs font-bold text-blue-600 mt-1">Generate a quotation for a customer</p></div>}
            headerActions={<div className="w-full sm:w-auto flex justify-end"><Link href={route('owner.estimates.index')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg font-black transition-all text-xs whitespace-nowrap">Cancel &amp; Back</Link></div>}
        >
            <Head title="Create Estimate" />
            <div className="w-full max-w-6xl mx-auto py-8 px-2 sm:px-4 lg:px-6">
                <form onSubmit={(e) => { e.preventDefault(); post(route('owner.estimates.store')); }} className="space-y-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100 p-6 sm:p-8">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex justify-between">
                            <span>1. Basic Information</span><span className="text-blue-600">No: {nextEstimateNumber}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-2">
                                <InputLabel htmlFor="customer_id" value="Select Customer" className="font-bold text-slate-700" />
                                <SearchableSelect className="mt-1" value={data.customer_id} onChange={(e) => setData('customer_id', e.target.value)} options={customers.map(c => ({ value: c.id, label: `${c.name} (${c.email})` }))} placeholder="-- Select Customer --" />
                                <InputError message={errors.customer_id} className="mt-2" />
                            </div>
                            <div className="lg:col-span-2">
                                <InputLabel htmlFor="vehicle_id" value="Select Vehicle" className="font-bold text-slate-700" />
                                <SearchableSelect className="mt-1" value={data.vehicle_id} onChange={(e) => setData('vehicle_id', e.target.value)} options={vehicles.filter(v => v.owner_id == data.customer_id || !data.customer_id).map(v => ({ value: v.id, label: `${v.vehicle_number} - ${v.make} ${v.model}` }))} placeholder="-- No Vehicle Selected --" />
                                <InputError message={errors.vehicle_id} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="estimate_date" value="Estimate Date" className="font-bold text-slate-700" />
                                <TextInput id="estimate_date" type="date" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 text-sm font-medium" value={data.estimate_date} onChange={(e) => setData('estimate_date', e.target.value)} required />
                                <InputError message={errors.estimate_date} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="expiry_date" value="Expiry Date" className="font-bold text-slate-700" />
                                <TextInput id="expiry_date" type="date" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 text-sm font-medium" value={data.expiry_date} onChange={(e) => setData('expiry_date', e.target.value)} />
                                <InputError message={errors.expiry_date} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    <EstimateItemsEditor items={data.items} services={services} inventory={inventory} errors={errors} onAdd={addItem} onUpdate={updateItem} onRemove={removeItem} />
                    <EstimateTotalsPanel data={data} setData={setData} subtotal={subtotal} total={total} processing={processing} />
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
