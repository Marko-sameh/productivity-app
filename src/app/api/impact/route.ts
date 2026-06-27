import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const { commitHash, category, note } = data;

    if (!commitHash || !category) {
      return NextResponse.json(
        { error: "Missing commitHash or category" },
        { status: 400 },
      );
    }

    const impact = await prisma.impact.create({
      data: {
        category,
        notes: note,
        commit: {
          connect: { hash: commitHash },
        },
      },
    });

    return NextResponse.json(impact);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to add impact" },
      { status: 500 },
    );
  }
}
