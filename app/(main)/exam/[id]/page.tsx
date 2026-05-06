import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ExamOverview } from "@/components/exam-overview";

export default async function ExamPage({
                                           params
                                       }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = session!.user.id;

    const exam = await prisma.exam.findUnique({
        where: { id },
        include: {
            questions: {
                orderBy: { order: "asc" },
                include: {
                    answer: { select: { summary: true } },
                    progress: { where: { userId }, select: { status: true } },
                },
            },
            examDates: { where: { userId } },
        },
    });

    if (!exam) notFound();

    const questions = exam.questions.map((q) => ({
        id: q.id,
        text: q.text,
        category: q.category,
        order: q.order,
        summary: q.answer?.summary ?? null,
        status: q.progress[0]?.status ?? "NOT_SEEN",
    }));

    const examDate = exam.examDates[0]?.date ?? null;

    return (
        <ExamOverview
            exam={{ id: exam.id, title: exam.title, description: exam.description, type: exam.type }}
            questions={questions}
            examDate={examDate}
        />
    );
}