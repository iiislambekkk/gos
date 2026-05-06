"use client"

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Войти</CardTitle>
                <CardDescription>Войди чтобы отслеживать прогресс</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <Button onClick={() => signIn("google")} variant="outline" className="w-full">
                    Войти через Google
                </Button>
            </CardContent>
        </Card>
    );
}