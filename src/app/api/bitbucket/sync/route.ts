import { NextResponse as NextResp } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyCommit } from "@/lib/classification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResp.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = process.env.BITBUCKET_WORKSPACE;
    const repoSlug = process.env.BITBUCKET_REPO_SLUG;
    const username = process.env.BITBUCKET_USERNAME;
    const appPassword = process.env.BITBUCKET_APP_PASSWORD;

    if (!workspace || !repoSlug || !username || !appPassword) {
      return NextResp.json(
        { error: "Bitbucket configuration missing in .env" },
        { status: 400 },
      );
    }

    const authHeader = `Basic ${Buffer.from(`${username}:${appPassword}`).toString("base64")}`;
    let nextUrl: string | null =
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/commits`;

    let totalInserted = 0;

    while (nextUrl) {
      const response: any = await fetch(nextUrl, {
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResp.json(
          { error: "Failed to fetch from Bitbucket", details: errorText },
          { status: response.status },
        );
      }

      const data = await response.json();
      const commits = data.values || [];

      if (commits.length > 0) {
        // Extract hashes
        const hashes = commits.map((c: any) => c.hash);

        // Bulk find existing hashes
        const existingRecords = await prisma.commit.findMany({
          where: { hash: { in: hashes } },
          select: { hash: true },
        });
        const existingSet = new Set(existingRecords.map((r) => r.hash));

        // Filter for new commits
        const newCommitsToInsert = commits
          .filter((c: any) => !existingSet.has(c.hash))
          .map((c: any) => ({
            hash: c.hash,
            repo: repoSlug,
            date: new Date(c.date),
            message: c.message,
            author: c.author?.user?.display_name || c.author?.raw || "Unknown",
            type: classifyCommit(c.message),
          }));

        if (newCommitsToInsert.length > 0) {
          const result = await prisma.commit.createMany({
            data: newCommitsToInsert,
          });
          totalInserted += result.count;
        }
      }

      // Check for next page
      nextUrl = data.next || null;
    }

    return NextResp.json({ message: "Sync complete", inserted: totalInserted });
  } catch (error: any) {
    console.error("Bitbucket sync error:", error);
    return NextResp.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
