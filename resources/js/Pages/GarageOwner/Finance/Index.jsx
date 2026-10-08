import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import BankAccountModal from './Partials/BankAccountModal';
import TransactionModal from './Partials/TransactionModal';
import SearchableSelect from '@/Components/SearchableSelect';

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
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Cash Out</p>
                            <h3 className="text-2xl font-black text-rose-600">Rs. {Number(summary.total_out).toFixed(2)}</h3>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Net Balance</p>
                            <h3 className="text-2xl font-black text-white">Rs. {Number(summary.net_balance).toFixed(2)}</h3>
                        </div>
                    </div>
                </div>

                {/* Bank Accounts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Cash in Hand Card */}
                    <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5 hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-sm">Cash in Drawer</h4>
                                <p className="text-[10px] font-bold text-blue-500 uppercase">Physical Cash</p>
                            </div>
                        </div>
                        <div>
                            <div className="text-lg font-black text-slate-900">Rs. {Number(summary.cash_in_hand).toFixed(2)}</div>
                        </div>
                    </div>

                    {bankAccounts.map(bank => (
                        <div key={bank.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-sm truncate max-w-[120px]">{bank.bank_name}</h4>
                                    <p className="text-[10px] font-mono text-slate-500">{bank.account_number}</p>
                                </div>
                            </div>
                            <div>
                                <div className="text-lg font-black text-slate-900">Rs. {Number(bank.current_balance).toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters & Transaction Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-end gap-3">
                        <div className="w-full sm:w-auto">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account</label>
                            <SearchableSelect 
                                className="w-full sm:w-48 text-sm" 
                                value={filterState.account_id} 
                                onChange={e => setFilterState({...filterState, account_id: e.target.value})}
                                options={[
                                    { value: '', label: 'All Accounts & Cash' },
                                    ...bankAccounts.map(b => ({ value: b.id, label: b.bank_name }))
                                ]}
                            />
                        </div>
                        <div className="w-full sm:w-auto">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Date</label>
                            <input type="date" className="w-full sm:w-40 text-sm border-slate-200 rounded-xl py-2" value={filterState.start_date} onChange={e => setFilterState({...filterState, start_date: e.target.value})} />
                        </div>
                        <div className="w-full sm:w-auto">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Date</label>
                            <input type="date" className="w-full sm:w-40 text-sm border-slate-200 rounded-xl py-2" value={filterState.end_date} onChange={e => setFilterState({...filterState, end_date: e.target.value})} />
                        </div>
                        <div className="w-full sm:w-auto flex gap-2">
                            <button onClick={applyFilters} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors">Filter</button>
                            <button onClick={clearFilters} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors">Clear</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100">Date & Ref</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100">Description</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100">Account</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100">Category</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100 text-right">In (Rs)</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100 text-right">Out (Rs)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.data.map(trx => (
                                    <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-700">{trx.date}</div>
                                            {trx.reference_type && <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{trx.reference_type} #{trx.reference_id}</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-semibold text-slate-800">{trx.description || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-xs font-bold text-slate-600 bg-slate-100 inline-flex px-2 py-1 rounded-lg">
                                                {trx.bank_account ? trx.bank_account.bank_name : 'Cash'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-xs font-semibold text-slate-500">{trx.category}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            {trx.type === 'in' ? <span className="text-sm font-black text-emerald-600">{Number(trx.amount).toFixed(2)}</span> : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            {trx.type === 'out' ? <span className="text-sm font-black text-rose-600">{Number(trx.amount).toFixed(2)}</span> : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-sm font-semibold text-slate-400">No transactions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {transactions.links && (
                        <div className="p-4 border-t border-slate-100">
                            <Pagination links={transactions.links} />
                        </div>
                    )}
                </div>
            </div>

            <BankAccountModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} />
            <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} bankAccounts={bankAccounts} />

        </AuthenticatedLayout>
    );
}
