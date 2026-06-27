"use client";

import { useEffect, useState, useCallback } from "react";
import { QuickAddDialog } from "@/components/dashboard/quick-add-dialog";

export function Notifications() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const triggerNotification = useCallback(() => {
    const hours = new Date().getHours();
    // Only trigger between 9 AM and 5 PM
    if (hours < 9 || hours > 17) return;

    if (Notification.permission === "granted") {
      const notification = new Notification("Dev Dashboard", {
        body: "Did you complete a task? Click to log it.",
        icon: "/favicon.ico",
      });



      notification.onclick = () => {
        window.focus();
        setShowQuickAdd(true);
      };
    } else {
      // Fallback if notifications not granted but we want to show it in app
      setShowQuickAdd(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    if (typeof window !== "undefined" && window.Worker) {
      // Initialize the background worker
      const worker = new Worker("/timer-worker.js");
      
      worker.onmessage = (e) => {
        if (e.data === "ping") {
          triggerNotification();
        }
      };

      // Start the 30-minute timer in the background thread
      worker.postMessage("start");

      return () => {
        worker.postMessage("stop");
        worker.terminate();
      };
    }
  }, [triggerNotification]);

  return (
    <>
      <QuickAddDialog open={showQuickAdd} onOpenChange={setShowQuickAdd} />
      {/* Hidden button for testing manual trigger if needed */}
      <button 
        id="trigger-notification-btn" 
        className="hidden" 
        onClick={triggerNotification}
      />
    </>
  );
}
