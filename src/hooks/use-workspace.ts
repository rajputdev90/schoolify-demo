"use client";
import { useSchool } from "@/lib/store";
import { accountFor, visibleStudents } from "@/lib/permissions";
export function useWorkspace() {
  const store = useSchool();
  if (!store.session) throw new Error("A demo session is required.");
  const account = accountFor(store.data, store.session);
  const students = visibleStudents(store.data, store.session);
  const student = students.find(s => s.id === store.childId) ?? students[0];
  return { ...store, session: store.session, role: store.session.role, account, students, student, person: account.personId };
}
