"use client";
import type { ReactNode } from "react";
import { Search, ArrowUpRight, Inbox, Info, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Dialog } from "./dialog";
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) { return <span className={`badge badge-${tone}`}>{children}</span>; }
export function Card({ children, className, title, action, subtitle }: { children: ReactNode; className?: string; title?: string; action?: ReactNode; subtitle?: string }) { return <section className={cn("card", className)}>{title && <div className="card-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>}{children}</section>; }
export function Stat({ label, value, note, icon, tone = "violet" }: { label: string; value: ReactNode; note: ReactNode; icon?: ReactNode; tone?: string }) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon tint-${tone}`}>{icon ?? <ArrowUpRight size={17}/>}</span></div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>; }
export function Empty({ title = "All clear for now", description = "New items will appear here when they're added.", action }: { title?: string; description?: string; action?: ReactNode }) { return <div className="empty"><div className="empty-icon"><Inbox size={25}/></div><h3>{title}</h3><p>{description}</p>{action}</div>; }
export function InfoBanner({ children }: { children: ReactNode }) { return <div className="info-banner"><Info size={17}/><span>{children}</span></div>; }
export function SearchInput({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (value: string) => void; placeholder?: string }) { return <label className="search-field"><Search size={16}/><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}/></label>; }
export function Field({ label, children, hint, className }: { label: string; children: ReactNode; hint?: string; className?: string }) { return <label className={cn("field", className)}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>; }
export function FormDialog({ open, onOpenChange, title, description, children, onSubmit, submitLabel = "Save changes" }: { open: boolean; onOpenChange: (value: boolean) => void; title: string; description?: string; children: ReactNode; onSubmit: (data: FormData) => boolean | void; submitLabel?: string }) {
  return <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}><form className="form-stack" onSubmit={e => { e.preventDefault(); if (onSubmit(new FormData(e.currentTarget)) !== false) onOpenChange(false); }}>{children}<div className="dialog-actions"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit">{submitLabel}</Button></div></form></Dialog>;
}
export function Tabs({ items, active, onChange, label = "View" }: { items: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void; label?: string }) { return <div className="tabs" role="group" aria-label={label}>{items.map(item => <button key={item.id} type="button" className={cn("tab", active === item.id && "active")} aria-pressed={active === item.id} onClick={() => onChange(item.id)}>{item.label}{item.count !== undefined && <span>{item.count}</span>}</button>)}</div>; }
export function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <Button onClick={onClick}><Plus size={16}/>{children}</Button>; }
export const str = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
export const num = (data: FormData, key: string) => Number(data.get(key));
export const toneFor = (status: string) => /Approved|Paid|Published|Verified|Present|Complete|Confirmed|Active/.test(status) ? "mint" : /Absent|Declined|High/.test(status) ? "rose" : /Pending|Requested|Late|Revision|Draft/.test(status) ? "peach" : "violet";
