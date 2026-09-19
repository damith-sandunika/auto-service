import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

export default function AuthenticatedLayout({ header, headerActions, children, fullWidth = false }) {
    const user = usePage().props.auth.user;
    const activeGarage = usePage().props.active_garage;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebarCollapsed') === 'true';
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }, [isCollapsed]);

    const [isOthersOpen, setIsOthersOpen] = useState(
        localStorage.getItem('sidebarOthersOpen') === 'true'
    );
    useEffect(() => {
        localStorage.setItem('sidebarOthersOpen', isOthersOpen);
    }, [isOthersOpen]);

    // Navigation Links based on Role
    const getNavLinks = () => {
        switch (user.role) {
            case 'super_admin':
                return [
                    { name: 'Dashboard', href: route('admin.dashboard'), active: route().current('admin.dashboard'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
                    { name: 'Branches', href: route('admin.garages.index'), active: route().current('admin.garages.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
                    { name: 'System Users', href: route('admin.users.index'), active: route().current('admin.users.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
                    { name: 'Billing', href: route('admin.billings.index'), active: route().current('admin.billings.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                ];
            case 'garage_owner':
                return [
                    { name: 'Dashboard', href: route('owner.dashboard'), active: route().current('owner.dashboard'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
                    { name: 'POS Terminal', href: route('owner.pos.index'), active: route().current('owner.pos.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
                    { name: 'Appointments', href: route('owner.appointments.index'), active: route().current('owner.appointments.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
                    { name: 'Invoices', href: route('owner.orders.index'), active: route().current('owner.orders.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
                    { name: 'Inventory', href: route('owner.inventory.index'), active: route().current('owner.inventory.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
                    { name: 'GRN (Purchases)', href: route('owner.purchases.index'), active: route().current('owner.purchases.*') || route().current('owner.suppliers.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
                    { name: 'Staff Management', href: route('owner.hr.index'), active: route().current('owner.hr.*') || route().current('owner.payroll.*') || route().current('owner.staff.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
                    { name: 'Expenses', href: route('owner.expenses.index'), active: route().current('owner.expenses.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
                    { name: 'Reports', href: route('owner.reports.index'), active: route().current('owner.reports.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
                    { name: 'Reminders', href: route('owner.reminders.index'), active: route().current('owner.reminders.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
                    { 
                        name: 'Others', 
                        isDropdown: true,
                        active: route().current('owner.finance.*') || route().current('owner.vehicles.*') || route().current('owner.estimates.*') || route().current('owner.inspections.*') || route().current('owner.warranties.*'), 
                        icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
                        subItems: [
                            { name: 'Cashbook', href: route('owner.finance.index'), active: route().current('owner.finance.*') },
                            { name: 'Vehicles', href: route('owner.vehicles.index'), active: route().current('owner.vehicles.*') },
                            { name: 'Estimates', href: route('owner.estimates.index'), active: route().current('owner.estimates.*') },
                            { name: 'Inspections', href: route('owner.inspections.index'), active: route().current('owner.inspections.*') },
                            { name: 'Warranties', href: route('owner.warranties.index'), active: route().current('owner.warranties.*') },
                        ]
                    },
                    { name: 'Settings', href: route('owner.settings.index'), active: route().current('owner.settings.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
                ];
            case 'garage_staff':
                return [
                    { name: 'Dashboard', href: route('staff.dashboard'), active: route().current('staff.dashboard'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
                    { name: 'My Jobs', href: route('staff.jobs.index'), active: route().current('staff.jobs.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
                ];
            case 'vehicle_owner':
                return [
                    { name: 'Vehicle History', href: route('customer.dashboard'), active: route().current('customer.dashboard'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
                ];
            default:
                return [{ name: 'Dashboard', href: route('dashboard'), active: route().current('dashboard'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> }];
        }
    };

    const navLinks = getNavLinks();
    const alerts = usePage().props.global_alerts || [];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50/50 font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* ══════════ SIDEBAR ══════════ */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } ${isCollapsed ? 'w-20' : 'w-64'}`}
            >
                {/* Brand & Logo */}
                <div
                    className="flex flex-col items-center text-center p-6 border-b border-slate-100/80 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition-colors"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-xl shadow-blue-500/20 mb-2 ring-2 ring-white transition-all duration-300 text-blue-600 ${!isCollapsed && 'w-16 h-16 rounded-[1.25rem] ring-4 mb-3'}`}>
                        <img src={activeGarage?.logo_url || "/images/auto-service-logo.png"} alt="Auto Service" className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} object-contain`} />
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fade-in">
                            <div className="text-lg font-black text-slate-900 tracking-tight leading-tight">{activeGarage?.name || "Auto Service"}</div>
                            <div className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest mt-1">Management</div>
                        </div>
                    )}
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200/50 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {navLinks.map((link) => {
                        if (link.isDropdown) {
                            return (
                                <div key={link.name} className="relative group">
                                    <button
                                        onClick={() => {
                                            if (isCollapsed) setIsCollapsed(false);
                                            setIsOthersOpen(!isOthersOpen);
                                        }}
                                        className={`w-full flex items-center justify-between gap-3 py-2.5 rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${link.active || isOthersOpen ? 'bg-blue-50/50 text-blue-700 shadow-sm ring-1 ring-blue-100/50' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={link.active || isOthersOpen ? 'opacity-100' : 'opacity-80'}>{link.icon}</span>
                                            {!isCollapsed && <span className="text-[13px] font-semibold">{link.name}</span>}
                                        </div>
                                        {!isCollapsed && (
                                            <svg className={`w-4 h-4 transition-transform duration-200 ${isOthersOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        )}
                                    </button>
                                    
                                    {!isCollapsed && (
                                        <div className={`overflow-hidden transition-all duration-300 ${isOthersOpen ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                            <div className="pl-9 pr-3 py-1.5 space-y-1 relative before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 rounded-lg">
                                                {link.subItems.map(subItem => (
                                                    <Link
                                                        key={subItem.name}
                                                        href={subItem.href}
                                                        className={`block py-2 text-xs font-semibold rounded-lg px-3 transition-colors ${subItem.active ? 'text-blue-700 bg-blue-50/80 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                                                    >
                                                        {subItem.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-1 before:border-4 before:border-transparent before:border-r-slate-800">
                                            {link.name}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                        <div key={link.name} className="relative group">
                            <Link
                                href={link.href}
                                className={`flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center px-0' : 'px-3'
                                    } ${link.active
                                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100/50'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <span className={link.active ? 'opacity-100' : 'opacity-80'}>
                                    {link.icon}
                                </span>
                                {!isCollapsed && (
                                    <span className="text-[13px] font-semibold whitespace-nowrap animate-fade-in">
                                        {link.name}
                                    </span>
                                )}
                            </Link>


                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-1 before:border-4 before:border-transparent before:border-r-slate-800">
                                    {link.name}
                                </div>
                            )}
                        </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100/80 text-center bg-white/40">
                    {!isCollapsed ? (
                        <div className="flex flex-col items-center justify-center animate-fade-in">
                            <div className="text-[11px] font-extrabold text-blue-600 tracking-widest uppercase mb-0.5">Powered by DSRZone</div>
                            <div className="text-[9px] font-extrabold text-slate-400/80 tracking-widest uppercase">Auto Service</div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center animate-fade-in" title="Powered by DSRZone Auto Service">
                            <div className="text-[11px] font-extrabold text-blue-600 tracking-widest uppercase">DSR</div>
                        </div>
                    )}
                </div>
            </aside>

            {/* ══════════ MAIN AREA ══════════ */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Topbar */}
                <header className="h-16 px-4 lg:px-8 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between sticky top-0 z-30 shadow-sm">

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>

                    {/* Center Title (Mobile) / Left Title (Desktop) */}
                    <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:transform-none lg:flex flex-col text-center lg:text-left pointer-events-none lg:pointer-events-auto">
                        <div className="flex items-center justify-center lg:justify-start gap-2">
                            <div className="text-[14px] lg:text-[15px] font-bold text-slate-800 tracking-tight leading-none">
                                {user.role === 'super_admin' ? 'Super Admin Portal' : (activeGarage?.name || 'Garage Branch')}
                            </div>
                        </div>
                        <div className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Auto Service Management</div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3 lg:gap-6 ml-auto">

                        {/* Low Stock Alert Marquee / Flashing Text */}
                        {alerts && alerts.filter(a => a.message.includes('Low Stock Alert')).length > 0 && (
                            <div className="hidden md:flex items-center text-red-600 font-bold animate-pulse text-xs bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {alerts.find(a => a.message.includes('Low Stock Alert'))?.message}
                            </div>
                        )}

                        {/* Alerts Dropdown (replaces sticky banner) */}
                        {alerts && alerts.length > 0 && (
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 border-2 border-rose-100 hover:bg-rose-100 hover:border-rose-200 transition-colors text-rose-600 hover:text-rose-700 animate-pulse">
                                            <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                <span className="relative flex rounded-full h-3.5 w-3.5 bg-rose-500 text-[9px] text-white items-center justify-center font-bold">{alerts.length}</span>
                                            </span>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content contentClasses="py-2 bg-white border border-slate-200 rounded-2xl shadow-xl w-[320px]">
                                        <div className="px-4 py-2 border-b border-slate-100 font-bold text-sm text-slate-800">System Alerts</div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {alerts.map((alert, idx) => (
                                                <div key={idx} className={`px-4 py-3 text-[13px] font-bold border-b border-slate-50 last:border-0 ${alert.type === 'error' ? 'text-rose-600 bg-rose-50/30' : 'text-amber-700 bg-amber-50/30'}`}>
                                                    {alert.message}
                                                </div>
                                            ))}
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        )}

                        {/* Notifications Menu */}
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border-2 border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-colors text-slate-500 hover:text-slate-700">
                                        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content contentClasses="py-2 bg-white border border-slate-200 rounded-2xl shadow-xl w-[280px]">
                                    <div className="px-4 py-2 text-center text-xs font-medium text-slate-400">No new notifications.</div>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center p-1 rounded-full hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-[13px] font-black text-white shadow-md">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="hidden lg:block text-[13px] font-bold text-slate-700">{user.name}</span>
                                            <svg className="hidden lg:block w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content contentClasses="py-1 bg-white border border-slate-200 rounded-2xl shadow-xl w-48">
                                    <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2.5 px-4 py-3 text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100">
                                        <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        Profile Settings
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2.5 w-full px-4 py-3 text-[12.5px] font-bold text-red-600 hover:bg-red-50/50 hover:text-red-700 text-left">
                                        <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Sign Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>



                {/* Main Content Area */}
                <main className={`flex-1 overflow-y-auto ${fullWidth ? 'p-0' : 'p-4 md:p-6 lg:p-8'} relative z-10 scrollbar-hide animate-fade-in-up`}>

                    {/* Header Slot (Geometric Pattern matching Laundry SaaS) */}
                    {(header || headerActions) && (
                        <div className={`mb-6 ${fullWidth ? 'mx-4 sm:mx-6 lg:mx-8 mt-4' : ''}`}>
                            <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-slate-200 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-50/80 to-transparent pointer-events-none"></div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none opacity-60">
                                    <div className="w-24 h-24 bg-blue-100/50 rotate-45 translate-x-12 rounded-lg"></div>
                                    <div className="w-36 h-36 bg-blue-200/50 rotate-45 translate-x-6 -ml-8 rounded-xl"></div>
                                    <div className="w-48 h-48 bg-blue-300/40 rotate-45 -ml-12 rounded-2xl"></div>
                                    <div className="w-32 h-32 bg-blue-400/30 rotate-45 -ml-16 rounded-lg"></div>
                                </div>

                                <div className="relative z-10 w-full flex-1">
                                    {header}
                                </div>

                                {headerActions && (
                                    <div className="relative z-10 hidden sm:block shrink-0">
                                        {headerActions}
                                    </div>
                                )}
                            </div>

                            {/* Mobile Actions (Outside Card) */}
                            {headerActions && (
                                <div className="mt-4 sm:hidden w-full flex flex-col gap-3">
                                    {headerActions}
                                </div>
                            )}
                        </div>
                    )}

                    {children}
                </main>
            </div>

            {/* Custom Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
            `}} />
        </div>
    );
}
