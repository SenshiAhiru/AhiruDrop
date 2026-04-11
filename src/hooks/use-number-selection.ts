"use client";

import { useState, useCallback, useMemo } from "react";

interface NumberInfo {
  number: number;
  status: "AVAILABLE" | "RESERVED" | "PAID";
}

export function useNumberSelection(maxPerPurchase: number = 10) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  const toggleNumber = useCallback((num: number) => {
    setSelectedNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      }
      if (prev.length >= maxPerPurchase) return prev;
      return [...prev, num].sort((a, b) => a - b);
    });
  }, [maxPerPurchase]);

  const selectRandom = useCallback((availableNumbers: NumberInfo[], count: number) => {
    const available = availableNumbers
      .filter((n) => n.status === "AVAILABLE")
      .map((n) => n.number);

    const actualCount = Math.min(count, maxPerPurchase, available.length);
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    setSelectedNumbers(shuffled.slice(0, actualCount).sort((a, b) => a - b));
  }, [maxPerPurchase]);

  const clearSelection = useCallback(() => {
    setSelectedNumbers([]);
  }, []);

  const isSelected = useCallback((num: number) => {
    return selectedNumbers.includes(num);
  }, [selectedNumbers]);

  const canSelectMore = useMemo(() => {
    return selectedNumbers.length < maxPerPurchase;
  }, [selectedNumbers.length, maxPerPurchase]);

  return {
    selectedNumbers,
    toggleNumber,
    selectRandom,
    clearSelection,
    isSelected,
    canSelectMore,
    count: selectedNumbers.length,
    maxPerPurchase,
  };
}
