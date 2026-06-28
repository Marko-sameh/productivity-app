"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Bug, Target, ShieldCheck, Trophy, HeartHandshake, CheckCircle } from "lucide-react";
import { DashboardCharts, ImpactPieChart, DeploymentHistoryChart } from "@/components/dashboard/charts";
import { calculateDeliveryScore, calculateQualityScore, calculateBusinessImpactScore, calculateConsistencyScore, calculateOwnershipScore } from "@/lib/scores";
import { subMonths, startOfMonth, isAfter, format, differenceInBusinessDays, differenceInMonths } from "date-fns";
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
  const oldestCommitDate = commits.reduce((oldest: Date, c: Commit) => {
    const d = new Date(c.date);
    return d < oldest ? d : oldest;
  }, now);
  const monthsSpan = Math.max(1, differenceInMonths(now, oldestCommitDate));
  const startDate = startOfMonth(oldestCommitDate);
  
  let prodMonths = new Set();
  let activeWeeksSet = new Set();
  
  commits.forEach((c: Commit) => {
    const d = new Date(c.date);
    if (isAfter(d, startDate)) {
      activeWeeksSet.add(format(d, "ww-yyyy"));
    }
  });

  const recentReleases = releases.filter((r: any) => isAfter(new Date(r.date), startDate));
  const consecutiveReleases = recentReleases.length;
  const totalDays = differenceInBusinessDays(now, startDate) || 1;
  const commitsPerDay = (commits.filter((c: Commit) => isAfter(new Date(c.date), startDate)).length / totalDays).toFixed(1);

  const deliveryScore = calculateDeliveryScore(features, totalCommits);
  const qualityScore = calculateQualityScore(bugs, totalCommits);
  const businessImpactScore = calculateBusinessImpactScore(impactsCount, totalCommits);
  const consistencyScore = calculateConsistencyScore(activeWeeksSet.size, Math.max(1, monthsSpan) * 4);
  const ownershipScore = calculateOwnershipScore(features, impactsCount);

  // Filter achievements
  const achievements = commits.filter((c: Commit) => (c.impacts?.length ?? 0) > 0 || c.type === "feat").slice(0, 10);

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      
      {/* Hero Greeting Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/20 via-accent/5 to-background border border-accent/20 p-8 shadow-2xl shadow-accent/5">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold tracking-tight text-primary-foreground mb-2">
            Welcome back, Developer! 👋
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Here's a breakdown of your performance and business impact over the last {monthsSpan} months. 
            Keep up the excellent work building value.
          </p>
        </div>
      </div>
      
      {/* Executive Summary: Last 6 Months */}
      <Card className="border-border/40 shadow-xl shadow-black/40 bg-card/60 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <CardHeader className="border-b border-border/40 pb-4 bg-background/30">
          <CardTitle className="text-xl font-bold text-primary-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            Performance Overview (Last {monthsSpan} Months)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
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
      <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
        <Card className="border-accent/20 shadow-lg shadow-accent/5 bg-gradient-to-b from-card/80 to-background backdrop-blur-xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-accent/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-bl-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Delivery Score</CardTitle>
            <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
              <Target className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-extrabold text-primary-foreground">{deliveryScore}<span className="text-lg text-muted-foreground font-normal">/100</span></div>
          </CardContent>
        </Card>
        
        <Card className="border-accent/20 shadow-lg shadow-accent/5 bg-gradient-to-b from-card/80 to-background backdrop-blur-xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-accent/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Quality Score</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-extrabold text-primary-foreground">{qualityScore}<span className="text-lg text-muted-foreground font-normal">/100</span></div>
            <p className="text-[11px] text-muted-foreground mt-2 font-medium">Fewer bugs after release</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 shadow-lg shadow-accent/5 bg-gradient-to-b from-card/80 to-background backdrop-blur-xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-accent/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground text-wrap">Business Impact</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
              <Trophy className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-extrabold text-primary-foreground">{businessImpactScore}<span className="text-lg text-muted-foreground font-normal">/100</span></div>
            <p className="text-[11px] text-muted-foreground mt-2 font-medium">Recorded value impact</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 shadow-lg shadow-accent/5 bg-gradient-to-b from-card/80 to-background backdrop-blur-xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-accent/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Consistency</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-extrabold text-primary-foreground">{consistencyScore}<span className="text-lg text-muted-foreground font-normal">/100</span></div>
            <p className="text-[11px] text-muted-foreground mt-2 font-medium">Weekly active coding</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 shadow-lg shadow-accent/5 bg-gradient-to-b from-card/80 to-background backdrop-blur-xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-accent/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-bl-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Ownership</CardTitle>
            <div className="p-2 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
              <HeartHandshake className="h-4 w-4 text-pink-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-extrabold text-primary-foreground">{ownershipScore}<span className="text-lg text-muted-foreground font-normal">/100</span></div>
            <p className="text-[11px] text-muted-foreground mt-2 font-medium">Core module features</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
