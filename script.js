'use strict';
/* ===== BEYOND – site logic. Edit only CONFIG. =====
   SHEET_ID: the ID in the Google Sheet URL.
   *_GID: the number after "gid=" in the URL when that tab is open. Used for the raw CSV export,
   which keeps every cell exactly as typed. If it is wrong or missing, the tab name is used instead. */
const CONFIG = { SHEET_ID: '1fdNEuTcdcp4WrXALEOHjiZG9XRlX2IJXZIPwGoRj_p8', RES_TAB: 'Resources', RES_GID: '1057308780', WALL_TAB: 'Wall', WALL_GID: '372891877', RECENT: 6 };
const NAV = [['home','nav_home'],['all','nav_all'],['class8','nav_class8'],['class9','nav_class9'],['class10','nav_class10'],['qbank','nav_qbank'],['exam','nav_exam'],['extra','nav_extra'],['mcq','nav_mcq'],['ask','nav_ask'],['contact','nav_contact'],['wall','nav_wall'],['saved','nav_saved']];
const BNAV = [['home','nav_home'],['class8','nav_class8'],['class9','nav_class9'],['class10','nav_class10'],['mcq','nav_mcq'],['saved','nav_saved']];
/* Subject buttons, in display order. Any subject in the sheet that does not match one of these
   (e.g. Physics, ICT, Higher Math) is grouped under OTHER. */
const SUBJECTS = ['Bangla','English','Math','Science','Biology','Chemistry'];
const OTHER = 'Others';
const ALL_SUBJECTS = [...SUBJECTS, OTHER];
/* Other spellings that count as the same subject. "Bangla 1st Paper", "English 2nd Paper" etc. also match. */
const SUB_ALIAS = { Bangla:['bangla','bengali','বাংলা'], English:['english','ইংরেজি'], Math:['math','maths','mathematics','generalmath','generalmathematics','গণিত'] };
const WALL_CATS = ['A Thought for Today',"A Teacher's Note",'Words of Encouragement','Ask Yourself','Beyond Books','Curiosity Corner','Life Lessons','Questions Worth Asking'];
const POP = ['Acid','Tag Questions','Suggestion','Chapter 5','MCQ','Practical'];
const NEW_DAYS = 7;
/* ---------- MCQ exam sets ----------
   Sample sets to start with. Each question: q, options (4), answer = index of the
   correct option (0-3), exp = short explanation shown in the result.
   To add a set, copy one set object, change id/title/questions. */
