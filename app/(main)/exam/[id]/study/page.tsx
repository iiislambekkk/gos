import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StudySession } from "@/components/study-session";

export default async function StudyPage({
                                            params,
                                            searchParams,
                                        }: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ from?: string }>;
}) {
    const { id } = await params;
    const { from } = await searchParams;
    const session = await getServerSession(authOptions);
    const userId = session!.user.id;

    const exam = await prisma.exam.findUnique({
        where: { id: id },
        include: {
            questions: {
                orderBy: { order: "asc" },
                include: {
                    answer: true,
                    progress: { where: { userId }, select: { status: true } },
                },
            },
        },
    });

    if (!exam) notFound();

    const questions = exam.questions.map((q) => ({
        id: q.id,
        text: q.text,
        category: q.category,
        order: q.order,
        status: q.progress[0]?.status ?? "NOT_SEEN",
        answer: q.answer
            ? {
                summary: q.answer.summary,
                eli5: q.answer.eli5,
                eli10: q.answer.eli10,
                eliStudent: q.answer.eliStudent,
                eliExpert: q.answer.eliExpert,
                analogy: q.answer.analogy,
                diagram: q.answer.diagram,
            }
            : null,
    }));

    const initialIndex = Math.min(
        parseInt(searchParams.from ?? "0", 10) || 0,
        Math.max(questions.length - 1, 0)
    );

    return (
        <StudySession
            examId={exam.id}
            examTitle={exam.title}
            questions={questions}
            initialIndex={initialIndex}
        />
    );
}