"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `callback` every `intervalMs` while the document is visible.
 * Pauses when the tab is hidden and resumes (with an immediate fire) when it becomes visible again.
 * Also triggers once on window focus.
 *
 * Use for light real-time polling (chat messages, status updates).
 */
export function usePoll(callback: () => void | Promise<void>, intervalMs: number = 5000) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (typeof document === "undefined") return;

    let timer: ReturnType<typeof setInterval> | null = null;

    function tick() {
      try {
        void callbackRef.current();
      } catch {
        // swallow
      }
    }

    function start() {
      if (timer != null) return;
      timer = setInterval(tick, intervalMs);
    }

    function stop() {
      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        tick(); // fire immediately on regain
        start();
      } else {
        stop();
      }
    }

    function handleFocus() {
      tick();
    }

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [intervalMs]);
}
