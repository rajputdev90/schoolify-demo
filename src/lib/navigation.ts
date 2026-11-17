import type { Role } from "./types";
export type NavItem = { id: string; label: string; icon: string; group: "Workspace" | "School life" | "Administration" };
const item = (id: string, label: string, icon: string, group: NavItem["group"] = "Workspace"): NavItem => ({ id, label, icon, group });
export const roleInfo: Record<Role, { label: string; short: string; greeting: string; description: string; color: string; icon: string }> = {
  student: { label: "Student", short: "Student space", greeting: "A little progress, every day.", description: "Your classes, your goals, your next big idea.", color: "#1749a6", icon: "GraduationCap" },
  teacher: { label: "Teacher", short: "Teacher workspace", greeting: "More time for the moments that matter.", description: "Plan a lesson. Spark a question. Make a difference.", color: "#245ea1", icon: "Presentation" },
  parent: { label: "Parent", short: "Parent connect", greeting: "A closer look at their growing world.", description: "Small milestones and school updates, in one place.", color: "#08746c", icon: "Heart" },
  principal: { label: "Principal", short: "Principal's office", greeting: "A clear view of your school.", description: "Lead with insight, care, and a little more clarity.", color: "#324b69", icon: "Landmark" },
  management: { label: "Management", short: "School operations", greeting: "A well-run school starts here.", description: "Keep your finances and operations moving together.", color: "#28704b", icon: "ChartNoAxesCombined" },
  examination: { label: "Examination Cell", short: "Examination centre", greeting: "Every assessment, thoughtfully organised.", description: "From the first draft to the final report card.", color: "#574c96", icon: "ClipboardCheck" },
  admin: { label: "Admin", short: "Admin console", greeting: "Everything in its right place.", description: "The people, permissions, and settings behind your school.", color: "#4c5961", icon: "Settings2" },
};
const overview = item("overview", "Overview", "LayoutDashboard");
const notices = item("notices", "Notice board", "Megaphone", "School life");
const events = item("events", "Events", "CalendarDays", "School life");
const attendance = item("attendance", "Attendance", "CalendarCheck");
const assignments = item("assignments", "Assignments", "NotebookPen");
const schedule = item("schedule", "Timetable", "CalendarDays");
const results = item("results", "Results & reports", "ChartNoAxesCombined");
const meetings = item("meetings", "Meetings", "Video", "School life");
const messages = item("messages", "Messages", "MessagesSquare", "School life");
const leave = item("leave", "Leave requests", "Coffee", "School life");
export const navigation: Record<Role, NavItem[]> = {
  student: [overview, item("subjects", "My subjects", "BookOpen"), assignments, schedule, attendance, item("assistant", "Study companion", "Sparkles"), item("progress", "My progress", "TrendingUp"), item("exams", "Examinations", "ClipboardList"), results, item("portfolio", "My portfolio", "Award"), item("planner", "Study planner", "ListTodo"), item("house", "My house", "Flag", "School life"), notices, events, item("discussions", "Ask a doubt", "MessagesSquare", "School life"), leave],
  teacher: [overview, item("classes", "My classes", "UsersRound"), attendance, assignments, item("materials", "Study materials", "Library"), schedule, item("lesson-plans", "Lesson plans", "NotebookTabs"), item("papers", "Exam papers", "FileLock2"), item("insights", "Student insights", "ChartNoAxesCombined"), item("self-attendance", "My check-in", "ScanFace"), meetings, messages, notices, leave],
  parent: [overview, item("children", "My children", "Heart"), attendance, assignments, results, item("fees", "Fees & receipts", "Wallet"), meetings, messages, item("achievements", "Achievements", "Award"), notices, events, leave],
  principal: [overview, item("staff", "Staff & workload", "UsersRound"), item("academics", "Academic insights", "ChartNoAxesCombined"), item("approvals", "Approval inbox", "Inbox"), meetings, notices, events, item("tasks", "Task delegation", "ListTodo"), item("compliance", "Board workspace", "Landmark"), item("documents", "Documents", "FolderOpen"), item("email", "Official email", "Mail"), item("reports", "School reports", "FileChartColumn")],
  management: [overview, item("fees", "Fee management", "Wallet"), item("expenses", "Expenses & budgets", "Receipt"), item("students", "Student directory", "GraduationCap"), item("admissions", "Admissions", "UserPlus"), item("staff", "Staff records", "UsersRound"), item("inventory", "Inventory", "Boxes"), item("purchases", "Purchase requests", "ShoppingBag"), item("refunds", "Refund register", "Undo2"), item("documents", "Documents", "FolderOpen"), item("reports", "Financial reports", "FileChartColumn"), notices],
  examination: [overview, item("exams", "Examinations", "ClipboardList"), item("papers", "Paper submissions", "Files"), item("approvals", "Paper approvals", "ClipboardCheck"), item("vault", "Paper vault", "FileLock2"), item("seating", "Seating plans", "Armchair"), item("invigilation", "Invigilation", "UsersRound"), results, item("archive", "Exam archive", "Archive"), notices],
  admin: [overview, item("users", "User accounts", "UsersRound"), item("roles", "Roles & permissions", "ShieldCheck"), item("classes", "Classes & teachers", "School"), item("links", "Family connections", "Link"), item("logs", "Audit log", "ScrollText"), item("import", "Import & export", "ArrowLeftRight"), item("settings", "School settings", "Settings2"), notices],
};
export const dockItems: Record<Role, string[]> = {
  student: ["overview", "subjects", "assignments", "assistant", "progress"], teacher: ["overview", "classes", "assignments", "materials", "schedule"], parent: ["overview", "children", "attendance", "fees", "messages"], principal: ["overview", "staff", "meetings", "notices", "approvals"], management: ["overview", "fees", "expenses", "students", "reports"], examination: ["exams", "papers", "approvals", "results"], admin: ["overview", "users", "roles", "logs", "settings"],
};
export const pathFor = (role: Role, page = "overview") => `/portal/${role}/${page}/`;
