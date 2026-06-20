import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/hooks/StoreProvider";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Amazon - Circular Intelligence",
    description: "Shop smarter with AI-powered purchase confidence and intelligent returns",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.variable}>
                <StoreProvider>
                    <Header />
                    <main className="min-h-screen">{children}</main>
                </StoreProvider>
            </body>
        </html>
    );
}
