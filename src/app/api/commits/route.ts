import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const unclassified = url.searchParams.get("unclassified") === "true";

  const commits = await prisma.commit.findMany({
    where: unclassified ? { type: null } : {},
    take: 500,
    orderBy: { date: "desc" },
    include: { impacts: true, deployments: true },
  });

  return NextResponse.json(commits);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const { hash, type, module, priority, estimatedHours, actualHours, status, evidenceUrl, releaseId } = data;

    if (!hash) {
      return NextResponse.json({ error: "Missing hash" }, { status: 400 });
    }

    const updated = await prisma.commit.update({
      where: { hash },
      data: { type, module, priority, estimatedHours, actualHours, status, evidenceUrl, releaseId: releaseId || null },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update commit/task" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const { message, module, priority, estimatedHours, actualHours, status, type, evidenceUrl, releaseId } = data;

    if (!message) {
      return NextResponse.json({ error: "Task title/message is required" }, { status: 400 });
    }

    const manualTask = await prisma.commit.create({
      data: {
        hash: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        repo: "Manual Entry",
        author: "Me",
        date: new Date(),
        message,
        type: type || "task",
        module,
        priority: priority || "Medium",
        estimatedHours,
        actualHours,
        status: status || "To Do",
        evidenceUrl,
        releaseId: releaseId || null,
      },
    });

    return NextResponse.json(manualTask);
  } catch (error: any) {
    console.error("Manual task creation error:", error);
    return NextResponse.json({ error: "Failed to create manual task" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const hash = url.searchParams.get("hash");

    if (!hash) {
      return NextResponse.json({ error: "Missing hash" }, { status: 400 });
    }

    await prisma.commit.delete({
      where: { hash },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
