// hooks/useUserRole.ts
import { useSession } from "next-auth/react";
import type { Role } from "@prisma/client";

interface UseUserRoleReturn {
    isAdmin: boolean;
    isUser: boolean;
    role: Role | undefined;
    userId: string | undefined;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasRole: (roles: Role | Role[]) => boolean;
    requireAuth: (redirectTo?: string) => boolean;
}

export function useUserRole(): UseUserRoleReturn {
    const { data: session, status } = useSession();
    const role = session?.user?.role;

    const hasRole = (roles: Role | Role[]): boolean => {
        if (!role) return false;
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        return rolesArray.includes(role);
    };

    const requireAuth = (redirectTo: string = "/login"): boolean => {
        if (status === "loading") return false;
        if (!session?.user) {
            // Используйте router.push в компоненте, здесь только логика
            return false;
        }
        return true;
    };

    return {
        isAdmin: role === "ADMIN", // ⚠️ Важно: в вашей схеме Role.ADMIN (верхний регистр)
        isUser: role === "USER",
        role,
        userId: session?.user?.id,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        hasRole,
        requireAuth,
    };
}