"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  "🚀 Enabled monthly release", 
  "🐞 Prevented production issue", 
  "⚡ Improved performance", 
  "😊 Improved user experience", 
  "🔧 Reduced future development effort", 
  "💰 Supported business feature", 
  "🔒 Increased reliability"
];

export function ImpactDialog() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pendingCommits, setPendingCommits] = useState<any[]>([]);
  const [currentCommit, setCurrentCommit] = useState<any>(null);
  
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    // Poll for unclassified commits every 10s
    const checkCommits = async () => {
      try {
        const res = await fetch("/api/commits?unclassified=true");
        if (res.ok) {
          const data = await res.json();
          // Filter out commits that already have an impact tagged if needed,
          // actually the requirement is "unclassified" or without impact. 
          // For now let's just show it if there are unclassified commits.
          if (data.length > 0) {
            setPendingCommits(data);
            setCurrentCommit(data[0]);
            setOpen(true);
          }
        }
      } catch (err) {}
    };

    checkCommits();
  }, [pathname]);

  useEffect(() => {
    if (!open || !currentCommit) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in textarea, only capture Cmd+Enter or Ctrl+Enter
      if (document.activeElement?.tagName === "TEXTAREA") {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          if (category) handleSubmit();
        }
        return;
      }

      // Hotkeys for categories 1-7
      if (["1", "2", "3", "4", "5", "6", "7"].includes(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (CATEGORIES[index]) {
          setCategory(CATEGORIES[index]);
        }
      }

      // Enter to submit
      if (e.key === "Enter" && category) {
        e.preventDefault();
        handleSubmit();
      }

      // 's' to skip
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentCommit, category, note]);

  const handleSubmit = async () => {
    if (!currentCommit || !category) return;

    try {
      // First save the impact
      await fetch("/api/impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commitHash: currentCommit.hash, category, note }),
      });

      // Then classify the commit so it doesn't show up again
      await fetch("/api/commits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash: currentCommit.hash, type: "feat" }), // default to feat if manually tagged, or you could add a type selector
      });

      // Move to next
      const nextCommits = pendingCommits.slice(1);
      setPendingCommits(nextCommits);
      setCategory("");
      setNote("");

      if (nextCommits.length > 0) {
        setCurrentCommit(nextCommits[0]);
      } else {
        setOpen(false);
      }
    } catch (err) {}
  };

  const handleSkip = async () => {
    if (!currentCommit) return;
    // Just classify it as "chore" to skip it
    await fetch("/api/commits", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash: currentCommit.hash, type: "chore" }),
    });

    const nextCommits = pendingCommits.slice(1);
    setPendingCommits(nextCommits);
    if (nextCommits.length > 0) {
      setCurrentCommit(nextCommits[0]);
    } else {
      setOpen(false);
    }
  };

  if (!currentCommit) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-border/40 shadow-lg shadow-black/50 bg-card/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Tag Business Impact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-background/50 border border-border/40 p-3 rounded-md text-sm font-mono text-muted-foreground">
            {currentCommit.message}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">What business outcome did this task support?</label>
            <Select onValueChange={(val) => setCategory(val || "")} value={category}>
              <SelectTrigger>
                <SelectValue placeholder="Select impact category..." />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border/40 w-full">
                {CATEGORIES.map((c, i) => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                        {i + 1}
                      </span>
                      {c}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Note (Optional)</label>
            <Textarea 
              placeholder="Provide more context..." 
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
            Skip <kbd className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded border">S</kbd>
          </Button>
          <Button onClick={handleSubmit} disabled={!category} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 font-semibold">
            Save Impact <kbd className="ml-2 text-[10px] bg-accent-foreground/20 px-1.5 py-0.5 rounded border border-accent-foreground/30 text-accent-foreground">↵</kbd>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
