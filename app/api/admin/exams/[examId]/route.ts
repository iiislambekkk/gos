// app/api/admin/exams/[examId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { examId: string } }
) {
    try {
        const { title, description, type } = await req.json();
        const {examId} = await params

        const exam = await prisma.exam.update({
            where: { id: examId },
            data: { title, description, type },
        });

        return NextResponse.json(exam);
    } catch (error) {
        return NextResponse.json(
            { error: "Ошибка при обновлении экзамена" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ examId: string }> }
) {
    const { examId } = await params;

    try {
        // Сначала удаляем связанные вопросы (если есть)
        await prisma.question.deleteMany({
            where: { examId: examId },
        });

        // Потом удаляем сам экзамен
        await prisma.exam.delete({
            where: { id: examId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting exam:", error);
        return NextResponse.json(
            { error: "Ошибка при удалении экзамена" },
            { status: 500 }
        );
    }
}