import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, MessageCircle } from "lucide-react";
import { ExamType } from "@prisma/client";

const examTypeLabel: Record<ExamType, string> = {
    KNOWLEDGE_BASED: "Знание",
    UNDERSTANDING_BASED: "Понимание",
    TASK_BASED: "Задачи",
    MIXED: "Смешанный",
};

interface ExamCardProps {
    exam: {
        id: string;
        title: string;
        description?: string | null;
        type: ExamType;
    };
    total: number;
    confident?: number;
    examDate?: Date | null;
}

export function ExamCard({ exam, total, confident = 0, examDate }: ExamCardProps) {
    const percent = total > 0 ? Math.round((confident / total) * 100) : 0;

    const daysLeft = examDate
        ? Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <Link href={`/exam/${exam.id}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{exam.title}</CardTitle>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                            {examTypeLabel[exam.type]}
                        </Badge>
                    </div>
                    {exam.description && (
                        <CardDescription className="text-xs">{exam.description}</CardDescription>
                    )}
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                    {/* прогресс */}
                    <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Прогресс</span>
                            <span>{confident}/{total}</span>
                        </div>
                        <Progress value={percent} className="h-1.5" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {/* таймер до экзамена */}
                        {daysLeft !== null ? (
                            <div className="flex items-center gap-1">
                                <CalendarDays size={12} />
                                {daysLeft > 0
                                    ? <span className={daysLeft <= 3 ? "text-destructive font-medium" : ""}>
                      {daysLeft} дн.
                    </span>
                                    : <span className="text-destructive font-medium">Сегодня!</span>
                                }
                            </div>
                        ) : (
                            <span>Дата не указана</span>
                        )}

                        <div className="flex items-center gap-1">
                            <MessageCircle size={12} />
                            <span>Чат</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}