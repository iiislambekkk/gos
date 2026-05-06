"use client";
import { ColorSchemeProvider } from "@/components/providers/ColorSchemeProvider";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ColorSchemeProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </ColorSchemeProvider>
        </SessionProvider>
    );
}