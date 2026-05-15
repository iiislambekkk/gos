// components/admin/delete-exam-dialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteExamDialogProps {
    examId: string;
    examTitle: string;
}

export function DeleteExamDialog({ examId, examTitle }: DeleteExamDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        setLoading(true);

        const response = await fetch(`/api/admin/exams/${examId}`, {
            method: "DELETE",
        });

        setLoading(false);

        if (response.ok) {
            setOpen(false);
            router.refresh();
        } else {
            const error = await response.json();
            console.error("Failed to delete:", error);
            alert(error.error || "Ошибка при удалении экзамена");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 size={14} />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Удалить экзамен?</DialogTitle>
                    <DialogDescription>
                        Вы действительно хотите удалить экзамен "{examTitle}"?
                        <br />
                        <span className="text-destructive font-medium mt-2 block">
                            Внимание: все вопросы этого экзамена также будут удалены без возможности восстановления.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Отмена
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? "Удаление..." : "Удалить"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}