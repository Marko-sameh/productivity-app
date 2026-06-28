"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, FileSearch, Sparkles, Image as ImageIcon } from "lucide-react";
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
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-xl shadow-black/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-bl-full blur-2xl group-hover:bg-accent/20 transition-all" />
          <p className="text-sm font-semibold text-muted-foreground mb-1">Total Entries</p>
          <p className="text-4xl font-extrabold text-primary-foreground relative z-10">{totalTasks}</p>
        </div>
        <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-xl shadow-black/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <p className="text-sm font-semibold text-muted-foreground mb-1">Entries This Week</p>
          <p className="text-4xl font-extrabold text-primary-foreground relative z-10">{tasksThisWeek}</p>
        </div>
        <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-xl shadow-black/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <p className="text-sm font-semibold text-muted-foreground mb-1">Total Hours Logged</p>
          <p className="text-4xl font-extrabold text-primary-foreground relative z-10">{totalHours.toFixed(1)}<span className="text-xl text-muted-foreground ml-1">h</span></p>
        </div>
      </div>

      <div className="border border-border/40 rounded-2xl bg-card/60 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
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
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-2">
                      <FileSearch className="h-8 w-8 text-accent opacity-80" />
                    </div>
                    <p className="text-lg font-medium text-primary-foreground">No entries found</p>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      You haven't logged any work yet. Click "+ New Entry" to log your first task and start building your performance profile.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && entries?.map((entry: Commit) => {
              const getTypeColor = (t: string) => {
                if (t === "feat") return "bg-accent/20 text-accent border-accent/30";
                if (t === "fix") return "bg-red-500/20 text-red-500 border-red-500/30";
                if (t === "perf") return "bg-purple-500/20 text-purple-500 border-purple-500/30";
                return "bg-muted/50 text-muted-foreground border-border";
              };

              return (
              <TableRow key={entry.hash} className="group hover:bg-accent/5 transition-colors border-border/30">
                <TableCell className="font-medium text-muted-foreground whitespace-nowrap">{new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                <TableCell className="font-semibold text-primary-foreground max-w-[200px] truncate" title={entry.message}>{entry.message}</TableCell>
                <TableCell>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getTypeColor(entry.type || "")}`}>
                    {entry.type || "task"}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{entry.module || "-"}</TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-muted-foreground truncate block max-w-[200px]" title={entry.impacts?.[0]?.category || "-"}>
                    {entry.impacts?.[0]?.category || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  {entry.evidenceUrl ? (
                    <a href={entry.evidenceUrl} target="_blank" rel="noreferrer" className="block relative w-10 h-10 overflow-hidden rounded-lg border border-border/50 group-hover:border-accent/50 transition-colors">
                      <img src={entry.evidenceUrl} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </a>
                  ) : (
                    <div className="w-10 h-10 rounded-lg border border-dashed border-border/50 flex items-center justify-center bg-muted/20">
                      <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors h-8 w-8"
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
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-8 w-8"
                      onClick={() => setDeleteHash(entry.hash)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )})}
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
