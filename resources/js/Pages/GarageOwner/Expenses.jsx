import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import Pagination from '@/Components/Pagination';

export default function Expenses({ expenses }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        category: '',
        amount: '',
        expense_date: '',
        description: ''
    });

    const openModal = () => {
        clearErrors();
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const submitForm = (e) => {
        e.preventDefault();
        post(route('owner.expenses.store'), {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">Expenses Management</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Track your daily garage expenses</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end">
                    <button onClick={openModal} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black transition-all text-xs shadow-sm shadow-blue-500/20 whitespace-nowrap">
                        <span className="text-base leading-none mb-0.5 mr-1">+</span> Add Expense
                    </button>
                </div>
            }
        >
            <Head title="Expenses" />
            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6">
                <DataTable 
                    columns={[
                        { label: 'Date' },
                        { label: 'Category' },
                        { label: 'Description' },
                        { label: 'Amount', align: 'right' },
                    ]}
                    isEmpty={!expenses || !expenses.data || expenses.data.length === 0}
                    emptyMessage="No expenses found."
                >
                    {expenses?.data?.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-800">{new Date(exp.expense_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-bold text-indigo-600 uppercase tracking-wider text-xs">{exp.category}</td>
                            <td className="px-6 py-4 text-slate-500">{exp.description || '-'}</td>
                            <td className="px-6 py-4 text-right font-black text-red-500">
                                - Rs. {parseFloat(exp.amount).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </DataTable>
                
                {/* Pagination */}
                {expenses?.links && <Pagination links={expenses.links} />}
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Add New Expense</h2>
                    <form onSubmit={submitForm} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="category" value="Category" />
                            <select id="category" className="mt-1 block w-full border-slate-200 rounded-md" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                                <option value="">-- Select --</option>
                                <option value="utilities">Utilities (Water/Electricity)</option>
                                <option value="spare_parts">Spare Parts</option>
                                <option value="rent">Rent</option>
                                <option value="other">Other</option>
                            </select>
                            <InputError message={errors.category} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="amount" value="Amount (Rs.)" />
                            <TextInput type="number" step="0.01" className="mt-1 block w-full border-slate-200" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                            <InputError message={errors.amount} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="expense_date" value="Date" />
                            <TextInput type="date" className="mt-1 block w-full border-slate-200" value={data.expense_date} onChange={(e) => setData('expense_date', e.target.value)} />
                            <InputError message={errors.expense_date} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="description" value="Description (Optional)" />
                            <TextInput className="mt-1 block w-full border-slate-200" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        </div>
                        <div className="mt-6 flex justify-end gap-3 pt-4">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold">Cancel</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold disabled:opacity-50">Save Expense</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
