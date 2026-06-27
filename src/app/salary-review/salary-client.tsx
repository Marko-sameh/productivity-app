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

export function SalaryClient({ commits }: { commits: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">Salary Review</h2>
          <p className="text-muted-foreground mt-2">6-Month Executive Summary</p>
        </div>
        <Button onClick={handleExport} disabled={exporting} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          {exporting ? "Exporting..." : "Export as PNG"}
        </Button>
      </div>
      
      {/* Container for export */}
      <div ref={containerRef} className="space-y-6 bg-background p-2 rounded-lg">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Delivery Score</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{deliveryScore}/100</div>
              <p className="text-xs text-muted-foreground mt-1">Based on feature velocity</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{qualityScore}/100</div>
              <p className="text-xs text-muted-foreground mt-1">Based on bug ratio</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Business Impact</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{impactScore}/100</div>
              <p className="text-xs text-muted-foreground mt-1">Based on tagged commits</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ownership</CardTitle>
              <HeartHandshake className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ownershipScore}/100</div>
              <p className="text-xs text-muted-foreground mt-1">Self-driven initiatives</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-accent/5 border-accent/20 shadow-lg shadow-black/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed mb-4">
                "During the last 6 months I completed:"
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 font-medium text-sm">
                <li>{features} Features Delivered</li>
                <li>{bugs} Bug Fixes</li>
                <li>{totalCommits} Commits / Tasks Completed</li>
                <li>{impactsCount} Documented Business Impacts</li>
              </ul>
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                "My work contributed consistently to monthly releases while maintaining production stability and delivering highly requested features."
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>AI Smart Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm text-muted-foreground">
                {features > 50 ? 
                  <li className="flex gap-2">
                    <Target className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <strong>High Velocity:</strong> Delivered {features} features in 6 months, showing exceptional productivity.
                  </li> : 
                  <li className="flex gap-2">
                    <Target className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <strong>Steady Delivery:</strong> Delivered {features} features, maintaining consistent output.
                  </li>}
                
                {qualityScore > 80 ?
                  <li className="flex gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <strong>Strong Quality:</strong> Low bug ratio implies excellent code quality and testing practices.
                  </li> :
                  <li className="flex gap-2">
                    <Bug className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <strong>Room for Quality Improvement:</strong> Higher bug count indicates potential need for more testing time.
                  </li>}
                
                <li className="flex gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  <strong>Business Alignment:</strong> Consistently tagged high-impact tasks, directly contributing to OKRs.
                </li>
                <li className="flex gap-2">
                  <HeartHandshake className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                  <strong>Reliability:</strong> You contributed to every release this period.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
