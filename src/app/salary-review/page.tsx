import { prisma } from "@/lib/prisma";
import { subMonths } from "date-fns";
import { SalaryClient } from "./salary-client";

export default async function SalaryReviewPage() {
  const sixMonthsAgo = subMonths(new Date(), 6);
  
  const recentCommits = await prisma.commit.findMany({
    where: { date: { gte: sixMonthsAgo } },
    include: { impacts: true },
  });

  return <SalaryClient commits={recentCommits} />;
}
