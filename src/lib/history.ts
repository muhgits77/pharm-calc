import { useEffect, useState } from "react";

export type HistoryEntry = {
  id: string;
  calculator: string;
  inputs: Record<string, string | number | boolean>;
  result: string;
  unit?: string;
  timestamp: number;
};

const KEY = "pharmacalc:history";

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveEntry(entry: Omit<HistoryEntry, "id" | "timestamp">) {
  const list = loadHistory();
  const next: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  list.unshift(next);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
  window.dispatchEvent(new Event("pharmacalc:history"));
  return next;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("pharmacalc:history"));
}

export function deleteEntry(id: string) {
  const list = loadHistory().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("pharmacalc:history"));
}

export function useHistory() {
  const [list, setList] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    setList(loadHistory());
    const fn = () => setList(loadHistory());
    window.addEventListener("pharmacalc:history", fn);
    return () => window.removeEventListener("pharmacalc:history", fn);
  }, []);
  return list;
}

export function exportCSV(entries: HistoryEntry[]) {
  const rows = [
    ["Timestamp", "Calculator", "Inputs", "Result", "Unit"],
    ...entries.map((e) => [
      new Date(e.timestamp).toISOString(),
      e.calculator,
      Object.entries(e.inputs)
        .map(([k, v]) => `${k}=${v}`)
        .join("; "),
      e.result,
      e.unit ?? "",
    ]),
  ];
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pharmacalc-history-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
