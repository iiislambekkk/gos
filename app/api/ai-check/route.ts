// app/api/ai-check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId, userAnswer } = await req.json();

    if (!questionId || !userAnswer?.trim()) {
        return NextResponse.json({ error: "questionId and userAnswer are required" }, { status: 400 });
    }

    // Загружаем вопрос + эталонный ответ
    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { answer: true },
    });

    if (!question) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const referenceAnswer = question.answer
        ? `${question.answer.eliExpert}\n\nКраткий ответ: ${question.answer.summary}`
        : "Эталонный ответ недоступен.";

    // Находим или создаём сессию
    let aiSession = await prisma.aIAnswerSession.findUnique({
        where: { userId_questionId: { userId: session.user.id, questionId } },
        include: { attempts: { orderBy: { attemptNumber: "asc" } } },
    });

    if (!aiSession) {
        aiSession = await prisma.aIAnswerSession.create({
            data: { userId: session.user.id, questionId },
            include: { attempts: { orderBy: { attemptNumber: "asc" } } },
        });
    }

    const attemptNumber = (aiSession.attempts?.length ?? 0) + 1;

    // Системный промпт
    const systemPrompt = `Ты — строгий, но справедливый ментор для студентов-технарей. Оцениваешь письменные ответы на экзаменационные вопросы.
Пиши все на казахском языке, пиши на русском только если студент написал ответ на русском.

Твоя задача: проверить ответ студента и дать структурированный фидбек в формате JSON.

Критерии оценки:
- Техническая точность (правильность фактов, определений)
- Полнота (охват ключевых аспектов)
- Понимание (а не просто заученные слова)
- Для TASK-вопросов: правильность решения

Возвращай ТОЛЬКО валидный JSON (без markdown блоков) в таком формате:
{
  "score": <число 0-100>,
  "scoreLabel": <"WEAK" | "OK" | "GOOD" | "EXCELLENT">,
  "isPassing": <true если score >= 70>,
  "aiFeedback": "<развёрнутый комментарий в Markdown, 3-5 абзацев>",
  "strengths": ["<сильная сторона 1>", "<сильная сторона 2>"],
  "improvements": ["<что улучшить 1>", "<что улучшить 2>"]
}

Шкала оценок:
- WEAK: 0–39 (не понимает тему)
- OK: 40–69 (базовое понимание, есть пробелы)
- GOOD: 70–84 (хорошее понимание)
- EXCELLENT: 85–100 (отличный ответ)

Strengths и improvements — конкретные, не общие слова.`;

    const userPrompt = `Вопрос: ${question.text}

Эталонный ответ (для сравнения, студент его не видел):
${referenceAnswer}

Ответ студента:
${userAnswer}

Это попытка номер ${attemptNumber}.${attemptNumber > 1 ? " Учти предыдущие попытки при формировании фидбека — если студент исправил ошибки, отметь прогресс." : ""}`;

    // Запрос к ChatGPT
    const completion = await openai.chat.completions.create({
        model: "gpt-5.4-mini-2026-03-17",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.3
    });

    const rawResponse = completion.choices[0].message.content ?? "{}";

    let parsed: {
        score: number;
        scoreLabel: "WEAK" | "OK" | "GOOD" | "EXCELLENT";
        isPassing: boolean;
        aiFeedback: string;
        strengths: string[];
        improvements: string[];
    };

    try {
        parsed = JSON.parse(rawResponse);
    } catch {
        return NextResponse.json({ error: "AI response parse error", raw: rawResponse }, { status: 500 });
    }

    // Сохраняем попытку
    const attempt = await prisma.aIAnswerAttempt.create({
        data: {
            sessionId: aiSession.id,
            attemptNumber,
            userAnswer,
            aiFeedback: parsed.aiFeedback,
            score: parsed.score,
            scoreLabel: parsed.scoreLabel,
            strengths: parsed.strengths,
            improvements: parsed.improvements,
            isPassing: parsed.isPassing,
        },
    });

    // Если прошёл — обновляем прогресс до CONFIDENT
    if (parsed.isPassing) {
        await prisma.userProgress.upsert({
            where: { userId_questionId: { userId: session.user.id, questionId } },
            update: { status: "CONFIDENT" },
            create: { userId: session.user.id, questionId, status: "CONFIDENT" },
        });
    }

    return NextResponse.json({ attempt, attemptNumber, sessionId: aiSession.id });
}

// GET — загрузить историю попыток для вопроса
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
        return NextResponse.json({ error: "questionId required" }, { status: 400 });
    }

    const aiSession = await prisma.aIAnswerSession.findUnique({
        where: { userId_questionId: { userId: session.user.id, questionId } },
        include: { attempts: { orderBy: { attemptNumber: "asc" } } },
    });

    return NextResponse.json({ attempts: aiSession?.attempts ?? [] });
}