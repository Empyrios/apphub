export const STORAGE_KEY = 'tutorforge:v1';
export const VERSION = 1;
export const STATUS = ['planned', 'completed', 'cancelled'];
export const HW_STATUS = ['assigned', 'submitted', 'reviewed'];
export const LEVELS = ['Primary', 'KS3', 'GCSE', 'A Level', 'IB', 'University', 'Other'];
export const SUBJECTS = ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'English', 'Science', 'Other'];
export const BOARDS = ['Edexcel', 'AQA', 'OCR', 'WJEC', 'Cambridge', 'IB', 'Other', 'Not specified'];
export const initial = () => ({version: VERSION, tutor: {name:'', defaultRatePence:3000}, students:[],sessions:[],homework:[],updatedAt:''});
export function localDate(now=new Date()){const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export const validDate = v => typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
export const validTime = v=> typeof v==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v);
export const money = p=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(p/100);
export const fee = (hourlyRatePence, minutes)=> Math.round((hourlyRatePence*minutes)/60);
export const month = d=>d.slice(0,7);
export const monthName=d=>new Date(d+'-01T12:00:00Z').toLocaleDateString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'});
export const dateName=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
export const uniqueId=()=> typeof crypto!=='undefined'&&crypto.randomUUID ? crypto.randomUUID() : `tf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,11)}`;
export function parsePrice(raw){const s=String(raw).replace(/,/g,'').trim();if(!/^(?:\d{1,8})(?:\.\d{1,2})?$/.test(s))throw Error('Enter a valid GBP amount (up to 2 decimal places)');const [pence,p='']=s.split('.');const v=Number(pence)*100+Number(p.padEnd(2,'0'));if(!Number.isSafeInteger(v)||v>1000000000)throw Error('Amount is too large');return v;}
const txt=(v,max=200)=>typeof v==='string' ? v.trim().slice(0,max) : '';
const isId=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(v);
const integer=(v,min,max)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
const checkArray=(a,max=1000)=>Array.isArray(a)&&a.length<=max;
function unique(items){const ids=items.map(x=>x.id);return ids.length===new Set(ids).size;}
export function validate(data){
 if(!data||typeof data!=='object'||Array.isArray(data)||data.version!==VERSION)throw Error('Invalid or unsupported TutorForge backup');
 if(!data.tutor||typeof data.tutor!=='object'||!integer(data.tutor.defaultRatePence,0,100000000)||typeof data.tutor.name!=='string'||data.tutor.name.length>100)throw Error('Invalid tutor settings');
 for(const key of ['students','sessions','homework'])if(!checkArray(data[key]))throw Error(`Invalid ${key} collection`);
 if(!unique(data.students)||!unique(data.sessions)||!unique(data.homework))throw Error('Duplicate records in backup');
 for(const s of data.students){
  if(!s||!isId(s.id)||typeof s.name!=='string'||!s.name.trim()||s.name.length>100||typeof s.subject!=='string'||s.subject.length>70||typeof s.level!=='string'||s.level.length>70||typeof s.examBoard!=='string'||s.examBoard.length>70||!integer(s.ratePence,0,100000000)||typeof s.notes!=='string'||s.notes.length>5000||typeof s.active!=='boolean')throw Error('Invalid student record');
 }
 const ids=new Set(data.students.map(x=>x.id));
 for(const s of data.sessions){
  if(!s||!isId(s.id)||!ids.has(s.studentId)||!validDate(s.date)||!validTime(s.time)||!integer(s.minutes,15,480)||!integer(s.ratePence,0,100000000)||!STATUS.includes(s.status)||typeof s.paid!=='boolean'||(s.status!=='completed'&&s.paid)||typeof s.topic!=='string'||!s.topic.trim()||s.topic.length>160||['objective','activities','feedback'].some(k=>typeof s[k]!=='string'||s[k].length>6000))throw Error('Invalid session record');
 }
 for(const h of data.homework){
  if(!h||!isId(h.id)||!ids.has(h.studentId)||!validDate(h.assignedAt)||!validDate(h.dueAt)||h.dueAt<h.assignedAt||!HW_STATUS.includes(h.status)||typeof h.title!=='string'||!h.title.trim()||h.title.length>160||typeof h.instructions!=='string'||h.instructions.length>5000||!((h.score===null)||integer(h.score,0,100)))throw Error('Invalid homework record');
 }
 return structuredClone(data);
}
export const studentById=(data,id)=>data.students.find(s=>s.id===id);
export const sessionsFor=(data,id)=>data.sessions.filter(s=>s.studentId===id);
export const homeworkFor=(data,id)=>data.homework.filter(h=>h.studentId===id);
export const sessionCharge=s=>fee(s.ratePence,s.minutes);
export function financeSummary(data,period=''){const completed=data.sessions.filter(s=>s.status==='completed'&&(!period||month(s.date)===period));return {earned:completed.reduce((a,s)=>a+sessionCharge(s),0),collected:completed.filter(s=>s.paid).reduce((a,s)=>a+sessionCharge(s),0),outstanding:completed.filter(s=>!s.paid).reduce((a,s)=>a+sessionCharge(s),0),sessions:completed.length,minutes:completed.reduce((a,s)=>a+s.minutes,0)};}
export function overview(data,day=localDate()){
 const upcoming=data.sessions.filter(s=>s.status==='planned'&&(s.date>day||(s.date===day))).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 const overdue=data.homework.filter(h=>h.status!=='reviewed'&&h.dueAt<day);
 const needsReview=data.homework.filter(h=>h.status==='submitted');
 return {activeStudents:data.students.filter(x=>x.active).length, upcoming,overdue,needsReview,...financeSummary(data,month(day))};
}
export function studentProgress(data,id){const s=sessionsFor(data,id);const h=homeworkFor(data,id);const scores=h.map(x=>x.score).filter(v=>v!==null);return {lessons:s.filter(x=>x.status==='completed').length,planned:s.filter(x=>x.status==='planned').length,reviewed:h.filter(x=>x.status==='reviewed').length,homework:h.length,averageScore:scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null};}
export function deleteStudent(data,id){if(!data.students.some(s=>s.id===id))return false;data.students=data.students.filter(s=>s.id!==id);data.sessions=data.sessions.filter(s=>s.studentId!==id);data.homework=data.homework.filter(h=>h.studentId!==id);return true;}
export function csvCell(value){let s=String(value??'');if(/^[\s\u0000-\u001f]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
export function exportSessionsCsv(data){const header=['Date','Time','Student','Subject','Topic','Status','Duration (minutes)','Fee GBP','Paid','Objective','Activities','Feedback'];const rows=data.sessions.map(s=>{const student=studentById(data,s.studentId);return [s.date,s.time,student?.name||'',student?.subject||'',s.topic,s.status,s.minutes,(sessionCharge(s)/100).toFixed(2),s.paid?'Yes':'No',s.objective,s.activities,s.feedback]});return '\uFEFF'+[header,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';}
export function createDemo(){const d=localDate();const mon=[d.slice(0,8),String(Math.min(Number(d.slice(-2))+1,28)).padStart(2,'0')].join('');const tomorrow=validDate(mon)&&mon>=d?mon:d;
 return validate({version:1,tutor:{name:'',defaultRatePence:4000},students:[{id:'demo_a',name:'Alex Morgan (demo)',subject:'Biology',level:'GCSE',examBoard:'Edexcel',ratePence:4000,notes:'Practise exam command words and six-mark questions.',active:true},{id:'demo_b',name:'Jamie Chen (demo)',subject:'Mathematics',level:'A Level',examBoard:'AQA',ratePence:4500,notes:'Building confidence with differentiation.',active:true}],sessions:[{id:'demo_s1',studentId:'demo_a',date:d,time:'18:00',minutes:90,ratePence:4000,status:'completed',paid:false,topic:'Cell transport revision',objective:'Compare diffusion, osmosis and active transport',activities:'Quick recall quiz; 6-mark exam practice',feedback:'Good progress; revisit active transport keywords.'},{id:'demo_s2',studentId:'demo_b',date:tomorrow,time:'17:00',minutes:60,ratePence:4500,status:'planned',paid:false,topic:'Parametric differentiation',objective:'Apply chain rule to parametric equations',activities:'Worked examples then exam questions',feedback:''}],homework:[{id:'demo_h1',studentId:'demo_a',assignedAt:d,dueAt:tomorrow,status:'assigned',title:'Cell transport exam practice',instructions:'Answer 10 exam questions, including a 6-marker.',score:null}],updatedAt:''});}
