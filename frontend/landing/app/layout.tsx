import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Amazon Second Life Commerce | HackOn with Amazon 2026",
    description: "An intelligent ecosystem where returned products automatically find their next best owner — through resale, refurbishment, donation, or recycling.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-[#0a0a0a] text-white">{children}</body>
        </html>
    );
}
