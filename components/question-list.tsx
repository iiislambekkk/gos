"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, BookOpen } from "lucide-react";
import { QuestionCategory, ReadStatus } from "@prisma/client";

const categoryLabel: Record<QuestionCategory, string> = {
    KNOWLEDGE: "Знание",
    UNDERSTANDING: "Понимание",
    TASK: "Задача",
};

const categoryColor: Record<QuestionCategory, string> = {
    KNOWLEDGE: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    UNDERSTANDING: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    TASK: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

interface Question {
    id: string;
    text: string;
    category: QuestionCategory;
    answer?: { summary: string } | null;
}

interface Props {
    questions: Question[];
    progressMap: Record<string, ReadStatus>;
    examId: string;
}

export function QuestionList({ questions, progressMap, examId }: Props) {
    const grouped = {
        KNOWLEDGE: questions.filter((q) => q.category === "KNOWLEDGE"),
        UNDERSTANDING: questions.filter((q) => q.category === "UNDERSTANDING"),
        TASK: questions.filter((q) => q.category === "TASK"),
    };

    return (
        <div className="flex flex-col gap-8">
            {(Object.keys(grouped) as QuestionCategory[]).map((category) => {
                const qs = grouped[category];
                if (qs.length === 0) return null;

                return (
                    <div key={category}>
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            {categoryLabel[category]} — {qs.length} вопр.
                        </h2>

                        <div className="flex flex-col gap-2">
                            {qs.map((q) => {
                                const status = progressMap[q.id] ?? "NOT_SEEN";

                                return (
                                    <Link
                                        key={q.id}
                                        href={`/exam/${examId}/question/${q.id}`}
                                        className={cn(
                                            "flex items-start gap-3 p-4 rounded-lg border transition-colors hover:border-primary",
                                            status === "CONFIDENT" && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                                        )}
                                    >
                                        {/* иконка статуса */}
                                        <div className="mt-0.5 shrink-0">
                                            {status === "CONFIDENT" ? (
                                                <CheckCircle2 size={18} className="text-green-500" />
                                            ) : status === "SEEN" ? (
                                                <BookOpen size={18} className="text-muted-foreground" />
                                            ) : (
                                                <Circle size={18} className="text-muted-foreground/40" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-snug">{q.text}</p>
                                            {q.answer?.summary && (
                                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                                    {q.answer.summary}
                                                </p>
                                            )}
                                        </div>

                                        <Badge className={cn("text-xs shrink-0", categoryColor[category])} variant="outline">
                                            {categoryLabel[category]}
                                        </Badge>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}