import { prisma } from "@/lib/prisma";
import { subMonths } from "date-fns";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const sixMonthsAgo = subMonths(new Date(), 6);

  const commits = await prisma.commit.findMany({
    where: { date: { gte: sixMonthsAgo } },
    take: 500,
    orderBy: { date: "desc" },
    include: { impacts: true, deployments: true },
  });

  return <DashboardClient initialData={commits} />;
}
