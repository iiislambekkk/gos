// app/(admin)/admin/exams/[examId]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ExamEditor } from "./exam-editor";

export default async function AdminExamEditPage({
                                                    params,
                                                }: {
    params: Promise<{ examId: string }>;
}) {
    const { examId } = await params;

    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
            questions: {
                include: {
                    answer: true,
                    _count: {
                        select: {
                            progress: true,
                            comments: true,
                        },
                    },
                },
                orderBy: { order: "asc" },
            },
        },
    });

    if (!exam) notFound();

    return <ExamEditor exam={exam} />;
}