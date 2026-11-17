"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="standalone"><h1>Let&apos;s try that again.</h1><p>This workspace could not load. Retry, or return to demo login.</p><Button onClick={reset}>Try again</Button><a href="/login/">Return to login</a></main>; }
