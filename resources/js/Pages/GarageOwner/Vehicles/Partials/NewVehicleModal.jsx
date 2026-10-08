import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import SearchableSelect from '@/Components/SearchableSelect';

export default function NewVehicleModal({ show, onClose, customers, onAddCustomer }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        owner_id: '', vehicle_number: '', make: '', model: '', year: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('owner.vehicles.store'), { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-black text-slate-800 mb-6">Register New Vehicle</h2>
                <div className="space-y-4">
                    <div>
                        <InputLabel value="Owner (Customer)" />
                        <SearchableSelect className="mt-1" value={data.owner_id} onChange={e => setData('owner_id', e.target.value)} options={customers ? customers.map(c => ({ value: c.id, label: `${c.name} ${c.phone ? `(${c.phone})` : ''}` })) : []} placeholder="Select Owner" />
                        <InputError message={errors.owner_id} className="mt-1" />
                        <p className="text-[10px] text-blue-600 mt-1 cursor-pointer font-bold" onClick={() => { onClose(); onAddCustomer(); }}>+ Add new customer instead</p>
                    </div>
                    <div>
                        <InputLabel value="Vehicle Number (Reg No)" />
                        <TextInput className="w-full mt-1 font-black uppercase" value={data.vehicle_number} onChange={e => setData('vehicle_number', e.target.value)} required placeholder="e.g. WP CAA-1234" />
                        <InputError message={errors.vehicle_number} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Make (Optional)" />
                            <TextInput className="w-full mt-1" value={data.make} onChange={e => setData('make', e.target.value)} placeholder="e.g. Toyota" />
                            <InputError message={errors.make} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Model (Optional)" />
                            <TextInput className="w-full mt-1" value={data.model} onChange={e => setData('model', e.target.value)} placeholder="e.g. Corolla" />
                            <InputError message={errors.model} className="mt-1" />
                        </div>
                    </div>
                    <div>
                        <InputLabel value="Year (Optional)" />
                        <TextInput type="number" className="w-full mt-1" value={data.year} onChange={e => setData('year', e.target.value)} placeholder="e.g. 2018" />
                        <InputError message={errors.year} className="mt-1" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase">Cancel</button>
                    <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase disabled:opacity-50">Save Vehicle</button>
                </div>
            </form>
        </Modal>
    );
}
