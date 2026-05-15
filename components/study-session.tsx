"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionCategory, ReadStatus } from "@prisma/client";
import {
    CheckCircle2, Circle, BookOpen, List, X,
    Zap, ChevronLeft, ChevronRight, Maximize2,
    BrainCircuit, Send, ChevronDown, ChevronUp,
    History, RotateCcw, Sparkles, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Mermaid from "@/components/mermaid";
import { MilkdownEditor } from "@/components/milkdown-editor";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {useIsMobile} from "@/hooks/use-mobile";

// ─── Types ───────────────────────────────────────────────────────────────────

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

type ScoreLabel = "WEAK" | "OK" | "GOOD" | "EXCELLENT";

interface AIAttempt {
    id: string;
    attemptNumber: number;
    userAnswer: string;
    aiFeedback: string;
    score: number;
    scoreLabel: ScoreLabel;
    isPassing: boolean;
    strengths: string[];
    improvements: string[];
    createdAt?: string;
}

interface Answer {
    summary: string; eli5: string; eli10: string;
    eliStudent: string; eliExpert: string;
    analogy?: string | null; diagram?: string | null;
}
interface Question {
    id: string; text: string; category: QuestionCategory;
    order: number; status: ReadStatus; answer: Answer | null;
}

// ─── Score helpers ────────────────────────────────────────────────────────────

const scoreConfig: Record<ScoreLabel, {
    label: string; color: string; bg: string; ring: string; textColor: string;
}> = {
    WEAK:      { label: "Слабо",    color: "text-red-500",    bg: "bg-red-500/10",    ring: "ring-red-400/40",    textColor: "text-red-600 dark:text-red-400" },
    OK:        { label: "Неплохо",  color: "text-amber-500",  bg: "bg-amber-500/10",  ring: "ring-amber-400/40",  textColor: "text-amber-600 dark:text-amber-400" },
    GOOD:      { label: "Хорошо",   color: "text-blue-500",   bg: "bg-blue-500/10",   ring: "ring-blue-400/40",   textColor: "text-blue-600 dark:text-blue-400" },
    EXCELLENT: { label: "Отлично!", color: "text-emerald-500", bg: "bg-emerald-500/10", ring: "ring-emerald-400/40", textColor: "text-emerald-600 dark:text-emerald-400" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score, label }: { score: number; label: ScoreLabel }) {
    const cfg = scoreConfig[label];
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
                <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor"
                        className="text-muted/30" strokeWidth="5" />
                <circle cx="36" cy="36" r={radius} fill="none"
                        stroke="currentColor" strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className={cn("transition-all duration-700", cfg.color)}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-[15px] font-bold leading-none", cfg.color)}>{score}</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">{cfg.label}</span>
            </div>
        </div>
    );
}

