"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ExamType } from "@prisma/client";
import {
    Flame, Trophy, Clock, BookOpen, CheckCircle2,
    ChevronRight, Target, Zap, Calendar, Timer, AlertCircle
} from "lucide-react";

const examTypeLabel: Record<ExamType, string> = {
    KNOWLEDGE_BASED: "Знание",
    UNDERSTANDING_BASED: "Понимание",
    TASK_BASED: "Задачи",
    MIXED: "Смешанный",
};

const motivationByStreak = (streak: number) => {
    if (streak === 0) return { text: "Начни сегодня — первый шаг самый важный 💪", color: "text-muted-foreground" };
    if (streak < 3)  return { text: "Хорошее начало! Не прерывай серию 🔥",         color: "text-orange-500" };
    if (streak < 7)  return { text: `${streak} дней подряд — ты в зоне потока! ⚡`,  color: "text-orange-500" };
    if (streak < 30) return { text: `${streak} дней! Ты машина 🚀`,                  color: "text-primary" };
    return { text: `${streak} дней — легенда 👑`,                                     color: "text-yellow-500" };
};

function daysLeft(date: Date | null) {
    if (!date) return null;
    return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
}

function urgencyColor(days: number | null) {
    if (days === null) return "";
    if (days <= 1) return "text-destructive";
    if (days <= 3) return "text-orange-500";
    if (days <= 7) return "text-yellow-600";
    return "text-muted-foreground";
}

interface Exam {
    id: string; title: string; description?: string | null; type: ExamType;
    total: number; confident: number; seen: number; examDate: Date | null;
}

interface Props {
    user: { name: string; image?: string | null };
    exams: Exam[];
    streak: { current: number; longest: number };
    upcomingExam: Exam | null;
    totalQuestions: number;
    totalConfident: number;
}

