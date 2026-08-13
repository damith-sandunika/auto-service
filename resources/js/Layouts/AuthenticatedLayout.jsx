import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

export default function AuthenticatedLayout({ header, children, fullWidth = false }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    // Navigation Links based on Role
    const getNavLinks = () => {
        switch (user.role) {
            case 'super_admin':
                return [
                    { name: 'Dashboard', href: route('admin.dashboard'), active: route().current('admin.dashboard'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
                    { name: 'Branches', href: route('admin.garages.index'), active: route().current('admin.garages.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
                    { name: 'System Users', href: route('admin.users.index'), active: route().current('admin.users.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
                    { name: 'Billing', href: route('admin.billings.index'), active: route().current('admin.billings.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
                ];
            case 'garage_owner':
                return [
                    { name: 'Dashboard', href: route('owner.dashboard'), active: route().current('owner.dashboard'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
                    { name: 'POS Terminal', href: route('owner.pos.index'), active: route().current('owner.pos.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg> },
                    { name: 'Staff Management', href: route('owner.staff.index'), active: route().current('owner.staff.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
                    { name: 'Inventory', href: route('owner.inventory.index'), active: route().current('owner.inventory.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg> },
                    { name: 'Appointments', href: route('owner.appointments.index'), active: route().current('owner.appointments.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
                    { name: 'Orders / Invoices', href: route('owner.orders.index'), active: route().current('owner.orders.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg> },
                    { name: 'Expenses', href: route('owner.expenses.index'), active: route().current('owner.expenses.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg> },
                    { name: 'Reports', href: route('owner.reports.index'), active: route().current('owner.reports.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
                ];
            case 'garage_staff':
                return [
                    { name: 'Dashboard', href: route('staff.dashboard'), active: route().current('staff.dashboard'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
                    { name: 'My Jobs', href: route('staff.jobs.index'), active: route().current('staff.jobs.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
                ];
            case 'vehicle_owner':
                return [
                    { name: 'Vehicle History', href: route('customer.dashboard'), active: route().current('customer.dashboard'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg> },
                ];
            default:
                return [{ name: 'Dashboard', href: route('dashboard'), active: route().current('dashboard'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }];
        }
    };

    const navLinks = getNavLinks();

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
                className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand & Logo */}
                <div className="flex flex-col items-center text-center p-6 border-b border-slate-100/80 bg-slate-50/50">
                    <div className="w-20 h-20 rounded-[1.25rem] bg-white flex items-center justify-center shadow-xl shadow-blue-500/10 mb-3 ring-4 ring-white transition-transform hover:scale-105 duration-300 text-blue-600">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.832M11.42 15.17l-4.96-4.96a2.476 2.476 0 010-3.502l.626-.626a2.476 2.476 0 013.502 0l4.96 4.96m-8.73-4.88L3 9M9 3l1.88 1.88" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-xl font-black text-slate-900 tracking-tight leading-tight">Garage SaaS</div>
                        <div className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mt-1">Management System</div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-[13px] font-semibold ${
                                link.active 
                                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100/50' 
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <span className={link.active ? 'opacity-100' : 'opacity-80'}>
                                {link.icon}
                            </span>
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100/80 text-center bg-white/40">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl bg-red-50/50 border border-red-100 text-red-600 hover:text-red-700 hover:bg-red-100 hover:border-red-200 transition-all duration-200 text-xs font-bold tracking-wide shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        Sign Out
                    </Link>
                    <div className="text-[10px] font-extrabold text-slate-400/80 tracking-widest mt-4 uppercase">Software by GarageSaaS</div>
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
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </button>

                    {/* Center Title (Mobile) / Left Title (Desktop) */}
                    <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:transform-none lg:flex flex-col text-center lg:text-left pointer-events-none lg:pointer-events-auto">
                        <div className="flex items-center justify-center lg:justify-start gap-2">
                            <div className="text-[14px] lg:text-[15px] font-bold text-slate-800 tracking-tight leading-none">
                                {user.role === 'super_admin' ? 'Super Admin Portal' : 'Garage Branch Manager'}
                            </div>
                        </div>
                        <div className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Garage SaaS Operations</div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3 lg:gap-6 ml-auto">
                        
                        {/* Notifications Menu */}
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border-2 border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-colors text-slate-500 hover:text-slate-700">
                                        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
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
                                            <svg className="hidden lg:block w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                                        </div>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content contentClasses="py-1 bg-white border border-slate-200 rounded-2xl shadow-xl w-48">
                                    <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2.5 px-4 py-3 text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100">
                                        <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                        Profile Settings
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2.5 w-full px-4 py-3 text-[12.5px] font-bold text-red-600 hover:bg-red-50/50 hover:text-red-700 text-left">
                                        <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
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
                    {header && (
                        <div className="mb-6 lg:mb-8 bg-white rounded-md p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none opacity-60">
                                <div className="w-24 h-24 bg-blue-50 rotate-45 translate-x-12 rounded-lg"></div>
                                <div className="w-36 h-36 bg-blue-100 rotate-45 translate-x-6 -ml-8 rounded-xl"></div>
                                <div className="w-48 h-48 bg-blue-200 rotate-45 -ml-12 rounded-2xl"></div>
                                <div className="w-32 h-32 bg-blue-300 rotate-45 -ml-16 rounded-lg"></div>
                            </div>
                            
                            <div className="relative z-10 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                                <div className="w-full text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                                    {header}
                                </div>
                            </div>
                        </div>
                    )}

                    {children}
                </main>
            </div>
            
            {/* Custom Styles */}
            <style dangerouslySetInnerHTML={{__html: `
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
