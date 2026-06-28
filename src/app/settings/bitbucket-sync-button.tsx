"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function BitbucketSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const handleSync = async () => {
    setSyncing(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch("/api/bitbucket/sync", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(`Synced successfully! Added ${data.inserted} new commits.`);
        queryClient.invalidateQueries({ queryKey: ["commits"] });
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to sync.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An unexpected error occurred.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-3 pt-4 border-t border-border/20 mt-4">
      <Button 
        onClick={handleSync} 
        disabled={syncing}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Syncing..." : "Manual Sync Now"}
      </Button>

      {status === "success" && (
        <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          {message}
        </div>
      )}
      
      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-destructive font-medium">
          <AlertCircle className="w-4 h-4" />
          {message}
        </div>
      )}
    </div>
  );
}