export function MainDashboard({ user, exams, streak, upcomingExam, totalQuestions, totalConfident }: Props) {
    const motivation = motivationByStreak(streak.current);
    const globalPercent = totalQuestions > 0 ? Math.round((totalConfident / totalQuestions) * 100) : 0;
    const urgencyDays = daysLeft(upcomingExam?.examDate ?? null);

    // Таймер до 25 мая 2026 9:00
    const TARGET_DATE = new Date(2026, 4, 25, 9, 0, 0); // 25 мая 2026, 9:00
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isExamPassed, setIsExamPassed] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = TARGET_DATE.getTime() - now.getTime();

            if (difference <= 0) {
                setIsExamPassed(true);
                return;
            }

            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000)
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    const getTimerColor = () => {
        const totalDays = timeLeft.days;
        if (totalDays <= 3) return "from-red-600 to-red-500";
        if (totalDays <= 7) return "from-orange-600 to-orange-500";
        if (totalDays <= 30) return "from-yellow-600 to-yellow-500";
        return "from-primary to-primary/70";
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 pb-24 space-y-6">

            {/* ── Приветствие ── */}
            <div className="pt-6 pb-2">
                <h1 className="text-2xl font-bold tracking-tight">
                    Привет, {user.name.split(" ")[0]} 👋
                </h1>
                <p className={`text-sm mt-1 font-medium ${motivation.color}`}>
                    {motivation.text}
                </p>
            </div>

            {/* ── СТИЛЬНЫЙ ТАЙМЕР ДО ЭКЗАМЕНА ── */}
            {!isExamPassed && (
                <Card className={`bg-gradient-to-br ${getTimerColor()} text-white border-0 shadow-xl overflow-hidden relative`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Timer className="h-5 w-5 animate-pulse" />
                                <span className="text-sm font-medium uppercase tracking-wider">
                                    До главного экзамена
                                </span>
                            </div>
                            <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                25 мая 2026 • 9:00
                            </Badge>
                        </div>

                        {/* Цифры таймера */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-black tracking-tighter bg-white/10 rounded-lg py-2 backdrop-blur-sm">
                                    {String(timeLeft.days).padStart(2, '0')}
                                </div>
                                <div className="text-xs mt-2 opacity-80 uppercase tracking-wide">Дней</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-black tracking-tighter bg-white/10 rounded-lg py-2 backdrop-blur-sm">
                                    {String(timeLeft.hours).padStart(2, '0')}
                                </div>
                                <div className="text-xs mt-2 opacity-80 uppercase tracking-wide">Часов</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-black tracking-tighter bg-white/10 rounded-lg py-2 backdrop-blur-sm">
                                    {String(timeLeft.minutes).padStart(2, '0')}
                                </div>
                                <div className="text-xs mt-2 opacity-80 uppercase tracking-wide">Минут</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-black tracking-tighter bg-white/10 rounded-lg py-2 backdrop-blur-sm">
                                    {String(timeLeft.seconds).padStart(2, '0')}
                                </div>
                                <div className="text-xs mt-2 opacity-80 uppercase tracking-wide">Секунд</div>
                            </div>
                        </div>

                        {/* Прогресс-бар времени */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs opacity-80">
                                <span>Осталось времени</span>
                                <span>{Math.round((1 - (timeLeft.days / 365)) * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full transition-all duration-500"
                                    style={{ width: `${Math.max(0, Math.min(100, (1 - (timeLeft.days / 365)) * 100))}%` }}
                                />
                            </div>
                        </div>

                        {/* Мотивирующая фраза */}
                        <div className="mt-4 text-xs text-center opacity-90">
                            {timeLeft.days <= 3 && "🔥 Последний рывок! Ты справишься!"}
                            {timeLeft.days > 3 && timeLeft.days <= 7 && "⚡ Финишная прямая! Усиль подготовку"}
                            {timeLeft.days > 7 && timeLeft.days <= 30 && "🎯 Отличное время для интенсивной подготовки"}
                            {timeLeft.days > 30 && "💪 У тебя достаточно времени, чтобы подготовиться отлично"}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Альтернатива, если экзамен прошёл ── */}
            {isExamPassed && (
                <Card className="bg-gradient-to-br from-green-500/20 to-green-500/10 border-green-500/30">
                    <CardContent className="p-6 text-center">
                        <Trophy className="h-12 w-12 mx-auto mb-2 text-green-500" />
                        <div className="font-semibold text-lg">Экзамен завершён! 🎉</div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Ждём результатов. Ты отлично постарался!
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Хэдер-статы ── */}
            <div className="grid grid-cols-3 gap-3">
                {/* Стрик */}
                <Card className="bg-gradient-to-br from-orange-500/40 to-orange-500/10 border-orange-500/20">
                    <CardContent className="p-4 text-center">
                        <Flame size={20} className="mx-auto mb-1 text-orange-500" />
                        <div className="text-2xl font-bold">{streak.current}</div>
                        <div className="text-xs text-muted-foreground">дней подряд</div>
                    </CardContent>
                </Card>

                {/* Общий прогресс */}
                <Card className="bg-gradient-to-br from-primary/40 to-primary/5 border-primary/20">
                    <CardContent className="p-4 text-center">
                        <Target size={20} className="mx-auto mb-1 text-primary" />
                        <div className="text-2xl font-bold">{globalPercent}%</div>
                        <div className="text-xs text-muted-foreground">готовность</div>
                    </CardContent>
                </Card>

                {/* Знаю */}
                <Card className="bg-gradient-to-br from-green-500/40 to-green-500/5 border-green-500/20">
                    <CardContent className="p-4 text-center">
                        <CheckCircle2 size={20} className="mx-auto mb-1 text-green-500" />
                        <div className="text-2xl font-bold">{totalConfident}</div>
                        <div className="text-xs text-muted-foreground">знаю</div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Ближайший экзамен — баннер ── */}
            {upcomingExam && urgencyDays !== null && (
                <Card className={`border-2 ${urgencyDays <= 3 ? "border-destructive/50 bg-destructive/5" : "border-primary/30 bg-primary/5"}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className={`text-4xl font-black ${urgencyColor(urgencyDays)}`}>
                            {urgencyDays === 0 ? "!" : urgencyDays}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                                {urgencyDays === 0 ? "Сегодня экзамен" : urgencyDays === 1 ? "Завтра экзамен" : `дней до экзамена`}
                            </div>
                            <div className="font-semibold truncate">{upcomingExam.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                Готов на {upcomingExam.total > 0 ? Math.round((upcomingExam.confident / upcomingExam.total) * 100) : 0}%
                            </div>
                        </div>
                        <Button size="sm" asChild>
                            <Link href={`/exam/${upcomingExam.id}`}>
                                <Zap size={14} className="mr-1" /> Учить
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* ── Глобальный прогресс ── */}
            <div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Общий прогресс</span>
                    <span className="text-muted-foreground">{totalConfident} / {totalQuestions} вопросов</span>
                </div>
                <Progress value={globalPercent} className="h-2" />
            </div>

            {/* ── Экзамены ── */}
            <div>
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    Экзамены
                </h2>
                <div className="space-y-4 flex flex-col gap-3">
                    {exams.map((exam) => {
                        const percent = exam.total > 0 ? Math.round((exam.confident / exam.total) * 100) : 0;
                        const days = daysLeft(exam.examDate);

                        return (
                            <Link key={exam.id} href={`/exam/${exam.id}`}>
                                <Card className="hover:border-primary/50 transition-all hover:shadow-sm active:scale-[0.99]">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold leading-tight">{exam.title}</div>
                                                {exam.description && (
                                                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{exam.description}</div>
                                                )}
                                            </div>
                                            <Badge variant="outline" className="text-xs shrink-0">
                                                {examTypeLabel[exam.type]}
                                            </Badge>
                                        </div>

                                        {/* Прогресс */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 size={11} className="text-green-500" />
                                                    {exam.confident} знаю
                                                    <span className="text-muted-foreground/50">·</span>
                                                    <BookOpen size={11} className="text-blue-500" />
                                                    {exam.seen} читал
                                                </span>
                                                <span>{percent}%</span>
                                            </div>
                                            <Progress value={percent} className="h-1.5" />
                                        </div>

                                        {/* Футер */}
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-1 text-xs">
                                                <Calendar size={11} />
                                                {days === null ? (
                                                    <span className="text-muted-foreground">Дата не указана</span>
                                                ) : days < 0 ? (
                                                    <span className="text-muted-foreground">Прошёл</span>
                                                ) : days === 0 ? (
                                                    <span className="text-destructive font-semibold">Сегодня!</span>
                                                ) : (
                                                    <span className={urgencyColor(days)}>
                                                        {days} дн. осталось
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-primary font-medium">
                                                {exam.total - exam.confident > 0
                                                    ? `${exam.total - exam.confident} осталось`
                                                    : <span className="text-green-500">✓ Готов!</span>
                                                }
                                                <ChevronRight size={14} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
        </div>
    );
}