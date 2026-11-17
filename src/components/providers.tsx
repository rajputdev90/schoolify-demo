"use client";
import { useEffect, type ReactNode } from "react";
import { MotionConfig, AnimatePresence, motion } from "motion/react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { useSchool } from "@/lib/store";
export function Providers({ children }: { children: ReactNode }) {
  const hydrate = useSchool(s => s.hydrate); const toast = useSchool(s => s.toast); const clear = useSchool(s => s.clearToast);
  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(clear, 5500); return () => clearTimeout(timer); }, [toast, clear]);
  return <MotionConfig reducedMotion="user">{children}<AnimatePresence>{toast && <motion.div key={toast.id} className={`toast ${toast.type}`} role={toast.type === "error" ? "alert" : "status"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{toast.type === "success" ? <CheckCircle2 size={19}/> : <CircleAlert size={19}/>}<span>{toast.message}</span><button onClick={clear} aria-label="Dismiss notification"><X size={16}/></button></motion.div>}</AnimatePresence></MotionConfig>;
}
