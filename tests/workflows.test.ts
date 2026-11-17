import { describe, it, expect } from 'vitest';
import { createSeed } from '../src/lib/data';
import { executeCommand } from '../src/lib/service';
import { canMarkAttendance, visibleStudents } from '../src/lib/permissions';

describe('connected demo workflows', () => {
  it('allows only the class teacher or an active substitute to mark attendance', () => {
    let data=createSeed(); const main={accountId:'a2',role:'teacher'} as const; const other={accountId:'a8',role:'teacher'} as const; const admin={accountId:'a7',role:'admin'} as const;
    expect(canMarkAttendance(data,main,'10a')).toBe(true); expect(canMarkAttendance(data,other,'10a')).toBe(false);
    data=executeCommand(data,admin,{type:'section.assign',sectionId:'10a',teacherId:'t2',substituteUntil:'2026-11-20'});
    expect(canMarkAttendance(data,other,'10a')).toBe(true);
    const records=data.students.filter(s=>s.sectionId==='10a').map(s=>({studentId:s.id,status:'Absent' as const}));
    data=executeCommand(data,other,{type:'attendance.mark',sectionId:'10a',date:'2026-11-17',records});
    expect(data.attendance.find(a=>a.studentId==='s1'&&a.date==='2026-11-17')?.status).toBe('Absent');
    expect(visibleStudents(data,{accountId:'a3',role:'parent'}).map(s=>s.id)).toEqual(['s1','s2']);
  });
  it('publishes an assignment and allows the assigned student to submit once',()=>{
    let data=createSeed(); data=executeCommand(data,{accountId:'a2',role:'teacher'},{type:'assignment.save',value:{title:'Practice equations',subject:'Mathematics',sectionId:'10a',due:'2026-11-20',description:'Solve these example equations.',priority:'Normal',total:20,published:true}});
    const assignment=data.assignments.at(-1)!; data=executeCommand(data,{accountId:'a1',role:'student'},{type:'submission.create',assignmentId:assignment.id,response:'Here is my worked solution.',fileName:''});
    expect(data.submissions.some(s=>s.assignmentId===assignment.id&&s.studentId==='s1')).toBe(true); expect(data.students.find(s=>s.id==='s1')?.xp).toBe(1260);
    expect(()=>executeCommand(data,{accountId:'a1',role:'student'},{type:'submission.create',assignmentId:assignment.id,response:'Another worked solution.',fileName:''})).toThrow();
  });
  it('updates linked fee records and prevents paying another family’s fee',()=>{
    const parent={accountId:'a3',role:'parent'} as const;let data=createSeed(); data=executeCommand(data,parent,{type:'fee.pay',feeId:'fee-s1-1',amount:1000,method:'Demo'});
    expect(data.fees.find(f=>f.id==='fee-s1-1')?.paid).toBe(13000);expect(()=>executeCommand(data,parent,{type:'fee.pay',feeId:'fee-s3-1',amount:1,method:'Demo'})).toThrow();
  });
  it('requires complete marks and verification before publication',()=>{
    const cell={accountId:'a6',role:'examination'} as const; let data=createSeed();expect(()=>executeCommand(data,cell,{type:'exam.publish',id:'ex1'})).toThrow();
    data=executeCommand(data,cell,{type:'exam.marks',examId:'ex1',marks:data.students.filter(s=>s.sectionId==='10a').map(s=>({studentId:s.id,marks:30}))});
    expect(()=>executeCommand(data,cell,{type:'exam.publish',id:'ex1'})).toThrow();data=executeCommand(data,cell,{type:'exam.verify',id:'ex1'});data=executeCommand(data,cell,{type:'exam.publish',id:'ex1'});expect(data.exams.find(e=>e.id==='ex1')?.published).toBe(true);
  });
  it('submits teacher leave to the principal and reflects the review for the teacher', () => {
    const teacher = { accountId: 'a2', role: 'teacher' } as const;
    const principal = { accountId: 'a4', role: 'principal' } as const;
    let data = executeCommand(createSeed(), teacher, { type: 'leave.add', from: '2026-11-20', to: '2026-11-21', reason: 'Family appointment' });
    const request = data.leaves.at(-1)!;
    expect(request).toMatchObject({ personId: 't1', status: 'Pending' });
    expect(() => executeCommand(data, teacher, { type: 'leave.review', id: request.id, status: 'Approved' })).toThrow();
    data = executeCommand(data, principal, { type: 'leave.review', id: request.id, status: 'Approved' });
    expect(data.leaves.find(l => l.id === request.id)?.status).toBe('Approved');
    expect(data.audit.some(a => a.action === 'leave.review')).toBe(true);
  });
});
