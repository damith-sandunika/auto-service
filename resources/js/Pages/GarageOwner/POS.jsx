import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import Modal from '@/Components/Modal';
import axios from 'axios';

export default function POS({ inventory, mechanics, customers }) {
    
    // 1. Manage ongoing orders in LocalStorage for persistence
    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('pos_ongoing_orders');
        if (saved) return JSON.parse(saved);
        return [{ id: 1, vehicle_number: '', customer_name: '', mechanic_id: '', items: [] }];
    });
    const [activeOrderId, setActiveOrderId] = useState(1);

    useEffect(() => {
        localStorage.setItem('pos_ongoing_orders', JSON.stringify(orders));
    }, [orders]);

    const activeOrder = orders.find(o => o.id === activeOrderId) || orders[0];

    const updateActiveOrder = (updates) => {
        setOrders(orders.map(o => o.id === activeOrderId ? { ...o, ...updates } : o));
    };

    const handleNewOrder = () => {
        const newId = Date.now();
        setOrders([{ id: newId, vehicle_number: '', customer_name: '', mechanic_id: '', items: [] }, ...orders]);
        setActiveOrderId(newId);
    };

    const removeOrder = (id, e) => {
        e.stopPropagation();
        const newOrders = orders.filter(o => o.id !== id);
        if (newOrders.length === 0) {
            const newId = Date.now();
            setOrders([{ id: newId, vehicle_number: '', customer_name: '', mechanic_id: '', items: [] }]);
            setActiveOrderId(newId);
        } else {
            setOrders(newOrders);
            if (activeOrderId === id) setActiveOrderId(newOrders[0].id);
        }
    };

    // 2. Search vehicle logic
    const [vehicleSearchFocused, setVehicleSearchFocused] = useState(false);
    
    const allVehiclesList = useMemo(() => {
        let list = [];
        customers.forEach(c => {
            c.vehicles?.forEach(v => {
                list.push({ ...v, customer: c });
            });
        });
        return list;
    }, [customers]);

    const vehicleSuggestions = useMemo(() => {
        if (!activeOrder.vehicle_number) return [];
        const term = activeOrder.vehicle_number.toUpperCase();
        return allVehiclesList.filter(v => v.vehicle_number.toUpperCase().includes(term)).slice(0, 5);
    }, [activeOrder.vehicle_number, allVehiclesList]);

    const selectVehicle = (veh) => {
        updateActiveOrder({ 
            vehicle_number: veh.vehicle_number, 
            customer_name: veh.customer.name,
            found_vehicle: veh
        });
        setVehicleSearchFocused(false);
    };

    const handleVehicleChange = (val) => {
        const upperVal = val.toUpperCase();
        let foundCustomer = null;
        let foundVehicle = null;

        for (let cust of customers) {
            const veh = cust.vehicles?.find(v => v.vehicle_number.toUpperCase() === upperVal);
            if (veh) {
                foundCustomer = cust;
                foundVehicle = veh;
                break;
            }
        }

        updateActiveOrder({ 
            vehicle_number: upperVal, 
            customer_name: foundCustomer ? foundCustomer.name : '',
            found_vehicle: foundVehicle
        });
    };

    // Registration Logic
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const registerForm = useForm({
        customer_name: '',
        customer_phone: '',
        vehicle_number: '',
        make: '',
        model: '',
        year: ''
    });

    const submitRegister = (e) => {
        e.preventDefault();
        registerForm.post(route('owner.pos.register-vehicle'), {
            onSuccess: () => {
                setIsRegisterOpen(false);
                updateActiveOrder({
                    vehicle_number: registerForm.data.vehicle_number,
                    customer_name: registerForm.data.customer_name,
                    found_vehicle: {
                        vehicle_number: registerForm.data.vehicle_number,
                        make: registerForm.data.make,
                        model: registerForm.data.model,
                        year: registerForm.data.year
                    }
                });
                registerForm.reset();
            }
        });
    };

    // 3. Parts & Manual Services
    const [partSearch, setPartSearch] = useState('');
    const filteredParts = useMemo(() => {
        if (!partSearch.trim()) return [];
        const term = partSearch.toLowerCase();
        return inventory.filter(i => 
            i.item_name.toLowerCase().includes(term) || 
            (i.sku && i.sku.toLowerCase().includes(term))
        ).slice(0, 8); // Top 8 results
    }, [partSearch, inventory]);

    const addPart = (part) => {
        const items = [...activeOrder.items];
        const existing = items.find(i => i.id === part.id && i.item_type === 'part');
        if (existing) {
            existing.quantity += 1;
        } else {
            items.push({ id: part.id, item_type: 'part', description: part.item_name, price: parseFloat(part.selling_price || part.price), quantity: 1 });
        }
        updateActiveOrder({ items });
        setPartSearch(''); // Clear search
    };

    const [serviceDesc, setServiceDesc] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    
    const addManualService = () => {
        if (!serviceDesc || !servicePrice) return;
        const items = [...activeOrder.items];
        items.push({ id: 'manual_' + Date.now(), item_type: 'service', description: serviceDesc, price: parseFloat(servicePrice), quantity: 1 });
        updateActiveOrder({ items });
        setServiceDesc('');
        setServicePrice('');
    };

    const updateQuantity = (index, qty) => {
        if (qty < 1) return;
        const items = [...activeOrder.items];
        items[index].quantity = parseInt(qty);
        updateActiveOrder({ items });
    };

    const removeItem = (index) => {
        const items = [...activeOrder.items];
        items.splice(index, 1);
        updateActiveOrder({ items });
    };

    const total = activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const formatPrice = (p) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(p).replace('LKR', 'Rs.');

    // 4. Checkout Logic
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
    
    const { data, setData, transform } = useForm({
        vehicle_number: '', customer_name: '', mechanic_id: '', items: [], payment_method: 'cash', discount: 0, tendered_amount: 0
    });

    const totalDue = total - parseFloat(data.discount || 0);
    const changeToReturn = parseFloat(data.tendered_amount || 0) - totalDue;

    transform((data) => ({
        ...data,
        payment_status: data.payment_method === 'credit' ? 'pending' : 'paid',
        amount_paid: data.payment_method === 'cash' ? totalDue : (data.payment_method === 'credit' ? 0 : totalDue)
    }));

    const proceedToCheckout = () => {
        setData({
            ...data,
            vehicle_number: activeOrder.vehicle_number,
            customer_name: activeOrder.customer_name,
            mechanic_id: activeOrder.mechanic_id,
            items: activeOrder.items,
            discount: 0,
            tendered_amount: ''
        });
        setIsCheckoutOpen(true);
    };

    const submitCheckout = (e) => {
        e.preventDefault();
        
        if (data.payment_method === 'cash' && data.tendered_amount < totalDue) {
            alert('Tendered amount is less than total due!');
            return;
        }

        setIsProcessingCheckout(true);
        
        axios.post(route('owner.pos.store'), {
            vehicle_number: activeOrder.vehicle_number,
            customer_name: activeOrder.customer_name,
            mechanic_id: activeOrder.mechanic_id,
            items: activeOrder.items,
            payment_status: data.payment_method === 'credit' ? 'pending' : 'paid',
            payment_method: data.payment_method,
            amount_paid: data.payment_method === 'credit' ? 0 : totalDue,
            discount: data.discount || 0,
            tendered_amount: data.payment_method === 'cash' ? data.tendered_amount : 0,
            balance_amount: data.payment_method === 'cash' ? changeToReturn : 0
        }).then(res => {
            setIsProcessingCheckout(false);
            setIsCheckoutOpen(false);
            removeOrder(activeOrderId, { stopPropagation: () => {} });
            window.open(route('owner.orders.print', res.data.invoice_id), '_blank');
        }).catch(err => {
            setIsProcessingCheckout(false);
            console.error(err);
            alert("Error completing checkout.");
        });
    };

    return (
        <AuthenticatedLayout fullWidth={true} header={null}>
            <Head title="POS Terminal" />
            
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)] flex gap-6 lg:gap-8">
                
                {/* MAIN: Current Active Order */}
                <div className="flex-[3] 2xl:flex-[4] flex flex-col gap-6 overflow-hidden">
                    
                    {/* Top: Vehicle & Customer Info */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex gap-5 items-start">
                        <div className="flex-[1.5] space-y-2">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Search Vehicle Number</label>
                            <div className="relative flex items-center">
                                <input 
                                    type="text"
                                    placeholder="e.g. CAB-1234"
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 font-mono text-xl uppercase focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-4 pr-12 shadow-inner relative z-10"
                                    value={activeOrder.vehicle_number}
                                    onChange={(e) => handleVehicleChange(e.target.value)}
                                    onFocus={() => setVehicleSearchFocused(true)}
                                    onBlur={() => setTimeout(() => setVehicleSearchFocused(false), 200)}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                </div>
                                
                                {vehicleSearchFocused && vehicleSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                        {vehicleSuggestions.map((veh, idx) => (
                                            <button 
                                                key={idx}
                                                type="button"
                                                onClick={() => selectVehicle(veh)}
                                                className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-slate-100 last:border-0 transition-colors flex justify-between items-center"
                                            >
                                                <div>
                                                    <div className="font-mono font-black text-slate-800">{veh.vehicle_number}</div>
                                                    <div className="text-xs font-bold text-slate-500">{veh.make} {veh.model}</div>
                                                </div>
                                                <div className="text-xs font-bold text-slate-400">
                                                    {veh.customer.name}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Beautiful Vehicle Info Card */}
                        <div className={`flex-[1.5] rounded-xl p-3 border flex gap-4 items-center transition-all ${activeOrder.found_vehicle ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-slate-50 border-slate-200 border-dashed'}`}>
                            {activeOrder.found_vehicle ? (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-black flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Customer & Vehicle Found</p>
                                        <h3 className="text-base font-black text-slate-800 leading-none">{activeOrder.customer_name}</h3>
                                        <p className="text-xs font-medium text-slate-600 mt-1">{activeOrder.found_vehicle.make} {activeOrder.found_vehicle.model} ({activeOrder.found_vehicle.year})</p>
                                    </div>
                                </>
                            ) : activeOrder.vehicle_number ? (
                                <div className="w-full flex flex-col justify-center items-center h-full text-center">
                                    <svg className="w-6 h-6 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle Not Found</p>
                                    <button 
                                        onClick={() => {
                                            registerForm.setData('vehicle_number', activeOrder.vehicle_number);
                                            setIsRegisterOpen(true);
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded-lg shadow text-[11px] transition-colors uppercase tracking-wide"
                                    >
                                        Register Vehicle
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full flex items-center justify-center h-full text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                    Search to begin
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assign Mechanic</label>
                            <select 
                                className="w-full bg-slate-50 border-slate-200 rounded-xl text-slate-800 text-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                                value={activeOrder.mechanic_id}
                                onChange={(e) => updateActiveOrder({ mechanic_id: e.target.value })}
                            >
                                <option value="">Select...</option>
                                {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Middle: Items Management */}
                    <div className="flex-1 flex gap-6 min-h-0">
                        
                        {/* Cart Table */}
                        <div className="flex-[2] bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-black text-slate-800 text-lg">Bill Items</h3>
                                <div className="text-right">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Subtotal</span>
                                    <span className="font-black text-indigo-600 text-xl">{formatPrice(total)}</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                                {activeOrder.items.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <svg className="w-12 h-12 opacity-30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                                        <p className="font-bold text-sm">No items added to the bill yet.</p>
                                    </div>
                                ) : (
                                    activeOrder.items.map((item, idx) => (
                                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 flex gap-3 items-center shadow-sm">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.item_type === 'service' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {item.item_type === 'service' ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-bold text-slate-800 text-[13px] leading-tight">{item.description}</h5>
                                                <div className="text-slate-500 font-black text-[11px] mt-0.5">{formatPrice(item.price)}</div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md p-1 shadow-inner">
                                                <button onClick={() => updateQuantity(idx, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 bg-white rounded shadow-sm border border-slate-200">-</button>
                                                <span className="font-black text-xs w-6 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(idx, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 bg-white rounded shadow-sm border border-slate-200">+</button>
                                            </div>
                                            <div className="font-black text-slate-800 w-20 text-right text-sm">
                                                {formatPrice(item.price * item.quantity)}
                                            </div>
                                            <button onClick={() => removeItem(idx)} className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 rounded-md transition-colors ml-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 border-t border-slate-200 bg-white">
                                <button 
                                    onClick={proceedToCheckout}
                                    disabled={activeOrder.items.length === 0 || !activeOrder.vehicle_number || !activeOrder.mechanic_id || !activeOrder.customer_name}
                                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black py-4 rounded-2xl text-lg transition-all shadow-md flex justify-center items-center gap-2"
                                >
                                    Proceed to Checkout
                                    <span className="bg-white/20 px-3 py-1 rounded-xl text-sm">{formatPrice(total)}</span>
                                </button>
                            </div>
                        </div>

                        {/* Add Tools Column */}
                        <div className="flex-1 flex flex-col gap-5">
                            
                            {/* Search Parts Panel */}
                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex-[1.5] flex flex-col overflow-hidden">
                                <h3 className="font-black text-slate-800 mb-4 text-base flex items-center gap-2">
                                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                    Search Parts
                                </h3>
                                <input 
                                    type="text"
                                    placeholder="Type part name or SKU..."
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 shadow-inner mb-3"
                                    value={partSearch}
                                    onChange={(e) => setPartSearch(e.target.value)}
                                />
                                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                    {filteredParts.map(part => (
                                        <button 
                                            key={part.id} 
                                            onClick={() => addPart(part)}
                                            className="w-full text-left bg-white border border-slate-100 hover:border-emerald-300 hover:shadow p-2.5 rounded-lg transition-all flex justify-between items-center group"
                                        >
                                            <div>
                                                <div className="font-bold text-slate-800 text-[13px]">{part.item_name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{part.sku || 'N/A'} - {part.quantity} in stock</div>
                                            </div>
                                            <div className="font-black text-emerald-600 text-xs group-hover:scale-110 transition-transform">
                                                {formatPrice(part.selling_price || part.price)}
                                            </div>
                                        </button>
                                    ))}
                                    {partSearch && filteredParts.length === 0 && (
                                        <p className="text-[10px] text-center text-slate-400 font-bold py-3">No parts found.</p>
                                    )}
                                </div>
                            </div>

                            {/* Manual Service Panel */}
                            <div className="bg-indigo-50 rounded-3xl p-5 shadow-sm border border-indigo-100 flex-1">
                                <h3 className="font-black text-indigo-900 mb-4 text-base flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                                    Add Custom Service
                                </h3>
                                <div className="space-y-2.5">
                                    <input 
                                        type="text"
                                        placeholder="Service Description"
                                        className="w-full bg-white border-white rounded-xl text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm py-2.5"
                                        value={serviceDesc}
                                        onChange={(e) => setServiceDesc(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <input 
                                            type="number"
                                            placeholder="Price (Rs.)"
                                            className="w-full bg-white border-white rounded-xl text-sm font-black text-indigo-600 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm py-2.5"
                                            value={servicePrice}
                                            onChange={(e) => setServicePrice(e.target.value)}
                                        />
                                        <button 
                                            onClick={addManualService}
                                            disabled={!serviceDesc || !servicePrice}
                                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold px-5 rounded-xl shadow transition-colors whitespace-nowrap text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* RIGHT SIDEBAR: Ongoing Orders */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-w-[300px]">
                    <div className="p-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-black text-white text-lg flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            Ongoing Bills
                        </h3>
                        <button 
                            onClick={handleNewOrder}
                            className="bg-white/10 hover:bg-white/20 text-white rounded-lg p-2 transition-colors border border-white/10"
                            title="Start New Order"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                        {orders.map(order => (
                            <div 
                                key={order.id}
                                onClick={() => setActiveOrderId(order.id)}
                                className={`cursor-pointer rounded-xl p-3 border-2 transition-all relative group overflow-hidden ${activeOrderId === order.id ? 'bg-white border-indigo-500 shadow ring-2 ring-indigo-500/10' : 'bg-white border-transparent shadow-sm hover:border-indigo-200'}`}
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <div className="font-mono font-black text-sm text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                        {order.vehicle_number || 'NEW ORDER'}
                                    </div>
                                    {orders.length > 1 && (
                                        <button 
                                            onClick={(e) => removeOrder(order.id, e)}
                                            className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all absolute top-3 right-3"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    )}
                                </div>
                                <div className="text-xs font-bold text-slate-500 line-clamp-1 pr-6">{order.customer_name || 'No Customer'}</div>
                                <div className="mt-2 flex justify-between items-end border-t border-slate-100 pt-2">
                                    <span className="text-[10px] font-bold text-slate-400">{order.items.length} items</span>
                                    <span className="font-black text-indigo-600 text-sm">
                                        {formatPrice(order.items.reduce((s, i) => s + i.price * i.quantity, 0))}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Checkout Modal */}
            <Modal show={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-2xl font-black text-slate-800 mb-6">Payment Checkout</h2>
                    <form onSubmit={submitCheckout} className="space-y-5">
                        
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                            <div className="flex justify-between items-center mb-2 text-sm text-slate-600">
                                <span>Vehicle:</span>
                                <span className="font-bold text-slate-800 bg-white px-2 py-1 border border-slate-200 rounded uppercase">{activeOrder.vehicle_number}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-700 mb-3">
                                <span>Subtotal:</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            
                            {/* Discount Input */}
                            <div className="flex items-center gap-3 mb-4">
                                <label className="text-sm font-bold text-slate-600 flex-1">Discount (Rs.):</label>
                                <input 
                                    type="number"
                                    min="0"
                                    max={total}
                                    step="0.01"
                                    className="w-32 bg-white border-slate-300 rounded-lg text-right font-bold focus:ring-emerald-500 focus:border-emerald-500 py-1.5"
                                    value={data.discount}
                                    onChange={(e) => setData('discount', e.target.value)}
                                />
                            </div>

                            <div className="flex justify-between items-center text-xl font-black text-indigo-700 border-t border-slate-200 pt-3">
                                <span>Total Due:</span>
                                <span>Rs. {totalDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Payment Method</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button type="button" onClick={() => setData('payment_method', 'cash')} className={`py-3 rounded-xl font-bold border-2 transition-all flex flex-col items-center justify-center gap-1 ${data.payment_method === 'cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                                    Cash
                                </button>
                                <button type="button" onClick={() => setData('payment_method', 'card')} className={`py-3 rounded-xl font-bold border-2 transition-all flex flex-col items-center justify-center gap-1 ${data.payment_method === 'card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                                    Card
                                </button>
                                <button type="button" onClick={() => setData('payment_method', 'credit')} className={`py-3 rounded-xl font-bold border-2 transition-all flex flex-col items-center justify-center gap-1 ${data.payment_method === 'credit' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    Credit
                                </button>
                            </div>
                        </div>

                        {data.payment_method === 'cash' && (
                            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 mt-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <label className="text-sm font-bold text-emerald-800 flex-1">Tendered Cash (Rs.):</label>
                                    <input 
                                        type="number"
                                        min={totalDue}
                                        step="0.01"
                                        required
                                        autoFocus
                                        className="w-32 bg-white border-emerald-300 rounded-lg text-right font-black text-lg focus:ring-emerald-500 focus:border-emerald-500 py-2 shadow-inner"
                                        value={data.tendered_amount}
                                        onChange={(e) => setData('tendered_amount', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex justify-between items-center text-lg font-black text-emerald-700 border-t border-emerald-200 pt-3">
                                    <span>Balance (Change):</span>
                                    <span>Rs. {changeToReturn > 0 ? changeToReturn.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex gap-3">
                            <button type="button" onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={isProcessingCheckout || (data.payment_method === 'cash' && data.tendered_amount < totalDue)} className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-slate-900/20">
                                {isProcessingCheckout ? 'Processing...' : 'Complete Checkout'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Registration Modal */}
            <Modal show={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        Register New Vehicle
                    </h2>
                    <form onSubmit={submitRegister} className="space-y-4">
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Vehicle Number *</label>
                                <input 
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-mono font-bold uppercase"
                                    value={registerForm.data.vehicle_number}
                                    onChange={(e) => registerForm.setData('vehicle_number', e.target.value)}
                                />
                                {registerForm.errors.vehicle_number && <p className="text-red-500 text-xs mt-1 font-bold">{registerForm.errors.vehicle_number}</p>}
                            </div>
                            
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Make (Brand) *</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g. Toyota"
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                                    value={registerForm.data.make}
                                    onChange={(e) => registerForm.setData('make', e.target.value)}
                                />
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Model *</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g. Corolla"
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                                    value={registerForm.data.model}
                                    onChange={(e) => registerForm.setData('model', e.target.value)}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Manufacture Year</label>
                                <input 
                                    type="number"
                                    placeholder="e.g. 2018"
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                                    value={registerForm.data.year}
                                    onChange={(e) => registerForm.setData('year', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-200 my-4 pt-4">
                            <h3 className="font-bold text-slate-800 text-sm mb-3">Customer Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name *</label>
                                    <input 
                                        type="text"
                                        required
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                                        value={registerForm.data.customer_name}
                                        onChange={(e) => registerForm.setData('customer_name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                                    <input 
                                        type="tel"
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                                        value={registerForm.data.customer_phone}
                                        onChange={(e) => registerForm.setData('customer_phone', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button type="button" onClick={() => setIsRegisterOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={registerForm.processing} className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                                {registerForm.processing ? 'Registering...' : 'Complete Registration'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
