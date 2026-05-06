import { prisma } from "@/lib/prisma";
import { ExamType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { CreateExamDialog } from "@/components/admin/create-exam-dialog";

const examTypeLabel: Record<ExamType, string> = {
    KNOWLEDGE_BASED: "Знание",
    UNDERSTANDING_BASED: "Понимание",
    TASK_BASED: "Задачи",
    MIXED: "Смешанный",
};

export default async function AdminExamsPage() {
    const exams = await prisma.exam.findMany({
        include: { _count: { select: { questions: true } } },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Экзамены</h1>
                <CreateExamDialog />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Вопросов</TableHead>
                        <TableHead className="w-16" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {exams.map((exam) => (
                        <TableRow key={exam.id}>
                            <TableCell className="font-medium">{exam.title}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{examTypeLabel[exam.type]}</Badge>
                            </TableCell>
                            <TableCell>{exam._count.questions}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/admin/exams/${exam.id}`}>
                                        <Pencil size={14} />
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {exams.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                Экзаменов пока нет
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}