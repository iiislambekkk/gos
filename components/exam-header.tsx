import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { ExamType } from "@prisma/client";

const examTypeLabel: Record<ExamType, string> = {
    KNOWLEDGE_BASED: "Знание",
    UNDERSTANDING_BASED: "Понимание",
    TASK_BASED: "Задачи",
    MIXED: "Смешанный",
};

interface Props {
    exam: { title: string; description?: string | null; type: ExamType };
    examDate?: Date | null;
}

export function ExamHeader({ exam, examDate }: Props) {
    const daysLeft = examDate
        ? Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{exam.title}</h1>
                <Badge variant="secondary">{examTypeLabel[exam.type]}</Badge>
            </div>

            {exam.description && (
                <p className="text-muted-foreground text-sm">{exam.description}</p>
            )}

            {daysLeft !== null && (
                <div className="flex items-center gap-1.5 mt-2 text-sm">
                    <CalendarDays size={14} />
                    {daysLeft > 0 ? (
                        <span className={daysLeft <= 3 ? "text-destructive font-medium" : "text-muted-foreground"}>
              До экзамена {daysLeft} дн.
            </span>
                    ) : (
                        <span className="text-destructive font-medium">Экзамен сегодня!</span>
                    )}
                </div>
            )}
        </div>
    );
}