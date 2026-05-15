// app/(admin)/admin/exams/[examId]/question-editor.tsx
"use client";

import { useState } from "react";
import { Question, Answer } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Save, AlertTriangle, ChevronRight, Eye, Code, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { MilkdownEditor } from "@/components/milkdown-editor";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Mermaid from "@/components/mermaid";

type QuestionWithAnswer = Question & {
    answer: Answer | null;
    _count: {
        progress: number;
        comments: number;
    };
};

interface LevelConfig {
    icon: string;
    label: string;
    placeholder: string;
    isMermaid?: boolean;
}

const levelConfigs: Record<string, LevelConfig> = {
    summary:    { icon: "📝", label: "Қысқа жауап",      placeholder: "Екі сөзбен түсіндіріңіз..."              },
    eli5:       { icon: "🧒", label: "Балаға (5 жас)",    placeholder: "Қарапайым тілмен, мысал келтіріп..."     },
    eli10:      { icon: "🎒", label: "Оқушыға",           placeholder: "Негізгі ұғымдармен, күрделі терминсіз..." },
    eliStudent: { icon: "🎓", label: "Студентке",         placeholder: "Терминдермен, құрылымды түрде..."         },
    eliExpert:  { icon: "💼", label: "Сарапшыға",         placeholder: "Толық техникалық жауап..."               },
    analogy:    { icon: "🎭", label: "Өмірден мысал",     placeholder: "Мысалы, бұл ұқсас..."                    },
    diagram:    { icon: "📊", label: "Схема (Mermaid)",   placeholder: "graph TD\n  A[Бастау] --> B{Шешім}\n  B --> C[Нәтиже]", isMermaid: true },
};

