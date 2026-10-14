import { Link } from '@inertiajs/react';

export default function Sidebar({ user, company, activeGarage, branches, hasBranches, sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed, openDropdowns, setOpenDropdowns, navLinks }) {
    const logoSrc = company?.logo_url 
        || (activeGarage?.logo_path ? `/tenant-media/${activeGarage.logo_path}` : null)
        || activeGarage?.logo_url 
        || "/images/auto-service-logo.png";

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            <div
                className="flex flex-col items-center text-center p-6 border-b border-slate-100/80 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition-colors"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-xl shadow-blue-500/20 mb-2 ring-2 ring-white transition-all duration-300 text-blue-600 ${!isCollapsed && 'w-16 h-16 rounded-[1.25rem] ring-4 mb-3'}`}>
                    <img src={logoSrc} alt={company?.name || "Auto Service"} className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} object-contain`} />
                </div>
                {!isCollapsed && (
                    <div className="animate-fade-in w-full px-2">
                        <div className="text-base font-black text-slate-900 tracking-tight leading-tight truncate" title={company?.name || activeGarage?.name}>
                            {company?.name || activeGarage?.name || "Auto Service"}
                        </div>
                        <div className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest mt-1 truncate">
                            {company?.tagline || "Enterprise System"}
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200/50 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                {navLinks.map((link) => {
                    if (link.isDropdown) {
                        return (
                            <div key={link.name} className="relative group">
                                <button
                                    onClick={() => {
                                        if (isCollapsed) setIsCollapsed(false);
                                        setOpenDropdowns(prev => ({ ...prev, [link.name]: !prev[link.name] }));
                                    }}
                                    className={`w-full flex items-center justify-between gap-3 py-2.5 rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${link.active || openDropdowns?.[link.name] ? 'bg-blue-50/50 text-blue-700 shadow-sm ring-1 ring-blue-100/50' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={link.active || openDropdowns?.[link.name] ? 'opacity-100' : 'opacity-80'}>{link.icon}</span>
                                        {!isCollapsed && <span className="text-[13px] font-semibold">{link.name}</span>}
                                    </div>
                                    {!isCollapsed && (
                                        <svg className={`w-4 h-4 transition-transform duration-200 ${openDropdowns?.[link.name] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    )}
                                </button>
                                
                                {!isCollapsed && (
                                    <div className={`overflow-hidden transition-all duration-300 ${openDropdowns?.[link.name] ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
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
                                className={`flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${link.active ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100/50' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
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
                            {isCollapsed && (
                                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-1 before:border-4 before:border-transparent before:border-r-slate-800">
                                    {link.name}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

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
    );
}

