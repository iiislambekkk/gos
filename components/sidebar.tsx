"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";

const links = [
    { href: "/", label: "Главная", icon: LayoutDashboard },
    { href: "/profile", label: "Профиль", icon: User },
];

// Десктопный сайдбар (без изменений)
function SidebarContent() {
    const pathname = usePathname();
    const { isAdmin } = useUserRole();

    return (
        <div className="flex flex-col gap-1 p-3 h-full">
            <div className="flex items-center gap-2 px-3 py-4 mb-2">
                <BookOpen size={20} />
                <span className="font-semibold text-sm">Экзамен</span>
            </div>

            {links.map(({ href, label, icon: Icon }) => (
                <Link
                    key={href}
                    href={href}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        pathname === href
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                >
                    <Icon size={16} />
                    {label}
                </Link>
            ))}

            {isAdmin && (
                <Link
                    href="/admin/exams"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        pathname === "/admin/exams"
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                >
                    <Shield size={16} />
                    Админ панель
                </Link>
            )}
        </div>
    );
}

// Десктопная версия
export function Sidebar() {
    return (
        <aside className="hidden md:flex w-56 border-r flex-col">
            <SidebarContent />
        </aside>
    );
}

// Мобильное нижнее меню
export function MobileBottomNav() {
    const pathname = usePathname();
    const { isAdmin } = useUserRole();

    if (pathname === "/login") return null

    const mobileLinks = isAdmin
        ? [...links, { href: "/admin/exams", label: "Админ", icon: Shield }]
        : links;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
            <div className="flex items-center justify-around h-14">
                {mobileLinks.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 h-full w-full transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon size={18} />
                            <span className="text-[10px] leading-none">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}