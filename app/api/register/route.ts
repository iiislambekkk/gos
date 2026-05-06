import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        // Валидация
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "Все поля обязательны" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Пароль должен содержать минимум 6 символов" },
                { status: 400 }
            );
        }

        // Проверка существующего пользователя
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Пользователь с таким email уже существует" },
                { status: 400 }
            );
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 12);

        // Создание пользователя
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER", // или ваш дефолтный Role.USER
                createdAt: new Date(),
                // остальные поля будут с дефолтными значениями
            }
        });

        // Убираем пароль из ответа
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            {
                message: "Пользователь успешно создан",
                user: userWithoutPassword
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Ошибка при создании пользователя" },
            { status: 500 }
        );
    }
}