const MCQ_SETS = [
{ id:'ict8-1', cls:'8', subject:'ICT', title:'Class 8 ICT — Set 1', desc:'Computer, memory, input & output devices.',
  questions:[
  {q:'CPU-এর পূর্ণরূপ কোনটি?',options:['Central Processing Unit','Computer Personal Unit','Central Program Unit','Computer Processing Unit'],answer:0,exp:'CPU = Central Processing Unit — কম্পিউটারের মস্তিষ্ক।'},
  {q:'নিচের কোনটি ইনপুট ডিভাইস?',options:['Monitor','Printer','Keyboard','Speaker'],answer:2,exp:'Keyboard দিয়ে তথ্য কম্পিউটারে ঢোকানো হয়।'},
  {q:'নিচের কোনটি আউটপুট ডিভাইস?',options:['Mouse','Scanner','Monitor','Keyboard'],answer:2,exp:'Monitor-এ ফলাফল দেখা যায়।'},
  {q:'RAM কেমন মেমোরি?',options:['স্থায়ী মেমোরি','অস্থায়ী মেমোরি','শুধু পড়া যায়','বাইরের মেমোরি'],answer:1,exp:'RAM অস্থায়ী — বিদ্যুৎ বন্ধ হলে এর তথ্য মুছে যায়।'},
  {q:'1 KB সমান কত Byte?',options:['100 Byte','512 Byte','1000 Byte','1024 Byte'],answer:3,exp:'1 KB = 1024 Byte।'},
  {q:'তথ্য স্থায়ীভাবে কোথায় সংরক্ষণ করা হয়?',options:['RAM-এ','Cache-এ','Hard Disk-এ','Register-এ'],answer:2,exp:'Hard Disk স্থায়ী সংরক্ষণের জায়গা।'},
  {q:'MS Word কী ধরনের সফটওয়্যার?',options:['Spreadsheet','Word Processing','Presentation','Database'],answer:1,exp:'MS Word দিয়ে লেখালেখির কাজ করা হয়।'},
  {q:'নিচের কোনটি ইন্টারনেট ব্রাউজার?',options:['MS Word','Chrome','Excel','Paint'],answer:1,exp:'Chrome দিয়ে ওয়েবসাইট দেখা হয়।'},
  {q:'কম্পিউটারে 0 আর 1 দিয়ে কী বোঝানো হয়?',options:['Decimal digit','Binary digit','Roman digit','Hex digit'],answer:1,exp:'কম্পিউটার 0 আর 1 — Binary — দিয়ে কাজ করে।'},
  {q:'নিচের কোনটি হার্ডওয়্যার নয়?',options:['Mouse','Monitor','Windows','Keyboard'],answer:2,exp:'Windows সফটওয়্যার, বাকিগুলো হার্ডওয়্যার।'} ]},
{ id:'chem10-1', cls:'10', subject:'Chemistry', title:'Class 10 Chemistry — Set 1', desc:'Atoms, symbols, acids & everyday chemistry.',
  questions:[
  {q:'পানির রাসায়নিক সংকেত কোনটি?',options:['CO₂','H₂O','O₂','NaCl'],answer:1,exp:'পানি = H₂O — দুটি হাইড্রোজেন আর একটি অক্সিজেন।'},
  {q:'কার্বনের পারমাণবিক সংখ্যা কত?',options:['4','6','8','12'],answer:1,exp:'কার্বনের পারমাণবিক সংখ্যা 6।'},
  {q:'NaCl-কে আমরা কী নামে চিনি?',options:['চুন','খাবার লবণ','বেকিং সোডা','ভিনেগার'],answer:1,exp:'NaCl = সোডিয়াম ক্লোরাইড = খাবার লবণ।'},
  {q:'নিরপেক্ষ দ্রবণের pH কত?',options:['0','5','7','14'],answer:2,exp:'pH 7 মানে নিরপেক্ষ — বিশুদ্ধ পানির pH 7।'},
  {q:'জ্বলতে কোন গ্যাস দরকার হয়?',options:['নাইট্রোজেন','কার্বন ডাই-অক্সাইড','অক্সিজেন','হাইড্রোজেন'],answer:2,exp:'অক্সিজেন ছাড়া আগুন জ্বলে না।'},
  {q:'Fe কোন মৌলের প্রতীক?',options:['সিসা','লোহা','ফ্লোরিন','তামা'],answer:1,exp:'Fe = Iron = লোহা।'},
  {q:'লেবুতে কোন এসিড থাকে?',options:['অ্যাসিটিক এসিড','সাইট্রিক এসিড','সালফিউরিক এসিড','হাইড্রোক্লোরিক এসিড'],answer:1,exp:'লেবুতে সাইট্রিক এসিড থাকে।'},
  {q:'কার্বন ডাই-অক্সাইডের সংকেত কোনটি?',options:['CO','CO₂','O₂','C₂O'],answer:1,exp:'কার্বন ডাই-অক্সাইড = CO₂।'},
  {q:'নিচের কোনটি ধাতু?',options:['অক্সিজেন','নাইট্রোজেন','লোহা','হাইড্রোজেন'],answer:2,exp:'লোহা ধাতু, বাকিগুলো অধাতু/গ্যাস।'},
  {q:'হাইড্রোজেনের পারমাণবিক সংখ্যা কত?',options:['1','2','3','4'],answer:0,exp:'হাইড্রোজেনের পারমাণবিক সংখ্যা 1।'} ]}
];
/* UI text in English and Bangla. Resource titles and descriptions stay exactly as typed in the sheet. */
const STR = {
en:{ nav_home:'Home',nav_all:'All Files',nav_class8:'Class 8',nav_class9:'Class 9',nav_class10:'Class 10',nav_qbank:'Question Bank',nav_exam:'Exam Resources',nav_extra:'Extra Resources',nav_wall:'Words on the Wall',nav_saved:'Saved',nav_search:'Search',nav_mcq:'MCQ Exam',nav_contact:'Contact Us',
notice_h:'BEYOND Notice',notice_empty:'New resources and exam news will appear here.',
courses_h:'Learn by class',courses_sub:'Pick your class and start — notes, questions and practice, chapter by chapter.',
mcq_h:'MCQ Exam',mcq_sub:'Practice with exam-style MCQs. All questions are on one page, top to bottom — answer them all, submit, and see your marks at once.',
mcq_sets:'Choose a set',mcq_q:'questions',mcq_marks:'marks',mcq_start:'Start exam →',mcq_name:'Your name (optional)',mcq_answered:'Answered',mcq_submit:'Submit exam',mcq_result:'Your result',mcq_out_of:'out of',mcq_correct:'Correct',mcq_wrong:'Wrong',mcq_notanswered:'Not answered',mcq_your:'Your answer',mcq_right:'Correct answer',mcq_retry:'Try again',mcq_back:'← Back to all sets',mcq_last:'Last score',mcq_sample:'Sample set — more sets coming soon',
contact_h:'Contact Us',contact_sub:'Send a message, feedback or a suggestion — your teacher will read it.',
all_h:'All Files',all_sub:'Every resource in one place — filter by class, subject, chapter or type.',
sort:'Sort',sort_new:'Newest first',sort_az:'Title A–Z',view_all:'View all files →',
hero_h1:'Welcome to BEYOND',hero_h2:'More than books. More than grades. More than yesterday.',hero_p:'A free learning space where you can explore educational resources, practice questions, develop curiosity, and keep growing.',
nav_ask:'Ask Your Teacher',ask_h:'Ask Your Teacher',ask_sub:'Stuck on a chapter, a question or a problem? Write it here — your teacher will see it and answer.',
ask_name:'Your name (optional)',ask_name_ph:'e.g. Sabbir',ask_class:'Class',ask_subject:'Subject',ask_q:'Your question',ask_q_ph:'Write your question here…',ask_send:'Send question',
ask_ok_t:'Question sent!',ask_ok_m:'Thank you — your teacher will read it and answer soon.',ask_err:'Could not send. Check your connection and try again.',
search_ph:'Try: Chemical Bond, Digestion, Chapter 5, CQ',search_btn:'Search',popular:'Popular searches',subjects:'Subjects',recent:'Recently added',
qbank_h:'Question Bank',qbank_sub:'CQ, SQ, MCQ, board questions and practice sets. Filter by class, subject, chapter and type.',
exam_h:'Exam Resources',exam_sub:'Model tests, revision sheets, suggestions and previous papers.',
extra_h:'Extra Resources',extra_sub:'Books, slides, videos and useful websites for going further.',
wall_h:'WORDS ON THE WALL',wall_sub:'Thoughts to remember. Questions to consider. Words to carry.',
class_sub:'Notes, worksheets, questions and more, organised chapter by chapter.',
search_h:'Search',search_empty_t:'Search BEYOND',search_empty_m:'Type a topic, chapter or question type to begin.',
no_results_t:'No results',no_results_m:'Try a shorter word, check the spelling, or clear the filters.',
nothing_t:'Nothing found yet',nothing_m:'Try another word, or clear the filters.',
no_res_t:'No resources yet',no_res_m:'New materials will appear here as soon as they are added.',
load_err_t:'Could not load resources',load_err_m:'Check your internet connection, then',retry:'try again',
setup_t:'Almost ready',setup_m:'The resource list has not been connected yet.',
clear:'Clear filters',all:'All',all_subjects:'All subjects',resources:'{n} resources',resources_one:'1 resource',results_for:'{n} results for “{q}”',results_for_one:'1 result for “{q}”',
view:'View',open:'Open',download:'Download',soon:'Link coming soon',save:'Save',saved:'Saved',new:'NEW',
on_wall:'On the wall',footer:'An independent learning space, built around the belief that knowledge should be accessible to everyone.',
empty_wall_t:'The wall is quiet for now',empty_wall_m:'New words will appear here soon.',
saved_h:'Saved resources',saved_sub:'Your saved resources, kept in this browser.',
saved_empty_t:'Nothing saved yet',saved_empty_m:'Tap Save on any resource to keep it here.',
cls:'Class',subject:'Subject',chapter:'Chapter',type:'Type' },
bn:{ nav_home:'হোম',nav_all:'সব ফাইল',nav_class8:'ক্লাস ৮',nav_class9:'ক্লাস ৯',nav_class10:'ক্লাস ১০',nav_qbank:'প্রশ্ন ব্যাংক',nav_exam:'পরীক্ষার রিসোর্স',nav_extra:'অতিরিক্ত রিসোর্স',nav_wall:'দেয়ালের কথা',nav_saved:'সেভ করা',nav_search:'খুঁজুন',nav_mcq:'MCQ পরীক্ষা',nav_contact:'যোগাযোগ',
notice_h:'BEYOND নোটিশ',notice_empty:'নতুন রিসোর্স আর পরীক্ষার খবর এখানে দেখা যাবে।',
courses_h:'ক্লাস অনুযায়ী শেখো',courses_sub:'তোমার ক্লাস বেছে নাও আর শুরু করো — নোট, প্রশ্ন আর প্র্যাকটিস, অধ্যায় অনুযায়ী।',
mcq_h:'MCQ পরীক্ষা',mcq_sub:'পরীক্ষার মতো MCQ দিয়ে প্র্যাকটিস করো। সব প্রশ্ন এক পেজে, উপর থেকে নিচে থাকবে — সবগুলোর উত্তর দিয়ে সাবমিট করলেই মার্কস দেখতে পাবে।',
mcq_sets:'সেট বেছে নাও',mcq_q:'টি প্রশ্ন',mcq_marks:'মার্কস',mcq_start:'পরীক্ষা শুরু করো →',mcq_name:'তোমার নাম (ঐচ্ছিক)',mcq_answered:'উত্তর দিয়েছো',mcq_submit:'পরীক্ষা জমা দাও',mcq_result:'তোমার ফলাফল',mcq_out_of:'এর মধ্যে',mcq_correct:'সঠিক',mcq_wrong:'ভুল',mcq_notanswered:'উত্তর দাওনি',mcq_your:'তোমার উত্তর',mcq_right:'সঠিক উত্তর',mcq_retry:'আবার চেষ্টা করো',mcq_back:'← সব সেটে ফিরে যাও',mcq_last:'শেষ স্কোর',mcq_sample:'নমুনা সেট — আরও সেট শীঘ্রই আসছে',
contact_h:'যোগাযোগ',contact_sub:'মেসেজ, মতামত বা পরামর্শ পাঠাও — তোমার শিক্ষক পড়বেন।',
all_h:'সব ফাইল',all_sub:'সব রিসোর্স এক জায়গায় — ক্লাস, বিষয়, অধ্যায় বা ধরন দিয়ে ফিল্টার করো।',
sort:'সাজান',sort_new:'নতুন আগে',sort_az:'নাম অনুযায়ী (A–Z)',view_all:'সব ফাইল দেখুন →',
hero_h1:'BEYOND-এ স্বাগতম',hero_h2:'বইয়ের চেয়ে বেশি। গ্রেডের চেয়ে বেশি। গতকালের চেয়ে বেশি।',hero_p:'একটি ফ্রি শেখার জায়গা — এখানে পড়ার রিসোর্স, প্র্যাকটিস প্রশ্ন পাবে, কৌতূহল বাড়বে আর এগিয়ে যাবে।',
nav_ask:'শিক্ষককে জিজ্ঞেস করো',ask_h:'শিক্ষককে জিজ্ঞেস করো',ask_sub:'কোনো অধ্যায়, প্রশ্ন বা অঙ্কে আটকে গেছো? এখানে লেখো — তোমার শিক্ষক দেখবেন আর উত্তর দেবেন।',
ask_name:'তোমার নাম (ঐচ্ছিক)',ask_name_ph:'যেমন: সাব্বির',ask_class:'ক্লাস',ask_subject:'বিষয়',ask_q:'তোমার প্রশ্ন',ask_q_ph:'তোমার প্রশ্ন এখানে লেখো…',ask_send:'প্রশ্ন পাঠাও',
ask_ok_t:'প্রশ্ন পাঠানো হয়েছে!',ask_ok_m:'ধন্যবাদ — তোমার শিক্ষক পড়বেন আর শীঘ্রই উত্তর দেবেন।',ask_err:'পাঠানো যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করো।',
search_ph:'খুঁজুন: Chemical Bond, Digestion, Chapter 5, CQ',search_btn:'খুঁজুন',popular:'জনপ্রিয় খোঁজ',subjects:'বিষয়সমূহ',recent:'সম্প্রতি যোগ হয়েছে',
qbank_h:'প্রশ্ন ব্যাংক',qbank_sub:'CQ, SQ, MCQ, বোর্ড প্রশ্ন আর প্র্যাকটিস সেট। ক্লাস, বিষয়, অধ্যায় আর ধরন দিয়ে ফিল্টার করো।',
exam_h:'পরীক্ষার রিসোর্স',exam_sub:'মডেল টেস্ট, রিভিশন শিট, সাজেশন আর আগের বছরের প্রশ্ন।',
extra_h:'অতিরিক্ত রিসোর্স',extra_sub:'আরও এগিয়ে যাওয়ার জন্য বই, স্লাইড, ভিডিও আর দরকারি ওয়েবসাইট।',
wall_h:'দেয়ালের কথা',wall_sub:'মনে রাখার মতো কথা। ভাবার মতো প্রশ্ন। সাথে নেওয়ার মতো শব্দ।',
class_sub:'নোট, ওয়ার্কশিট, প্রশ্নসহ আরও অনেক কিছু — অধ্যায় অনুযায়ী সাজানো।',
search_h:'খুঁজুন',search_empty_t:'BEYOND খুঁজুন',search_empty_m:'শুরু করতে একটি বিষয়, অধ্যায় বা প্রশ্নের ধরন লেখো।',
no_results_t:'কোনো ফলাফল নেই',no_results_m:'ছোট শব্দ লিখে দেখো, বানান দেখে নাও, বা ফিল্টার মুছে ফেলো।',
nothing_t:'এখনো কিছু পাওয়া যায়নি',nothing_m:'অন্য শব্দ লিখে দেখো, বা ফিল্টার মুছে ফেলো।',
no_res_t:'এখনো কোনো রিসোর্স নেই',no_res_m:'নতুন কিছু যোগ হলেই এখানে দেখা যাবে।',
load_err_t:'রিসোর্স লোড করা যায়নি',load_err_m:'ইন্টারনেট সংযোগ দেখে',retry:'আবার চেষ্টা করো',
setup_t:'প্রায় প্রস্তুত',setup_m:'রিসোর্সের তালিকা এখনো যুক্ত করা হয়নি।',
clear:'ফিল্টার মুছুন',all:'সবগুলো',all_subjects:'সব বিষয়',resources:'{n} টি রিসোর্স',resources_one:'১ টি রিসোর্স',results_for:'“{q}” এর জন্য {n} টি ফলাফল',results_for_one:'“{q}” এর জন্য ১ টি ফলাফল',
view:'দেখুন',open:'খুলুন',download:'ডাউনলোড',soon:'লিংক শীঘ্রই আসছে',save:'সেভ করুন',saved:'সেভ করা',new:'নতুন',
on_wall:'দেয়ালে',footer:'একটি স্বাধীন শেখার জায়গা — জ্ঞান সবার জন্য সহজলভ্য হওয়া উচিত, এই বিশ্বাস থেকে তৈরি।',
empty_wall_t:'দেয়াল এখন শান্ত',empty_wall_m:'নতুন কথা এলে এখানে দেখা যাবে।',
saved_h:'সেভ করা রিসোর্স',saved_sub:'তোমার সেভ করা রিসোর্সগুলো, এই ব্রাউজারে রাখা আছে।',
saved_empty_t:'এখনো কিছু সেভ করোনি',saved_empty_m:'যেকোনো রিসোর্সে Save চাপলেই সেটা এখানে থাকবে।',
cls:'ক্লাস',subject:'বিষয়',chapter:'অধ্যায়',type:'ধরন' }
};
const store = { get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }, set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} } };
const state = { res:[], wall:[], status:'loading', q:'', f:{}, lang: store.get('beyond-lang')==='bn' ? 'bn' : 'en', mcq:{ setId:null, answers:{}, submitted:false, name:'' } };
const mcqSet = () => MCQ_SETS.find(s=>s.id===state.mcq.setId) || null;
const mcqLast = id => { try{ const v=JSON.parse(store.get('beyond-mcq-last')||'{}'); return v[id]||null; }catch(e){ return null; } };
const mcqSaveLast = (id,score,total) => { try{ const v=JSON.parse(store.get('beyond-mcq-last')||'{}'); v[id]={score,total,at:Date.now()}; store.set('beyond-mcq-last',JSON.stringify(v)); }catch(e){} };
const t = (k,v) => { let s=(STR[state.lang]&&STR[state.lang][k])||STR.en[k]||k; if(v) for(const key in v) s=s.split('{'+key+'}').join(v[key]); return s; };
const num = n => state.lang==='bn' ? String(n).replace(/[0-9]/g,d=>'০১২৩৪৫৬৭৮৯'[d]) : String(n);
const rc = n => n===1 ? t('resources_one') : t('resources',{n});
const rf = (n,q) => n===1 ? t('results_for_one',{q}) : t('results_for',{n,q});
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- bookmarks (saved in this browser) ---------- */
const savedIds = () => { try{ const v=JSON.parse(store.get('beyond-saved')||'[]'); return Array.isArray(v)?v:[]; }catch(e){ return []; } };
const isSaved = id => savedIds().indexOf(id)>=0;
function toggleSave(id){ const s=savedIds(); const i=s.indexOf(id); if(i>=0) s.splice(i,1); else s.push(id); store.set('beyond-saved',JSON.stringify(s)); render(); }

