import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const { commitHash, environment } = data; // environment: "dev" | "production"

    if (!commitHash || !environment) {
      return NextResponse.json({ error: "Missing commitHash or environment" }, { status: 400 });
    }

    const deployment = await prisma.deployment.create({
      data: {
        environment,
        commit: {
          connect: { hash: commitHash }
        }
      },
    });

    return NextResponse.json(deployment);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create deployment" }, { status: 500 });
  }
}
