import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function FinanceIndex({ bankAccounts, transactions, summary, filters }) {
    const { auth } = usePage().props;
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    // Filter State
    const [filterState, setFilterState] = useState({
        account_id: filters.account_id || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    const applyFilters = () => {
        router.get(route('owner.finance.index'), filterState, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setFilterState({ account_id: '', start_date: '', end_date: '' });
        router.get(route('owner.finance.index'));
    };

    // Bank Account Form
    const { data: bankData, setData: setBankData, post: postBank, processing: bankProcessing, errors: bankErrors, reset: bankReset } = useForm({
        bank_name: '',
        account_name: '',
        account_number: '',
        branch: '',
        initial_balance: 0,
    });

    const submitBank = (e) => {
        e.preventDefault();
        postBank(route('owner.finance.bank-accounts.store'), {
            onSuccess: () => {
                setIsBankModalOpen(false);
                bankReset();
            },
        });
    };

    // Transaction Form
    const { data: trxData, setData: setTrxData, post: postTrx, processing: trxProcessing, errors: trxErrors, reset: trxReset } = useForm({
        bank_account_id: '', // Empty means Cash in Hand
        type: 'out',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    const submitTrx = (e) => {
        e.preventDefault();
        postTrx(route('owner.finance.transactions.store'), {
            onSuccess: () => {
                setIsTransactionModalOpen(false);
                trxReset();
            },
        });
    };

    return (
        <AuthenticatedLayout 
            fullWidth={true}
            header={
                <div className="text-left w-full">
                    <h2 className="text-xl font-black text-black">Finance & Cashbook</h2>
                    <p className="text-xs font-bold text-blue-600 mt-1">Manage bank accounts and track all transactions</p>
                </div>
            }
            headerActions={
                <div className="w-full sm:w-auto flex justify-end gap-2">
                    <button onClick={() => setIsBankModalOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-black transition-all text-xs whitespace-nowrap">
                        + Add Bank Account
                    </button>
                    <button onClick={() => setIsTransactionModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-black transition-all text-xs shadow-sm shadow-blue-500/20 whitespace-nowrap">
                        + New Transaction
                    </button>
                </div>
            }
        >
            <Head title="Finance" />

            <div className="w-full max-w-[1600px] mx-auto py-6 px-2 sm:px-4 lg:px-6 space-y-6">
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Cash In</p>
                            <h3 className="text-2xl font-black text-emerald-600">Rs. {Number(summary.total_in).toFixed(2)}</h3>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Cash Out</p>
                            <h3 className="text-2xl font-black text-red-600">Rs. {Number(summary.total_out).toFixed(2)}</h3>
                        </div>
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-2xl shadow-md flex items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Net Balance</p>
                            <h3 className="text-2xl font-black text-white">Rs. {Number(summary.balance).toFixed(2)}</h3>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Bank Accounts Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Bank Accounts</h3>
                            
                            <div className="space-y-3">
                                {/* Cash in Hand (Virtual Account) */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-slate-800 text-sm">Cash in Hand</div>
                                        <div className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded uppercase">Default</div>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium">Physical Cash Drawer</div>
                                </div>

                                {/* Actual Bank Accounts */}
                                {bankAccounts.length > 0 ? (
                                    bankAccounts.map(account => (
                                        <div key={account.id} className="p-4 bg-white rounded-xl border border-slate-200 relative overflow-hidden hover:border-blue-300 transition-colors cursor-pointer group">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="font-bold text-blue-700 text-sm">{account.bank_name}</div>
                                                <div className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${account.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {account.is_active ? 'Active' : 'Inactive'}
                                                </div>
                                            </div>
                                            <div className="text-xs font-black text-slate-800 mb-1">{account.account_number}</div>
                                            <div className="text-[10px] text-slate-500 font-medium mb-3">{account.account_name} &bull; {account.branch}</div>
                                            
                                            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Balance</span>
                                                <span className="text-sm font-black text-slate-800">Rs. {Number(account.current_balance).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-xs text-slate-500 font-medium">No bank accounts added.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Cashbook Ledger */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        
                        {/* Filters */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-3 items-end">
                            <div>
                                <InputLabel value="Account" className="text-[10px] uppercase tracking-wider mb-1" />
                                <select 
                                    className="bg-white border-slate-200 text-slate-700 rounded text-xs h-9 py-1 px-3"
                                    value={filterState.account_id}
                                    onChange={e => setFilterState({...filterState, account_id: e.target.value})}
                                >
                                    <option value="">All Accounts & Cash</option>
                                    <option value="cash">Cash in Hand Only</option>
                                    {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.bank_name} ({b.account_number})</option>)}
                                </select>
                            </div>
                            <div>
                                <InputLabel value="From Date" className="text-[10px] uppercase tracking-wider mb-1" />
                                <TextInput 
                                    type="date" 
                                    className="bg-white text-xs h-9 py-1" 
                                    value={filterState.start_date}
                                    onChange={e => setFilterState({...filterState, start_date: e.target.value})}
                                />
                            </div>
                            <div>
                                <InputLabel value="To Date" className="text-[10px] uppercase tracking-wider mb-1" />
                                <TextInput 
                                    type="date" 
                                    className="bg-white text-xs h-9 py-1" 
                                    value={filterState.end_date}
                                    onChange={e => setFilterState({...filterState, end_date: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={applyFilters} className="bg-slate-800 text-white px-4 h-9 rounded text-xs font-bold hover:bg-slate-700">Filter</button>
                                {(filters.account_id || filters.start_date || filters.end_date) && (
                                    <button onClick={clearFilters} className="bg-white text-red-500 border border-slate-200 px-4 h-9 rounded text-xs font-bold hover:bg-red-50">Clear</button>
                                )}
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-white border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-4">Date</th>
                                        <th className="px-5 py-4">Description / Ref</th>
                                        <th className="px-5 py-4">Account</th>
                                        <th className="px-5 py-4 text-right">Cash In</th>
                                        <th className="px-5 py-4 text-right">Cash Out</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.data && transactions.data.length > 0 ? (
                                        transactions.data.map((trx) => (
                                            <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-slate-700">
                                                    {trx.date}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="font-bold text-slate-800">{trx.description}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                                        {trx.reference_type} {trx.reference_id ? `#${trx.reference_id}` : ''}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {trx.bank_account_id ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700">
                                                            {trx.bank_account?.bank_name}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700">
                                                            Cash
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    {trx.type === 'in' ? (
                                                        <span className="font-black text-emerald-600">+{Number(trx.amount).toFixed(2)}</span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    {trx.type === 'out' ? (
                                                        <span className="font-black text-red-600">-{Number(trx.amount).toFixed(2)}</span>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium text-sm">
                                                No transactions found for the selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {transactions.links && (
                            <div className="border-t border-slate-100">
                                <Pagination links={transactions.links} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Bank Account Modal */}
            <Modal show={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} maxWidth="md">
                <form onSubmit={submitBank} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Add Bank Account</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Bank Name" />
                            <TextInput 
                                className="w-full mt-1" 
                                value={bankData.bank_name} 
                                onChange={e => setBankData('bank_name', e.target.value)} 
                                required placeholder="e.g. Commercial Bank" 
                            />
                            <InputError message={bankErrors.bank_name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Account Name" />
                            <TextInput 
                                className="w-full mt-1" 
                                value={bankData.account_name} 
                                onChange={e => setBankData('account_name', e.target.value)} 
                                required placeholder="e.g. Garage Main Account" 
                            />
                            <InputError message={bankErrors.account_name} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Account Number" />
                                <TextInput 
                                    className="w-full mt-1" 
                                    value={bankData.account_number} 
                                    onChange={e => setBankData('account_number', e.target.value)} 
                                    required 
                                />
                                <InputError message={bankErrors.account_number} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel value="Branch (Optional)" />
                                <TextInput 
                                    className="w-full mt-1" 
                                    value={bankData.branch} 
                                    onChange={e => setBankData('branch', e.target.value)} 
                                />
                                <InputError message={bankErrors.branch} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <InputLabel value="Initial Balance (Rs)" />
                            <TextInput 
                                type="number" step="0.01" 
                                className="w-full mt-1 font-black" 
                                value={bankData.initial_balance} 
                                onChange={e => setBankData('initial_balance', e.target.value)} 
                                required 
                            />
                            <InputError message={bankErrors.initial_balance} className="mt-1" />
                            <p className="text-[10px] text-slate-500 mt-1">This will create an initial "Cash In" transaction.</p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsBankModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase">Cancel</button>
                        <button type="submit" disabled={bankProcessing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase disabled:opacity-50">Save Account</button>
                    </div>
                </form>
            </Modal>

            {/* Add Transaction Modal */}
            <Modal show={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} maxWidth="md">
                <form onSubmit={submitTrx} className="p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Record Manual Transaction</h2>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <label className={`border-2 rounded-xl p-3 flex items-center justify-center cursor-pointer transition-colors ${trxData.type === 'in' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <input type="radio" className="hidden" name="trx_type" value="in" checked={trxData.type === 'in'} onChange={() => setTrxData('type', 'in')} />
                                <span className="font-black text-sm uppercase">Cash In (Income)</span>
                            </label>
                            <label className={`border-2 rounded-xl p-3 flex items-center justify-center cursor-pointer transition-colors ${trxData.type === 'out' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <input type="radio" className="hidden" name="trx_type" value="out" checked={trxData.type === 'out'} onChange={() => setTrxData('type', 'out')} />
                                <span className="font-black text-sm uppercase">Cash Out (Expense)</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Amount (Rs)" />
                                <TextInput 
                                    type="number" step="0.01" 
                                    className="w-full mt-1 font-black text-lg text-right" 
                                    value={trxData.amount} 
                                    onChange={e => setTrxData('amount', e.target.value)} 
                                    required 
                                />
                                <InputError message={trxErrors.amount} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel value="Date" />
                                <TextInput 
                                    type="date" 
                                    className="w-full mt-1" 
                                    value={trxData.date} 
                                    onChange={e => setTrxData('date', e.target.value)} 
                                    required 
                                />
                                <InputError message={trxErrors.date} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Account Source / Destination" />
                            <select 
                                className="w-full mt-1 bg-slate-50 border-slate-200 rounded-lg text-sm"
                                value={trxData.bank_account_id}
                                onChange={e => setTrxData('bank_account_id', e.target.value)}
                            >
                                <option value="">Physical Cash / Drawer</option>
                                {bankAccounts.map(b => (
                                    <option key={b.id} value={b.id}>{b.bank_name} - {b.account_number}</option>
                                ))}
                            </select>
                            <InputError message={trxErrors.bank_account_id} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Description" />
                            <TextInput 
                                className="w-full mt-1" 
                                value={trxData.description} 
                                onChange={e => setTrxData('description', e.target.value)} 
                                required placeholder="e.g. Owner Drawing, Capital Injection" 
                            />
                            <InputError message={trxErrors.description} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsTransactionModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase">Cancel</button>
                        <button type="submit" disabled={trxProcessing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase disabled:opacity-50">Record Transaction</button>
                    </div>
                </form>
            </Modal>
            
        </AuthenticatedLayout>
    );
}
