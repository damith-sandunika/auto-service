import React, { useRef, useState } from 'react';

/**
 * SafeButton provides zero-millisecond synchronous click-locking
 * to prevent double-clicks, duplicate submissions, and accidental multi-taps.
 */
export default function SafeButton({
    children,
    onClick,
    type = 'button',
    disabled = false,
    loading = false,
    lockDuration = 1000,
    className = '',
    loadingText = 'Processing...',
    ...props
}) {
    const isLockedRef = useRef(false);
    const [isInternalLocked, setIsInternalLocked] = useState(false);

    const handleClick = async (e) => {
        if (disabled || loading || isLockedRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // Synchronous 0ms lock: blocks any immediate subsequent click
        isLockedRef.current = true;
        setIsInternalLocked(true);

        try {
            if (onClick) {
                await onClick(e);
            }
        } finally {
            // Guarantee unlocking after duration or async completion
            setTimeout(() => {
                isLockedRef.current = false;
                setIsInternalLocked(false);
            }, lockDuration);
        }
    };

    const isEffectivelyDisabled = disabled || loading || isInternalLocked;

    return (
        <button
            type={type}
            onClick={handleClick}
            disabled={isEffectivelyDisabled}
            className={`${className} ${isEffectivelyDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''} transition-all duration-150 inline-flex items-center justify-center`}
            {...props}
        >
            {(loading || isInternalLocked) ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{loadingText || children}</span>
                </span>
            ) : (
                children
            )}
        </button>
    );
}
