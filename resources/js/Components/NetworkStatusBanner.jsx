import React, { useState, useEffect } from 'react';

export default function NetworkStatusBanner() {
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [wasOffline, setWasOffline] = useState(false);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                setShowReconnected(true);
                const timer = setTimeout(() => {
                    setShowReconnected(false);
                    setWasOffline(false);
                }, 4000);
                return () => clearTimeout(timer);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
            setShowReconnected(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    if (!isOnline) {
        return (
            <div className="bg-rose-600 text-white px-4 py-2.5 text-center text-sm font-black sticky top-0 z-50 shadow-lg flex items-center justify-center gap-3 animate-pulse">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-1.414-1.414m0 0L3 3m5.05 5.05a5 5 0 001.414 1.414M12 12v.01" />
                </svg>
                <span>⚠️ අන්තර්ජාල සම්බන්ධතාවය බිඳවැටී ඇත (No Internet Connection). කරුණාකර නැවත සංඥා ලැබෙනතුරු රැඳී සිටින්න.</span>
                <button
                    onClick={() => setIsOnline(navigator.onLine)}
                    className="ml-3 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs uppercase tracking-wider font-bold transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (showReconnected) {
        return (
            <div className="bg-emerald-600 text-white px-4 py-2 text-center text-sm font-black sticky top-0 z-50 shadow-md flex items-center justify-center gap-2 animate-fade-in">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>✅ අන්තර්ජාල සම්බන්ධතාවය නැවත තහවුරු විය (Connection Restored).</span>
            </div>
        );
    }

    return null;
}
