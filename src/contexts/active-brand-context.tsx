"use client";

/*
 * Active Brand Context
 * Manages the currently selected brand across the app
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";

type ActiveBrandContextType = {
    activeBrandId: string | null;
    setActiveBrand: (brandId: string) => void;
};

const ActiveBrandContext = createContext<ActiveBrandContextType | null>(null);

const BRAND_COOKIE_NAME = "current_brand";

export function ActiveBrandProvider({ children }: { children: React.ReactNode }) {
    const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from cookie on mount
    useEffect(() => {
        const savedBrandId = document.cookie
            .split("; ")
            .find((row) => row.startsWith(BRAND_COOKIE_NAME))
            ?.split("=")[1];

        setActiveBrandId(savedBrandId || null);
        setIsLoaded(true);
    }, []);

    // Set active brand and save to cookie
    const setActiveBrand = useCallback((brandId: string) => {
        setActiveBrandId(brandId);
        document.cookie = `${BRAND_COOKIE_NAME}=${brandId}; path=/; max-age=${60 * 60 * 24 * 365}`;
    }, []);

    // Don't render children until loaded to prevent hydration mismatch
    if (!isLoaded) {
        return null;
    }

    return (
        <ActiveBrandContext value={{ activeBrandId, setActiveBrand }}>
            {children}
        </ActiveBrandContext>
    );
}

export function useActiveBrand() {
    const context = useContext(ActiveBrandContext);
    if (!context) {
        throw new Error("useActiveBrand must be used within ActiveBrandProvider");
    }
    return context;
}
