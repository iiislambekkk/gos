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
import { Trash2, Save, AlertTriangle, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { MilkdownEditor } from "@/components/milkdown-editor";

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
}

const levelConfigs: Record<string, LevelConfig> = {
    summary:    { icon: "📝", label: "Қысқа жауап",      placeholder: "Екі сөзбен түсіндіріңіз..."              },
    eli5:       { icon: "🧒", label: "Балаға (5 жас)",    placeholder: "Қарапайым тілмен, мысал келтіріп..."     },
    eli10:      { icon: "🎒", label: "Оқушыға",           placeholder: "Негізгі ұғымдармен, күрделі терминсіз..." },
    eliStudent: { icon: "🎓", label: "Студентке",         placeholder: "Терминдермен, құрылымды түрде..."         },
    eliExpert:  { icon: "💼", label: "Сарапшыға",         placeholder: "Толық техникалық жауап..."               },
    analogy:    { icon: "🎭", label: "Өмірден мысал",     placeholder: "Мысалы, бұл ұқсас..."                    },
    diagram:    { icon: "📊", label: "Схема (Mermaid)",   placeholder: "Mermaid синтаксисімен диаграмма..."       },
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

    const filledCount = Object.values(fields).filter(v => v.trim().length > 0).length;

    const updateField = (key: string, value: string) => {
        setFields((prev) => ({ ...prev, [key]: value }));
    };

    async function saveQuestion() {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/exams/${examId}/questions/${question.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: questionText, category, ...fields }),
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

    return (
        <div className="space-y-6">
            {/* Question + Category */}
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
                <div className="w-48 space-y-2">
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
                                    {hasContent ? (
                                        <Badge variant="secondary" className="text-xs">✓ Толтырылған</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-xs text-muted-foreground">Бос</Badge>
                                    )}
                                </button>

                                {isExpanded && (
                                    <div className="px-4 pb-4">
                                        <MilkdownEditor
                                            value={value}
                                            onChange={(v) => updateField(key, v)}
                                            placeholder={config.placeholder}
                                            height="280px"
                                        />
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