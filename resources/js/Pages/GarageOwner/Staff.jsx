import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function Staff({ staff }) {
    const { auth } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [deletingStaff, setDeletingStaff] = useState(null);
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({ name: '', email: '', password: '' });

    const openCreate = () => { clearErrors(); reset(); setEditingStaff(null); setIsModalOpen(true); };
    const openEdit = (s) => { clearErrors(); setData({ name: s.name, email: s.email, password: '' }); setEditingStaff(s); setIsModalOpen(true); };
    const openDelete = (s) => { setDeletingStaff(s); setIsDeleteModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setTimeout(() => { reset(); clearErrors(); }, 200); };
    const closeDeleteModal = () => { setIsDeleteModalOpen(false); setTimeout(() => setDeletingStaff(null), 200); };
    const submitForm = (e) => { e.preventDefault(); editingStaff ? put(route('owner.staff.update', editingStaff.id), { onSuccess: () => closeModal() }) : post(route('owner.staff.store'), { onSuccess: () => closeModal() }); };
    const confirmDelete = () => destroy(route('owner.staff.destroy', deletingStaff.id), { onSuccess: () => closeDeleteModal() });

    return (
        <AuthenticatedLayout
            header={<div className="text-left w-full"><h2 className="text-xl font-black text-black">Staff Management</h2></div>}
            headerActions={<div className="w-full sm:w-auto flex justify-end"><button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-colors text-sm shadow-md shadow-blue-500/20 whitespace-nowrap"><span className="text-lg leading-none mb-0.5">+</span> Add New Staff</button></div>}
        >
            <Head title="Staff Members" />
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider"><tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {staff?.length > 0 ? staff.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black">{s.name.charAt(0)}</div>
                                            <div><div className="font-bold text-slate-800">{s.name} {s.id === auth.user.id && <span className="text-xs text-emerald-600 font-bold ml-1">(You)</span>}</div><div className="text-xs text-slate-500 mt-0.5">{s.email}</div></div>
                                        </td>
                                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${s.role === 'garage_owner' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>{s.role === 'garage_owner' ? 'Garage Owner' : 'Mechanic / Staff'}</span></td>
                                        <td className="px-6 py-4"><div className="flex items-center gap-1.5 font-bold text-emerald-600 text-xs uppercase tracking-wider"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>Active</div></td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">Edit</button>
                                            {s.id !== auth.user.id && <button onClick={() => openDelete(s)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider">Delete</button>}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500 font-medium">No staff members found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">{editingStaff ? 'Edit Staff Details' : 'Register New Staff Member'}</h2>
                    <form onSubmit={submitForm} className="space-y-4">
                        <div><InputLabel htmlFor="name" value="Full Name" /><TextInput id="name" type="text" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800" value={data.name} onChange={(e) => setData('name', e.target.value)} /><InputError message={errors.name} className="mt-2" /></div>
                        <div><InputLabel htmlFor="email" value="Email Address" /><TextInput id="email" type="email" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800" value={data.email} onChange={(e) => setData('email', e.target.value)} /><InputError message={errors.email} className="mt-2" /></div>
                        <div><InputLabel htmlFor="password" value={editingStaff ? 'Password (leave blank to keep current)' : 'Password'} /><TextInput id="password" type="password" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800" value={data.password} onChange={(e) => setData('password', e.target.value)} /><InputError message={errors.password} className="mt-2" /></div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">Cancel</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50">{processing ? 'Saving...' : 'Save Staff'}</button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div><h2 className="text-lg font-black text-slate-800">Delete Staff</h2></div>
                    <p className="text-sm text-slate-600 mb-6 font-medium">Are you sure you want to remove <span className="font-bold text-slate-800">{deletingStaff?.name}</span> from the staff? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={closeDeleteModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">Cancel</button>
                        <button onClick={confirmDelete} disabled={processing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50">{processing ? 'Deleting...' : 'Yes, Delete'}</button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
