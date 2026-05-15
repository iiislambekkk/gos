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
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    return (
        <html lang="ru" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
        <body className={geist.className}>
        <Providers>
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <Navbar user={session.user} />
                    <main className="flex-1 overflow-hidden">
                        {children}
                    </main>
                </div>
            </div>

            <MobileBottomNav />
        </Providers>
        </body>
        </html>
    );
}