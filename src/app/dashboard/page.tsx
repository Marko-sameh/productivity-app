import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const commits = await prisma.commit.findMany({
    take: 500,
    orderBy: { date: "desc" },
    include: { impacts: true, deployments: true },
  });

  return <DashboardClient initialData={commits} />;
}
