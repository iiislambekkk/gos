import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { questionId, status } = await req.json();

    const progress = await prisma.userProgress.upsert({
        where: { userId_questionId: { userId: session.user.id, questionId } },
        update: { status },
        create: { userId: session.user.id, questionId, status },
    });

    return NextResponse.json(progress);
}