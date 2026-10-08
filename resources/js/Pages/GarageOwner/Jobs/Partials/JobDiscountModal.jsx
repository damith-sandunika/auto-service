import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function JobDiscountModal({ job, subTotal }) {
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

    const { data: discountData, setData: setDiscountData, patch: patchDiscount, processing: discountProcessing, errors: discountErrors } = useForm({
        discount: job.discount || ''
    });
    
    const [discountType, setDiscountType] = useState('fixed');
    const [percentValue, setPercentValue] = useState('');

    useEffect(() => {
        const handleOpenDiscount = () => setIsDiscountModalOpen(true);
        window.addEventListener('open-discount-modal', handleOpenDiscount);
        return () => window.removeEventListener('open-discount-modal', handleOpenDiscount);
    }, []);

    const submitDiscount = (e) => {
        e.preventDefault();
        patchDiscount(route('owner.jobs.discount.update', job.id), {
            onSuccess: () => setIsDiscountModalOpen(false)
        });
    };

    return (
        <Modal show={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} maxWidth="sm">
            <form onSubmit={submitDiscount} className="p-6">
                <h2 className="text-xl font-bold mb-4">Apply Discount</h2>
                <div className="mb-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                        <button type="button" onClick={() => setDiscountType('fixed')} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${discountType === 'fixed' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Fixed Amount</button>
                        <button type="button" onClick={() => setDiscountType('percent')} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${discountType === 'percent' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Percentage %</button>
                    </div>
                    {discountType === 'fixed' ? (
                        <input 
                            type="number" 
                            step="0.01" 
                            className="w-full text-lg font-bold p-3 rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500" 
                            value={discountData.discount} 
                            onChange={e => setDiscountData('discount', e.target.value)} 
                            placeholder="0.00"
                        />
                    ) : (
                        <div>
                            <input 
                                type="number" 
                                step="0.01" 
                                max="100"
                                min="0"
                                className="w-full text-lg font-bold p-3 rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500" 
                                value={percentValue} 
                                onChange={e => {
                                    setPercentValue(e.target.value);
                                    const val = parseFloat(e.target.value) || 0;
                                    setDiscountData('discount', (subTotal * (val / 100)).toFixed(2));
                                }} 
                                placeholder="0 - 100"
                            />
                            {percentValue && (
                                <p className="text-xs font-bold text-blue-600 mt-2 bg-blue-50 p-2 rounded-lg">
                                    Calculated Discount: LKR {discountData.discount}
                                </p>
                            )}
                        </div>
                    )}
                    {discountErrors.discount && <p className="text-red-500 text-xs mt-1">{discountErrors.discount}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setIsDiscountModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                    <button type="submit" disabled={discountProcessing} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                        {discountProcessing ? 'Applying...' : 'Apply Discount'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
