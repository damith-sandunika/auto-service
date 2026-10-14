import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

export const showToast = (message, type = 'success', duration = 4000) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app-toast', {
            detail: { message, type, duration }
        }));
    }
};

function ToastItem({ toast, onDismiss }) {
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const startTimeRef = useRef(Date.now());
    const remainingTimeRef = useRef(toast.duration || 4000);
    const timerRef = useRef(null);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            onDismiss(toast.id);
        }, 300);
    };

    useEffect(() => {
        if (isPaused) return;

        const interval = 16; // ~60fps
        const totalDuration = toast.duration || 4000;
        
        timerRef.current = setInterval(() => {
            remainingTimeRef.current -= interval;
            const newProgress = Math.max(0, (remainingTimeRef.current / totalDuration) * 100);
            setProgress(newProgress);

            if (remainingTimeRef.current <= 0) {
                clearInterval(timerRef.current);
                handleDismiss();
            }
        }, interval);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPaused]);

    const getIcon = () => {
        switch (toast.type) {
            case 'error':
                return (
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'info':
                return (
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            default: // success
                return (
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/10">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
        }
    };

    const getBarColor = () => {
        switch (toast.type) {
            case 'error': return 'bg-rose-500';
            case 'warning': return 'bg-amber-500';
            case 'info': return 'bg-blue-500';
            default: return 'bg-emerald-500';
        }
    };

    const getTitle = () => {
        if (toast.title) return toast.title;
        switch (toast.type) {
            case 'error': return 'Action Failed';
            case 'warning': return 'Notice';
            case 'info': return 'Information';
            default: return 'Success';
        }
    };

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={`pointer-events-auto relative overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-4 flex flex-col gap-2 transition-all duration-300 ease-out transform ${
                isExiting 
                    ? 'opacity-0 translate-x-12 scale-95' 
                    : 'opacity-100 translate-x-0 scale-100'
            }`}
        >
            <div className="flex items-start gap-3">
                {getIcon()}
                <div className="flex-1 pr-2">
                    <h4 className="text-xs font-black text-slate-800 tracking-tight leading-tight uppercase">
                        {getTitle()}
                    </h4>
                    <p className="text-sm font-semibold text-slate-600 leading-snug mt-0.5">
                        {toast.message}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleDismiss}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                    title="Close"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Animated countdown progress bar */}
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                <div 
                    className={`h-full ${getBarColor()} transition-all ease-linear duration-75 rounded-full`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);
    const { flash } = usePage().props;
    const lastFlashRef = useRef({});

    const addToast = (message, type = 'success', duration = 4000, title = null) => {
        if (!message) return;
        const id = Date.now() + Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type, duration, title }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // React to Inertia flash updates
    useEffect(() => {
        if (!flash) return;

        if (flash.success && flash.success !== lastFlashRef.current.success) {
            addToast(flash.success, 'success');
            lastFlashRef.current.success = flash.success;
        }
        if (flash.error && flash.error !== lastFlashRef.current.error) {
            addToast(flash.error, 'error');
            lastFlashRef.current.error = flash.error;
        }
        if (flash.warning && flash.warning !== lastFlashRef.current.warning) {
            addToast(flash.warning, 'warning');
            lastFlashRef.current.warning = flash.warning;
        }
        if (flash.info && flash.info !== lastFlashRef.current.info) {
            addToast(flash.info, 'info');
            lastFlashRef.current.info = flash.info;
        }
        if (flash.message && flash.message !== lastFlashRef.current.message) {
            addToast(flash.message, 'info');
            lastFlashRef.current.message = flash.message;
        }
    }, [flash]);

    // Listen to custom window events
    useEffect(() => {
        const handleCustomToast = (event) => {
            const { message, type = 'success', duration = 4000, title = null } = event.detail || {};
            if (message) {
                addToast(message, type, duration, title);
            }
        };

        window.addEventListener('app-toast', handleCustomToast);
        return () => window.removeEventListener('app-toast', handleCustomToast);
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-5 right-5 z-[9999] pointer-events-none flex flex-col gap-2.5 max-w-sm w-full px-3">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
}
