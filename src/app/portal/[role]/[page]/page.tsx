import { notFound } from "next/navigation";
import { roles, type Role } from "@/lib/types";
import { navigation } from "@/lib/navigation";
import { WorkspaceShell } from "@/components/shell/workspace-shell";
import { StudentOverview } from "@/features/dashboard/student-overview";
import { RoleOverview } from "@/features/dashboard/role-overview";
import { StudentPage } from "@/features/pages/student";
import { WorkspacePage } from "@/features/pages/workspace";

export function generateStaticParams() {
  return roles.flatMap(role => navigation[role].map(page => ({ role, page: page.id })));
}

export default async function PortalPage({ params }: { params: Promise<{ role: string; page: string }> }) {
  const { role: rawRole, page } = await params;
  if (!roles.includes(rawRole as Role)) notFound();
  const role = rawRole as Role;
  const item = navigation[role].find(entry => entry.id === page);
  if (!item) notFound();
  const studentPages = ["subjects", "assignments", "attendance", "schedule", "notices", "events", "planner", "progress", "exams", "results", "assistant"];
  return <WorkspaceShell role={role} page={page}>{page === "overview" ? role === "student" ? <StudentOverview /> : <RoleOverview /> : role === "student" && studentPages.includes(page) ? <StudentPage page={page}/> : <WorkspacePage page={page}/>}</WorkspaceShell>;
}
