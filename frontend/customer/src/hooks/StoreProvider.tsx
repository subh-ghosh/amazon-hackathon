"use client";

import { useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from "react";
import { StoreContext, type AppState, type AppStore, type PersonaType } from "./useStore";
import type { Order, Product, Address } from "@/api/types";

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getInitialState(): AppState {
    return {
        cart: [],
        orders: [],
        customer_id: "CUST-GOOD-001",
        persona: "TRUSTED",
        greenCredits: 150,
        greenHistory: [
            { action: "Welcome bonus", credits: 100, timestamp: new Date(Date.now() - 7 * 86400000).toISOString() },
            { action: "Chose sustainable packaging", credits: 10, timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
            { action: "Bought Renewed item", credits: 50, timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
            { action: "Redeemed: ₹500 off order", credits: -10, timestamp: new Date(Date.now() - 86400000).toISOString() },
        ],
    };
}

export function StoreProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AppState>(getInitialState);
    const [isLoaded, setIsLoaded] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const hasHydrated = useRef(false);

    useEffect(() => {
        fetch("/api/store", { cache: "no-store" })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Store bootstrap failed with status ${response.status}`);
                }
                return response.json() as Promise<AppState>;
            })
            .then((remoteState) => {
                setState(remoteState);
                hasHydrated.current = true;
                setIsLoaded(true);
            })
            .catch((error) => {
                setSyncError(error instanceof Error ? error.message : "Failed to load persisted store state.");
            });
    }, []);

    useEffect(() => {
        if (!hasHydrated.current) {
            return;
        }

        fetch("/api/store", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(state),
        }).then((response) => {
            if (!response.ok) {
                throw new Error(`Store persistence failed with status ${response.status}`);
            }
        }).catch((error) => {
            setSyncError(error instanceof Error ? error.message : "Failed to persist store state.");
        });
    }, [state]);

    const setPersona = useCallback((persona: PersonaType) => {
        setState((prev) => ({
            ...prev,
            persona,
            customer_id: persona === "TRUSTED" ? "CUST-GOOD-001" : "CUST-FRAUD-999"
        }));
    }, []);

    const earnCredits = useCallback((action: string, credits: number) => {
        setState((prev) => ({
            ...prev,
            greenCredits: prev.greenCredits + credits,
            greenHistory: [
                { action, credits, timestamp: new Date().toISOString() },
                ...prev.greenHistory,
            ],
        }));
    }, []);

    const addToCart = useCallback((product: Product, quantity = 1) => {
        setState((prev) => {
            const existing = prev.cart.find((item) => item.product.product_id === product.product_id);
            if (existing) {
                return { ...prev, cart: prev.cart.map((item) => item.product.product_id === product.product_id ? { ...item, quantity: item.quantity + quantity } : item) };
            }
            return { ...prev, cart: [...prev.cart, { product, quantity }] };
        });
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setState((prev) => ({ ...prev, cart: prev.cart.filter((item) => item.product.product_id !== productId) }));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        setState((prev) => ({ ...prev, cart: prev.cart.map((item) => item.product.product_id === productId ? { ...item, quantity } : item) }));
    }, []);

    const clearCart = useCallback(() => { setState((prev) => ({ ...prev, cart: [] })); }, []);

    const getCartTotal = useCallback((): number => {
        return state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }, [state.cart]);

    const getCartCount = useCallback((): number => {
        return state.cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [state.cart]);

    const placeOrder = useCallback((address: Address): Order => {
        const order: Order = {
            order_id: `ORD-${generateId()}`,
            customer_id: state.customer_id,
            items: [...state.cart],
            total: state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
            status: "confirmed",
            created_at: new Date().toISOString(),
            delivery_date: new Date(Date.now() + 3 * 86400000).toISOString(),
            address,
        };
        setState((prev) => ({ ...prev, orders: [order, ...prev.orders], cart: [] }));
        return order;
    }, [state.cart, state.customer_id]);

    const store: AppStore = useMemo(() => ({
        ...state, addToCart, removeFromCart, updateQuantity, clearCart, placeOrder, getCartTotal, getCartCount, setPersona, earnCredits,
    }), [state, addToCart, removeFromCart, updateQuantity, clearCart, placeOrder, getCartTotal, getCartCount, setPersona, earnCredits]);

    if (syncError) {
        return (
            <div className="min-h-screen bg-[#EAEDED] px-4 py-12">
                <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-semibold text-slate-900">Persistent Store Unavailable</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        This app is configured to use database-backed customer state only. The persisted session could not be loaded or saved.
                    </p>
                    <p className="mt-3 text-sm text-red-700">{syncError}</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[#EAEDED] px-4 py-12">
                <div className="mx-auto max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-semibold text-slate-900">Loading Persistent Store</h1>
                    <p className="mt-2 text-sm text-slate-600">Hydrating customer session from the backing database.</p>
                </div>
            </div>
        );
    }

    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
