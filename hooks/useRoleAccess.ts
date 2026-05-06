// hooks/useRoleAccess.ts
import { useUserRole } from "./useUserRole";
import type { Role } from "@prisma/client";

export function useRoleAccess() {
    const { role, isAdmin, isUser, isLoading } = useUserRole();

    const canAccess = (allowedRoles: Role | Role[]): boolean => {
        if (isLoading) return false;
        if (!role) return false;

        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        return roles.includes(role);
    };

    const withRoleGuard = <T>(
        allowedRoles: Role | Role[],
        component: T,
        fallback: T | null = null
    ): T | null => {
        return canAccess(allowedRoles) ? component : fallback;
    };

    return {
        canAccess,
        withRoleGuard,
        isAdmin,
        isUser,
        role,
        isLoading,
    };
}