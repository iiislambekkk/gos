"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ExamType, QuestionCategory, ReadStatus } from "@prisma/client";
import {
    CheckCircle2, Circle, BookOpen, ArrowLeft,
    Play, Filter, ChevronRight, Target, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryEmoji: Record<QuestionCategory, string> = {
    KNOWLEDGE: "💡",
    UNDERSTANDING: "🧠",
    TASK: "⚙️",
};

const statusConfig = {
    NOT_SEEN:  { icon: Circle,         color: "text-muted-foreground", bg: "bg-muted/40" },
    SEEN:      { icon: BookOpen,       color: "text-blue-500",          bg: "bg-blue-500/10" },
    CONFIDENT: { icon: CheckCircle2,   color: "text-green-500",         bg: "bg-green-500/10" },
};

type Filter = "ALL" | "NOT_SEEN" | "SEEN" | "CONFIDENT";

interface Question {
    id: string; text: string; category: QuestionCategory;
    order: number; summary: string | null; status: ReadStatus;
}

interface Props {
    exam: { id: string; title: string; description?: string | null; type: ExamType };
    questions: Question[];
    examDate: Date | null;
}

export function ExamOverview({ exam, questions, examDate }: Props) {
    const router = useRouter();
    const [filter, setFilter] = useState<Filter>("ALL");

    const confident = questions.filter((q) => q.status === "CONFIDENT").length;
    const seen = questions.filter((q) => q.status === "SEEN").length;
    const notSeen = questions.filter((q) => q.status === "NOT_SEEN").length;
    const percent = questions.length > 0 ? Math.round((confident / questions.length) * 100) : 0;

    const daysLeft = examDate
        ? Math.ceil((new Date(examDate).getTime() - Date.now()) / 86_400_000)
        : null;

    const filtered = filter === "ALL" ? questions : questions.filter((q) => q.status === filter);

    const firstUnseen = questions.find((q) => q.status !== "CONFIDENT");
    const startIdx = firstUnseen ? questions.indexOf(firstUnseen) : 0;

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-2xl mx-auto px-4">
                {/* ── Навигация ── */}
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-3 -mx-4 px-4 border-b">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft size={18} />
                        </Button>
                        <div className="flex-1 min-w-0">
                            <h1 className="font-bold text-lg leading-tight truncate">{exam.title}</h1>
                            {exam.description && (
                                <p className="text-xs text-muted-foreground truncate">{exam.description}</p>
                            )}
                        </div>
                        {daysLeft !== null && daysLeft > 0 && (
                            <Badge variant={daysLeft <= 3 ? "destructive" : "secondary"} className="gap-1">
                                <Calendar size={12} />
                                {daysLeft} дн.
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="py-5 space-y-5">
                    {/* ── Прогресс ── */}
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium flex items-center gap-1">
                                <Target size={14} />
                                {percent}% готов
                            </span>
                            <span className="text-muted-foreground">{confident}/{questions.length}</span>
                        </div>
                        <Progress value={percent} className="h-2" />

                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-xl bg-muted/30 p-3">
                                <div className="text-2xl font-bold text-muted-foreground">{notSeen}</div>
                                <div className="text-[11px] text-muted-foreground">не начато</div>
                            </div>
                            <div className="rounded-xl bg-blue-500/10 p-3">
                                <div className="text-2xl font-bold text-blue-500">{seen}</div>
                                <div className="text-[11px] text-muted-foreground">в процессе</div>
                            </div>
                            <div className="rounded-xl bg-green-500/10 p-3">
                                <div className="text-2xl font-bold text-green-500">{confident}</div>
                                <div className="text-[11px] text-muted-foreground">выучено</div>
                            </div>
                        </div>
                    </div>

                    {/* ── CTA кнопка ── */}
                    <Button className="w-full h-12 gap-2 text-base" size="lg" asChild>
                        <Link href={`/exam/${exam.id}/study?from=${startIdx}`}>
                            <Play size={18} />
                            {confident === questions.length ? "Повторить всё" : firstUnseen ? "Продолжить" : "Начать подготовку"}
                        </Link>
                    </Button>

                    <Separator />

                    {/* ── Фильтры ── */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {(["ALL", "NOT_SEEN", "SEEN", "CONFIDENT"] as Filter[]).map((f) => (
                            <Button
                                key={f}
                                size="sm"
                                variant={filter === f ? "default" : "outline"}
                                onClick={() => setFilter(f)}
                                className="shrink-0 text-xs h-8"
                            >
                                {f === "ALL" ? `Все (${questions.length})`
                                    : f === "NOT_SEEN" ? `❌ ${notSeen}`
                                        : f === "SEEN" ? `📖 ${seen}`
                                            : `✓ ${confident}`}
                            </Button>
                        ))}
                    </div>

                    {/* ── Список вопросов ── */}
                    <div className="space-y-2 pb-4">
                        {filtered.map((q, idx) => {
                            const { icon: Icon, color, bg } = statusConfig[q.status];
                            const globalIdx = questions.findIndex(quest => quest.id === q.id);

                            return (
                                <Link
                                    key={q.id}
                                    href={`/exam/${exam.id}/study?from=${globalIdx}`}
                                    className="block"
                                >
                                    <div className={cn("rounded-xl border p-4 flex gap-3 items-start active:scale-[0.98] transition-all", bg)}>
                                        <div className="flex flex-col items-center gap-1 pt-0.5">
                                            <Icon size={18} className={color} />
                                            <span className="text-[10px] text-muted-foreground font-mono">{q.order}</span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm">{categoryEmoji[q.category]}</span>
                                                <span className="text-sm font-medium leading-snug line-clamp-2">{q.text}</span>
                                            </div>
                                            {q.summary && (
                                                <p className="text-xs text-muted-foreground line-clamp-1">{q.summary}</p>
                                            )}
                                        </div>

                                        <ChevronRight size={16} className="text-muted-foreground shrink-0 mt-1" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}