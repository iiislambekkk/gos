import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ExamCard } from "@/components/exam-card";

export default async function HomePage() {
    const session = await getServerSession(authOptions);

    const exams = await prisma.exam.findMany({
        include: {
            _count: { select: { questions: true } },
            examDates: {
                where: { userId: session!.user.id },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    // прогресс пользователя по всем вопросам
    const progress = await prisma.userProgress.findMany({
        where: { userId: session!.user.id },
        select: { questionId: true, status: true },
    });

    const progressMap = new Map(
        progress.map((p) => [p.questionId, p.status])
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Привет, {session!.user.name} 👋</h1>
                <p className="text-muted-foreground mt-1">Выбери экзамен и начни готовиться</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((exam) => {
                    const total = exam._count.questions;
                    const examDate = exam.examDates[0]?.date ?? null;

                    // считаем сколько вопросов CONFIDENT — но нам нужны id вопросов этого экзамена
                    // это делается в ExamCard через отдельный подсчёт
                    return (
                        <ExamCard
                            key={exam.id}
                            exam={exam}
                            total={total}
                            examDate={examDate}
                        />
                    );
                })}
            </div>
        </div>
    );
}