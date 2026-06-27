"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line
} from "recharts";
import { format, subMonths, startOfMonth, isAfter } from "date-fns";

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#eab308'];

import type { Commit, Impact, Deployment } from "@/types";

export function DashboardCharts({ data }: { data: Commit[] }) {
  const chartData = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = startOfMonth(subMonths(now, 5));
    
    const monthlyData = new Map();
    for (let i = 0; i < 6; i++) {
      const d = subMonths(now, i);
      monthlyData.set(format(d, "MMM yyyy"), { name: format(d, "MMM yyyy"), feat: 0, fix: 0, other: 0 });
    }

    data.forEach(c => {
      const date = new Date(c.date);
      if (isAfter(date, sixMonthsAgo)) {
        const monthKey = format(date, "MMM yyyy");
        if (monthlyData.has(monthKey)) {
          const m = monthlyData.get(monthKey);
          if (c.type === "feat") m.feat++;
          else if (c.type === "fix") m.fix++;
          else m.other++;
        }
      }
    });

    return Array.from(monthlyData.values()).reverse();
  }, [data]);

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "8px", color: "#f8fafc", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)" }}
            itemStyle={{ color: "#f8fafc" }}
          />
          <Legend />
          <Bar dataKey="feat" stackId="a" fill="#3b82f6" name="Features" radius={[0, 0, 4, 4]} />
          <Bar dataKey="fix" stackId="a" fill="#ef4444" name="Bugs" />
          <Bar dataKey="other" stackId="a" fill="#22c55e" name="Other" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ImpactPieChart({ data }: { data: Commit[] }) {
  const chartData = useMemo(() => {
    const impactCounts = new Map();
    data.forEach(c => {
      c.impacts?.forEach((i: Impact) => {
        const cat = i.category;
        impactCounts.set(cat, (impactCounts.get(cat) || 0) + 1);
      });
    });
    return Array.from(impactCounts.entries()).map(([name, value]) => ({ name, value }));
  }, [data]);

  if (chartData.length === 0) {
    return <div className="h-[300px] w-full flex items-center justify-center text-sm text-muted-foreground">No impact data available</div>;
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "8px", color: "#f8fafc" }}
            itemStyle={{ color: "#f8fafc" }}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: "20px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DeploymentHistoryChart({ data }: { data: Commit[] }) {
  const chartData = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = startOfMonth(subMonths(now, 5));
    
    const monthlyData = new Map();
    for (let i = 0; i < 6; i++) {
      const d = subMonths(now, i);
      monthlyData.set(format(d, "MMM yyyy"), { name: format(d, "MMM yyyy"), dev: 0, prod: 0 });
    }

    data.forEach(c => {
      c.deployments?.forEach((d: Deployment) => {
        const date = new Date(d.deployedAt || c.date);
        if (isAfter(date, sixMonthsAgo)) {
          const monthKey = format(date, "MMM yyyy");
          if (monthlyData.has(monthKey)) {
            const m = monthlyData.get(monthKey);
            if (d.environment === "dev") m.dev++;
            if (d.environment === "production") m.prod++;
          }
        }
      });
    });

    return Array.from(monthlyData.values()).reverse();
  }, [data]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "8px", color: "#f8fafc" }}
          />
          <Legend />
          <Line type="monotone" dataKey="dev" name="Dev Deployments" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="prod" name="Prod Deployments" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
