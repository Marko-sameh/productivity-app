"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { classifyCommit } from "@/lib/classification";

export function QuickAddDialog({ open, onOpenChange, initialData }: { open: boolean, onOpenChange: (open: boolean) => void, initialData?: any }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [autoTypeSet, setAutoTypeSet] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [module, setModule] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [actualHours, setActualHours] = useState("");
  const [impact, setImpact] = useState("");
  const [notes, setNotes] = useState("");
  const [deployedDev, setDeployedDev] = useState(false);
  const [deployedProd, setDeployedProd] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [releaseId, setReleaseId] = useState("");

  const { data: releasesData } = useQuery({
    queryKey: ["releases"],
    queryFn: async () => {
      const res = await fetch("/api/releases");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const releases = Array.isArray(releasesData) ? releasesData : [];

  // Sync initialData when opened for editing
  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.message || "");
        setModule(initialData.module || "");
        setType(initialData.type || "");
        setPriority(initialData.priority || "Medium");
        setEstimatedHours(initialData.estimatedHours ? String(initialData.estimatedHours) : "");
        setActualHours(initialData.actualHours ? String(initialData.actualHours) : "");
        setImpact(initialData.impacts?.[0]?.category || "");
        setNotes(initialData.impacts?.[0]?.notes || "");
        setDeployedDev(initialData.deployments?.some((d: any) => d.environment === "dev") || false);
        setDeployedProd(initialData.deployments?.some((d: any) => d.environment === "production") || false);
        setAutoTypeSet(!!initialData.type);
        setReleaseId(initialData.releaseId || "");
      } else {
        // Reset
        setTitle(""); setModule(""); setType(""); setImpact(""); setNotes(""); setEstimatedHours(""); setActualHours(""); setDeployedDev(false); setDeployedProd(false); setAutoTypeSet(false); setEvidenceFile(null); setReleaseId("");
      }
    }
  }, [open, initialData]);

  const mutation = useMutation({
    mutationFn: async (taskData: any) => {
      let evidenceUrl = null;

      // 0. Upload image if exists
      if (evidenceFile) {
        const formData = new FormData();
        formData.append("file", evidenceFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          evidenceUrl = url;
        }
      }

      // 1. Create or Update the task via API
      const isEdit = !!initialData?.hash;
      const res = await fetch("/api/commits", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...taskData, hash: initialData?.hash, evidenceUrl: evidenceUrl || initialData?.evidenceUrl }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const data = await res.json();
      
      // 2. Attach Impact if provided
      if (taskData.impact) {
        await fetch("/api/impact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commitHash: data.hash, category: taskData.impact, note: taskData.notes }),
        });
      }

      // 3. Mark deployments if checked
      if (taskData.deployedDev) {
        await fetch("/api/deployments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commitHash: data.hash, environment: "dev" }),
        });
      }
      if (taskData.deployedProd) {
        await fetch("/api/deployments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commitHash: data.hash, environment: "production" }),
        });
      }
      
      return data;
    },
    onMutate: async (taskData: any) => {
      await queryClient.cancelQueries({ queryKey: ["commits"] });
      const previousCommits = queryClient.getQueryData(["commits"]);

      // Optimistically update
      const isEdit = !!initialData?.hash;
      queryClient.setQueryData(["commits"], (old: any) => {
        if (!old) return [];
        
        // Optimistic object
        const optimisticCommit = {
          hash: isEdit ? initialData.hash : `temp-${Date.now()}`,
          date: initialData?.date || new Date().toISOString(),
          message: taskData.message,
          type: taskData.type,
          module: taskData.module,
          impacts: taskData.impact ? [{ category: taskData.impact, notes: taskData.notes }] : [],
          deployments: [
            ...(taskData.deployedDev ? [{ environment: "dev" }] : []),
            ...(taskData.deployedProd ? [{ environment: "production" }] : []),
          ],
          evidenceUrl: evidenceFile ? URL.createObjectURL(evidenceFile) : initialData?.evidenceUrl,
        };

        if (isEdit) {
          return old.map((c: any) => c.hash === optimisticCommit.hash ? { ...c, ...optimisticCommit } : c);
        } else {
          return [optimisticCommit, ...old];
        }
      });
      
      onOpenChange(false);
      // Reset form
      setTitle(""); setModule(""); setType(""); setImpact(""); setNotes(""); setEstimatedHours(""); setActualHours(""); setDeployedDev(false); setDeployedProd(false); setAutoTypeSet(false); setEvidenceFile(null); setReleaseId("");
      
      return { previousCommits };
    },
    onError: (err, variables, context) => {
      if (context?.previousCommits) {
        queryClient.setQueryData(["commits"], context.previousCommits);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["commits"] });
    },
  });

  const handleSubmit = async () => {
    if (!title) return;
    setLoading(true);
    await mutation.mutateAsync({
      message: title,
      module,
      type,
      priority,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
      actualHours: actualHours ? parseFloat(actualHours) : null,
      status: "Done",
      impact,
      notes,
      deployedDev,
      deployedProd,
      releaseId: releaseId === "none" ? null : releaseId
    });
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Add Task</DialogTitle>
          <DialogDescription>Takes less than 20 seconds. Focus on the business value.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input 
                placeholder="e.g. Implement login" 
                value={title} 
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setTitle(newTitle);
                  if (!autoTypeSet || type === "") {
                    const suggested = classifyCommit(newTitle);
                    if (suggested) {
                      setType(suggested);
                      setAutoTypeSet(true);
                    }
                  }
                }} 
              />
            </div>
            <div className="space-y-2">
              <Label>Module</Label>
              <Input placeholder="e.g. Auth, Core" value={module} onChange={(e) => setModule(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select onValueChange={(val) => setType(val || "")} value={type}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="feat">Feature</SelectItem>
                  <SelectItem value="fix">Bug Fix</SelectItem>
                  <SelectItem value="perf">Performance</SelectItem>
                  <SelectItem value="refactor">Refactoring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select onValueChange={(val) => setPriority(val || "Medium")} value={priority}>
                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estimated Hours</Label>
              <Input type="number" placeholder="2.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Actual Hours</Label>
              <Input type="number" placeholder="3.0" value={actualHours} onChange={(e) => setActualHours(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>What business outcome did this task support?</Label>
            <Select onValueChange={(val) => setImpact(val || "")} value={impact}>
              <SelectTrigger><SelectValue placeholder="Select primary outcome..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="🚀 Enabled monthly release">🚀 Enabled monthly release</SelectItem>
                <SelectItem value="🐞 Prevented production issue">🐞 Prevented production issue</SelectItem>
                <SelectItem value="⚡ Improved performance">⚡ Improved performance</SelectItem>
                <SelectItem value="😊 Improved user experience">😊 Improved user experience</SelectItem>
                <SelectItem value="🔧 Reduced future development effort">🔧 Reduced future development effort</SelectItem>
                <SelectItem value="💰 Supported business feature">💰 Supported business feature</SelectItem>
                <SelectItem value="🔒 Increased reliability">🔒 Increased reliability</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assign to Release (Optional)</Label>
            <Select onValueChange={(val) => setReleaseId(val || "")} value={releaseId}>
              <SelectTrigger><SelectValue placeholder="Select a release..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- None --</SelectItem>
                {releases?.map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={deployedDev} onChange={(e) => setDeployedDev(e.target.checked)} className="rounded" />
              Deployed to Dev
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={deployedProd} onChange={(e) => setDeployedProd(e.target.checked)} className="rounded" />
              Deployed to Prod
            </label>
          </div>

          <div className="space-y-2">
            <Label>Evidence Image (Optional)</Label>
            <Input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setEvidenceFile(e.target.files[0]);
                }
              }} 
            />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title || loading}>{loading ? "Saving..." : "Save Task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
