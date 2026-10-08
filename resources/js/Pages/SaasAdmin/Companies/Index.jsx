import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function CompaniesIndex({ companies }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        company_name: '', domain: '', admin_name: '', admin_email: '', admin_password: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('saas.companies.store'), {
            onSuccess: () => { setIsModalOpen(false); reset(); }
        });
    };

    return (
        <AuthenticatedLayout header={<div className="flex justify-between items-center w-full"><span>SaaS Companies Management (Multi-DB)</span><button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-md">+ Add New Company</button></div>}>
            <Head title="SaaS Companies" />
            <div className="max-w-7xl mx-auto space-y-6 mt-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                    <h3 className="font-bold text-lg mb-4">Registered Companies</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                                <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Company Name</th><th className="px-6 py-4">Domain</th><th className="px-6 py-4">Database</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {companies?.length > 0 ? companies.map(c => (
                                    <tr key={c.id}>
                                        <td className="px-6 py-4 font-black">{c.id}</td>
                                        <td className="px-6 py-4 font-bold text-blue-600">{c.data?.company_name || c.id}</td>
                                        <td className="px-6 py-4 font-medium">{c.domains?.[0]?.domain || '-'}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">tenant{c.id}</span></td>
                                    </tr>
                                )) : <tr><td colSpan="4" className="text-center py-6 text-slate-500">No companies registered. Add one to create a dedicated database.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-xl font-black mb-6">Register New Company & DB</h2>
                    <form onSubmit={submit} className="space-y-4">
                        <div><InputLabel value="Company/Tenant ID (no spaces)" /><TextInput type="text" className="w-full mt-1" value={data.company_name} onChange={e => setData('company_name', e.target.value)} /><InputError message={errors.company_name} /></div>
                        <div><InputLabel value="Domain (e.g. abc.localhost)" /><TextInput type="text" className="w-full mt-1" value={data.domain} onChange={e => setData('domain', e.target.value)} /><InputError message={errors.domain} /></div>
                        <hr className="my-4"/>
                        <h4 className="font-bold text-sm text-slate-500 uppercase">Company Owner Details</h4>
                        <div><InputLabel value="Owner Name" /><TextInput type="text" className="w-full mt-1" value={data.admin_name} onChange={e => setData('admin_name', e.target.value)} /><InputError message={errors.admin_name} /></div>
                        <div><InputLabel value="Owner Email" /><TextInput type="email" className="w-full mt-1" value={data.admin_email} onChange={e => setData('admin_email', e.target.value)} /><InputError message={errors.admin_email} /></div>
                        <div><InputLabel value="Owner Password" /><TextInput type="password" className="w-full mt-1" value={data.admin_password} onChange={e => setData('admin_password', e.target.value)} /><InputError message={errors.admin_password} /></div>
                        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded font-bold">Cancel</button><button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded font-bold">{processing ? 'Creating DB...' : 'Create Company'}</button></div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
