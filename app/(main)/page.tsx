import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { MainDashboard } from "@/components/main-dashboard";

export default async function HomePage() {
    const session = await getServerSession(authOptions);
    const userId = session!.user.id;

    const [exams, progress, streak] = await Promise.all([
        prisma.exam.findMany({
            include: {
                _count: { select: { questions: true } },
                examDates: { where: { userId } },
                questions: { select: { id: true } },
            },
            orderBy: { createdAt: "asc" },
        }),
        prisma.userProgress.findMany({
            where: { userId },
            select: { questionId: true, status: true },
        }),
        prisma.userStreak.findUnique({ where: { userId } }),
    ]);

    const progressMap = new Map(progress.map((p) => [p.questionId, p.status]));

    const examsWithProgress = exams.map((exam) => {
        const ids = exam.questions.map((q) => q.id);
        const confident = ids.filter((id) => progressMap.get(id) === "CONFIDENT").length;
        const seen = ids.filter((id) => progressMap.get(id) === "SEEN").length;
        return {
            id: exam.id,
            title: exam.title,
            description: exam.description,
            type: exam.type,
            total: exam._count.questions,
            confident,
            seen,
            examDate: exam.examDates[0]?.date ?? null,
        };
    });

    const totalQuestions = examsWithProgress.reduce((s, e) => s + e.total, 0);
    const totalConfident = examsWithProgress.reduce((s, e) => s + e.confident, 0);

    const upcomingExam = examsWithProgress
        .filter((e) => e.examDate && new Date(e.examDate) > new Date())
        .sort((a, b) => new Date(a.examDate!).getTime() - new Date(b.examDate!).getTime())[0] ?? null;

    return (
        <MainDashboard
            user={{ name: session!.user.name ?? "Студент", image: session!.user.image }}
            exams={examsWithProgress}
            streak={streak ?? { current: 0, longest: 0 }}
            upcomingExam={upcomingExam}
            totalQuestions={totalQuestions}
            totalConfident={totalConfident}
        />
    );
}