/* ---------- data ---------- */
function parseCSV(t){
  const rows=[]; let r=[], c='', q=false;
  for(let i=0;i<t.length;i++){
    const ch=t[i];
    if(q){ if(ch==='"'){ if(t[i+1]==='"'){c+='"';i++;} else q=false; } else c+=ch; }
    else if(ch==='"') q=true;
    else if(ch===','){ r.push(c); c=''; }
    else if(ch==='\n'||ch==='\r'){ if(ch==='\r'&&t[i+1]==='\n') i++; r.push(c); rows.push(r); r=[]; c=''; }
    else c+=ch;
  }
  if(c||r.length){ r.push(c); rows.push(r); }
  return rows;
}
/* Header aliases so small wording changes in the sheet still match. */
const ALIAS = { url:'fileurl', link:'fileurl', file:'fileurl', type:'resourcetype', date:'uploaddate', publishdate:'publicationdate', visible:'visibility', show:'visibility' };
const normKey = h => { const k=String(h).replace(/^\uFEFF/,'').toLowerCase().replace(/[^a-z]/g,''); return ALIAS[k]||k; };
async function getCSV(url){
  const res=await fetch(url,{cache:'no-store'});
  if(!res.ok) throw new Error('HTTP '+res.status+' for '+url);
  const type=res.headers.get('content-type')||'';
  if(!/csv|text\/plain/i.test(type)) throw new Error('Not CSV ('+type+') for '+url);
  const rows=parseCSV(await res.text());
  if(!rows.length||!rows[0].map(normKey).includes('title')) throw new Error('No "Title" header in '+url);
  return rows;
}
async function fetchTab(tab,gid){
  const base=`https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}`;
  /* gviz: headers=1 stops Google merging data rows into the header row. */
  const gviz=`${base}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
  let rows;
  if(gid){
    try{ rows=await getCSV(`${base}/export?format=csv&gid=${encodeURIComponent(gid)}`); }
    catch(e){ console.warn('Export failed, using gviz:',e.message); }
  }
  if(!rows) rows=await getCSV(gviz);
  const keys=rows[0].map(normKey);
  return rows.slice(1).map(r=>{ const o={}; keys.forEach((k,i)=>{ if(k&&!(k in o&&o[k])) o[k]=(r[i]||'').trim(); }); return o; });
}
const SHOW=['yes','y','true','show','visible','1'];
const isOn = v => SHOW.includes((v||'').toLowerCase());
const yes = v => ['yes','y','true','1'].includes((v||'').toLowerCase());
function pd(s){
  if(!s) return 0; s=s.trim();
  let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if(m) return Date.UTC(+m[1],m[2]-1,+m[3]);
  m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/); if(m) return Date.UTC(+m[3],m[2]-1,+m[1]);
  const t2=Date.parse(s); return isNaN(t2)?0:t2;
}
const fmt = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}) : '';
function subjectGroup(raw){
  const t2=String(raw||'').trim().toLowerCase(), k=t2.replace(/[^a-z]/g,'');
  for(const s of SUBJECTS){
    const names=[s.toLowerCase(),...(SUB_ALIAS[s]||[])];
    if(names.some(n=>/^[a-z]+$/.test(n)?k.startsWith(n):t2.startsWith(n))) return s;
  }
  return OTHER;
}
function mapRes(o){
  const cm=(o.class||'').match(/\b(8|9|10)\b/);
  const sub=SUBJECTS.find(s=>s.toLowerCase()===(o.subject||'').toLowerCase())||o.subject;
  return { id:o.id, title:o.title, cls:cm?cm[1]:'', subject:sub, grp:subjectGroup(o.subject), chapter:o.chapter, cat:o.category, type:o.resourcetype,
    desc:o.description, kw:o.keywords, url:o.fileurl, date:pd(o.uploaddate), feat:yes(o.featured), on:isOn(o.visibility) };
}
function kind(r){ const c=(r.cat||'').toLowerCase(); return c.includes('question')?'qbank':c.includes('exam')?'exam':c.includes('extra')?'extra':'class'; }
const byDate = (a,b) => b.date-a.date;
async function load(){
  state.status='loading'; render();
  if(CONFIG.SHEET_ID.startsWith('PASTE')){ state.status='setup'; render(); return; }
  try{
    const [r,w]=await Promise.all([fetchTab(CONFIG.RES_TAB,CONFIG.RES_GID),fetchTab(CONFIG.WALL_TAB,CONFIG.WALL_GID)]);
    state.res=r.filter(o=>o.title).map((o,i)=>({...mapRes(o),_i:i})).filter(x=>x.on).sort((a,b)=>b.date-a.date||b._i-a._i);
    state.wall=w.filter(o=>o.title&&o.content).map(o=>({id:o.id,title:o.title,content:o.content,cat:o.category,date:pd(o.publicationdate||o.uploaddate),feat:yes(o.featured),on:isOn(o.visibility)})).filter(x=>x.on).sort(byDate);
    state.status='ok';
  }catch(e){ console.error(e); state.status='error'; }
  render();
}

/* ---------- smart links ---------- */
function links(url){
  url=(url||'').trim(); if(!url) return {};
  const d=url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/);
  if(d) return { view:`https://drive.google.com/file/d/${d[1]}/preview`, dl:`https://drive.google.com/uc?export=download&id=${d[1]}` };
  if(/docs\.google\.com\/(document|presentation|spreadsheets)\//.test(url))
    return { view:url.replace(/\/(edit|view|preview)?([?#].*)?$/,'/preview') };
  return /^https?:\/\//i.test(url) ? { view:url } : {};
}

/* ---------- pieces ---------- */
const subSlug = s => (String(s||'Others').toLowerCase().replace(/[^a-z]/g,'') || 'others');
const isNew = r => !!r.date && r.date <= Date.now()+864e5 && Date.now()-r.date <= NEW_DAYS*864e5;
const empty = (tt,mm) => `<div class="empty"><strong>${tt}</strong>${mm}</div>`;
const skeleton = n => `<div class="grid">${'<div class="sk"></div>'.repeat(n)}</div>`;
function card(r){
  const l=links(r.url);
  const ch=r.chapter?(/^\d+$/.test(r.chapter)?t('chapter')+' '+num(r.chapter):r.chapter):'';
  const meta=[r.cls?t('cls')+' '+num(r.cls):'',r.subject,ch].filter(Boolean).join(' · ');
  const open = l.view ? `<a class="btn" href="${esc(l.view)}" target="_blank" rel="noopener noreferrer">${l.dl?t('view'):t('open')}</a>` : '<span class="soon">'+t('soon')+'</span>';
  const dl = l.dl ? `<a class="btn ghost" href="${esc(l.dl)}" target="_blank" rel="noopener noreferrer">${t('download')}</a>` : '';
  const sv = `<button type="button" class="btn ghost save${isSaved(r.id)?' on':''}" data-save="${esc(r.id)}" aria-pressed="${isSaved(r.id)}">${isSaved(r.id)?'★ '+t('saved'):'☆ '+t('save')}</button>`;
  return `<article class="card"><div class="row"><span class="badges"><span class="badge sb-${subSlug(r.grp)}">${esc(r.type||r.cat||'Resource')}</span>${isNew(r)?`<span class="new">${t('new')}</span>`:''}</span><time>${fmt(r.date)}</time></div>
  <h3>${esc(r.title)}</h3><p class="meta">${esc(meta)}</p>${r.desc?`<p class="desc">${esc(r.desc)}</p>`:''}<div class="actions">${open}${dl}${sv}</div></article>`;
}
function wallCard(w){
  return `<article class="wc${w.feat?' feat':''}"><span class="cat">${esc(w.cat)}</span><h3>${esc(w.title)}</h3><p>${esc(w.content).replace(/\n/g,'<br>')}</p>${w.date?`<time>${fmt(w.date)}</time>`:''}</article>`;
}
/* Empty values are dropped, so a blank chapter can no longer add a second "All" option. */
const uniq = (items,k) => [...new Set(items.map(r=>r[k]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));
function bar(v,items,fields,f,extra=''){
  const sel=fields.map(k=>`<label>${t(k)}<select data-v="${v}" data-k="${k}"><option value="">${t('all')}</option>${uniq(items,k).map(o=>`<option${f[k]===String(o)?' selected':''} value="${esc(o)}">${esc(k==='cls'?t('cls')+' '+num(o):k==='chapter'?num(o):o)}</option>`).join('')}</select></label>`).join('');
  return `<div class="filters">${sel}${extra}<button class="link" data-clear="${v}">${t('clear')}</button></div>`;
}
function listView(v,items,fields,head,sub,pre=''){
  const f=state.f[v]||(state.f[v]={});
  let shown=items.filter(r=>fields.every(k=>!f[k]||String(r[k])===f[k]));
  const sort=f.sort||'new';
  if(sort==='az') shown=[...shown].sort((a,b)=>String(a.title).localeCompare(String(b.title)));
  const sortSel=`<label>${t('sort')}<select data-v="${v}" data-sort><option value="new"${sort==='new'?' selected':''}>${t('sort_new')}</option><option value="az"${sort==='az'?' selected':''}>${t('sort_az')}</option></select></label>`;
  return `<section class="wrap"><h1>${head}</h1><p class="sub">${sub}</p>${pre}${bar(v,items,fields,f,sortSel)}
  <p class="count">${rc(shown.length)}</p>${shown.length?`<div class="grid">${shown.map(card).join('')}</div>`:empty(t('nothing_t'),t('nothing_m'))}</section>`;
}
const sform = (cls='') => `<form class="sform ${cls}" role="search"><input type="search" name="q" value="${esc(state.q)}" placeholder="${esc(t('search_ph'))}" aria-label="Search BEYOND" autocomplete="off"><button type="submit">${t('search_btn')}</button></form>`;

/* ---------- views ---------- */
const V = {
  home(){
    const recent=state.res.slice(0,CONFIG.RECENT);
    const quick=[['class8','nav_class8'],['class9','nav_class9'],['class10','nav_class10'],['all','nav_all'],['qbank','nav_qbank'],['mcq','nav_mcq'],['exam','nav_exam'],['extra','nav_extra'],['ask','nav_ask'],['contact','nav_contact']];
    const cls=n=>`<div class="cls"><h3>${t('cls')} ${num(n)}</h3><div class="subs">${ALL_SUBJECTS.map(s=>`<button class="sc sb-${subSlug(s)}" data-go="class${n}" data-sub="${s}"><small>${t('cls')} ${num(n)}</small>${s}</button>`).join('')}</div></div>`;
    const pop=`<div class="pop"><span>${t('popular')}</span>${POP.map(q=>`<button type="button" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>`;
    /* BEYOND Notice — like AAPathshala's "Pathshala Barta": the newest
       resources, so students see what's new at a glance. */
    const notices=state.res.slice(0,5);
    const noticeHtml = state.status==='loading' ? skeleton(1)
      : notices.length ? `<div class="ticker">${notices.map(r=>`<a href="#all">• ${esc(r.title)}</a>`).join('')}</div>`
      : `<p class="sub">${t('notice_empty')}</p>`;
    const courseCard=n=>{
      const count=state.res.filter(r=>r.cls===String(n)).length;
      const subs=[...new Set(state.res.filter(r=>r.cls===String(n)).map(r=>r.grp))].filter(Boolean);
      return `<article class="course"><span class="course-n">${num(n)}</span><h3>${t('cls')} ${num(n)}</h3>
      <p>${rc(count)}${subs.length?' · '+subs.join(', '):''}</p>
      <a class="btn" href="#class${n}">${t('cls')} ${num(n)} →</a></article>`;
    };
    return `<section class="hero"><div class="in"><h1>${t('hero_h1')}</h1><h2>${t('hero_h2')}</h2>
    <p>${t('hero_p')}</p>${sform()}${pop}</div></section>
    <section class="notice"><div class="wrap"><h2>📢 ${t('notice_h')}</h2>${noticeHtml}</div></section>
    <section class="wrap"><div class="quick">${quick.map(([h,k])=>`<a class="qa" href="#${h}">${t(k)}</a>`).join('')}</div>
    <h2>${t('courses_h')}</h2><p class="sub">${t('courses_sub')}</p>
    <div class="course-grid">${courseCard(8)}${courseCard(9)}${courseCard(10)}
    <article class="course mcq-card"><span class="course-n">?</span><h3>${t('nav_mcq')}</h3>
    <p>${t('mcq_sub')}</p><a class="btn" href="#mcq">${t('mcq_start')}</a></article></div>
    <h2>${t('subjects')}</h2>${cls(8)}${cls(9)}${cls(10)}
    <div class="sec"><h2>${t('recent')}</h2></div>${body(recent.length?`<div class="grid">${recent.map(card).join('')}</div>`:empty(t('no_res_t'),t('no_res_m')),CONFIG.RECENT)}<p class="more"><a href="#all">${t('view_all')}</a></p></section>`;
  },
  classView(n){
    const v='class'+n, f=state.f[v]||(state.f[v]={});
    /* Show every resource of this class here, whatever its category is.
       (Before, only "Class Resources" were shown, so e.g. the Bangla
       suggestions — Category "Exam Resources" — never appeared under Bangla.) */
    const all=state.res.filter(r=>r.cls===String(n));
    const items=all.filter(r=>!f.subject||r.grp===f.subject);
    const chips=`<div class="chips">${['',...ALL_SUBJECTS].map(s=>`<button class="chip sb-${subSlug(s)}${(f.subject||'')===s?' on':''}" data-chip="${v}" data-sub="${s}">${s||t('all_subjects')}</button>`).join('')}</div>`;
    return listView(v,items,['chapter','type'],t('cls')+' '+num(n),t('class_sub'),chips);
  },
  qbank(){ return listView('qbank',state.res.filter(r=>kind(r)==='qbank'),['cls','subject','chapter','type'],t('qbank_h'),t('qbank_sub')); },
  /* All Files: every resource in one place. */
  all(){ return listView('all',state.res,['cls','subject','chapter','type'],t('all_h'),t('all_sub')); },
  exam(){ return listView('exam',state.res.filter(r=>kind(r)==='exam'),['cls','subject','type'],t('exam_h'),t('exam_sub')); },
  extra(){ return listView('extra',state.res.filter(r=>kind(r)==='extra'),['type'],t('extra_h'),t('extra_sub')); },
  wall(){
    const f=state.f.wall||(state.f.wall={});
    const items=state.wall.filter(w=>!f.cat||w.cat===f.cat);
    const sorted=[...items.filter(w=>w.feat),...items.filter(w=>!w.feat)];
    const chips=`<div class="chips">${['',...WALL_CATS].map(c=>`<button class="chip${(f.cat||'')===c?' on':''}" data-wcat="${esc(c)}">${esc(c||t('all'))}</button>`).join('')}</div>`;
    return `<section class="wrap"><h1>${t('wall_h')}</h1><p class="sub">${t('wall_sub')}</p>${chips}
    ${body(sorted.length?`<div class="wall">${sorted.map(wallCard).join('')}</div>`:empty(t('empty_wall_t'),t('empty_wall_m')),2)}</section>`;
  },
  /* Ask Your Teacher: the real Google Form embedded in the page.
     Posting to formResponse from our own form never landed (Google
     silently drops posts that don't come from its own form page —
     fetch and hidden-iframe posts both failed in tests), while
     submitting on the Google Form page itself always lands. So the
     Ask page embeds the form directly; answers land in its
     Responses tab. */
  ask(){
    const GF='https://docs.google.com/forms/d/e/1FAIpQLSdsyC6OU35gbcDId3SC5JY8Gb-rp8RHGwzmRqCGeGX3iJP_Bg/viewform?embedded=true';
    return `<section class="wrap narrow"><h1>${t('ask_h')}</h1><p class="sub">${t('ask_sub')}</p>
    <iframe class="gform-embed" src="${GF}" width="100%" height="820" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe></section>`;
  },
  /* MCQ Exam: all questions on one page, top to bottom. Submit once at
     the bottom — marks + correct/wrong review appear right away. */
  mcq(){
    const set=mcqSet();
    if(!set){
      const cards=MCQ_SETS.map(s=>{
        const last=mcqLast(s.id);
        return `<article class="course"><span class="course-n">${num(s.cls)}</span><h3>${esc(s.title)}</h3>
        <p>${esc(s.desc)}</p><p class="meta">${s.questions.length} ${t('mcq_q')} · ${s.questions.length} ${t('mcq_marks')}</p>
        ${last?`<p class="meta">${t('mcq_last')}: ${num(last.score)}/${num(last.total)}</p>`:''}
        <button type="button" class="btn" data-mcq-set="${esc(s.id)}">${t('mcq_start')}</button></article>`;
      }).join('');
      return `<section class="wrap"><h1>${t('mcq_h')}</h1><p class="sub">${t('mcq_sub')}</p>
      <p class="sub">${t('mcq_sample')}</p><div class="course-grid">${cards}</div></section>`;
    }
    const m=state.mcq, total=set.questions.length;
    if(m.submitted){
      let score=0;
      const review=set.questions.map((qq,i)=>{
        const picked=m.answers[i];
        const ok=picked===qq.answer;
        if(ok) score++;
        const cls2=picked==null?'unans':ok?'ok':'bad';
        const your=picked==null?t('mcq_notanswered'):esc(qq.options[picked]);
        return `<div class="q ${cls2}"><p><strong>${num(i+1)}.</strong> ${esc(qq.q)}</p>
        <p class="meta">${t('mcq_your')}: <strong>${your}</strong></p>
        <p class="meta">${t('mcq_right')}: <strong>${esc(qq.options[qq.answer])}</strong></p>
        ${qq.exp?`<p class="meta">${esc(qq.exp)}</p>`:''}</div>`;
      }).join('');
      const pct=Math.round(score/total*100);
      return `<section class="wrap narrow2"><div class="result"><h1>${t('mcq_result')}</h1>
      <p class="score"><strong>${num(score)}</strong> / ${num(total)}</p>
      <p>${num(pct)}% · ${num(score)} ${t('mcq_correct')} · ${num(total-score)} ${t('mcq_wrong')}</p>
      ${m.name?`<p class="meta">${esc(m.name)}</p>`:''}</div>
      <div class="qlist">${review}</div>
      <div class="actions"><button type="button" class="btn" data-mcq-retry>${t('mcq_retry')}</button>
      <button type="button" class="btn ghost" data-mcq-back>${t('mcq_back')}</button></div></section>`;
    }
    const answered=Object.keys(m.answers).length;
    const qs=set.questions.map((qq,i)=>`<div class="q"><p><strong>${num(i+1)}.</strong> ${esc(qq.q)}</p>
      <div class="opts">${qq.options.map((o,j)=>`<label><input type="radio" name="mq${i}" value="${j}" data-mcq-q="${i}"${m.answers[i]===j?' checked':''}> ${esc(o)}</label>`).join('')}</div></div>`).join('');
    return `<section class="wrap narrow2"><h1>${esc(set.title)}</h1><p class="sub">${esc(set.desc)} · ${total} ${t('mcq_q')} · ${total} ${t('mcq_marks')}</p>
    <label class="mcq-name">${t('mcq_name')}<input type="text" id="mcqname" value="${esc(m.name)}" placeholder=""></label>
    <p class="count" id="mcqcount">${t('mcq_answered')}: ${num(answered)} / ${num(total)}</p>
    <div class="qlist">${qs}</div>
    <div class="actions"><button type="button" class="btn" data-mcq-submit>${t('mcq_submit')}</button>
    <button type="button" class="btn ghost" data-mcq-back>${t('mcq_back')}</button></div></section>`;
  },
  /* Contact Us: the real Google Form embedded in the page (same lesson as
     Ask Your Teacher — posts from our own form never land in Google,
     submitting on Google's own form page always does). Messages land in
     the "Contact Us — BEYOND" form's Responses tab. */
  contact(){
    const GF='https://docs.google.com/forms/d/e/1FAIpQLScUcDm0rJ83QPwM5SW0pZ-Ns2pvBhs3nJFg0WTLPosXSarn3g/viewform?embedded=true';
    return `<section class="wrap narrow"><h1>${t('contact_h')}</h1><p class="sub">${t('contact_sub')}</p>
    <iframe class="gform-embed" src="${GF}" width="100%" height="820" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe></section>`;
  },
  saved(){
    const ids=savedIds();
    const items=state.res.filter(r=>ids.indexOf(r.id)>=0);
    return `<section class="wrap"><h1>${t('saved_h')}</h1><p class="sub">${t('saved_sub')}</p>
    <p class="count">${rc(items.length)}</p>${body(items.length?`<div class="grid">${items.map(card).join('')}</div>`:empty(t('saved_empty_t'),t('saved_empty_m')),3)}</section>`;
  },
  search(){
    const f=state.f.search||(state.f.search={});
    const toks=state.q.toLowerCase().split(/\s+/).filter(Boolean);
    const hay=r=>[r.title,r.kw,r.subject,r.grp,r.chapter,r.chapter&&'chapter '+r.chapter,r.desc,r.cat,r.type,r.cls&&'class '+r.cls].join(' ').toLowerCase();
    const hits=toks.length?state.res.filter(r=>{const h=hay(r);return toks.every(tok=>h.includes(tok));}):[];
    const shown=hits.filter(r=>['cls','subject','chapter','type'].every(k=>!f[k]||String(r[k])===f[k]));
    const hasF=Object.values(f).some(Boolean);
    const wh=toks.length&&!hasF?state.wall.filter(w=>{const h=[w.title,w.content,w.cat].join(' ').toLowerCase();return toks.every(tok=>h.includes(tok));}):[];
    let out;
    if(!toks.length) out=empty(t('search_empty_t'),t('search_empty_m'));
    else if(!shown.length&&!wh.length) out=empty(t('no_results_t'),t('no_results_m'));
    else out=(shown.length?`<div class="grid">${shown.map(card).join('')}</div>`:'')+(wh.length?`<div class="sec"><h2>${t('on_wall')}</h2></div><div class="wall">${wh.map(wallCard).join('')}</div>`:'');
    return `<section class="wrap"><h1>${t('search_h')}</h1>${sform('plain')}${toks.length?bar('search',hits,['cls','subject','chapter','type'],f)+`<p class="count">${rf(shown.length+wh.length,state.q)}</p>`:''}${body(out,3)}</section>`;
  }
};
/* loading / error / setup wrapper */
function body(html,n){
  if(state.status==='loading') return skeleton(n||3);
  if(state.status==='setup') return `<div class="empty"><strong>${t('setup_t')}</strong>${t('setup_m')}</div>`;
  if(state.status==='error') return `<div class="err"><strong>${t('load_err_t')}</strong>${t('load_err_m')} <button class="link" data-retry>${t('retry')}</button>${state.lang==='bn'?'।':'.'}</div>`;
  return html;
}

/* ---------- router ---------- */
function render(){
  const h=(location.hash||'#home').slice(1);
  const name=V[h]?h:/^class(8|9|10)$/.test(h)?h:'home';
  const labels=Object.fromEntries(NAV.map(([k,key])=>[k,t(key)]));
  let html;
  if(name==='home') html=V.home();
  else if(name==='ask') html=V.ask();
  else if(name==='mcq') html=V.mcq();
  else if(name==='contact') html=V.contact();
  else if(state.status!=='ok') html=`<section class="wrap"><h1>${esc(labels[name]||t('nav_search'))}</h1>${body('',3)}</section>`;
  else if(name.startsWith('class')) html=V.classView(name.slice(5));
  else html=V[name]();
  const app=$('#app');
  app.className=name==='wall'?'wallpg':'';
  app.innerHTML=html;
  document.title=(labels[name]&&name!=='home'?labels[name]+' – ':'')+'BEYOND – Learn. Think. Grow.';
  document.documentElement.lang=state.lang==='bn'?'bn':'en';
  $('#menu').innerHTML=NAV.map(([k,key])=>{
    let s=`<a href="#${k}"${k===name?' class="on" aria-current="page"':''}>${t(key)}</a>`;
    /* Chapter links under Class 9 / Class 10, so students can jump straight
       to a chapter from the menu (mobile). "All" is not a chapter. */
    if(k==='class8'||k==='class9'||k==='class10'){
      const n=k.slice(5);
      const skip=c=>['all','n/a','na','-'].includes(String(c).toLowerCase());
      const chs=uniq(state.res.filter(r=>r.cls===n),'chapter').filter(c=>c&&!skip(c));
      s+=chs.map(c=>`<a class="sub" href="#${k}" data-chapter="${k}" data-ch="${esc(c)}">${esc(c)}</a>`).join('');
    }
    return s;
  }).join('');
  $('#bnav').innerHTML=BNAV.map(([k,key])=>`<a href="#${k}"${k===name?' class="on" aria-current="page"':''}>${t(key)}</a>`).join('');
  const lb=$('#langbtn'); if(lb) lb.textContent=state.lang==='bn'?'EN':'বাংলা';
  const ft=$('#foot'); if(ft) ft.textContent=t('footer');
  setMenu(false);
}
let lastView='';
function onHash(){ render(); const v=(location.hash||'#home'); if(v!==lastView){ window.scrollTo(0,0); lastView=v; } }

/* ---------- events ---------- */
function setMenu(o){ document.body.classList.toggle('open',o); $('#burger').setAttribute('aria-expanded',o); $('#burger').setAttribute('aria-label',o?'Close menu':'Open menu'); }
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-go],[data-chip],[data-wcat],[data-clear],[data-retry],[data-q],[data-save],[data-chapter],[data-mcq-set],[data-mcq-submit],[data-mcq-retry],[data-mcq-back],#burger,#scrim,#menu a,#langbtn');
  if(!el) return;
  if(el.dataset.mcqSet!==undefined){ state.mcq={setId:el.dataset.mcqSet,answers:{},submitted:false,name:''}; if(location.hash==='#mcq') render(); else location.hash='mcq'; return; }
  if(el.dataset.mcqBack!==undefined){ state.mcq={setId:null,answers:{},submitted:false,name:''}; return render(); }
  if(el.dataset.mcqRetry!==undefined){ const id=state.mcq.setId; state.mcq={setId:id,answers:{},submitted:false,name:state.mcq.name}; return render(); }
  if(el.dataset.mcqSubmit!==undefined){
    const set=mcqSet(); if(!set) return;
    const nameEl=document.getElementById('mcqname'); state.mcq.name=nameEl?nameEl.value.trim():'';
    const un=set.questions.length-Object.keys(state.mcq.answers).length;
    if(un>0 && !confirm(state.lang==='bn'?`${num(un)}টি প্রশ্নের উত্তর দাওনি। তবুও জমা দেবে?`:`You have ${un} unanswered question(s). Submit anyway?`)) return;
    let score=0; set.questions.forEach((qq,i)=>{ if(state.mcq.answers[i]===qq.answer) score++; });
    mcqSaveLast(set.id,score,set.questions.length);
    state.mcq.submitted=true; render(); window.scrollTo(0,0); return;
  }
  if(el.id==='burger') return setMenu(!document.body.classList.contains('open'));
  if(el.id==='langbtn'){ state.lang=state.lang==='bn'?'en':'bn'; store.set('beyond-lang',state.lang); return render(); }
  if(el.dataset.chapter!==undefined){
    const v=el.dataset.chapter, f=state.f[v]=state.f[v]||{};
    f.chapter=el.dataset.ch; f.subject=''; f.type='';
    setMenu(false);
    if(location.hash==='#'+v) render(); else location.hash=v;
    return;
  }
  if(el.id==='scrim'||el.closest('#menu')) return setMenu(false);
  if(el.hasAttribute('data-retry')) return load();
  if(el.dataset.q!==undefined){ state.q=el.dataset.q; state.f.search={}; if(location.hash==='#search') render(); else location.hash='search'; return; }
  if(el.dataset.save!==undefined){ toggleSave(el.dataset.save); return; }
  if(el.dataset.go){ (state.f[el.dataset.go]=state.f[el.dataset.go]||{}).subject=el.dataset.sub||''; state.f[el.dataset.go].chapter=''; state.f[el.dataset.go].type=''; if(location.hash==='#'+el.dataset.go) render(); else location.hash=el.dataset.go; return; }
  if(el.dataset.chip!==undefined){ const f=state.f[el.dataset.chip]=state.f[el.dataset.chip]||{}; f.subject=el.dataset.sub; f.chapter=''; return render(); }
  if(el.dataset.wcat!==undefined){ (state.f.wall=state.f.wall||{}).cat=el.dataset.wcat; return render(); }
  if(el.dataset.clear){ const f=state.f[el.dataset.clear]=state.f[el.dataset.clear]||{}; ['cls','chapter','type'].forEach(k=>f[k]=''); if(el.dataset.clear!=='class8'&&el.dataset.clear!=='class9'&&el.dataset.clear!=='class10') f.subject=''; return render(); }
});
document.addEventListener('change',e=>{
  const mq=e.target.closest('input[data-mcq-q]');
  if(mq){ state.mcq.answers[+mq.dataset.mcqQ]=+mq.value; const set=mcqSet(); const c=document.getElementById('mcqcount'); if(set&&c) c.textContent=t('mcq_answered')+': '+num(Object.keys(state.mcq.answers).length)+' / '+num(set.questions.length); return; }
  const s=e.target.closest('select[data-k]');
  if(s){ (state.f[s.dataset.v]=state.f[s.dataset.v]||{})[s.dataset.k]=s.value; return render(); }
  const so=e.target.closest('select[data-sort]');
  if(so){ (state.f[so.dataset.v]=state.f[so.dataset.v]||{})[so.dataset.sort]=so.value; return render(); }
});
document.addEventListener('submit',e=>{
  if(!e.target.classList.contains('sform')) return;
  e.preventDefault(); state.q=new FormData(e.target).get('q').trim(); state.f.search={};
  if(location.hash==='#search') render(); else location.hash='search';
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape') setMenu(false); });
window.addEventListener('hashchange',onHash);
onHash(); load();
