"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-6">
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

      <div className="border border-border/40 rounded-xl bg-card shadow-lg shadow-black/20 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Release Name</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Attached Commits</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Loading releases...</TableCell>
              </TableRow>
            )}
            {!isLoading && releases?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No releases found. Click "+ New Release".</TableCell>
              </TableRow>
            )}
            {!isLoading && releases?.map((release: any) => (
              <TableRow key={release.id}>
                <TableCell className="font-medium text-primary-foreground">{release.name}</TableCell>
                <TableCell>{new Date(release.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className="bg-accent/20 text-accent border border-accent/40 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {release._count?.commits || 0} tasks
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => setDeleteId(release.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
