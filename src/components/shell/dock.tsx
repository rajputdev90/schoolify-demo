"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { dockItems, navigation, pathFor } from "@/lib/navigation";
import type { Role } from "@/lib/types";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
export function Dock({ role, page }: { role: Role; page: string }) {
  const reduced = useReducedMotion();
  return <nav className="dock" aria-label="Quick navigation">{dockItems[role].map(id => { const item = navigation[role].find(n => n.id === id)!; return <motion.div key={id} whileHover={reduced ? undefined : { y: -5, scale: 1.12 }} transition={{ type: "spring", stiffness: 350, damping: 20 }} className="dock-item"><Link href={pathFor(role, id)} className={cn("dock-link", page === id && "active")} aria-label={item.label} aria-current={page === id ? "page" : undefined}><Icon name={item.icon} size={21}/><span className="dock-mobile-label">{id === "overview" ? "Home" : item.label.split(" ")[0]}</span></Link><span className="dock-tooltip">{item.label}</span></motion.div>; })}</nav>;
}
