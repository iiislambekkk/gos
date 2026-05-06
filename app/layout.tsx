import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers/providers";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Экзамен",
    description: "Подготовка к экзамену",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
        <body className={geist.className}>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}