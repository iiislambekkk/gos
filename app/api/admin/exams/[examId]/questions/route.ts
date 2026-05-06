// app/api/admin/exams/[examId]/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ examId: string }> }
) {
    const { examId } = await params;

    try {
        const { text, category } = await req.json();

        const lastQuestion = await prisma.question.findFirst({
            where: { examId },
            orderBy: { order: "desc" },
        });
        const nextOrder = (lastQuestion?.order ?? -1) + 1;

        const question = await prisma.question.create({
            data: {
                examId,
                text,
                category,
                order: nextOrder,
                answer: {
                    create: {
                        summary: "",
                        eli5: "",
                        eli10: "",
                        eliStudent: "",
                        eliExpert: "",
                        analogy: "",
                        diagram: "",
                    },
                },
            },
            include: {
                answer: true,
                _count: {
                    select: {
                        progress: true,
                        comments: true,
                    },
                },
            },
        });

        return NextResponse.json(question);
    } catch (error) {
        console.error("Error creating question:", error);
        return NextResponse.json(
            { error: "Ошибка при создании вопроса" },
            { status: 500 }
        );
    }
}