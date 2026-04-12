"use client";

import { useState, useEffect, useRef } from "react";

interface CountdownResult {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  isExpired: boolean;
}

function calculateTimeLeft(targetMs: number): CountdownResult {
  const diff = targetMs - Date.now();

  if (diff <= 0) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00", isExpired: true };
  }

  return {
    days: String(Math.floor(diff / 86400000)).padStart(2, "0"),
    hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0"),
    minutes: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
    seconds: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
    isExpired: false,
  };
}

export function useCountdown(targetDate: string | Date): CountdownResult {
  const targetMs = useRef(
    typeof targetDate === "string" ? new Date(targetDate).getTime() : targetDate.getTime()
  ).current;

  const [timeLeft, setTimeLeft] = useState<CountdownResult>(() =>
    calculateTimeLeft(targetMs)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetMs));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  return timeLeft;
}
