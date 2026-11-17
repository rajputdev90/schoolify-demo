import type { SchoolState, Session, Student } from "./types";
import type { Command } from "./commands";
import { accountFor, can, canMarkAttendance, canTeach, contactIds, personId, visibleStudents, workflowRoles, type Capability } from "./permissions";
import { DEMO_DATE, uid } from "./utils";

function requireValue(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
function validText(value: string, label: string, min = 2) { requireValue(value.trim().length >= min && value.length <= 6000, `${label} must contain ${min}–6,000 characters.`); }
function validAmount(value: number, max = 10000000) { requireValue(Number.isFinite(value) && value > 0 && value <= max, "Enter a valid positive amount within the available limit."); }
function validDate(value: string) { requireValue(/^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0,10) === value, "Choose a valid date."); }

/** Frontend convenience rules only. A production backend must re-authorize every operation. */
export function executeCommand(current: SchoolState, session: Session, cmd: Command): SchoolState {
  const state = structuredClone(current); const account = accountFor(state, session); const person = personId(state, session);
  const requireCap = (cap: Capability) => requireValue(can(session.role, cap), "Your demo role cannot perform this action.");
  const ownStudent = () => { requireCap("learn"); const student = state.students.find(s => s.id === person); requireValue(student, "Student profile not found."); return student; };
  const allowedStudents = () => visibleStudents(state, session);
  const award = (student: Student, activity: string, amount: number, key: string) => {
    if (!state.settings.gamification || state.xpEntries.some(x => x.id === key)) return;
    student.xp += amount; state.xpEntries.push({ id: key, studentId: student.id, activity, amount, date: DEMO_DATE });
  };
  switch (cmd.type) {
    case "material.save": {
      requireValue(canTeach(state, session, cmd.value.sectionId, cmd.value.subject), "You can publish only to your assigned subjects and classes.");
      validText(cmd.value.title, "Title"); validText(cmd.value.chapter, "Chapter");
      const old = state.materials.find(m => m.id === cmd.value.id);
      requireValue(!cmd.value.id || old?.teacherId === person, "Only the author can edit this material.");
      const value = { ...cmd.value, id: old?.id ?? uid("mat"), teacherId: person, updated: DEMO_DATE, version: (old?.version ?? 0) + 1 };
      state.materials = old ? state.materials.map(m => m.id === old.id ? value : m) : [...state.materials, value]; break;
    }
    case "material.remove": {
      requireCap("teach"); requireValue(state.materials.some(m => m.id === cmd.id && m.teacherId === person), "Only the author can remove this material.");
      state.materials = state.materials.filter(m => m.id !== cmd.id); break;
    }
    case "bookmark": {
      const student = ownStudent(); requireValue(state.materials.some(m => m.id === cmd.id && m.published && m.sectionId === student.sectionId), "This material is not available to your class.");
      const saved = state.bookmarks[person] ?? []; state.bookmarks[person] = saved.includes(cmd.id) ? saved.filter(id => id !== cmd.id) : [...saved, cmd.id]; break;
    }
    case "assignment.save": {
      requireValue(canTeach(state, session, cmd.value.sectionId, cmd.value.subject), "Choose an assigned subject and class."); validText(cmd.value.title, "Title"); validText(cmd.value.description, "Instructions"); validDate(cmd.value.due); validAmount(cmd.value.total, 1000);
      state.assignments.push({ ...cmd.value, id: uid("as"), teacherId: person }); break;
    }
    case "submission.create": {
      const student = ownStudent(); const assignment = state.assignments.find(a => a.id === cmd.assignmentId && a.sectionId === student.sectionId && a.published);
      requireValue(assignment, "This assignment is not available to you."); requireValue(!state.submissions.some(s => s.assignmentId === assignment.id && s.studentId === person), "You have already submitted this assignment.");
      validText(cmd.response, "Your response", 10); state.submissions.push({ id: uid("sub"), assignmentId: assignment.id, studentId: person, response: cmd.response, fileName: cmd.fileName, at: `${DEMO_DATE}T10:30:00`, published: false });
      if (assignment.due >= DEMO_DATE) award(student, "Assignment submitted on time", state.settings.xp.assignment, `xp-${person}-${assignment.id}`); break;
    }
    case "submission.grade": {
      requireCap("teach"); const submission = state.submissions.find(s => s.id === cmd.id); const assignment = state.assignments.find(a => a.id === submission?.assignmentId);
      requireValue(submission && assignment?.teacherId === person, "Only the assignment's teacher can grade this work."); requireValue(Number.isFinite(cmd.grade) && cmd.grade >= 0 && cmd.grade <= assignment.total, `Marks must be between 0 and ${assignment.total}.`);
      Object.assign(submission, { grade: cmd.grade, feedback: cmd.feedback, published: cmd.published }); break;
    }
    case "attendance.mark": {
      validDate(cmd.date); requireValue(cmd.date <= DEMO_DATE, "Attendance cannot be marked for a future demo date.");
      requireValue(canMarkAttendance(state, session, cmd.sectionId, DEMO_DATE), "Only the main class teacher or an active substitute can edit attendance.");
      const students = state.students.filter(s => s.sectionId === cmd.sectionId);
      requireValue(cmd.records.length === students.length && new Set(cmd.records.map(r => r.studentId)).size === students.length && cmd.records.every(r => students.some(s => s.id === r.studentId) && ["Present", "Absent", "Late"].includes(r.status)), "Include exactly one valid record for each student in this section.");
      state.attendance = state.attendance.filter(a => a.date !== cmd.date || !students.some(s => s.id === a.studentId));
      state.attendance.push(...cmd.records.map(r => ({ ...r, date: cmd.date, markedBy: person }))); break;
    }
    case "section.assign": {
      requireCap("manageClasses"); const section = state.sections.find(s => s.id === cmd.sectionId); requireValue(section && state.teachers.some(t => t.id === cmd.teacherId), "Choose an existing class and teacher.");
      if (cmd.substituteUntil) { validDate(cmd.substituteUntil); requireValue(cmd.substituteUntil >= DEMO_DATE, "Substitute access must end on or after the demo date."); section.substitute = { teacherId: cmd.teacherId, until: cmd.substituteUntil }; }
      else { section.mainTeacherId = cmd.teacherId; section.substitute = undefined; const teacher = state.teachers.find(t => t.id === cmd.teacherId)!; if (!teacher.sectionIds.includes(section.id)) teacher.sectionIds.push(section.id); } break;
    }
    case "section.create": {
      requireCap("manageClasses"); validText(cmd.name, "Class name"); requireValue(!state.sections.some(s => s.name.toLowerCase() === cmd.name.toLowerCase()), "This section already exists."); const teacher = state.teachers.find(t => t.id === cmd.teacherId); requireValue(teacher, "Choose a main class teacher.");
      const id = uid("class"); state.sections.push({ id, name: cmd.name, room: cmd.room, mainTeacherId: teacher.id }); teacher.sectionIds.push(id); break;
    }
    case "teacher.assign": {
      requireCap("manageClasses"); const teacher = state.teachers.find(t => t.id === cmd.teacherId); requireValue(teacher && cmd.subjects.length && cmd.sectionIds.length && cmd.sectionIds.every(id => state.sections.some(s => s.id === id)), "Choose an existing teacher, subjects, and classes.");
      teacher.subjects = cmd.subjects; teacher.sectionIds = [...new Set([...cmd.sectionIds, ...state.sections.filter(s => s.mainTeacherId === teacher.id).map(s => s.id)])]; break;
    }
    case "fee.pay": {
      requireCap("payFees"); const fee = state.fees.find(f => f.id === cmd.feeId); requireValue(fee && allowedStudents().some(s => s.id === fee.studentId), "This fee does not belong to an accessible student."); validAmount(cmd.amount, fee.amount - fee.discount - fee.paid);
      fee.paid += cmd.amount; state.payments.push({ id: uid("receipt"), feeId: fee.id, amount: cmd.amount, method: cmd.method, at: new Date().toISOString(), by: person }); break;
    }
    case "fee.adjust": {
      requireCap("manageFees"); const fee = state.fees.find(f => f.id === cmd.feeId); requireValue(fee && Number.isFinite(cmd.discount) && cmd.discount >= 0 && cmd.discount <= fee.amount - fee.paid, "Discount must fit within the unpaid amount."); fee.discount = cmd.discount; break;
    }
    case "fee.create": {
      requireCap("manageFees"); requireValue(state.students.some(s => s.id === cmd.studentId), "Choose a student."); validAmount(cmd.amount); validText(cmd.title, "Fee description"); validDate(cmd.due); state.fees.push({ id: uid("fee"), studentId: cmd.studentId, title: cmd.title, amount: cmd.amount, due: cmd.due, paid: 0, discount: 0 }); break;
    }
    case "notice.publish": {
      requireCap("publishNotices"); validText(cmd.value.title, "Title"); validText(cmd.value.body, "Notice"); requireValue(cmd.value.audience.length > 0, "Select at least one audience.");
      state.notices.unshift({ ...cmd.value, id: uid("notice"), date: DEMO_DATE, author: account.name }); break;
    }
    case "event.register": {
      requireValue(["student", "parent"].includes(session.role) && allowedStudents().some(s => s.id === cmd.studentId), "Choose your own or a linked child's profile."); const event = state.events.find(e => e.id === cmd.id); requireValue(event, "Event not found.");
      if (event.registered.includes(cmd.studentId)) event.registered = event.registered.filter(id => id !== cmd.studentId);
      else { requireValue(event.registered.length < event.capacity, "This event is full."); event.registered.push(cmd.studentId); } break;
    }
    case "event.create": { requireCap("manageEvents"); validText(cmd.value.title, "Event name"); validDate(cmd.value.date); validAmount(cmd.value.capacity, 10000); state.events.push({ ...cmd.value, id: uid("ev"), registered: [] }); break; }
    case "goal.add": { ownStudent(); validText(cmd.title, "Goal"); validDate(cmd.due); state.goals.push({ id: uid("goal"), studentId: person, title: cmd.title, due: cmd.due, complete: false }); break; }
    case "goal.complete": { const student = ownStudent(); const goal = state.goals.find(g => g.id === cmd.id && g.studentId === person); requireValue(goal && !goal.complete, "This goal is unavailable or already complete."); goal.complete = true; award(student, "Personal learning goal", state.settings.xp.goal, `xp-${goal.id}`); break; }
    case "achievement.add": { ownStudent(); validText(cmd.title, "Achievement"); validText(cmd.description, "Description"); validDate(cmd.date); state.achievements.push({ id: uid("achievement"), studentId: person, title: cmd.title, category: cmd.category, description: cmd.description, date: cmd.date, verified: false }); break; }
    case "achievement.verify": { requireCap("verifyPortfolio"); const achievement = state.achievements.find(a => a.id === cmd.id && allowedStudents().some(s => s.id === a.studentId)); requireValue(achievement && !achievement.verified, "This achievement is unavailable or already verified."); achievement.verified = true; if (achievement.category === "Competition") award(state.students.find(s => s.id === achievement.studentId)!, "Verified competition participation", state.settings.xp.competition, `xp-${achievement.id}`); break; }
    case "quiz.complete": { const student = ownStudent(); requireValue(cmd.answer === "2, 3", "Not quite. Find two numbers whose product is 6 and sum is 5."); requireValue(!state.xpEntries.some(x => x.id === `quiz-${person}-quadratics`), "You've already completed this practice. No extra XP is awarded."); award(student, "Quadratics practice quiz", state.settings.xp.quiz, `quiz-${person}-quadratics`); break; }
    case "paper.submit": {
      requireCap("teach"); const exam = state.exams.find(e => e.id === cmd.examId); requireValue(exam && canTeach(state, session, exam.sectionId, exam.subject), "Choose an exam in your assigned class and subject."); validText(cmd.title, "Paper title"); validText(cmd.fileName, "Sample file name"); const old = state.papers.find(p => p.id === cmd.id);
      if (cmd.id) { requireValue(old && old.teacherId === person && old.status !== "Approved", "This paper cannot be replaced."); old.versions.push({ number: old.versions.length + 1, date: DEMO_DATE, fileName: cmd.fileName }); old.status = "Submitted"; old.title = cmd.title; }
      else state.papers.push({ id: uid("paper"), examId: exam.id, teacherId: person, title: cmd.title, feedback: "", status: "Submitted", versions: [{ number: 1, date: DEMO_DATE, fileName: cmd.fileName }] }); break;
    }
    case "paper.review": { requireCap("reviewPapers"); const paper = state.papers.find(p => p.id === cmd.id); requireValue(paper && paper.status === "Submitted", "Only submitted papers can be reviewed."); if (cmd.status === "Revision requested") validText(cmd.feedback, "Revision feedback"); paper.status = cmd.status; paper.feedback = cmd.feedback; break; }
    case "exam.create": { requireCap("manageExams"); validText(cmd.value.name, "Exam name"); validDate(cmd.value.date); validAmount(cmd.value.total, 1000); requireValue(state.sections.some(s => s.id === cmd.value.sectionId), "Choose an existing class."); state.exams.push({ ...cmd.value, id: uid("exam"), published: false, verified: false }); break; }
    case "exam.marks": {
      requireCap("manageExams"); const exam = state.exams.find(e => e.id === cmd.examId); requireValue(exam && !exam.published, "Published results cannot be edited in this prototype.");
      const students = state.students.filter(s => s.sectionId === exam.sectionId); requireValue(cmd.marks.length === students.length && new Set(cmd.marks.map(m => m.studentId)).size === students.length && cmd.marks.every(m => students.some(s => s.id === m.studentId) && Number.isFinite(m.marks) && m.marks >= 0 && m.marks <= exam.total), "Enter valid marks for every student in this section.");
      state.results = state.results.filter(r => r.examId !== exam.id); state.results.push(...cmd.marks.map(m => ({ ...m, examId: exam.id }))); exam.verified = false; break;
    }
    case "exam.verify": case "exam.publish": {
      requireCap("manageExams"); const exam = state.exams.find(e => e.id === cmd.id); requireValue(exam, "Exam not found."); const students = state.students.filter(s => s.sectionId === exam.sectionId); requireValue(students.length && students.every(s => state.results.some(r => r.examId === exam.id && r.studentId === s.id)), "Collect marks for every student before verifying results.");
      if (cmd.type === "exam.verify") exam.verified = true; else { requireValue(exam.verified, "Verify all results before publishing."); exam.published = true; } break;
    }
    case "message.send": { requireCap("message"); requireValue(contactIds(state, session).includes(cmd.to), "Choose a teacher or parent linked to your class."); validText(cmd.body, "Message"); state.messages.push({ id: uid("message"), from: person, to: cmd.to, body: cmd.body, at: new Date().toISOString() }); break; }
    case "meeting.book": {
      requireCap("bookMeetings"); const student = allowedStudents().find(s => s.id === cmd.studentId); requireValue(student && state.teachers.some(t => t.id === cmd.teacherId && t.sectionIds.includes(student.sectionId)), "Choose a linked child and their teacher."); validDate(cmd.date); requireValue(cmd.date >= DEMO_DATE && /^\d{2}:\d{2}$/.test(cmd.time), "Choose an upcoming date and time."); requireValue(!state.meetings.some(m => m.teacherId === cmd.teacherId && m.date === cmd.date && m.time === cmd.time && m.status !== "Cancelled"), "This appointment is already reserved. Choose another slot."); state.meetings.push({ id: uid("meeting"), parentId: person, studentId: student.id, teacherId: cmd.teacherId, date: cmd.date, time: cmd.time, notes: cmd.notes, status: "Requested" }); break;
    }
    case "meeting.status": { const meeting = state.meetings.find(m => m.id === cmd.id); requireValue(meeting && ((session.role === "teacher" && meeting.teacherId === person) || session.role === "principal" || (session.role === "parent" && meeting.parentId === person && cmd.status === "Cancelled")), "You cannot update this meeting."); meeting.status = cmd.status; meeting.notes = cmd.notes; break; }
    case "leave.add": { requireCap("requestLeave"); validDate(cmd.from); validDate(cmd.to); validText(cmd.reason, "Reason", 5); requireValue(cmd.to >= cmd.from && (!cmd.studentId || allowedStudents().some(s => s.id === cmd.studentId)), "Choose valid dates and an accessible student."); requireValue(session.role === "teacher" || cmd.studentId, "Choose the student requesting leave."); state.leaves.push({ id: uid("leave"), personId: person, studentId: cmd.studentId, from: cmd.from, to: cmd.to, reason: cmd.reason, status: "Pending" }); break; }
    case "leave.review": { requireCap("reviewLeave"); const leave = state.leaves.find(l => l.id === cmd.id); requireValue(leave?.status === "Pending", "This request has already been reviewed."); leave.status = cmd.status; break; }
    case "expense.add": { requireCap("manageExpenses"); validText(cmd.value.title, "Expense title"); validAmount(cmd.value.amount); validDate(cmd.value.date); state.expenses.push({ ...cmd.value, id: uid("expense") }); break; }
    case "expense.pay": { requireCap("manageExpenses"); const expense = state.expenses.find(e => e.id === cmd.id); requireValue(expense?.status === "Pending", "This expense is unavailable or already paid."); expense.status = "Paid"; break; }
    case "workflow.save": {
      requireValue(workflowRoles[cmd.kind]?.includes(session.role), "Your role cannot edit these records."); validText(cmd.title, "Title"); validText(cmd.detail, "Details"); validDate(cmd.date);
      const old = state.workflows.find(w => w.id === cmd.id); requireValue(!cmd.id || (old?.kind === cmd.kind && (session.role !== "teacher" || old.owner === person)), "This record cannot be edited by your account.");
      const value = { id: old?.id ?? uid("record"), kind: cmd.kind, title: cmd.title, detail: cmd.detail, date: cmd.date, owner: session.role === "teacher" ? person : cmd.owner, status: cmd.status, amount: cmd.amount };
      state.workflows = old ? state.workflows.map(w => w.id === old.id ? value : w) : [...state.workflows, value]; break;
    }
    case "checkin": { requireCap("teach"); requireValue(!state.checkIns.some(c => c.teacherId === person && c.at.startsWith(DEMO_DATE)), "You have already checked in for this demo day."); state.checkIns.push({ teacherId: person, at: `${DEMO_DATE}T08:10:00` }); break; }
    case "settings.save": { requireCap("manageSettings"); validText(cmd.value.schoolName, "School name"); requireValue(Object.values(cmd.value.xp).every(v => Number.isFinite(v) && v >= 0 && v <= 100) && [cmd.value.lateFee, cmd.value.scholarship].every(v => Number.isFinite(v) && v >= 0), "Use valid non-negative settings; XP awards must be 0–100."); state.settings = cmd.value; break; }
    case "account.save": {
      requireCap("manageUsers"); validText(cmd.value.name, "Name"); validText(cmd.value.alias, "User ID"); requireValue(cmd.value.roles.length > 0, "Choose at least one role.");
      requireValue(!state.accounts.some(a => a.id !== cmd.value.id && a.alias.toLowerCase() === cmd.value.alias.toLowerCase()), "This user ID is already used.");
      for (const role of cmd.value.roles) { if (role === "student") requireValue(state.students.some(s => s.id === cmd.value.personId), "Student roles require a student profile."); if (role === "teacher") requireValue(state.teachers.some(t => t.id === cmd.value.personId), "Teacher roles require a teacher profile."); if (role === "parent") requireValue(state.parents.some(p => p.id === cmd.value.personId), "Parent roles require a linked parent profile."); }
      requireValue(cmd.value.id !== account.id || (cmd.value.active && cmd.value.roles.includes("admin")), "Keep your active administrator access to avoid locking this demo."); state.accounts = state.accounts.some(a => a.id === cmd.value.id) ? state.accounts.map(a => a.id === cmd.value.id ? cmd.value : a) : [...state.accounts, cmd.value]; break;
    }
    case "parent.link": { requireCap("manageUsers"); const parent = state.parents.find(p => p.id === cmd.parentId); requireValue(parent && cmd.childIds.every(id => state.students.some(s => s.id === id)), "Choose an existing parent and students."); parent.childIds = [...new Set(cmd.childIds)]; break; }
    case "students.import": {
      requireCap("manageUsers"); requireValue(cmd.rows.length > 0 && cmd.rows.length <= 200, "Import between 1 and 200 fictional students.");
      for (const row of cmd.rows) { validText(row.name, "Name"); validText(row.alias, "Alias"); requireValue(state.sections.some(s => s.id === row.sectionId) && Number.isInteger(row.roll) && row.roll > 0 && !state.students.some(s => s.sectionId === row.sectionId && s.roll === row.roll), "Every row needs an existing section and a unique positive roll number."); state.students.push({ ...row, id: uid("student"), xp: 0, streak: 0 }); } break;
    }
    case "email.save": { requireCap("composeEmail"); validText(cmd.subject, "Subject"); validText(cmd.body, "Email body"); state.emailDrafts.push({ id: uid("draft"), subject: cmd.subject, body: cmd.body, audience: cmd.audience, status: cmd.status }); break; }
  }
  const detail = cmd.type === "attendance.mark" ? `${cmd.sectionId}: ${cmd.records.length} records for ${cmd.date}` : cmd.type === "section.assign" ? `${cmd.sectionId}: ${cmd.teacherId}${cmd.substituteUntil ? `, substitute until ${cmd.substituteUntil}` : ", main class teacher"}` : cmd.type.replaceAll(".", " ");
  state.audit.unshift({ id: uid("audit"), actor: `${account.name} (${session.role})`, action: cmd.type, detail, at: new Date().toISOString() });
  return state;
}
