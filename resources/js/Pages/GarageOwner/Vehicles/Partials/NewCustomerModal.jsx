import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function NewCustomerModal({ show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', phone: '', email: '', address: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('owner.customers.store'), { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-black text-slate-800 mb-6">Register New Customer</h2>
                <div className="space-y-4">
                    <div>
                        <InputLabel value="Full Name" />
                        <TextInput className="w-full mt-1" value={data.name} onChange={e => setData('name', e.target.value)} required />
                        <InputError message={errors.name} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel value="Phone Number (Optional)" />
                        <TextInput className="w-full mt-1" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        <InputError message={errors.phone} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel value="Email Address (Optional)" />
                        <TextInput type="email" className="w-full mt-1" value={data.email} onChange={e => setData('email', e.target.value)} />
                        <InputError message={errors.email} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel value="Address (Optional)" />
                        <TextInput className="w-full mt-1" value={data.address} onChange={e => setData('address', e.target.value)} />
                        <InputError message={errors.address} className="mt-1" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase">Cancel</button>
                    <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase disabled:opacity-50">Save Customer</button>
                </div>
            </form>
        </Modal>
    );
}
