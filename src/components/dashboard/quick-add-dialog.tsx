"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { classifyCommit } from "@/lib/classification";
import { Sparkles, ChevronDown, ChevronUp, Briefcase, FileImage, LayoutGrid, Clock, Tag } from "lucide-react";

export function QuickAddDialog({ open, onOpenChange, initialData }: { open: boolean, onOpenChange: (open: boolean) => void, initialData?: any }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [autoTypeSet, setAutoTypeSet] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      if (taskData.evidenceFile) {
        const formData = new FormData();
        formData.append("file", taskData.evidenceFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          evidenceUrl = url;
        } else {
          throw new Error("Image upload failed. Please try a smaller image.");
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
          evidenceUrl: taskData.evidenceFile ? URL.createObjectURL(taskData.evidenceFile) : initialData?.evidenceUrl,
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
      releaseId: (releaseId === "none" || releaseId === "") ? null : releaseId,
      evidenceFile,
    });
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-card border-border/50 shadow-2xl">
        
        {/* Header */}
        <div className="bg-accent/5 border-b border-border/40 p-6 flex flex-col gap-1">
          <DialogTitle className="text-2xl font-bold text-primary-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Log Work Entry
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground font-medium">
            Takes less than 20 seconds. Focus on the business value.
          </DialogDescription>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          
          {/* PRIMARY FIELDS */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-primary-foreground">What did you accomplish?</Label>
              <Input 
                placeholder="e.g. Implemented secure login flow" 
                value={title} 
                className="text-lg py-6 bg-background border-accent/20 focus:border-accent shadow-[0_0_10px_rgba(59,130,246,0.05)] transition-all"
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
              <Label className="text-sm font-semibold text-primary-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-accent/70" />
                Primary Business Outcome
              </Label>
              <Select onValueChange={(val) => setImpact(val || "")} value={impact}>
                <SelectTrigger className="py-6 text-md bg-background border-border/50"><SelectValue placeholder="Select the business value..." /></SelectTrigger>
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
          </div>

          {/* ADVANCED TOGGLE */}
          <div className="pt-2">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors w-full gap-2"
            >
              <div className="flex-1 h-px bg-border/40" />
              <span className="flex items-center gap-1">
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showAdvanced ? "Hide Details" : "Add Details (Optional)"}
              </span>
              <div className="flex-1 h-px bg-border/40" />
            </button>
          </div>

          {/* ADVANCED FIELDS */}
          {showAdvanced && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200 pb-2">
              
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Type</Label>
                  <Select onValueChange={(val) => setType(val || "")} value={type}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feat">Feature</SelectItem>
                      <SelectItem value="fix">Bug Fix</SelectItem>
                      <SelectItem value="perf">Performance</SelectItem>
                      <SelectItem value="refactor">Refactoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><LayoutGrid className="h-3.5 w-3.5" /> Module</Label>
                  <Input placeholder="e.g. Auth, Core" value={module} onChange={(e) => setModule(e.target.value)} className="bg-background" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Est. Hours</Label>
                  <Input type="number" placeholder="2.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Act. Hours</Label>
                  <Input type="number" placeholder="3.0" value={actualHours} onChange={(e) => setActualHours(e.target.value)} className="bg-background" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Select onValueChange={(val) => setPriority(val || "Medium")} value={priority}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Release</Label>
                  <Select onValueChange={(val) => setReleaseId(val || "")} value={releaseId}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Assign Release" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- None --</SelectItem>
                      {releases?.map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button 
                  type="button"
                  onClick={() => setDeployedDev(!deployedDev)}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium border transition-colors ${deployedDev ? "bg-accent/20 border-accent/40 text-accent" : "bg-background border-border/50 text-muted-foreground hover:border-accent/30"}`}
                >
                  {deployedDev ? "✓ Deployed Dev" : "+ Deploy Dev"}
                </button>
                <button 
                  type="button"
                  onClick={() => setDeployedProd(!deployedProd)}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium border transition-colors ${deployedProd ? "bg-green-500/20 border-green-500/40 text-green-500" : "bg-background border-border/50 text-muted-foreground hover:border-green-500/30"}`}
                >
                  {deployedProd ? "✓ Deployed Prod" : "+ Deploy Prod"}
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/40">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><FileImage className="h-3.5 w-3.5" /> Evidence Screenshot</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="bg-background cursor-pointer file:text-accent file:bg-accent/10 file:rounded-md file:border-0 file:px-3 file:py-1 file:mr-4 file:text-xs file:font-semibold"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setEvidenceFile(e.target.files[0]);
                    }
                  }} 
                />
              </div>

            </div>
          )}

        </div>

        <div className="bg-background border-t border-border/40 p-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title || !impact || loading}
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all font-semibold px-6"
          >
            {loading ? "Saving..." : "Log Entry"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
