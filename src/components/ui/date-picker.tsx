"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({ value, onChange, placeholder = "Selecione data e hora", className }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value ? new Date(value) : undefined);
  const [time, setTime] = useState(value ? format(new Date(value), "HH:mm") : "20:00");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    setTimeout(() => document.addEventListener("mousedown", handleClick), 0);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleDaySelect(day: Date | undefined) {
    if (!day) return;
    setSelectedDate(day);
    const [hours, minutes] = time.split(":").map(Number);
    day.setHours(hours, minutes, 0, 0);
    onChange(day.toISOString());
  }

  function handleTimeChange(newTime: string) {
    setTime(newTime);
    if (selectedDate) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const updated = new Date(selectedDate);
      updated.setHours(hours, minutes, 0, 0);
      onChange(updated.toISOString());
    }
  }

  const displayValue = selectedDate
    ? `${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} ${time}`
    : "";

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg border border-surface-700 bg-transparent px-3 py-2 text-sm text-left transition-colors hover:border-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      >
        <CalendarDays className="h-4 w-4 text-surface-500 shrink-0" />
        <span className={displayValue ? "text-[var(--foreground)]" : "text-surface-500"}>
          {displayValue || placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 bottom-full mb-2 rounded-xl border border-surface-700 bg-surface-900 p-4 shadow-2xl">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            locale={ptBR}
            showOutsideDays
            classNames={{
              root: "text-sm",
              months: "flex flex-col",
              month_caption: "flex items-center justify-between mb-3",
              caption_label: "text-sm font-semibold text-white",
              nav: "flex gap-1",
              button_previous: "h-7 w-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-800 transition-colors",
              button_next: "h-7 w-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-800 transition-colors",
              weekdays: "grid grid-cols-7 mb-1",
              weekday: "text-[10px] font-medium text-surface-500 text-center py-1",
              weeks: "grid gap-0.5",
              week: "grid grid-cols-7",
              day: "text-center",
              day_button: "h-8 w-8 rounded-lg text-xs font-medium transition-colors hover:bg-surface-800 text-surface-300 hover:text-white flex items-center justify-center mx-auto",
              selected: "!bg-primary-600 !text-white hover:!bg-primary-700",
              today: "ring-1 ring-accent-500/50",
              outside: "text-surface-700",
              disabled: "text-surface-800 cursor-not-allowed",
            }}
          />

          {/* Time picker */}
          <div className="mt-3 pt-3 border-t border-surface-700 flex items-center gap-2">
            <span className="text-xs text-surface-400">Horário:</span>
            <input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="rounded-lg border border-surface-700 bg-surface-800 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
