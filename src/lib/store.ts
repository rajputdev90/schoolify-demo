"use client";
import { create } from "zustand";
import { createSeed } from "./data";
import type { SchoolState, Session } from "./types";
import { accountFor } from "./permissions";
import { executeCommand } from "./service";
import type { Command } from "./commands";

const DATA_KEY = "schoolify-demo-v1";
const SESSION_KEY = "schoolify-session-v1";
export function isSchoolState(value: unknown): value is SchoolState {
  if (!value || typeof value !== "object") return false;
  const data = value as SchoolState; const seed = createSeed();
  return data.schema === 1 && Object.entries(seed).every(([key, v]) => Array.isArray(v) ? Array.isArray(data[key as keyof SchoolState]) : data[key as keyof SchoolState] != null) && data.accounts.every(a => typeof a.id === "string" && Array.isArray(a.roles)) && data.sections.every(s => typeof s.mainTeacherId === "string") && !!data.settings.xp;
}
type Store = {
  data: SchoolState; session: Session | null; hydrated: boolean; theme: "light" | "dark"; childId: string;
  storageWarning: string; toast: { id: number; message: string; type: "success" | "error" } | null;
  hydrate: () => void; login: (session: Session, remember: boolean) => boolean; logout: () => void;
  act: (command: Command, message?: string) => boolean; setChild: (id: string) => void;
  setTheme: (theme: "light" | "dark") => void; notify: (message: string, type?: "success" | "error") => void;
  clearToast: () => void; reset: () => void;
};
export const useSchool = create<Store>((set, get) => ({
  data: createSeed(), session: null, hydrated: false, theme: "light", childId: "s1", storageWarning: "", toast: null,
  hydrate: () => {
    if (get().hydrated) return;
    let data = createSeed(); let session: Session | null = null; let theme: "light" | "dark" = "light"; let warning = "";
    try {
      const stored = localStorage.getItem(DATA_KEY);
      if (stored) { const parsed: unknown = JSON.parse(stored); if (isSchoolState(parsed)) data = parsed; else warning = "Saved demo data was incompatible. A fresh demo has been loaded."; }
      const storedSession = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (storedSession) { const parsed = JSON.parse(storedSession) as Session; try { accountFor(data, parsed); session = parsed; } catch { session = null; } }
      theme = localStorage.getItem("schoolify-theme") === "dark" ? "dark" : "light";
    } catch { warning = "Browser storage is unavailable or damaged. You can explore; changes may be lost when you leave."; }
    document.documentElement.dataset.theme = theme;
    set({ data, session, theme, hydrated: true, storageWarning: warning });
    window.addEventListener("storage", (event) => { if (event.key === DATA_KEY && event.newValue) { try { const value: unknown = JSON.parse(event.newValue); if (isSchoolState(value)) set({ data: value }); } catch { /* Retain valid in-memory state. */ } } });
  },
  login: (session, remember) => {
    try { accountFor(get().data, session); } catch (error) { get().notify((error as Error).message, "error"); return false; }
    try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session)); } catch { set({ storageWarning: "Your demo session will last only until this page is reloaded." }); }
    set({ session }); return true;
  },
  logout: () => { try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch { /* In-memory logout still works. */ } set({ session: null }); },
  act: (command, message = "Demo changes saved.") => {
    const { data, session } = get(); if (!session) { get().notify("Choose a demo account first.", "error"); return false; }
    try {
      const next = executeCommand(data, session, command); set({ data: next });
      try { localStorage.setItem(DATA_KEY, JSON.stringify(next)); } catch { set({ storageWarning: "Storage is full or blocked. Your changes are kept in this tab only." }); }
      get().notify(message); return true;
    } catch (error) { get().notify(error instanceof Error ? error.message : "Could not save. Please check your entries.", "error"); return false; }
  },
  setChild: childId => set({ childId }),
  setTheme: theme => { document.documentElement.dataset.theme = theme; set({ theme }); try { localStorage.setItem("schoolify-theme", theme); } catch { /* Theme works without persistence. */ } },
  notify: (message, type = "success") => set({ toast: { id: Date.now(), message, type } }),
  clearToast: () => set({ toast: null }),
  reset: () => {
    const session = get().session; if (!session || session.role !== "admin") { get().notify("Only an administrator can reset the demo.", "error"); return; }
    const data = createSeed(); set({ data, childId: "s1" }); try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch { set({ storageWarning: "Reset could not be saved to browser storage." }); }
    get().notify("Demo restored to its original fictional records.");
  },
}));
