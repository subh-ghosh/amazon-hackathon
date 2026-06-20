"use client";

import { useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { StoreContext, type AppState, type AppStore, type PersonaType } from "./useStore";
import type { CartItem, Order, Product, Address } from "@/api/types";

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

const STORAGE_KEY = "amazon-slc-store";

function getInitialState(): AppState {
    if (typeof window !== "undefined") {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch { /* ignore */ }
    }
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

    // Persist to localStorage on every state change
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
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

    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
