import type { Role, SchoolState, Session, Student } from "./types";
import { DEMO_DATE } from "./utils";
export const capabilities = {
  learn: ["student"], teach: ["teacher"], markAttendance: ["teacher"], manageClasses: ["admin"],
  payFees: ["parent", "management"], manageFees: ["management"], publishNotices: ["principal", "admin"],
  manageEvents: ["principal", "admin"], reviewPapers: ["examination"], manageExams: ["examination"],
  message: ["parent", "teacher", "student"], bookMeetings: ["parent"], manageMeetings: ["teacher", "principal"],
  requestLeave: ["student", "parent", "teacher"], reviewLeave: ["principal"], manageExpenses: ["management"],
  manageUsers: ["admin"], manageSettings: ["admin"], composeEmail: ["principal"],
  verifyPortfolio: ["teacher"], viewAllStudents: ["principal", "management", "examination", "admin"],
} satisfies Record<string, Role[]>;
export type Capability = keyof typeof capabilities;
export function can(role: Role, capability: Capability) { return (capabilities[capability] as Role[]).includes(role); }
export function accountFor(state: SchoolState, session: Session) {
  const account = state.accounts.find(a => a.id === session.accountId && a.active && a.roles.includes(session.role));
  if (!account) throw new Error("This demo account cannot access that portal. Please choose an available demo account.");
  return account;
}
export function personId(state: SchoolState, session: Session) { return accountFor(state, session).personId; }
export function visibleStudents(state: SchoolState, session: Session): Student[] {
  const person = personId(state, session);
  if (session.role === "student") return state.students.filter(s => s.id === person);
  if (session.role === "parent") return state.students.filter(s => state.parents.find(p => p.id === person)?.childIds.includes(s.id));
  if (session.role === "teacher") return state.students.filter(s => state.teachers.find(t => t.id === person)?.sectionIds.includes(s.sectionId) || canMarkAttendance(state, session, s.sectionId));
  return can(session.role, "viewAllStudents") ? state.students : [];
}
export function canMarkAttendance(state: SchoolState, session: Session, sectionId: string, date = DEMO_DATE) {
  if (!can(session.role, "markAttendance")) return false;
  const person = personId(state, session); const section = state.sections.find(s => s.id === sectionId);
  return !!section && (section.mainTeacherId === person || (section.substitute?.teacherId === person && section.substitute.until >= date));
}
export function canTeach(state: SchoolState, session: Session, sectionId: string, subject: string) {
  if (!can(session.role, "teach")) return false;
  const teacher = state.teachers.find(t => t.id === personId(state, session));
  return !!teacher?.sectionIds.includes(sectionId) && teacher.subjects.includes(subject);
}
export function visibleSectionIds(state: SchoolState, session: Session) {
  if (session.role === "teacher") return state.teachers.find(t => t.id === personId(state, session))?.sectionIds ?? [];
  return [...new Set(visibleStudents(state, session).map(s => s.sectionId))];
}
export function contactIds(state: SchoolState, session: Session): string[] {
  const id = personId(state, session);
  if (session.role === "teacher") {
    const students = visibleStudents(state, session);
    return [...state.parents.filter(p => p.id !== id && p.childIds.some(child => students.some(s => s.id === child))).map(p => p.id), ...students.map(s => s.id)];
  }
  const sections = visibleSectionIds(state, session);
  return state.teachers.filter(t => t.sectionIds.some(s => sections.includes(s))).map(t => t.id);
}
export const workflowRoles: Record<string, Role[]> = {
  "lesson-plans": ["teacher"], admissions: ["management"], inventory: ["management"], documents: ["principal", "management"], compliance: ["principal"], tasks: ["principal"], seating: ["examination"], invigilation: ["examination"], refunds: ["management"], purchases: ["management", "principal"],
};