export function QuestionEditor({
                                   examId,
                                   question,
                                   onUpdate,
                                   onDelete,
                               }: {
    examId: string;
    question: QuestionWithAnswer;
    onUpdate: (updated: QuestionWithAnswer) => void;
    onDelete: () => void;
}) {
    const [questionText, setQuestionText]       = useState(question.text);
    const [category, setCategory]               = useState(question.category);
    const [difficulty, setDifficulty]           = useState(question.difficulty);
    const [fields, setFields]                   = useState({
        summary:    question.answer?.summary    || "",
        eli5:       question.answer?.eli5       || "",
        eli10:      question.answer?.eli10      || "",
        eliStudent: question.answer?.eliStudent || "",
        eliExpert:  question.answer?.eliExpert  || "",
        analogy:    question.answer?.analogy    || "",
        diagram:    question.answer?.diagram    || "",
    });
    const [expandedLevel, setExpandedLevel]     = useState<string | null>("summary");
    const [saving, setSaving]                   = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [previewOpen, setPreviewOpen]         = useState(false);
    const [diagramError, setDiagramError]       = useState<string | null>(null);

    const filledCount = Object.values(fields).filter(v => v.trim().length > 0).length;

    const updateField = (key: string, value: string) => {
        setFields((prev) => ({ ...prev, [key]: value }));
        if (key === 'diagram') {
            setDiagramError(null);
        }
    };

    async function saveQuestion() {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/exams/${examId}/questions/${question.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: questionText,
                    category,
                    difficulty,
                    ...fields
                }),
            });
            if (!res.ok) throw new Error();
            const updated = await res.json();
            onUpdate(updated);
            toast.success("Сақталды");
        } catch {
            toast.error("Қате кетті");
        } finally {
            setSaving(false);
        }
    }

    const handleDiagramError = (error: string) => {
        setDiagramError(error);
    };

    const getDifficultyColor = (level: number) => {
        if (level <= 2) return "text-green-600 bg-green-50 dark:bg-green-950/30";
        if (level <= 3) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30";
        return "text-red-600 bg-red-50 dark:bg-red-950/30";
    };

    const getDifficultyStars = (level: number) => {
        return "⭐".repeat(level) + "☆".repeat(5 - level);
    };

    return (
        <div className="space-y-6  overflow-y-scroll  hide-scrollbar h-[400px]">
            {/* Question + Category + Difficulty */}
            <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                <div className="flex-1 space-y-2">
                    <Label>Сұрақ мәтіні</Label>
                    <MilkdownEditor
                        value={questionText}
                        onChange={setQuestionText}
                        placeholder="Сұрақты жазыңыз..."
                        height="150px"
                    />
                </div>
                <div className="w-60 space-y-2">
                    <Label>Категория</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="KNOWLEDGE">Білім</SelectItem>
                            <SelectItem value="UNDERSTANDING">Түсіну</SelectItem>
                            <SelectItem value="TASK">Есеп</SelectItem>
                        </SelectContent>
                    </Select>

                    <Label>Сложность</Label>
                    <Select value={difficulty.toString()} onValueChange={(v) => setDifficulty(parseInt(v))}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">⭐ Очень легко</SelectItem>
                            <SelectItem value="2">⭐⭐ Легко</SelectItem>
                            <SelectItem value="3">⭐⭐⭐ Средне</SelectItem>
                            <SelectItem value="4">⭐⭐⭐⭐ Сложно</SelectItem>
                            <SelectItem value="5">⭐⭐⭐⭐⭐ Очень сложно</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Difficulty badge */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                        <span>{getDifficultyStars(difficulty)}</span>
                        <span>({difficulty}/5)</span>
                    </div>

                    {/* Stats */}
                    <div className="pt-2 space-y-1">
                        <div className="text-xs text-muted-foreground flex justify-between">
                            <span>Жауаптар</span>
                            <span className="font-medium text-foreground">{filledCount}/{Object.keys(levelConfigs).length}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                            <span>Прогресс</span>
                            <span className="font-medium text-foreground">{question._count.progress}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                            <span>Комментарии</span>
                            <span className="font-medium text-foreground">{question._count.comments}</span>
                        </div>
                    </div>

                    {/* Fill progress bar */}
                    <div className="pt-1">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${(filledCount / Object.keys(levelConfigs).length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Answer Levels */}
            <div className="space-y-2">
                <Label>Жауап деңгейлері</Label>
                <div className="border rounded-lg overflow-hidden divide-y">
                    {Object.entries(levelConfigs).map(([key, config]) => {
                        const value = fields[key as keyof typeof fields];
                        const isExpanded = expandedLevel === key;
                        const hasContent = value.trim().length > 0;

                        return (
                            <div key={key}>
                                <button
                                    type="button"
                                    onClick={() => setExpandedLevel(isExpanded ? null : key)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <ChevronRight
                                            size={16}
                                            className={`transition-transform text-muted-foreground ${isExpanded ? "rotate-90" : ""}`}
                                        />
                                        <span className="text-base">{config.icon}</span>
                                        <span className="font-medium text-sm">{config.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasContent && (
                                            <Badge variant="secondary" className="text-xs">✓ Толтырылған</Badge>
                                        )}
                                        {!hasContent && (
                                            <Badge variant="outline" className="text-xs text-muted-foreground">Бос</Badge>
                                        )}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="px-4 pb-4">
                                        {config.isMermaid ? (
                                            <div className="space-y-3">
                                                {/* Mermaid редактор как обычный текст */}
                                                <div className="relative">
                                                    <Label className="text-xs text-muted-foreground mb-1 block">
                                                        Mermaid синтаксисі
                                                    </Label>
                                                    <Textarea
                                                        value={value}
                                                        onChange={(e) => updateField(key, e.target.value)}
                                                        placeholder={config.placeholder}
                                                        className="font-mono text-sm min-h-[200px]"
                                                    />
                                                    <div className="absolute top-8 right-2 flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 px-2"
                                                            onClick={() => setPreviewOpen(true)}
                                                            disabled={!value.trim()}
                                                        >
                                                            <Eye size={14} className="mr-1" />
                                                            Көрсету
                                                        </Button>
                                                        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 px-2"
                                                                    disabled={!value.trim()}
                                                                >
                                                                    <Maximize2 size={14} />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                                <DialogHeader>
                                                                    <DialogTitle>Mermaid Диаграмма</DialogTitle>
                                                                </DialogHeader>
                                                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                                                    <Mermaid
                                                                        chart={value}
                                                                        onError={handleDiagramError}
                                                                    />
                                                                    {diagramError && (
                                                                        <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                                                                            <AlertTriangle size={14} className="inline mr-2" />
                                                                            {diagramError}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="mt-4">
                                                                    <Label className="text-xs text-muted-foreground">Код:</Label>
                                                                    <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                                                                        <code>{value}</code>
                                                                    </pre>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </div>

                                                {/* Живое превью */}
                                                {value.trim() && (
                                                    <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                                <Eye size={14} />
                                                                Алдын ала қарау
                                                            </Label>
                                                            <Badge variant="outline" className="text-xs">
                                                                Mermaid
                                                            </Badge>
                                                        </div>
                                                        <div className="min-h-[200px] flex items-center justify-center">
                                                            <Mermaid
                                                                chart={value}
                                                                onError={handleDiagramError}
                                                            />
                                                        </div>
                                                        {diagramError && (
                                                            <div className="mt-3 p-2 bg-destructive/10 text-destructive rounded-md text-xs">
                                                                <AlertTriangle size={12} className="inline mr-1" />
                                                                {diagramError}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Подсказка по синтаксису */}
                                                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                                                    <div className="font-medium mb-1 flex items-center gap-1">
                                                        <Code size={12} />
                                                        Mermaid синтаксисі мысалы:
                                                    </div>
                                                    <pre className="mt-1 font-mono text-xs">
{`graph TD
    A[Бастау] --> B{Шешім қабылдау}
    B -->|Иә| C[Нәтиже 1]
    B -->|Жоқ| D[Нәтиже 2]
    C --> E[Аяқтау]
    D --> E`}
                                                    </pre>
                                                    <div className="mt-2">
                                                        <a
                                                            href="https://mermaid.js.org/syntax/"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline"
                                                        >
                                                            Толық документация →
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <MilkdownEditor
                                                value={value}
                                                onChange={(v) => updateField(key, v)}
                                                placeholder={config.placeholder}
                                                height="280px"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
                {showDeleteConfirm ? (
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={16} className="text-destructive" />
                        <span className="text-sm">Сұрақты жою?</span>
                        <Button size="sm" variant="destructive" onClick={onDelete}>Иә</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>Жоқ</Button>
                    </div>
                ) : (
                    <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                        <Trash2 size={14} className="mr-1.5 text-destructive" />
                        Жою
                    </Button>
                )}
                <Button onClick={saveQuestion} disabled={saving}>
                    <Save size={14} className="mr-1.5" />
                    {saving ? "Сақталуда..." : "Сақтау"}
                </Button>
            </div>
        </div>
    );
}