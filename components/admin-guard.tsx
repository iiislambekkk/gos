// components/admin-guard.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

interface AdminGuardProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function AdminGuard({ children, redirectTo = "/" }: AdminGuardProps) {
    const { isAdmin, isLoading, isAuthenticated } = useUserRole();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !isAdmin)) {
            router.push(redirectTo);
        }
    }, [isLoading, isAuthenticated, isAdmin, router, redirectTo]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return <>{children}</>;
}