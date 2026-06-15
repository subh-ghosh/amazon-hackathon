import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/hooks/StoreProvider";
import { Header } from "@/components/Header";

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
            <body>
                <StoreProvider>
                    <Header />
                    <main className="min-h-screen">{children}</main>
                </StoreProvider>
            </body>
        </html>
    );
}
