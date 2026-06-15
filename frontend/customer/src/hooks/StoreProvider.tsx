"use client";

import { useState, useCallback, useMemo, type ReactNode } from "react";
import { StoreContext, type AppState, type AppStore } from "./useStore";
import type { CartItem, Order, Product, Address } from "@/api/types";

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AppState>({
        cart: [],
        orders: [],
        customer_id: "CUST-GOOD-001",
        persona: "TRUSTED",
    });

    const setPersona = useCallback((persona: import("./useStore").PersonaType) => {
        setState((prev) => ({
            ...prev,
            persona,
            customer_id: persona === "TRUSTED" ? "CUST-GOOD-001" : "CUST-FRAUD-999"
        }));
    }, []);

    const addToCart = useCallback((product: Product, quantity = 1) => {
        setState((prev) => {
            const existing = prev.cart.find(
                (item) => item.product.product_id === product.product_id
            );
            if (existing) {
                return {
                    ...prev,
                    cart: prev.cart.map((item) =>
                        item.product.product_id === product.product_id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    ),
                };
            }
            return { ...prev, cart: [...prev.cart, { product, quantity }] };
        });
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setState((prev) => ({
            ...prev,
            cart: prev.cart.filter((item) => item.product.product_id !== productId),
        }));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        setState((prev) => ({
            ...prev,
            cart: prev.cart.map((item) =>
                item.product.product_id === productId ? { ...item, quantity } : item
            ),
        }));
    }, []);

    const clearCart = useCallback(() => {
        setState((prev) => ({ ...prev, cart: [] }));
    }, []);

    const getCartTotal = useCallback((): number => {
        return state.cart.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        );
    }, [state.cart]);

    const getCartCount = useCallback((): number => {
        return state.cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [state.cart]);

    const placeOrder = useCallback(
        (address: Address): Order => {
            const order: Order = {
                order_id: `ORD-${generateId()}`,
                customer_id: state.customer_id,
                items: [...state.cart],
                total: state.cart.reduce(
                    (sum, item) => sum + item.product.price * item.quantity,
                    0
                ),
                status: "confirmed",
                created_at: new Date().toISOString(),
                delivery_date: new Date(
                    Date.now() + 3 * 24 * 60 * 60 * 1000
                ).toISOString(),
                address,
            };

            setState((prev) => ({
                ...prev,
                orders: [order, ...prev.orders],
                cart: [],
            }));

            return order;
        },
        [state.cart, state.customer_id]
    );

    const store: AppStore = useMemo(
        () => ({
            ...state,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            placeOrder,
            getCartTotal,
            getCartCount,
            setPersona,
        }),
        [
            state,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            placeOrder,
            getCartTotal,
            getCartCount,
            setPersona,
        ]
    );

    return (
        <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
}
