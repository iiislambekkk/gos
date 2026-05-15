// app/(admin)/admin/exams/[examId]/exam-editor.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Exam, Question, Answer } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Eye, EyeOff, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { QuestionEditor } from "./question-editor";

type QuestionWithAnswer = Question & {
    answer: Answer | null;
    _count: {
        progress: number;
        comments: number;
    };
};

type ExamWithQuestions = Exam & {
    questions: QuestionWithAnswer[];
};

const questionCategoryLabels: Record<string, string> = {
    KNOWLEDGE: "Білім",
    UNDERSTANDING: "Түсіну",
    TASK: "Есеп",
};

const questionCategoryColors: Record<string, string> = {
    KNOWLEDGE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    UNDERSTANDING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    TASK: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export function ExamEditor({ exam }: { exam: ExamWithQuestions }) {
    const router = useRouter();
    const [questions, setQuestions] = useState<QuestionWithAnswer[]>(exam.questions);
    const [examTitle, setExamTitle] = useState(exam.title);
    const [examDescription, setExamDescription] = useState(exam.description || "");
    const [examType, setExamType] = useState(exam.type);
    const [saving, setSaving] = useState(false);
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newQuestionText, setNewQuestionText] = useState("");
    const [newQuestionCategory, setNewQuestionCategory] = useState("KNOWLEDGE");
    const [addingQuestion, setAddingQuestion] = useState(false);

    async function saveExamMetadata() {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/exams/${exam.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: examTitle,
                    description: examDescription,
                    type: examType,
                    examId: exam.id
                }),
            });
            if (!res.ok) throw new Error();
            toast.success("Емтихан жаңартылды / Экзамен обновлён");
            router.refresh();
        } catch {
            toast.error("Сақтау қатесі / Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    }

    async function addQuestion() {
        if (!newQuestionText.trim()) return;
        setAddingQuestion(true);
        try {
            const res = await fetch(`/api/admin/exams/${exam.id}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: newQuestionText,
                    category: newQuestionCategory,
                }),
            });
            if (!res.ok) throw new Error();
            const newQuestion = await res.json();
            setQuestions((prev) => [...prev, newQuestion]);
            setExpandedQuestionId(newQuestion.id);
            toast.success("Сұрақ қосылды / Вопрос добавлен");
            setShowAddDialog(false);
            setNewQuestionText("");
            setNewQuestionCategory("KNOWLEDGE");
            router.refresh();
        } catch {
            toast.error("Қате / Ошибка");
        } finally {
            setAddingQuestion(false);
        }
    }

    async function deleteQuestion(questionId: string) {
        try {
            const res = await fetch(
                `/api/admin/exams/${exam.id}/questions/${questionId}`,
                { method: "DELETE" }
            );
            if (!res.ok) throw new Error();
            setQuestions((prev) => prev.filter((q) => q.id !== questionId));
            if (expandedQuestionId === questionId) setExpandedQuestionId(null);
            toast.success("Сұрақ жойылды / Вопрос удалён");
            router.refresh();
        } catch {
            toast.error("Қате / Ошибка");
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 h-full overflow-y-auto hide-scrollbar">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/exams" className="flex items-center gap-1">
                        <ArrowLeft size={16} />
                        Артқа
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">{exam.title}</h1>
            </div>

            <Tabs defaultValue="questions" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="questions">Сұрақтар ({questions.length})</TabsTrigger>
                    <TabsTrigger value="meta">Баптаулар</TabsTrigger>
                </TabsList>

                {/* Questions Tab */}
                <TabsContent value="questions" className="space-y-4">
                    {/* Header with add button */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Барлығы: {questions.length} сұрақ
                        </p>
                        <Button onClick={() => setShowAddDialog(true)}>
                            <Plus size={16} className="mr-2" />
                            Сұрақ қосу
                        </Button>
                    </div>

                    {/* Questions list */}
                    {questions.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Сұрақтар жоқ</p>
                            <Button variant="link" onClick={() => setShowAddDialog(true)}>
                                Бірінші сұрақты қосыңыз
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {questions.map((question, index) => {
                                const isExpanded = expandedQuestionId === question.id;
                                const hasAnswer = !!question.answer?.summary;

                                return (
                                    <Card key={question.id} className="overflow-hidden">
                                        {/* Question header - always visible */}
                                        <div
                                            className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                                                isExpanded ? "bg-muted/30 border-b" : "hover:bg-muted/50"
                                            }`}
                                            onClick={() => setExpandedQuestionId(isExpanded ? null : question.id)}
                                        >
                                            <div className="flex-shrink-0">
                                                <ChevronRight
                                                    size={18}
                                                    className={`transition-transform mt-1 ${
                                                        isExpanded ? "rotate-90" : ""
                                                    }`}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        #{index + 1}
                                                    </span>
                                                    <Badge className={questionCategoryColors[question.category]}>
                                                        {questionCategoryLabels[question.category]}
                                                    </Badge>
                                                    {hasAnswer ? (
                                                        <Badge variant="outline" className="gap-1">
                                                            <Eye size={12} />
                                                            Жауап бар
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="gap-1 text-muted-foreground">
                                                            <EyeOff size={12} />
                                                            Жауап жоқ
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mt-2 font-medium line-clamp-2">
                                                    {question.text}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Question editor - shown when expanded */}
                                        {isExpanded && (
                                            <div className="p-4 pt-2">
                                                <QuestionEditor
                                                    examId={exam.id}
                                                    question={question}
                                                    onUpdate={(updated) => {
                                                        setQuestions((prev) =>
                                                            prev.map((q) => (q.id === updated.id ? updated : q))
                                                        );
                                                        router.refresh();
                                                    }}
                                                    onDelete={() => deleteQuestion(question.id)}
                                                />
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="meta">
                    <Card>
                        <CardHeader>
                            <CardTitle>Емтихан баптаулары</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Атауы</Label>
                                <Input
                                    value={examTitle}
                                    onChange={(e) => setExamTitle(e.target.value)}
                                    placeholder="Емтихан атауы"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Сипаттамасы</Label>
                                <Textarea
                                    value={examDescription}
                                    onChange={(e) => setExamDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Емтихан туралы қысқаша"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Түрі</Label>
                                <Select value={examType} onValueChange={setExamType}>
                                    <SelectTrigger className="w-full max-w-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MIXED">Аралас</SelectItem>
                                        <SelectItem value="KNOWLEDGE_BASED">Білім</SelectItem>
                                        <SelectItem value="UNDERSTANDING_BASED">Түсіну</SelectItem>
                                        <SelectItem value="TASK_BASED">Есептер</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={saveExamMetadata} disabled={saving}>
                                {saving ? "Сақталуда..." : "Сақтау"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Question Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Жаңа сұрақ</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Сұрақ мәтіні</Label>
                            <Textarea
                                placeholder="Сұрақты жазыңыз..."
                                value={newQuestionText}
                                onChange={(e) => setNewQuestionText(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Категория</Label>
                            <Select value={newQuestionCategory} onValueChange={setNewQuestionCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="KNOWLEDGE">Білім</SelectItem>
                                    <SelectItem value="UNDERSTANDING">Түсіну</SelectItem>
                                    <SelectItem value="TASK">Есеп</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Болдырмау
                        </Button>
                        <Button onClick={addQuestion} disabled={addingQuestion || !newQuestionText.trim()}>
                            {addingQuestion ? "Қосылуда..." : "Қосу"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}