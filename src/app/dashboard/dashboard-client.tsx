"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Bug, Target, ShieldCheck, Trophy, HeartHandshake, CheckCircle } from "lucide-react";
import { DashboardCharts, ImpactPieChart, DeploymentHistoryChart } from "@/components/dashboard/charts";
import { calculateDeliveryScore, calculateQualityScore, calculateBusinessImpactScore, calculateConsistencyScore, calculateOwnershipScore } from "@/lib/scores";
import { subMonths, startOfMonth, isAfter, format, differenceInBusinessDays } from "date-fns";
import type { Commit, Deployment, Impact } from "@/types";

export function DashboardClient({ initialData }: { initialData: Commit[] }) {
  const { data: commits = initialData } = useQuery({
    queryKey: ["commits"],
    queryFn: async () => {
      const res = await fetch("/api/commits");
      return res.json();
    },
    initialData
  });

  const { data: releasesData } = useQuery({
    queryKey: ["releases"],
    queryFn: async () => {
      const res = await fetch("/api/releases");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const releases = Array.isArray(releasesData) ? releasesData : [];

  // Basic Metrics
  const totalCommits = commits.length;
  const features = commits.filter((c: Commit) => c.type === "feat").length;
  const bugs = commits.filter((c: Commit) => c.type === "fix").length;
  const perf = commits.filter((c: Commit) => c.type === "perf").length;
  const prodDeployments = commits.reduce((acc: number, c: Commit) => acc + (c.deployments?.filter((d: Deployment) => d.environment === "production").length || 0), 0);
  
  const impactsCount = commits.reduce((acc: number, c: Commit) => acc + (c.impacts?.length || 0), 0);
  
  // Calculate consecutive monthly releases
  const now = new Date();
  const sixMonthsAgo = startOfMonth(subMonths(now, 5));
  let prodMonths = new Set();
  let activeWeeksSet = new Set();
  
  commits.forEach((c: Commit) => {
    const d = new Date(c.date);
    if (isAfter(d, sixMonthsAgo)) {
      activeWeeksSet.add(format(d, "ww-yyyy"));
    }
  });

  const recentReleases = releases.filter((r: any) => isAfter(new Date(r.date), sixMonthsAgo));
  const consecutiveReleases = recentReleases.length;
  const totalDays = differenceInBusinessDays(now, sixMonthsAgo) || 1;
  const commitsPerDay = (commits.filter((c: Commit) => isAfter(new Date(c.date), sixMonthsAgo)).length / totalDays).toFixed(1);

  const deliveryScore = calculateDeliveryScore(features, totalCommits);
  const qualityScore = calculateQualityScore(bugs, totalCommits);
  const businessImpactScore = calculateBusinessImpactScore(impactsCount, totalCommits);
  const consistencyScore = calculateConsistencyScore(activeWeeksSet.size, 24);
  const ownershipScore = calculateOwnershipScore(features, impactsCount);

  // Filter achievements
  const achievements = commits.filter((c: Commit) => (c.impacts?.length ?? 0) > 0 || c.type === "feat").slice(0, 10);

  return (
    <div className="space-y-6 pb-10">
      <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">Dashboard</h2>
      
      {/* Executive Summary: Last 6 Months */}
      <Card className="border-border/40 shadow-lg shadow-black/20 bg-accent/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-primary-foreground">Last 6 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
            <div>
              <p className="text-3xl font-bold text-primary-foreground">{totalCommits}</p>
              <p className="text-muted-foreground mt-1">Total Commits</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">{features}</p>
              <p className="text-muted-foreground mt-1">Features</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">{bugs}</p>
              <p className="text-muted-foreground mt-1">Bug Fixes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">{perf}</p>
              <p className="text-muted-foreground mt-1">Perf. Improvements</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">{prodDeployments}</p>
              <p className="text-muted-foreground mt-1">Prod Deployments</p>
            </div>
            
            <div className="col-span-2 md:col-span-5 bg-background/50 border border-border/40 p-4 rounded-lg mt-2">
              <ul className="space-y-3 text-muted-foreground font-medium flex flex-col md:flex-row justify-between gap-4">
                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-accent" /> Contributed to {consecutiveReleases} consecutive monthly releases</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-accent" /> Average of {commitsPerDay} commits per working day</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-accent" /> {consistencyScore > 80 ? "High consistency across all releases" : "Building consistency across releases"}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5 Key Scores */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delivery Score</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">{deliveryScore}/100</div>
          </CardContent>
        </Card>
        
        <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <ShieldCheck className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">{qualityScore}/100</div>
            <p className="text-xs text-muted-foreground mt-1">Fewer bugs after release</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-wrap">Business Impact Score</CardTitle>
            <Trophy className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">{businessImpactScore}/100</div>
            <p className="text-xs text-muted-foreground mt-1">Based on recorded impact</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consistency Score</CardTitle>
            <Activity className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">{consistencyScore}/100</div>
            <p className="text-xs text-muted-foreground mt-1">Weekly and monthly</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ownership Score</CardTitle>
            <HeartHandshake className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">{ownershipScore}/100</div>
            <p className="text-xs text-muted-foreground mt-1">Modules contributed to</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Productivity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardCharts data={commits} />
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Business Impact Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ImpactPieChart data={commits} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <div className="col-span-4 space-y-4">
          <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Deployment History</CardTitle>
            </CardHeader>
            <CardContent>
              <DeploymentHistoryChart data={commits} />
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-3 space-y-4">
          <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle>Achievements Timeline</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {achievements.map((c: Commit) => (
                  <div key={c.hash} className="flex flex-col gap-2 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none text-primary-foreground">{c.message}</p>
                    </div>
                    {(c.impacts?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {c.impacts!.map((i: Impact) => (
                          <span key={i.id} className="text-[11px] font-medium bg-accent/20 text-accent border border-accent/40 px-2 py-0.5 rounded-full">
                            {i.category}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <div className={`h-1.5 w-8 rounded-full ${c.deployments?.some((d: Deployment) => d.environment === "dev") ? "bg-amber-500" : "bg-muted"}`} title="Dev Deployed"></div>
                      <div className={`h-1.5 w-8 rounded-full ${c.deployments?.some((d: Deployment) => d.environment === "production") ? "bg-accent" : "bg-muted"}`} title="Prod Deployed"></div>
                    </div>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No achievements logged yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
