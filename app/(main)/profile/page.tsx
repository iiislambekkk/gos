// app/profile/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Palette, User, Mail, Calendar, Loader2 } from "lucide-react";
import { useColorScheme } from "@/components/providers/ColorSchemeProvider";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { currentTheme, themes, changeTheme } = useColorScheme();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (status !== "authenticated") return null;

    const { user } = session;
    const initials = user.name
        ?.split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase() || user.email?.[0]?.toUpperCase() || "U";

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Профиль</h1>
                <p className="text-muted-foreground mt-1">
                    Управление аккаунтом и настройками
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Личная информация
                        </CardTitle>
                        <CardDescription>
                            Ваши данные из аккаунта
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={user.image || ""} />
                                <AvatarFallback className="text-2xl">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-xl font-semibold">{user.name || "Без имени"}</h2>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                                <Badge variant="outline" className="mt-1">
                                    {user.role === "ADMIN" ? "Администратор" : "Пользователь"}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Цветовая тема
                        </CardTitle>
                        <CardDescription>
                            Выберите цветовое оформление интерфейса
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {themes.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => changeTheme(theme)}
                                    className={`
                                        relative p-4 rounded-lg border-2 transition-all text-left
                                        ${currentTheme?.id === theme.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"}
                                    `}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-2xl">{theme.icon}</span>
                                        <div>
                                            <h3 className="font-medium">{theme.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {theme.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-1 mt-2">
                                        <div
                                            className="h-6 w-6 rounded-full border"
                                            style={{ backgroundColor: theme.colors.light.primary }}
                                        />
                                        <div
                                            className="h-6 w-6 rounded-full border"
                                            style={{ backgroundColor: theme.colors.light.secondary }}
                                        />
                                        <div
                                            className="h-6 w-6 rounded-full border"
                                            style={{ backgroundColor: theme.colors.light.accent }}
                                        />
                                        <div
                                            className="h-6 w-6 rounded-full border"
                                            style={{ backgroundColor: theme.colors.light.muted }}
                                        />
                                    </div>

                                    {currentTheme?.id === theme.id && (
                                        <div className="absolute top-2 right-2">
                                            <div className="h-3 w-3 rounded-full bg-primary" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Активность
                        </CardTitle>
                        <CardDescription>
                            Ваша активность в системе
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold">0</div>
                                <div className="text-xs text-muted-foreground">Всего экзаменов</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold">0</div>
                                <div className="text-xs text-muted-foreground">Изучено вопросов</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold">0</div>
                                <div className="text-xs text-muted-foreground">Streak дней</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold">0</div>
                                <div className="text-xs text-muted-foreground">Достижений</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}