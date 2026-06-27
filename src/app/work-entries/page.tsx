"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { QuickAddDialog } from "@/components/dashboard/quick-add-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import type { Commit } from "@/types";

export default function WorkEntriesPage() {
  const queryClient = useQueryClient();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [deleteHash, setDeleteHash] = useState<string | null>(null);

  const { data: entries, isLoading } = useQuery({
    queryKey: ["commits"],
    queryFn: async () => {
      const res = await fetch("/api/commits");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (hash: string) => {
      const res = await fetch(`/api/commits?hash=${hash}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onMutate: async (hash: string) => {
      await queryClient.cancelQueries({ queryKey: ["commits"] });
      const previousCommits = queryClient.getQueryData(["commits"]);
      queryClient.setQueryData(["commits"], (old: any) => 
        old ? old.filter((c: any) => c.hash !== hash) : []
      );
      setDeleteHash(null);
      return { previousCommits };
    },
    onError: (err, hash, context) => {
      if (context?.previousCommits) {
        queryClient.setQueryData(["commits"], context.previousCommits);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["commits"] });
    },
  });

  const totalTasks = entries?.length || 0;
  
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);

  const tasksThisWeek = entries?.filter((e: Commit) => new Date(e.date) >= startOfThisWeek).length || 0;
  const totalHours = entries?.reduce((acc: number, e: Commit) => acc + (e.actualHours || e.estimatedHours || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">Work Entries</h2>
          <p className="text-muted-foreground mt-2">Manage your manual tasks and commits.</p>
        </div>
        <Button 
          onClick={() => { setEditingEntry(null); setShowQuickAdd(true); }}
          className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 font-semibold"
        >
          + New Entry
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border/40 rounded-xl p-4 shadow-lg shadow-black/20">
          <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
          <p className="text-2xl font-bold text-primary-foreground">{totalTasks}</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-4 shadow-lg shadow-black/20">
          <p className="text-sm font-medium text-muted-foreground">Entries This Week</p>
          <p className="text-2xl font-bold text-primary-foreground">{tasksThisWeek}</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-4 shadow-lg shadow-black/20">
          <p className="text-sm font-medium text-muted-foreground">Total Hours Logged</p>
          <p className="text-2xl font-bold text-primary-foreground">{totalHours.toFixed(1)}h</p>
        </div>
      </div>

      <div className="border border-border/40 rounded-xl bg-card shadow-lg shadow-black/20 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">Loading entries...</TableCell>
              </TableRow>
            )}
            {!isLoading && entries?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No entries found. Click "+ New Entry".</TableCell>
              </TableRow>
            )}
            {!isLoading && entries?.map((entry: Commit) => (
              <TableRow key={entry.hash}>
                <TableCell className="font-medium">{new Date(entry.date).toLocaleDateString()}</TableCell>
                <TableCell>{entry.message}</TableCell>
                <TableCell>{entry.type || "task"}</TableCell>
                <TableCell>{entry.module || "-"}</TableCell>
                <TableCell>{entry.impacts?.[0]?.category || "-"}</TableCell>
                <TableCell>
                  {entry.evidenceUrl ? (
                    <a href={entry.evidenceUrl} target="_blank" rel="noreferrer">
                      <img src={entry.evidenceUrl} alt="Evidence" className="h-8 w-8 object-cover rounded border" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    onClick={() => {
                      setEditingEntry(entry);
                      setShowQuickAdd(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => setDeleteHash(entry.hash)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <QuickAddDialog open={showQuickAdd} onOpenChange={setShowQuickAdd} initialData={editingEntry} />

      <Dialog open={!!deleteHash} onOpenChange={(open) => !open && setDeleteHash(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteHash(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteHash && deleteMutation.mutate(deleteHash)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
