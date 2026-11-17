import type { Account, Assignment, AttendanceStatus, Exam, Expense, Material, Notice, Role, SchoolEvent, Settings, WorkflowKind } from "./types";
export type Command =
  | { type: "material.save"; value: Omit<Material, "id" | "teacherId" | "updated" | "version"> & { id?: string } }
  | { type: "material.remove"; id: string }
  | { type: "bookmark"; id: string }
  | { type: "assignment.save"; value: Omit<Assignment, "id" | "teacherId"> }
  | { type: "submission.create"; assignmentId: string; response: string; fileName: string }
  | { type: "submission.grade"; id: string; grade: number; feedback: string; published: boolean }
  | { type: "attendance.mark"; sectionId: string; date: string; records: { studentId: string; status: AttendanceStatus }[] }
  | { type: "section.assign"; sectionId: string; teacherId: string; substituteUntil?: string }
  | { type: "section.create"; name: string; teacherId: string; room: string }
  | { type: "teacher.assign"; teacherId: string; subjects: string[]; sectionIds: string[] }
  | { type: "fee.pay"; feeId: string; amount: number; method: string }
  | { type: "fee.adjust"; feeId: string; discount: number }
  | { type: "fee.create"; studentId: string; title: string; amount: number; due: string }
  | { type: "notice.publish"; value: Omit<Notice, "id" | "date" | "author"> }
  | { type: "event.register"; id: string; studentId: string }
  | { type: "event.create"; value: Omit<SchoolEvent, "id" | "registered"> }
  | { type: "goal.add"; title: string; due: string }
  | { type: "goal.complete"; id: string }
  | { type: "achievement.add"; title: string; category: string; description: string; date: string }
  | { type: "achievement.verify"; id: string }
  | { type: "quiz.complete"; answer: string }
  | { type: "paper.submit"; examId: string; title: string; fileName: string; id?: string }
  | { type: "paper.review"; id: string; status: "Approved" | "Revision requested"; feedback: string }
  | { type: "exam.create"; value: Omit<Exam, "id" | "published" | "verified"> }
  | { type: "exam.marks"; examId: string; marks: { studentId: string; marks: number }[] }
  | { type: "exam.verify" | "exam.publish"; id: string }
  | { type: "message.send"; to: string; body: string }
  | { type: "meeting.book"; studentId: string; teacherId: string; date: string; time: string; notes: string }
  | { type: "meeting.status"; id: string; status: "Confirmed" | "Completed" | "Cancelled"; notes: string }
  | { type: "leave.add"; studentId?: string; from: string; to: string; reason: string }
  | { type: "leave.review"; id: string; status: "Approved" | "Declined" }
  | { type: "expense.add"; value: Omit<Expense, "id"> }
  | { type: "expense.pay"; id: string }
  | { type: "workflow.save"; id?: string; kind: WorkflowKind; title: string; detail: string; date: string; owner: string; status: string; amount?: number }
  | { type: "checkin" }
  | { type: "settings.save"; value: Settings }
  | { type: "account.save"; value: Account }
  | { type: "parent.link"; parentId: string; childIds: string[] }
  | { type: "students.import"; rows: { name: string; alias: string; sectionId: string; house: string; roll: number }[] }
  | { type: "email.save"; subject: string; body: string; audience: string; status: "Draft" | "Previewed" };
export type ServiceResult = { ok: boolean; message: string };
export type StudyResponse = { text: string; sources: { label: string; materialId: string }[]; suggestions: string[] };
export interface StudyService { reply(question: string, subject: string, mode: string, language: string): Promise<StudyResponse> }
export const allRoles: Role[] = ["student", "teacher", "parent", "principal", "management", "examination", "admin"];
