import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { EnvelopeIcon, LockClosedIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [isHovered, setIsHovered] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        
        const loginRoute = route().current('tenant.login') ? route('tenant.login') : route('login');
        
        post(loginRoute, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 selection:bg-blue-500 selection:text-white font-sans">
            <Head title="Secure Login" />

            {/* Dynamic Mesh Gradient Background - Light Mode */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/10 blur-[150px] mix-blend-multiply animate-pulse" style={{ animationDuration: '10s' }}></div>
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-300/20 blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: '12s' }}></div>
                
                {/* Subtle Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMikiLz48L3N2Zz4=')] opacity-50"></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                
                {/* Logo / Brand Area */}
                <div className="flex flex-col items-center justify-center mb-10 transform transition-transform hover:scale-105 duration-500">
                    <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center shadow-[0_10px_40px_rgba(59,130,246,0.15)] border border-slate-100 mb-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <img src="/images/auto-service-logo.png" alt="Auto Service" className="w-12 h-12 object-contain relative z-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Auto Service</h1>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] mt-2">Management Portal</p>
                </div>

                {/* Glassmorphism Login Card */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 relative overflow-hidden">
                    
                    {/* Subtle top highlight */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"></div>

                    <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Sign in to your account</h2>

                    {status && (
                        <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm font-medium text-emerald-700 text-center">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        
                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <EnvelopeIcon className="h-5 w-5" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm shadow-sm"
                                    placeholder="admin@autoservice.com"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.email} className="mt-2 text-red-500 text-xs font-medium ml-1" />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 mt-6">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <LockClosedIcon className="h-5 w-5" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm shadow-sm"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2 text-red-500 text-xs font-medium ml-1" />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center bg-white group-hover:border-blue-400">
                                        <svg className={`w-3 h-3 text-white transform transition-transform ${data.remember ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors underline-offset-4 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                disabled={processing}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                className={`
                                    relative w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl text-sm font-black text-white 
                                    bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600
                                    shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_25px_rgba(79,70,229,0.35)]
                                    transition-all duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed
                                `}
                            >
                                {/* Shine effect */}
                                <div className={`absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 ${isHovered && !processing ? 'animate-shine' : ''}`}></div>
                                
                                <span className="relative z-10">{processing ? 'Authenticating...' : 'Sign In Securely'}</span>
                                {!processing && (
                                    <ArrowRightOnRectangleIcon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                                )}
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-8 text-center border-t border-slate-100 pt-6">
                        <p className="text-xs font-medium text-slate-500">
                            Powered by <span className="text-slate-800 font-bold">DSRZone</span>
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Custom Animation Keyframes inline for shine effect */}
            <style jsx="true">{`
                @keyframes shine {
                    100% {
                        left: 200%;
                    }
                }
                .animate-shine {
                    animation: shine 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
