"use client";

import { createContext, useContext } from "react";
import type { CartItem, Order, Product, Address } from "@/api/types";

export type PersonaType = "TRUSTED" | "SUSPICIOUS";

export const PERSONA_LABELS: Record<PersonaType, string> = {
    TRUSTED: "Regular Customer",
    SUSPICIOUS: "Frequent Returner",
};

export interface GreenCreditEntry {
    action: string;
    credits: number;
    timestamp: string;
}

export interface AppState {
    cart: CartItem[];
    orders: Order[];
    customer_id: string;
    persona: PersonaType;
    greenCredits: number;
    greenHistory: GreenCreditEntry[];
}

export interface AppActions {
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    placeOrder: (address: Address) => Order;
    getCartTotal: () => number;
    getCartCount: () => number;
    setPersona: (persona: PersonaType) => void;
    earnCredits: (action: string, credits: number) => void;
}

export type AppStore = AppState & AppActions;

export const StoreContext = createContext<AppStore | null>(null);

export function useStore(): AppStore {
    const store = useContext(StoreContext);
    if (!store) {
        throw new Error("useStore must be used within a StoreProvider");
    }
    return store;
}
