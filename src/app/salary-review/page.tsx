import { prisma } from "@/lib/prisma";
import { SalaryClient } from "./salary-client";

export default async function SalaryReviewPage() {
  const allCommits = await prisma.commit.findMany({
    include: { impacts: true },
    orderBy: { date: "asc" }
  });

  return <SalaryClient commits={allCommits} />;
}
