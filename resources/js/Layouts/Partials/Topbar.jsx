import { Link } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

export default function Topbar({ user, activeGarage, sidebarOpen, setSidebarOpen, notifOpen, setNotifOpen, alerts }) {
    return (
        <header className="h-16 px-4 lg:px-8 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:transform-none lg:flex flex-col text-center lg:text-left pointer-events-none lg:pointer-events-auto">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                    <div className="text-[14px] lg:text-[15px] font-bold text-slate-800 tracking-tight leading-none">
                        {user.role === 'super_admin' ? 'Super Admin Portal' : (activeGarage?.name || 'Garage Branch')}
                    </div>
                </div>
                <div className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Auto Service Management</div>
            </div>

            <div className="flex items-center gap-3 lg:gap-6 ml-auto">
                {alerts && alerts.filter(a => a.message.includes('Low Stock Alert')).length > 0 && (
                    <div className="hidden md:flex items-center text-red-600 font-bold animate-pulse text-xs bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {alerts.find(a => a.message.includes('Low Stock Alert'))?.message}
                    </div>
                )}

                {alerts && alerts.length > 0 && (
                    <div className="relative">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 border-2 border-rose-100 hover:bg-rose-100 hover:border-rose-200 transition-colors text-rose-600 hover:text-rose-700 animate-pulse">
                                    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white text-[8px] font-bold text-white items-center justify-center">{alerts.length}</span>
                                    </span>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content align="right" width="80" contentClasses="py-2 bg-white ring-1 ring-slate-100 shadow-2xl rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                                <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                                    <div className="text-xs font-black text-slate-800 uppercase tracking-widest">Alerts & Notifications</div>
                                </div>
                                {alerts.map((alert, index) => (
                                    <div key={index} className={`px-4 py-3 flex gap-3 text-sm border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors cursor-pointer ${alert.type === 'error' || alert.type === 'danger' ? 'text-rose-600 bg-rose-50/30' : (alert.type === 'warning' ? 'text-amber-600 bg-amber-50/30' : 'text-slate-600')}`}>
                                        <div className="mt-0.5">
                                            {alert.type === 'error' || alert.type === 'danger' ? (
                                                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold leading-snug">{alert.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                )}

                <div className="relative">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <span className="inline-flex rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 border border-slate-200/60 text-sm leading-4 font-bold rounded-xl text-slate-700 bg-white hover:text-blue-600 focus:outline-none transition ease-in-out duration-150"
                                >
                                    <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-[11px] shadow-inner border border-blue-400/20">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="hidden lg:block text-left">
                                        <div className="text-[13px] text-slate-800">{user.name}</div>
                                        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 -mt-0.5">{user.role.replace('_', ' ')}</div>
                                    </div>
                                    <svg className="-mr-1 ml-1 h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </span>
                        </Dropdown.Trigger>

                        <Dropdown.Content align="right" width="48" contentClasses="py-1 bg-white ring-1 ring-slate-100 shadow-xl rounded-xl">
                            <Dropdown.Link href={route('profile.edit')} className="font-semibold text-[13px] py-2.5">
                                Account Profile
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button" className="font-bold text-[13px] text-rose-600 hover:text-rose-700 py-2.5">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
}
