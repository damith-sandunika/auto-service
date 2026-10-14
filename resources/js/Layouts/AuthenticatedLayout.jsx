import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from './Partials/Sidebar';
import Topbar from './Partials/Topbar';
import NetworkStatusBanner from '@/Components/NetworkStatusBanner';

export default function AuthenticatedLayout({ header, headerActions, children, fullWidth = false }) {
    const user = usePage().props.auth.user;
    const company = usePage().props.company;
    const activeGarage = usePage().props.active_garage;
    const branches = usePage().props.branches || [];
    const hasBranches = usePage().props.has_branches;
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

    const [openDropdowns, setOpenDropdowns] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                return JSON.parse(localStorage.getItem('sidebarOpenDropdowns')) || {};
            } catch (e) {
                return {};
            }
        }
        return {};
    });

    useEffect(() => {
        localStorage.setItem('sidebarOpenDropdowns', JSON.stringify(openDropdowns));
    }, [openDropdowns]);

    const getNavLinks = () => {
        switch (user.role) {
            case 'saas_admin':
                return [
                    { name: 'Dashboard', href: route('saas.dashboard'), active: route().current('saas.dashboard'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
                    { name: 'Companies', href: route('saas.companies.index'), active: route().current('saas.companies.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
                    { name: 'Company Owners', href: route('saas.owners.index'), active: route().current('saas.owners.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
                    { name: 'Subscriptions', href: route('saas.subscriptions.index'), active: route().current('saas.subscriptions.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                    { name: 'Vehicle Master', href: route('saas.vehicle-master.index'), active: route().current('saas.vehicle-master.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
                ];
            case 'company_owner':
            case 'branch_admin':
            case 'accountant':
            case 'hr_manager':
            case 'staff':
            case 'garage_owner':
            case 'garage_staff':
                const perms = usePage().props.auth.permissions;
                const hasPerm = (module) => {
                    if (perms === 'all') return true;
                    return perms && perms[module] && perms[module].includes('view');
                };

                // The staff dashboard is minimal, owner dashboard is full
                const dashRoute = (user.role === 'staff' || user.role === 'garage_staff') ? route('staff.dashboard') : route('owner.dashboard');

                let links = [
                    { name: 'Dashboard', href: dashRoute, active: route().current('*.dashboard'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> }
                ];

                if (perms === 'all') {
                    links.push({ name: 'Branches', href: route('owner.branches.index'), active: route().current('owner.branches.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> });
                }

                if (hasPerm('pos')) {
                    links.push({ name: 'POS Terminal', href: route('owner.pos.index'), active: route().current('owner.pos.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> });
                }

                if (hasPerm('pos') || hasPerm('invoices')) {
                    links.push({ name: 'Appointments', href: route('owner.appointments.index'), active: route().current('owner.appointments.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> });
                }

                if (hasPerm('invoices')) {
                    links.push({ name: 'Invoices', href: route('owner.orders.index'), active: route().current('owner.orders.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> });
                }

                if (hasPerm('inventory')) {
                    links.push({ name: 'Inventory', href: route('owner.inventory.index'), active: route().current('owner.inventory.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> });
                }

                if (hasPerm('purchases')) {
                    links.push({ name: 'Purchases', href: route('owner.purchases.index'), active: route().current('owner.purchases.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> });
                }

                if (hasPerm('suppliers')) {
                    links.push({ name: 'Suppliers', href: route('owner.suppliers.index'), active: route().current('owner.suppliers.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> });
                }

                if (hasPerm('hr')) {
                    links.push({ name: 'Staff Management', href: route('owner.hr.index'), active: route().current('owner.hr.*') && !route().current('owner.hr.dashboard') || route().current('owner.payroll.*') || route().current('owner.staff.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> });
                    links.push({ name: 'HR Dashboard', href: route('owner.hr.dashboard'), active: route().current('owner.hr.dashboard'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> });
                }

                if (hasPerm('expenses')) {
                    links.push({ name: 'Expenses', href: route('owner.expenses.index'), active: route().current('owner.expenses.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> });
                }

                if (hasPerm('reports')) {
                    links.push({ 
                        name: 'Reports', 
                        isDropdown: true,
                        active: route().current('owner.reports.*'), 
                        icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
                        subItems: [
                            { name: 'Sales Log', href: route('owner.reports.index', { tab: 'sales' }), active: typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('tab') === 'sales' || !new URLSearchParams(window.location.search).get('tab')) },
                            { name: 'Pending Orders', href: route('owner.reports.index', { tab: 'pending' }), active: typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'pending' },
                            { name: 'Credit Customers', href: route('owner.reports.index', { tab: 'credit' }), active: typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'credit' },
                            { name: 'Top Customers', href: route('owner.reports.index', { tab: 'customers' }), active: typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'customers' },
                            { name: 'Expenses / Salaries', href: route('owner.reports.index', { tab: 'expenses' }), active: typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'expenses' },
                        ]
                    });
                }

                // Add Others dropdown dynamically based on sub-permissions
                let othersSubItems = [];
                // Allow finance/cashbook for POS or expenses users loosely, or just give it to owner
                if (perms === 'all' || hasPerm('pos') || hasPerm('expenses')) othersSubItems.push({ name: 'Cashbook', href: route('owner.finance.index'), active: route().current('owner.finance.*') });
                if (hasPerm('vehicles')) othersSubItems.push({ name: 'Vehicles', href: route('owner.vehicles.index'), active: route().current('owner.vehicles.*') });
                if (hasPerm('invoices')) othersSubItems.push({ name: 'Estimates', href: route('owner.estimates.index'), active: route().current('owner.estimates.*') });
                if (hasPerm('inspections')) othersSubItems.push({ name: 'Inspections', href: route('owner.inspections.index'), active: route().current('owner.inspections.*') });
                if (hasPerm('warranties')) othersSubItems.push({ name: 'Warranties', href: route('owner.warranties.index'), active: route().current('owner.warranties.*') });

                if (othersSubItems.length > 0) {
                    links.push({
                        name: 'Others',
                        isDropdown: true,
                        active: route().current('owner.finance.*') || route().current('owner.vehicles.*') || route().current('owner.estimates.*') || route().current('owner.inspections.*') || route().current('owner.warranties.*'),
                        icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
                        subItems: othersSubItems
                    });
                }

                if (perms === 'all' || hasPerm('roles')) {
                    links.push({ 
                        name: 'Settings', 
                        isDropdown: true,
                        active: route().current('owner.settings.*') || route().current('owner.roles.*'), 
                        icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
                        subItems: [
                            ...(perms === 'all' ? [{ name: 'Company Settings', href: route('owner.settings.index'), active: route().current('owner.settings.index') }] : []),
                            ...(perms === 'all' ? [{ name: 'Invoice Format', href: route('owner.settings.invoice'), active: route().current('owner.settings.invoice') }] : []),
                            ...(perms === 'all' ? [{ name: 'Thermal Bill', href: route('owner.settings.thermal'), active: route().current('owner.settings.thermal') }] : []),
                            ...(hasPerm('roles') || perms === 'all' ? [{ name: 'Access & Roles', href: route('owner.roles.index'), active: route().current('owner.roles.*') }] : []),
                            ...(perms === 'all' ? [{ name: 'Danger Zone', href: route('owner.settings.danger-zone'), active: route().current('owner.settings.danger-zone') }] : []),
                        ]
                    });
                }

                // If user is just 'staff' with no special permissions, add 'My Jobs'
                if ((user.role === 'staff' || user.role === 'garage_staff') && (!perms || Object.keys(perms).length === 0)) {
                    links.push({ name: 'My Jobs', href: route('staff.jobs.index'), active: route().current('staff.jobs.*'), icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> });
                }

                return links;

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
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <Sidebar 
                user={user} 
                company={company}
                activeGarage={activeGarage} 
                branches={branches}
                hasBranches={hasBranches}
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
                openDropdowns={openDropdowns} 
                setOpenDropdowns={setOpenDropdowns} 
                navLinks={navLinks} 
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <Topbar 
                    user={user} 
                    company={company}
                    activeGarage={activeGarage} 
                    branches={branches}
                    hasBranches={hasBranches}
                    sidebarOpen={sidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                    notifOpen={notifOpen} 
                    setNotifOpen={setNotifOpen} 
                    alerts={alerts} 
                />

                <NetworkStatusBanner />

                <main className={`flex-1 overflow-y-auto ${fullWidth ? 'p-0' : 'p-4 md:p-6 lg:p-8'} relative z-10 scrollbar-hide animate-fade-in-up`}>
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

                                <div className="relative z-10 w-full flex-1 flex items-center gap-4">
                                    {route().current() && !route().current().includes('dashboard') && (
                                        <button 
                                            onClick={() => window.history.back()} 
                                            className="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl shadow-sm border border-slate-200 transition-all flex items-center justify-center shrink-0"
                                            title="Go Back"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                        </button>
                                    )}
                                    <div className="flex-1 w-full overflow-hidden">
                                        {header}
                                    </div>
                                </div>

                                {headerActions && (
                                    <div className="relative z-10 hidden sm:block shrink-0">
                                        {headerActions}
                                    </div>
                                )}
                            </div>

                            {headerActions && (
                                <div className="mt-4 sm:hidden w-full flex flex-col gap-3">
                                    {headerActions}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={`${fullWidth ? 'max-w-[1600px]' : 'max-w-7xl'} mx-auto animate-fade-in`}>
                        {children}
                    </div>
                    
                    <div className="h-8"></div>
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