function AttemptCard({ attempt, isLatest }: { attempt: AIAttempt; isLatest: boolean }) {
    const [expanded, setExpanded] = useState(isLatest);
    const cfg = scoreConfig[attempt.scoreLabel];

    return (
        <div className={cn(
            "rounded-2xl border transition-all",
            isLatest ? "border-primary/20 bg-primary/5" : "border-border bg-muted/20"
        )}>
            {/* Header */}
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center gap-3 p-3.5 text-left"
            >
                <ScoreRing score={attempt.score} label={attempt.scoreLabel} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Попытка {attempt.attemptNumber}
            </span>
                        {attempt.isPassing && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Зачтено
              </span>
                        )}
                        {isLatest && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                Последняя
              </span>
                        )}
                    </div>
                    {!expanded && (<p className="text-xs text-muted-foreground line-clamp-1">{attempt.userAnswer}</p>)}
                </div>
                {expanded ? (
                    <ChevronUp size={14} className="text-muted-foreground shrink-0" />
                ) : (
                    <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                )}
            </button>

            {/* Expanded content */}
            {expanded && (
                <div className="px-3.5 pb-3.5 space-y-3 border-t border-border/50 pt-3">
                    {attempt.strengths.length > 0 && (
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1.5">
                                Ваш ответ:
                            </p>
                            <p className="text-xs text-muted-foreground">{attempt.userAnswer}</p>
                        </div>
                    )}

                    {/* Strengths & Improvements */}
                    {attempt.strengths.length > 0 && (
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1.5">
                                Сильные стороны
                            </p>
                            <ul className="space-y-1">
                                {attempt.strengths.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {attempt.improvements.length > 0 && (
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1.5">
                                Что улучшить
                            </p>
                            <ul className="space-y-1">
                                {attempt.improvements.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                                        <span className="text-amber-500 mt-0.5 shrink-0">→</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Full feedback */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                            Подробный фидбек
                        </p>
                        <div className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">
                            {attempt.aiFeedback}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── AI Check Panel ───────────────────────────────────────────────────────────

function AICheckPanel({ question, onPass }: { question: Question; onPass: () => void }) {
    const [userAnswer, setUserAnswer] = useState("");
    const [checking, setChecking] = useState(false);
    const [attempts, setAttempts] = useState<AIAttempt[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Загружаем историю при открытии
    useEffect(() => {
        const load = async () => {
            setLoadingHistory(true);
            try {
                const res = await fetch(`/api/ai-check?questionId=${question.id}`);
                const data = await res.json();
                setAttempts(data.attempts ?? []);
            } catch {
                // ignore
            } finally {
                setLoadingHistory(false);
            }
        };
        load();
    }, [question.id]);

    // Auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [userAnswer]);

    const handleCheck = async () => {
        if (!userAnswer.trim() || checking) return;
        setChecking(true);
        try {
            const res = await fetch("/api/ai-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionId: question.id, userAnswer }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            const newAttempt: AIAttempt = data.attempt;
            setAttempts((prev) => [...prev, newAttempt]);
            setUserAnswer("");

            if (newAttempt.isPassing) {
                toast.success("Зачёт! 🎉 Ответ засчитан");
                onPass();
            } else {
                toast.info(`${scoreConfig[newAttempt.scoreLabel].label} — ${newAttempt.score}/100`);
            }
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "Ошибка";
            toast.error(errorMessage || "Ошибка при проверке");
        } finally {
            setChecking(false);
        }
    };

    const latestPassing = attempts.find((a) => a.isPassing);
    const hasAttempts = attempts.length > 0;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BrainCircuit size={14} className="text-primary" />
                </div>
                <div>
                    <p className="text-sm font-semibold">Проверь себя</p>
                    <p className="text-[11px] text-muted-foreground">
                        Напиши ответ — ИИ оценит и даст фидбек
                    </p>
                </div>
            </div>

            {/* Already passed banner */}
            {latestPassing && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                        Ты уже сдал этот вопрос ({latestPassing.score}/100). Можешь повторить ещё раз.
                    </p>
                </div>
            )}

            {/* Textarea */}
            <div className={cn(
                "rounded-2xl border bg-background transition-colors",
                checking ? "border-primary/30" : "border-border focus-within:border-primary/50"
            )}>
        <textarea
            ref={textareaRef}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Напиши свой ответ здесь..."
            disabled={checking}
            rows={4}
            className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm leading-relaxed focus:outline-none placeholder:text-muted-foreground/50 disabled:opacity-60"
            onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleCheck();
            }}
        />
                <div className="flex items-center justify-between px-3 pb-2.5">
          <span className="text-[10px] text-muted-foreground/50">
            {userAnswer.length > 0 ? `${userAnswer.length} симв.` : "⌘↵ чтобы отправить"}
          </span>
                    <button
                        onClick={handleCheck}
                        disabled={!userAnswer.trim() || checking}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95",
                            userAnswer.trim() && !checking
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                    >
                        {checking ? (
                            <>
                                <Sparkles size={12} className="animate-pulse" />
                                Проверяю...
                            </>
                        ) : (
                            <>
                                <Send size={12} />
                                Проверить
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* History */}
            {loadingHistory ? (
                <div className="py-6 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : hasAttempts ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <History size={11} className="text-muted-foreground" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Попытки ({attempts.length})
                        </p>
                    </div>
                    {[...attempts].reverse().map((attempt, i) => (
                        <AttemptCard
                            key={attempt.id}
                            attempt={attempt}
                            isLatest={i === 0}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-6 text-center text-muted-foreground">
                    <AlertCircle size={20} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs">Попыток пока нет. Попробуй ответить!</p>
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
    const [aiMode, setAiMode] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const isHorizontalScrollIntent = useRef(false);

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
        setAiMode(false);
        scrollToTop();
    }, [scrollToTop]);

    const goToPrev = useCallback(() => { if (currentIdx > 0) goTo(currentIdx - 1); }, [currentIdx, goTo]);
    const goToNext = useCallback(() => { if (currentIdx < questions.length - 1) goTo(currentIdx + 1); }, [currentIdx, questions.length, goTo]);

    const isHorizontallyScrollable = (element: HTMLElement | null): boolean => {
        if (!element) return false;
        let el: HTMLElement | null = element;
        let depth = 0;
        while (el && depth < 15) {
            const style = window.getComputedStyle(el);
            const overflowX = style.overflowX;
            const canScroll = el.scrollWidth > el.clientWidth;
            if (canScroll && (overflowX === "auto" || overflowX === "scroll")) return true;
            if (el.scrollLeft > 0) return true;
            el = el.parentElement;
            depth++;
        }
        return false;
    };

    useEffect(() => {
        if (!isMobile) return;
        const handleTouchMove = (e: TouchEvent) => {
            if (touchStartX.current === null || touchStartY.current === null) return;
            const target = e.target as HTMLElement;
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const dx = Math.abs(currentX - touchStartX.current);
            const dy = Math.abs(currentY - touchStartY.current);
            if (dx > 10 || dy > 10) {
                if (dx > dy && dx > 10 && isHorizontallyScrollable(target)) {
                    isHorizontalScrollIntent.current = true;
                } else if (dy > dx) {
                    isHorizontalScrollIntent.current = false;
                }
            }
        };
        const handleTouchEndGlobal = () => {
            setTimeout(() => { isHorizontalScrollIntent.current = false; }, 50);
        };
        window.addEventListener("touchmove", handleTouchMove, { passive: true });
        window.addEventListener("touchend", handleTouchEndGlobal);
        return () => {
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEndGlobal);
        };
    }, [isMobile]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!isMobile) return;
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isHorizontalScrollIntent.current = false;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isMobile || touchStartX.current === null || touchStartY.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (!isHorizontalScrollIntent.current) {
            const isHorizontalSwipe = Math.abs(dx) > Math.abs(dy) * 1.5;
            const isLongEnough = Math.abs(dx) > 50;
            if (isHorizontalSwipe && isLongEnough) {
                const target = e.target as HTMLElement;
                const isInteractive = target.closest('button, a, [role="button"], input, textarea, [contenteditable="true"]');
                const isInScrollable = isHorizontallyScrollable(target);
                if (!isInteractive && !isInScrollable) {
                    dx < 0 ? goToNext() : goToPrev();
                }
            }
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

    // Called when AI passes the answer
    const handleAIPass = useCallback(() => {
        setStatuses((prev) => ({ ...prev, [question.id]: "CONFIDENT" }));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
        setTimeout(() => {
            if (currentIdx < questions.length - 1) goToNext();
        }, 800);
    }, [question.id, currentIdx, questions.length, goToNext]);

    const handleLevelClick = (key: LevelKey) => {
        setActiveLevel(key);
        if (statuses[question.id] === "NOT_SEEN") saveStatus(question.id, "SEEN");
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
            if (e.key === "ArrowLeft") goToPrev();
            if (e.key === "ArrowRight") goToNext();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [goToPrev, goToNext]);

    return (
        <div
            className="flex flex-col h-full bg-background overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Progress bar */}
            <div className="h-0.5 bg-muted shrink-0">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Header */}
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

                <span className="text-sm font-semibold shrink-0">
          {currentIdx + 1}
                    <span className="text-muted-foreground font-normal"> / {questions.length}</span>
        </span>

                <div className="shrink-0 flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-full">
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{confidentCount}</span>
                </div>

                {/* Questions list */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0">
                            <List size={18} className="text-muted-foreground" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col h-full overflow-auto">
                        <div className="p-4 border-b pr-20">
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
                                            <span className="text-xs text-muted-foreground shrink-0 font-mono">{q.order+1}.</span>
                                            <p className="text-xs leading-snug line-clamp-2">{q.text}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </header>

            {/* Content */}
            <div ref={contentRef} className="flex-1 overflow-y-auto overscroll-contain">
                <div className="max-w-2xl mx-auto px-4 pt-5 pb-32">

                    {/* Meta */}
                    <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                        <span>{category.icon} {category.label}</span>
                        <span>·</span>
                        <StatusIcon size={11} className={statusColor} />
                        <span>{statusLabel}</span>
                    </div>

                    {/* Question */}
                    <h2 className="text-[18px] md:text-xl font-bold leading-snug mb-6 tracking-tight">
                        {question.text}
                    </h2>

                    {/* Mode tabs */}
                    <div className="flex gap-1.5 mb-6 p-1 bg-muted/40 rounded-2xl">
                        <button
                            onClick={() => setAiMode(false)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all",
                                !aiMode
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <BookOpen size={12} />
                            Читать
                        </button>
                        <button
                            onClick={() => {
                                setAiMode(true);
                                if (statuses[question.id] === "NOT_SEEN") saveStatus(question.id, "SEEN");
                            }}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all",
                                aiMode
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <BrainCircuit size={12} />
                            Проверить себя
                            {/* AI badge */}
                            <span className="text-[9px] px-1 py-0.5 rounded bg-primary-foreground/20 text-primary-foreground/80 font-bold">
                AI
              </span>
                        </button>
                    </div>

                    {/* ── Read mode ── */}
                    {!aiMode && (
                        <>
                            {!question.answer ? (
                                <div className="py-16 text-center text-muted-foreground">
                                    <BookOpen size={36} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Ответ пока не добавлен</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Summary */}
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

                                    {/* Level picker */}
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

                                    {/* Answer by level */}
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                                            {levels.find((l) => l.key === activeLevel)?.icon}{" "}
                                            {levels.find((l) => l.key === activeLevel)?.label}
                                        </p>
                                        <MilkdownEditor
                                            key={`${question.id}-${activeLevel}`}
                                            value={question.answer[activeLevel]}
                                            readOnly={true}
                                            height="auto"
                                        />
                                    </div>

                                    {/* Analogy */}
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

                                    {/* Diagram */}
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
                                                        <Mermaid key={`${question.id}-diagram-fullscreen`} chart={question.answer.diagram} />
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            <div className="bg-muted/30 rounded-2xl p-4 overflow-x-auto">
                                                <Mermaid key={`${question.id}-diagram`} chart={question.answer.diagram} />
                                            </div>
                                        </div>
                                    )}

                                    {/* CTA to switch to AI mode */}
                                    <button
                                        onClick={() => setAiMode(true)}
                                        className="w-full py-3 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-primary"
                                    >
                                        <BrainCircuit size={15} />
                                        Проверить себя с ИИ
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── AI check mode ── */}
                    {aiMode && (
                        <AICheckPanel
                            key={question.id}
                            question={question}
                            onPass={handleAIPass}
                        />
                    )}
                </div>
            </div>

            {/* Bottom bar */}
            <div
                className="shrink-0 border-t bg-background/95 backdrop-blur-md px-3 pt-3"
                style={{ paddingBottom: `calc(${isMobile ? "5" : "1"}rem + env(safe-area-inset-bottom))` }}
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