// timer-worker.js
// Runs entirely on a background thread, preventing UI blocking and reducing battery usage.

let intervalId = null;

self.onmessage = function (e) {
  if (e.data === "start") {
    // 30 minutes = 30 * 60 * 1000 ms
    const INTERVAL_MS = 30 * 60 * 1000;

    // Clear any existing interval to prevent duplicates
    if (intervalId) clearInterval(intervalId);

    intervalId = setInterval(() => {
      self.postMessage("ping");
    }, INTERVAL_MS);
  } else if (e.data === "stop") {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};
