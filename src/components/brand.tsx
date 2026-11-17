import Link from "next/link";
import { cn } from "@/lib/utils";
export function Brand({ compact = false, href = "/" }: { compact?: boolean; href?: string }) { return <Link href={href} className={cn("brand", compact && "brand-compact")} aria-label="Schoolify home"><span className="brand-mark"><span/><span/><span/><span/></span>{!compact && <span>schoolify<span className="brand-dot">.</span></span>}</Link>; }
