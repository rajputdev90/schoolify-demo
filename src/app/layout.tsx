import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import { Providers } from "@/components/providers";
export const metadata: Metadata = { title: { default: "Schoolify — A little progress, every day", template: "%s | Schoolify" }, description: "A thoughtful school workspace for students, teachers, parents, and the people behind a great school. Explore the fictional Schoolify demo." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><body><Providers>{children}</Providers></body></html>; }
