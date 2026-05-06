"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionCategory, ReadStatus } from "@prisma/client";
import {
    CheckCircle2, Circle, BookOpen, List, X,
    Zap, ChevronLeft, ChevronRight, Maximize2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Mermaid from "@/components/mermaid";
import { MilkdownEditor } from "@/components/milkdown-editor";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

const levels = [
    { key: "eli5",       icon: "🧒", label: "5 лет" },
    { key: "eli10",      icon: "🎒", label: "Школьник" },
    { key: "eliStudent", icon: "🎓", label: "Студент" },
    { key: "eliExpert",  icon: "💼", label: "Эксперт" },
] as const;
type LevelKey = typeof levels[number]["key"];

const categoryConfig: Record<QuestionCategory, { icon: string; label: string }> = {
    KNOWLEDGE:     { icon: "💡", label: "Знание" },
    UNDERSTANDING: { icon: "🧠", label: "Понимание" },
    TASK:          { icon: "⚙️", label: "Задача" },
};

const statusConfig = {
    NOT_SEEN:  { icon: Circle,       color: "text-muted-foreground", label: "Не просмотрено" },
    SEEN:      { icon: BookOpen,     color: "text-blue-500",         label: "Просмотрено" },
    CONFIDENT: { icon: CheckCircle2, color: "text-emerald-500",      label: "Знаю" },
};

interface Answer {
    summary: string; eli5: string; eli10: string;
    eliStudent: string; eliExpert: string;
    analogy?: string | null; diagram?: string | null;
}
interface Question {
    id: string; text: string; category: QuestionCategory;
    order: number; status: ReadStatus; answer: Answer | null;
}

export function StudySession({
                                 examId, examTitle, questions, initialIndex,
                             }: {
    examId: string; examTitle: string;
    questions: Question[]; initialIndex: number;
}) {
    const router = useRouter();
    const [currentIdx, setCurrentIdx] = useState(initialIndex);
    const [statuses, setStatuses] = useState<Record<string, ReadStatus>>(
        Object.fromEntries(questions.map((q) => [q.id, q.status]))
    );
    const [activeLevel, setActiveLevel] = useState<LevelKey>("eliStudent");
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const question = questions[currentIdx];
    const confidentCount = Object.values(statuses).filter((s) => s === "CONFIDENT").length;
    const currentStatus = statuses[question.id];
    const { icon: StatusIcon, color: statusColor, label: statusLabel } = statusConfig[currentStatus];
    const category = categoryConfig[question.category];
    const progressPercent = ((currentIdx + 1) / questions.length) * 100;

    const scrollToTop = useCallback(() => {
        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const goTo = useCallback((idx: number) => {
        setCurrentIdx(idx);
        setActiveLevel("eliStudent");
        scrollToTop();
    }, [scrollToTop]);

    const goToPrev = useCallback(() => { if (currentIdx > 0) goTo(currentIdx - 1); }, [currentIdx, goTo]);
    const goToNext = useCallback(() => { if (currentIdx < questions.length - 1) goTo(currentIdx + 1); }, [currentIdx, questions.length, goTo]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!isMobile) return;
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isMobile || touchStartX.current === null || touchStartY.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            dx < 0 ? goToNext() : goToPrev();
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    const saveStatus = useCallback(async (questionId: string, status: ReadStatus) => {
        setStatuses((prev) => ({ ...prev, [questionId]: status }));
        setSaving(true);
        try {
            await fetch(`/api/progress`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionId, status }),
            });
        } catch {
            toast.error("Не удалось сохранить прогресс");
        } finally {
            setSaving(false);
        }
    }, []);

    const toggleConfident = async () => {
        const next = currentStatus === "CONFIDENT" ? "SEEN" : "CONFIDENT";
        await saveStatus(question.id, next);
        if (next === "CONFIDENT") {
            setShowSuccess(true);
            toast.success("Отлично! 🎉");
            setTimeout(() => setShowSuccess(false), 1500);
            setTimeout(() => { if (currentIdx < questions.length - 1) goToNext(); }, 600);
        }
    };

    const handleLevelClick = (key: LevelKey) => {
        setActiveLevel(key);
        if (statuses[question.id] === "NOT_SEEN") saveStatus(question.id, "SEEN");
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") goToPrev();
            if (e.key === "ArrowRight") goToNext();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [goToPrev, goToNext]);

    return (
        <div className="flex flex-col h-full bg-background"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Прогресс — самая верхняя линия */}
            <div className="h-0.5 bg-muted shrink-0">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Хедер */}
            <header className="shrink-0 flex items-center gap-3 px-3 py-2.5 border-b">
                <button
                    onClick={() => router.back()}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
                >
                    <X size={18} className="text-muted-foreground" />
                </button>

                <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{examTitle}</p>
                </div>

                {/* Счётчик */}
                <span className="text-sm font-semibold shrink-0">
                    {currentIdx + 1}
                    <span className="text-muted-foreground font-normal"> / {questions.length}</span>
                </span>

                {/* Уверен счётчик */}
                <div className="shrink-0 flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-full">
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{confidentCount}</span>
                </div>

                {/* Список вопросов */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0">
                            <List size={18} className="text-muted-foreground" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-sm">Все вопросы</h3>
                                <span className="text-xs text-muted-foreground">{confidentCount} / {questions.length}</span>
                            </div>
                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.round((confidentCount / questions.length) * 100)}%` }}
                                />
                            </div>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-0.5">
                                {questions.map((q, idx) => {
                                    const st = statuses[q.id];
                                    const { icon: Icon, color } = statusConfig[st];
                                    const isActive = idx === currentIdx;
                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => goTo(idx)}
                                            className={cn(
                                                "w-full text-left rounded-xl p-3 flex items-start gap-2.5 transition-all",
                                                isActive ? "bg-primary/10" : "hover:bg-muted/60"
                                            )}
                                        >
                                            <Icon size={13} className={cn(color, "mt-0.5 shrink-0")} />
                                            <span className="text-xs text-muted-foreground shrink-0 font-mono">{q.order}.</span>
                                            <p className="text-xs leading-snug line-clamp-2">{q.text}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </header>

            {/* Контент */}
            <div ref={contentRef} className="flex-1 overflow-y-auto overscroll-contain">
                <div className="max-w-2xl mx-auto px-4 pt-5 pb-32">

                    {/* Мета: категория + статус */}
                    <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                        <span>{category.icon} {category.label}</span>
                        <span>·</span>
                        <StatusIcon size={11} className={statusColor} />
                        <span>{statusLabel}</span>
                    </div>

                    {/* Вопрос */}
                    <h2 className="text-[18px] md:text-xl font-bold leading-snug mb-6 tracking-tight">
                        {question.text}
                    </h2>

                    {!question.answer ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <BookOpen size={36} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Ответ пока не добавлен</p>
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {/* Кратко */}
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                                    Кратко
                                </p>
                                <MilkdownEditor
                                    key={`${question.id}-summary`}
                                    value={question.answer.summary}
                                    readOnly={true}
                                    height="auto"
                                />
                            </div>

                            {/* Уровни — 2×2 сетка */}
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                                    Уровень объяснения
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {levels.map(({ key, icon, label }) => (
                                        <button
                                            key={key}
                                            onClick={() => handleLevelClick(key)}
                                            className={cn(
                                                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 text-left",
                                                activeLevel === key
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            <span className="text-lg leading-none">{icon}</span>
                                            <span className="text-sm">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ответ по уровню — без лишних бордеров, просто текст */}
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                                    {levels.find(l => l.key === activeLevel)?.icon}{" "}
                                    {levels.find(l => l.key === activeLevel)?.label}
                                </p>
                                <MilkdownEditor
                                    key={`${question.id}-${activeLevel}`}
                                    value={question.answer[activeLevel]}
                                    readOnly={true}
                                    height="auto"
                                />
                            </div>

                            {/* Аналогия */}
                            {question.answer.analogy && (
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                                        🎭 Аналогия
                                    </p>
                                    <MilkdownEditor
                                        key={`${question.id}-analogy`}
                                        value={question.answer.analogy}
                                        readOnly={true}
                                        height="auto"
                                    />
                                </div>
                            )}

                            {/* Диаграмма */}
                            {question.answer.diagram && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                            📊 Схема
                                        </p>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                                                    <Maximize2 size={13} className="text-muted-foreground" />
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>Схема</DialogTitle>
                                                </DialogHeader>
                                                <Mermaid
                                                    key={`${question.id}-diagram-fullscreen`}
                                                    chart={question.answer.diagram}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-4 overflow-x-auto">
                                        <Mermaid
                                            key={`${question.id}-diagram`}
                                            chart={question.answer.diagram}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Нижняя панель */}
            <div
                className="shrink-0 border-t bg-background/95 backdrop-blur-md px-3 pt-3"
                style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            >
                <div className="max-w-2xl mx-auto flex items-center gap-2">
                    <button
                        onClick={goToPrev}
                        disabled={currentIdx === 0}
                        className="w-11 h-11 rounded-2xl border flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none hover:bg-muted"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        onClick={toggleConfident}
                        disabled={saving || showSuccess}
                        className={cn(
                            "flex-1 h-11 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97]",
                            showSuccess
                                ? "bg-emerald-500 text-white"
                                : currentStatus === "CONFIDENT"
                                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                    >
                        {showSuccess ? (
                            "✨ Отлично!"
                        ) : currentStatus === "CONFIDENT" ? (
                            <><CheckCircle2 size={16} /> Знаю</>
                        ) : (
                            <><Zap size={16} /> Знаю</>
                        )}
                    </button>

                    <button
                        onClick={goToNext}
                        disabled={currentIdx === questions.length - 1}
                        className="w-11 h-11 rounded-2xl border flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none hover:bg-muted"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}