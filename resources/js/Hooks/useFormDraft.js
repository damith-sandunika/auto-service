import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useFormDraft hook: Protects against power cuts, accidental browser closures,
 * and page refreshes by auto-saving form drafts to localStorage and providing instant restore.
 */
export default function useFormDraft(storageKey, currentData, setData, isEnabled = true) {
    const [hasDraft, setHasDraft] = useState(false);
    const [draftTimestamp, setDraftTimestamp] = useState(null);
    const isInitialMount = useRef(true);

    // Check for existing draft on mount
    useEffect(() => {
        if (!isEnabled || typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.data && Object.keys(parsed.data).length > 0) {
                    // Check if draft has any meaningful content
                    const hasValues = Object.values(parsed.data).some(v => v !== '' && v !== null && v !== undefined);
                    if (hasValues) {
                        setHasDraft(true);
                        setDraftTimestamp(parsed.timestamp || null);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to read draft from localStorage', e);
        }
    }, [storageKey, isEnabled]);

    // Auto-save on data change with debounce
    useEffect(() => {
        if (!isEnabled || typeof window === 'undefined') return;

        // Skip saving initial empty state
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timer = setTimeout(() => {
            try {
                const hasValues = Object.values(currentData).some(v => v !== '' && v !== null && v !== undefined);
                if (hasValues) {
                    localStorage.setItem(storageKey, JSON.stringify({
                        data: currentData,
                        timestamp: new Date().toISOString()
                    }));
                    setHasDraft(true);
                }
            } catch (e) {
                console.error('Failed to auto-save draft to localStorage', e);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [storageKey, currentData, isEnabled]);

    const restoreDraft = useCallback(() => {
        if (typeof window === 'undefined') return;
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.data) {
                    setData(parsed.data);
                }
            }
        } catch (e) {
            console.error('Failed to restore draft', e);
        }
    }, [storageKey, setData]);

    const clearDraft = useCallback(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(storageKey);
            setHasDraft(false);
            setDraftTimestamp(null);
        } catch (e) {
            console.error('Failed to clear draft', e);
        }
    }, [storageKey]);

    return {
        hasDraft,
        draftTimestamp,
        restoreDraft,
        clearDraft
    };
}
