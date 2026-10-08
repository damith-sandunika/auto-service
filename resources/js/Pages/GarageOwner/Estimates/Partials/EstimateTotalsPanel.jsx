import React from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function EstimateTotalsPanel({ data, setData, subtotal, total, processing }) {
    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100 p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Notes and Terms */}
                <div className="space-y-4">
                    <div>
                        <InputLabel htmlFor="notes" value="Internal Notes (Not visible on print)" className="font-bold text-slate-700 text-xs" />
                        <textarea id="notes" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500 p-3" value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows="2"></textarea>
                    </div>
                    <div>
                        <InputLabel htmlFor="terms" value="Terms & Conditions (Visible to Customer)" className="font-bold text-slate-700 text-xs" />
                        <textarea id="terms" className="mt-1 block w-full bg-slate-50 border-slate-200 text-slate-800 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500 p-3" value={data.terms} onChange={(e) => setData('terms', e.target.value)} rows="3"></textarea>
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
                        <TextInput type="number" step="0.01" className="w-32 text-right bg-white text-xs h-8" value={data.discount} onChange={e => setData('discount', e.target.value)} />
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                        <span>Tax (Rs):</span>
                        <TextInput type="number" step="0.01" className="w-32 text-right bg-white text-xs h-8" value={data.tax} onChange={e => setData('tax', e.target.value)} />
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
    );
}
