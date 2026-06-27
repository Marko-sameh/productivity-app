import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyCommit } from "@/lib/classification";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Check if it's a repo:push event
    if (data.push && data.push.changes) {
      let count = 0;
      const repoSlug = data.repository?.name || "unknown";

      for (const change of data.push.changes) {
        if (change.commits) {
          for (const c of change.commits) {
            const hash = c.hash;
            const message = c.message;
            const date = new Date(c.date);
            const authorName = c.author?.user?.display_name || c.author?.raw || "Unknown";
            
            const existing = await prisma.commit.findUnique({ where: { hash } });
            if (!existing) {
              await prisma.commit.create({
                data: {
                  hash,
                  repo: repoSlug,
                  date,
                  message,
                  author: authorName,
                  type: classifyCommit(message),
                },
              });
              count++;
            }
          }
        }
      }
      return NextResponse.json({ message: "Webhook processed", inserted: count });
    }

    return NextResponse.json({ message: "No commits found in payload" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
