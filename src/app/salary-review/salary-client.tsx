"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Trophy, Target, HeartHandshake, ShieldCheck, Bug, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { 
  calculateDeliveryScore, 
  calculateQualityScore, 
  calculateBusinessImpactScore, 
  calculateOwnershipScore 
} from "@/lib/scores";
import { differenceInMonths } from "date-fns";

export function SalaryClient({ commits }: { commits: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const now = new Date();
  const oldestCommitDate = commits.reduce((oldest: Date, c: any) => {
    const d = new Date(c.date);
    return d < oldest ? d : oldest;
  }, now);
  const monthsSpan = Math.max(1, differenceInMonths(now, oldestCommitDate));

  const totalCommits = commits.length;
  const features = commits.filter(c => c.type === "feat").length;
  const bugs = commits.filter(c => c.type === "fix").length;
  const impactsCount = commits.reduce((acc, c) => acc + c.impacts?.length, 0) || 0;

  const deliveryScore = calculateDeliveryScore(features, totalCommits);
  const qualityScore = calculateQualityScore(bugs, totalCommits);
  const impactScore = calculateBusinessImpactScore(impactsCount, totalCommits);
  const ownershipScore = calculateOwnershipScore(features, impactsCount);

  const handleExport = async () => {
    if (!containerRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(containerRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `salary-review-report-${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      <div className="flex justify-between items-end bg-background/80 backdrop-blur-md sticky top-0 z-20 py-4 border-b border-border/40">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">Salary Review</h2>
          <p className="text-muted-foreground mt-1">{monthsSpan}-Month Executive Performance Dossier</p>
        </div>
        <Button 
          onClick={handleExport} 
          disabled={exporting} 
          className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 font-semibold"
        >
          <Download className="w-4 h-4" />
          {exporting ? "Generating..." : "Export Official Report"}
        </Button>
      </div>
      
      {/* Container for export (Dossier format) */}
      <div 
        ref={containerRef} 
        className="space-y-8 bg-card/40 p-10 rounded-2xl border border-border/50 shadow-2xl shadow-black/40 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-purple-500 to-emerald-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
          <Trophy className="w-96 h-96" />
        </div>
        
        <div className="text-center pb-6 border-b border-border/30">
          <h1 className="text-2xl font-black tracking-widest uppercase text-muted-foreground mb-1">Developer Performance Report</h1>
          <p className="text-sm font-medium text-accent">CONFIDENTIAL INTERNAL DOSSIER</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-accent/20 bg-gradient-to-br from-card/80 to-background shadow-lg relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Delivery Score</CardTitle>
              <div className="p-1.5 bg-accent/10 rounded-md">
                <Target className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold text-primary-foreground">{deliveryScore}<span className="text-lg text-muted-foreground font-normal">/100</span></div>
              <p className="text-xs font-medium text-muted-foreground mt-2">Feature velocity</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-gradient-to-br from-card/80 to-background shadow-lg relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Quality Score</CardTitle>
              <div className="p-1.5 bg-emerald-500/10 rounded-md">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold text-primary-foreground">{qualityScore}<span className="text-lg text-muted-foreground font-normal">/100</span></div>
              <p className="text-xs font-medium text-muted-foreground mt-2">Bug ratio analysis</p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-gradient-to-br from-card/80 to-background shadow-lg relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Business Impact</CardTitle>
              <div className="p-1.5 bg-amber-500/10 rounded-md">
                <Trophy className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold text-primary-foreground">{impactScore}<span className="text-lg text-muted-foreground font-normal">/100</span></div>
              <p className="text-xs font-medium text-muted-foreground mt-2">Goal alignment</p>
            </CardContent>
          </Card>

          <Card className="border-pink-500/20 bg-gradient-to-br from-card/80 to-background shadow-lg relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Ownership</CardTitle>
              <div className="p-1.5 bg-pink-500/10 rounded-md">
                <HeartHandshake className="h-4 w-4 text-pink-500" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold text-primary-foreground">{ownershipScore}<span className="text-lg text-muted-foreground font-normal">/100</span></div>
              <p className="text-xs font-medium text-muted-foreground mt-2">Initiative tracking</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-accent/5 border-accent/20 shadow-xl shadow-black/20 relative">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-xl">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg font-serif italic text-muted-foreground mb-6 pl-4 border-l-4 border-accent">
                "During the last {monthsSpan} months I completed:"
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                  <span className="font-semibold text-primary-foreground">Features Delivered</span>
                  <span className="text-lg font-bold text-accent">{features}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                  <span className="font-semibold text-primary-foreground">Bug Fixes</span>
                  <span className="text-lg font-bold text-emerald-500">{bugs}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                  <span className="font-semibold text-primary-foreground">Total Commits / Tasks</span>
                  <span className="text-lg font-bold text-purple-500">{totalCommits}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                  <span className="font-semibold text-primary-foreground">Documented Impacts</span>
                  <span className="text-lg font-bold text-amber-500">{impactsCount}</span>
                </div>
              </div>
              <p className="text-lg font-serif italic text-muted-foreground pl-4 border-l-4 border-accent/50">
                "My work contributed consistently to monthly releases while maintaining production stability and delivering highly requested features."
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-xl shadow-black/20 bg-card/80">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-xl">AI Smart Insights</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-6 text-[15px] text-muted-foreground">
                {features > 50 ? 
                  <li className="flex gap-4">
                    <div className="p-2 bg-green-500/10 rounded-full h-fit"><Target className="w-5 h-5 text-green-500" /></div>
                    <div><strong className="text-primary-foreground block mb-1">High Velocity</strong> Delivered {features} features in {monthsSpan} months, showing exceptional productivity.</div>
                  </li> : 
                  <li className="flex gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-full h-fit"><Target className="w-5 h-5 text-blue-500" /></div>
                    <div><strong className="text-primary-foreground block mb-1">Steady Delivery</strong> Delivered {features} features, maintaining consistent output.</div>
                  </li>}
                
                {qualityScore > 80 ?
                  <li className="flex gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-full h-fit"><ShieldCheck className="w-5 h-5 text-emerald-500" /></div>
                    <div><strong className="text-primary-foreground block mb-1">Strong Quality</strong> Low bug ratio implies excellent code quality and testing practices.</div>
                  </li> :
                  <li className="flex gap-4">
                    <div className="p-2 bg-orange-500/10 rounded-full h-fit"><Bug className="w-5 h-5 text-orange-500" /></div>
                    <div><strong className="text-primary-foreground block mb-1">Room for Quality Improvement</strong> Higher bug count indicates potential need for more testing time.</div>
                  </li>}
                
                <li className="flex gap-4">
                  <div className="p-2 bg-yellow-500/10 rounded-full h-fit"><Trophy className="w-5 h-5 text-yellow-500" /></div>
                  <div><strong className="text-primary-foreground block mb-1">Business Alignment</strong> Consistently tagged high-impact tasks, directly contributing to OKRs.</div>
                </li>
                <li className="flex gap-4">
                  <div className="p-2 bg-purple-500/10 rounded-full h-fit"><HeartHandshake className="w-5 h-5 text-purple-500" /></div>
                  <div><strong className="text-primary-foreground block mb-1">Reliability</strong> You contributed to every release this period.</div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
