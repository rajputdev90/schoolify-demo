import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export const DEMO_DATE = "2026-11-17";
export const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
export const niceDate = (value: string, pattern = "d MMM") => { try { return format(parseISO(value), pattern); } catch { return value; } };
export const initials = (name: string) => name.split(" ").slice(0, 2).map(p => p[0]).join("");
export const uid = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
export function downloadText(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadCsv(name: string, headers: string[], rows: (string | number)[][]) {
  const cell = (v: string | number) => `"${String(v).replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`;
  downloadText(name, [headers, ...rows].map(row => row.map(cell).join(",")).join("\r\n"), "text/csv;charset=utf-8");
}
