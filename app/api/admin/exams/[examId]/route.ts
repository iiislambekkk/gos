// app/api/admin/exams/[examId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { examId: string } }
) {
    try {
        const { title, description, type } = await req.json();

        const exam = await prisma.exam.update({
            where: { id: params.examId },
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