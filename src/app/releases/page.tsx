"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Rocket, Calendar, Tag, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { Release } from "@/types";

export default function ReleasesPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: releasesData, isLoading } = useQuery({
    queryKey: ["releases"],
    queryFn: async () => {
      const res = await fetch("/api/releases");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const releases = Array.isArray(releasesData) ? releasesData : [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date }),
      });
      if (!res.ok) throw new Error("Failed to create release");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["releases"] });
      setShowAdd(false);
      setName("");
      setDate("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/releases?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete release");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["releases"] });
      setDeleteId(null);
    },
  });

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">Releases</h2>
          <p className="text-muted-foreground mt-2">Manage formal releases and track their impact.</p>
        </div>
        <Button 
          onClick={() => setShowAdd(true)}
          className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 font-semibold"
        >
          + New Release
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 text-muted-foreground">Loading releases...</div>
      ) : releases.length === 0 ? (
        <div className="border border-border/40 rounded-2xl bg-card/60 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <Rocket className="h-10 w-10 text-accent opacity-80" />
          </div>
          <h3 className="text-xl font-bold text-primary-foreground mb-2">No formal releases yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Group your completed work entries into formal releases to track your monthly cadence and overall impact.
          </p>
          <Button 
            onClick={() => setShowAdd(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Create Your First Release
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {releases.map((release: any) => (
            <Card key={release.id} className="border-border/40 bg-card/60 backdrop-blur-xl shadow-xl shadow-black/20 overflow-hidden relative group hover:-translate-y-1 hover:shadow-accent/10 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full blur-3xl group-hover:bg-accent/20 transition-all pointer-events-none" />
              <CardHeader className="border-b border-border/30 pb-4 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl font-bold text-primary-foreground flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-accent" />
                      {release.name}
                    </CardTitle>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(release.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={() => setDeleteId(release.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 pb-2 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-lg border border-border/50">
                    <Tag className="h-5 w-5 text-accent/70" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Tasks attached</p>
                    <p className="text-2xl font-bold text-primary-foreground">{release._count?.commits || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Release</DialogTitle>
            <DialogDescription>Define a new formal release to attach tasks to.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Release Name</Label>
              <Input placeholder="e.g. v1.4.0 - June Release" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Release Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Release"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Release</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this release? Attached tasks will NOT be deleted, but they will be unlinked from this release.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
