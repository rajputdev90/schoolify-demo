import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
export default function NotFound() { return <main className="standalone"><Brand/><span className="big-number">404</span><h1>A little off the timetable.</h1><p>This page is not part of the Schoolify demo.</p><Button asChild><Link href="/login/">Choose a workspace</Link></Button></main>; }
