"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {BookOpen, LayoutDashboard, User, Menu, Shield} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {useUserRole} from "@/hooks/useUserRole";

const links = [
    { href: "/",        label: "Главная",  icon: LayoutDashboard },
    { href: "/profile", label: "Профиль",  icon: User },
];

function SidebarContent() {
    const pathname = usePathname();
    const { isAdmin } = useUserRole(); // role === "ADMIN"

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

            {/* Админ панель - для ADMIN роли */}
            {isAdmin && (
                <Link href={"/admin/exams"}  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    pathname === "/admin/exams"
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}>
                    <Shield size={14} className="mr-2" />
                    Админ панель
                </Link>
            )}
        </div>
    );
}

// десктоп версия
export function Sidebar() {
    return (
        <aside className="hidden md:flex w-56 border-r flex-col">
            <SidebarContent />
        </aside>
    );
}

// кнопка для мобила (вставляется в Navbar)
export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu size={20} />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-56">
                <SidebarContent />
            </SheetContent>
        </Sheet>
    );
}