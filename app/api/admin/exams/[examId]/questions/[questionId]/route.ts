// app/api/admin/exams/[examId]/questions/[questionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ examId: string; questionId: string }> }
) {
    const { questionId } = await params;

    try {
        const body = await req.json();
        const { text, category, order } = body;

        const question = await prisma.question.update({
            where: { id: questionId },
            data: {
                ...(text !== undefined && { text }),
                ...(category !== undefined && { category }),
                ...(order !== undefined && { order }),
                answer: {
                    upsert: {
                        create: {
                            summary: body.summary || "",
                            eli5: body.eli5 || "",
                            eli10: body.eli10 || "",
                            eliStudent: body.eliStudent || "",
                            eliExpert: body.eliExpert || "",
                            analogy: body.analogy || "",
                            diagram: body.diagram || "",
                        },
                        update: {
                            ...(body.summary !== undefined && { summary: body.summary }),
                            ...(body.eli5 !== undefined && { eli5: body.eli5 }),
                            ...(body.eli10 !== undefined && { eli10: body.eli10 }),
                            ...(body.eliStudent !== undefined && { eliStudent: body.eliStudent }),
                            ...(body.eliExpert !== undefined && { eliExpert: body.eliExpert }),
                            ...(body.analogy !== undefined && { analogy: body.analogy }),
                            ...(body.diagram !== undefined && { diagram: body.diagram }),
                        },
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
        console.error("Error updating question:", error);
        return NextResponse.json(
            { error: "Ошибка при обновлении вопроса" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ examId: string; questionId: string }> }
) {
    const { questionId } = await params;

    try {
        await prisma.question.delete({
            where: { id: questionId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting question:", error);
        return NextResponse.json(
            { error: "Ошибка при удалении вопроса" },
            { status: 500 }
        );
    }
}