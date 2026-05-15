// app/(admin)/admin/exams/[examId]/add-question-dialog.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Question, Answer } from "@prisma/client";

type QuestionWithAnswer = Question & { answer: Answer | null };

export function AddQuestionDialog({
                                      examId,
                                      onQuestionAdded,
                                  }: {
    examId: string;
    onQuestionAdded: (question: QuestionWithAnswer) => void;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [text, setText] = useState("");
    const [category, setCategory] = useState("KNOWLEDGE");
    const [summary, setSummary] = useState("");
    const [difficulty, setDifficulty] = useState(3);

    async function handleSubmit() {
        if (!text.trim()) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/admin/exams/${examId}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, category, summary, difficulty }),
            });

            if (!res.ok) throw new Error();
            const newQuestion = await res.json();

            onQuestionAdded(newQuestion);
            toast.success("Вопрос добавлен");
            setOpen(false);
            setText("");
            setCategory("KNOWLEDGE");
            setSummary("");
            setDifficulty(3);
        } catch {
            toast.error("Ошибка при создании вопроса");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus size={16} className="mr-2" />
                    Добавить вопрос
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Новый вопрос</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label>Вопрос</Label>
                        <Textarea
                            placeholder="Что такое TCP handshake?"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Краткий ответ (превью)</Label>
                        <Input
                            placeholder="Трёхстороннее рукопожатие для установки TCP-соединения"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Категория</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="KNOWLEDGE">Знание (Что такое X?)</SelectItem>
                                    <SelectItem value="UNDERSTANDING">Понимание (Как работает?)</SelectItem>
                                    <SelectItem value="TASK">Задача (Реши/напиши)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Сложность (1-5)</Label>
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
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !text.trim()}>
                        {loading ? "Создание..." : "Создать"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}