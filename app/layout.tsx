import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers/providers";
import { cn } from "@/lib/utils";
import {MobileBottomNav, Sidebar} from "@/components/sidebar";
import {Navbar} from "@/components/navbar";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {redirect} from "next/navigation";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Экзамен",
    description: "Подготовка к экзамену",
};

export default async function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {

    return (
        <html lang="ru" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
        <body className={geist.className}>
        <Providers>
            {children}

            <MobileBottomNav />
        </Providers>
        </body>
        </html>
    );
}