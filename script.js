'use strict';
/* ===== BEYOND – site logic. Edit only CONFIG.SHEET_ID. ===== */
const CONFIG = { SHEET_ID: '1fdNEuTcdcp4WrXALEOHjiZG9XRlX2IJXZIPwGoRj_p8', RES_TAB: 'Resources', WALL_TAB: 'Wall', RECENT: 6 };
const NAV = [['home','Home'],['class9','Class 9'],['class10','Class 10'],['qbank','Question Bank'],['exam','Exam Resources'],['extra','Extra Resources'],['wall','Words on the Wall']];
const SUBJECTS = ['Science','Biology','Chemistry'];
const WALL_CATS = ['A Thought for Today',"A Teacher's Note",'Words of Encouragement','Ask Yourself','Beyond Books','Curiosity Corner','Life Lessons','Questions Worth Asking'];
const LABELS = { cls:'Class', subject:'Subject', chapter:'Chapter', type:'Type' };
const state = { res:[], wall:[], status:'loading', q:'', f:{} };
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

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
async function fetchTab(tab){
  const url=`https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  const res=await fetch(url); if(!res.ok) throw new Error('HTTP '+res.status);
  const rows=parseCSV(await res.text()); if(!rows.length) return [];
  const keys=rows[0].map(h=>h.toLowerCase().replace(/[^a-z]/g,''));
  return rows.slice(1).map(r=>{ const o={}; keys.forEach((k,i)=>o[k]=(r[i]||'').trim()); return o; });
}
const SHOW=['yes','y','true','show','visible','1'];
const isOn = v => SHOW.includes((v||'').toLowerCase());
const yes = v => ['yes','y','true','1'].includes((v||'').toLowerCase());
function pd(s){
  if(!s) return 0; s=s.trim();
  let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if(m) return Date.UTC(+m[1],m[2]-1,+m[3]);
  m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/); if(m) return Date.UTC(+m[3],m[2]-1,+m[1]);
  const t=Date.parse(s); return isNaN(t)?0:t;
}
const fmt = t => t ? new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}) : '';
function mapRes(o){
  const cm=(o.class||'').match(/\b(9|10)\b/);
  const sub=SUBJECTS.find(s=>s.toLowerCase()===(o.subject||'').toLowerCase())||o.subject;
  return { id:o.id, title:o.title, cls:cm?cm[1]:'', subject:sub, chapter:o.chapter, cat:o.category, type:o.resourcetype,
    desc:o.description, kw:o.keywords, url:o.fileurl, date:pd(o.uploaddate), feat:yes(o.featured), on:isOn(o.visibility) };
}
function kind(r){ const c=(r.cat||'').toLowerCase(); return c.includes('question')?'qbank':c.includes('exam')?'exam':c.includes('extra')?'extra':'class'; }
const byDate = (a,b) => b.date-a.date;
async function load(){
  state.status='loading'; render();
  if(CONFIG.SHEET_ID.startsWith('PASTE')){ state.status='setup'; render(); return; }
  try{
    const [r,w]=await Promise.all([fetchTab(CONFIG.RES_TAB),fetchTab(CONFIG.WALL_TAB)]);
    state.res=r.filter(o=>o.title).map(mapRes).filter(x=>x.on).sort(byDate);
    state.wall=w.filter(o=>o.title&&o.content).map(o=>({id:o.id,title:o.title,content:o.content,cat:o.category,date:pd(o.publicationdate),feat:yes(o.featured),on:isOn(o.visibility)})).filter(x=>x.on).sort(byDate);
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
const empty = (t='Nothing found yet',m='Try another word, or clear the filters.') => `<div class="empty"><strong>${t}</strong>${m}</div>`;
const skeleton = n => `<div class="grid">${'<div class="sk"></div>'.repeat(n)}</div>`;
function card(r){
  const l=links(r.url);
  const ch=r.chapter?(/^\d+$/.test(r.chapter)?'Chapter '+r.chapter:r.chapter):'';
  const meta=[r.cls?'Class '+r.cls:'',r.subject,ch].filter(Boolean).join(' · ');
  const open = l.view ? `<a class="btn" href="${esc(l.view)}" target="_blank" rel="noopener noreferrer">${l.dl?'View':'Open'}</a>` : '<span class="soon">Link coming soon</span>';
  const dl = l.dl ? `<a class="btn ghost" href="${esc(l.dl)}" target="_blank" rel="noopener noreferrer">Download</a>` : '';
  return `<article class="card"><div class="row"><span class="badge">${esc(r.type||r.cat||'Resource')}</span><time>${fmt(r.date)}</time></div>
  <h3>${esc(r.title)}</h3><p class="meta">${esc(meta)}</p>${r.desc?`<p class="desc">${esc(r.desc)}</p>`:''}<div class="actions">${open}${dl}</div></article>`;
}
function wallCard(w){
  return `<article class="wc${w.feat?' feat':''}"><span class="cat">${esc(w.cat)}</span><h3>${esc(w.title)}</h3><p>${esc(w.content).replace(/\n/g,'<br>')}</p>${w.date?`<time>${fmt(w.date)}</time>`:''}</article>`;
}
const uniq = (items,k) => [...new Set(items.map(r=>r[k]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));
function bar(v,items,fields,f){
  const sel=fields.map(k=>`<label>${LABELS[k]}<select data-v="${v}" data-k="${k}"><option value="">All</option>${uniq(items,k).map(o=>`<option${f[k]===String(o)?' selected':''} value="${esc(o)}">${esc(k==='cls'?'Class '+o:o)}</option>`).join('')}</select></label>`).join('');
  return `<div class="filters">${sel}<button class="link" data-clear="${v}">Clear filters</button></div>`;
}
function listView(v,items,fields,head,sub,pre=''){
  const f=state.f[v]||(state.f[v]={});
  const shown=items.filter(r=>fields.every(k=>!f[k]||String(r[k])===f[k]));
  return `<section class="wrap"><h1>${head}</h1><p class="sub">${sub}</p>${pre}${bar(v,items,fields,f)}
  <p class="count">${shown.length} resource${shown.length===1?'':'s'}</p>${shown.length?`<div class="grid">${shown.map(card).join('')}</div>`:empty()}</section>`;
}
const sform = (cls='') => `<form class="sform ${cls}" role="search"><input type="search" name="q" value="${esc(state.q)}" placeholder="Try: Chemical Bond, Digestion, Chapter 5, CQ" aria-label="Search BEYOND" autocomplete="off"><button type="submit">Search</button></form>`;

/* ---------- views ---------- */
const V = {
  home(){
    const recent=state.res.slice(0,CONFIG.RECENT);
    const quick=[['class9','Class 9'],['class10','Class 10'],['qbank','Question Bank'],['exam','Exam Resources'],['extra','Extra Resources']];
    const cls=n=>`<div class="cls"><h3>Class ${n}</h3><div class="subs">${SUBJECTS.map(s=>`<button class="sc" data-go="class${n}" data-sub="${s}"><small>Class ${n}</small>${s}</button>`).join('')}</div></div>`;
    return `<section class="hero"><div class="in"><h1>Welcome to BEYOND</h1><h2>More than books. More than grades. More than yesterday.</h2>
    <p>A free learning space where you can explore educational resources, practice questions, develop curiosity, and keep growing.</p>${sform()}</div></section>
    <section class="wrap"><div class="quick">${quick.map(([h,t])=>`<a class="qa" href="#${h}">${t}</a>`).join('')}</div>
    <h2>Subjects</h2>${cls(9)}${cls(10)}
    <div class="sec"><h2>Recently added</h2></div>${body(recent.length?`<div class="grid">${recent.map(card).join('')}</div>`:empty('No resources yet','New materials will appear here as soon as they are added.'),CONFIG.RECENT)}</section>`;
  },
  classView(n){
    const v='class'+n, f=state.f[v]||(state.f[v]={});
    const all=state.res.filter(r=>r.cls===String(n)&&kind(r)==='class');
    const items=all.filter(r=>!f.subject||r.subject===f.subject);
    const chips=`<div class="chips">${['',...SUBJECTS].map(s=>`<button class="chip${(f.subject||'')===s?' on':''}" data-chip="${v}" data-sub="${s}">${s||'All subjects'}</button>`).join('')}</div>`;
    return listView(v,items,['chapter','type'],`Class ${n}`,'Notes, worksheets, questions and more, organised chapter by chapter.',chips);
  },
  qbank(){ return listView('qbank',state.res.filter(r=>kind(r)==='qbank'),['cls','subject','chapter','type'],'Question Bank','CQ, SQ, MCQ, board questions and practice sets. Filter by class, subject, chapter and type.'); },
  exam(){ return listView('exam',state.res.filter(r=>kind(r)==='exam'),['cls','subject','type'],'Exam Resources','Model tests, revision sheets, suggestions and previous papers.'); },
  extra(){ return listView('extra',state.res.filter(r=>kind(r)==='extra'),['type'],'Extra Resources','Books, slides, videos and useful websites for going further.'); },
  wall(){
    const f=state.f.wall||(state.f.wall={});
    const items=state.wall.filter(w=>!f.cat||w.cat===f.cat);
    const sorted=[...items.filter(w=>w.feat),...items.filter(w=>!w.feat)];
    const chips=`<div class="chips">${['',...WALL_CATS].map(c=>`<button class="chip${(f.cat||'')===c?' on':''}" data-wcat="${esc(c)}">${esc(c||'All')}</button>`).join('')}</div>`;
    return `<section class="wrap"><h1>WORDS ON THE WALL</h1><p class="sub">Thoughts to remember. Questions to consider. Words to carry.</p>${chips}
    ${body(sorted.length?`<div class="wall">${sorted.map(wallCard).join('')}</div>`:empty('The wall is quiet for now','New words will appear here soon.'),2)}</section>`;
  },
  search(){
    const f=state.f.search||(state.f.search={});
    const toks=state.q.toLowerCase().split(/\s+/).filter(Boolean);
    const hay=r=>[r.title,r.kw,r.subject,r.chapter,r.chapter&&'chapter '+r.chapter,r.desc,r.cat,r.type,r.cls&&'class '+r.cls].join(' ').toLowerCase();
    const hits=toks.length?state.res.filter(r=>{const h=hay(r);return toks.every(t=>h.includes(t));}):[];
    const shown=hits.filter(r=>['cls','subject','chapter','type'].every(k=>!f[k]||String(r[k])===f[k]));
    const hasF=Object.values(f).some(Boolean);
    const wh=toks.length&&!hasF?state.wall.filter(w=>{const h=[w.title,w.content,w.cat].join(' ').toLowerCase();return toks.every(t=>h.includes(t));}):[];
    let out;
    if(!toks.length) out=empty('Search BEYOND','Type a topic, chapter or question type to begin.');
    else if(!shown.length&&!wh.length) out=empty('No results','Try a shorter word, check the spelling, or clear the filters.');
    else out=(shown.length?`<div class="grid">${shown.map(card).join('')}</div>`:'')+(wh.length?`<div class="sec"><h2>On the wall</h2></div><div class="wall">${wh.map(wallCard).join('')}</div>`:'');
    return `<section class="wrap"><h1>Search</h1>${sform('plain')}${toks.length?bar('search',hits,['cls','subject','chapter','type'],f)+`<p class="count">${shown.length+wh.length} result${shown.length+wh.length===1?'':'s'} for “${esc(state.q)}”</p>`:''}${body(out,3)}</section>`;
  }
};
/* loading / error / setup wrapper */
function body(html,n){
  if(state.status==='loading') return skeleton(n||3);
  if(state.status==='setup') return `<div class="empty"><strong>Almost ready</strong>The resource list has not been connected yet.</div>`;
  if(state.status==='error') return `<div class="err"><strong>Could not load resources</strong>Check your internet connection, then <button class="link" data-retry>try again</button>.</div>`;
  return html;
}

/* ---------- router ---------- */
function render(){
  const h=(location.hash||'#home').slice(1);
  const name=V[h]?h:/^class(9|10)$/.test(h)?h:'home';
  const labels=Object.fromEntries(NAV);
  let html;
  if(name==='home') html=V.home();
  else if(state.status!=='ok') html=`<section class="wrap"><h1>${esc(labels[name]||'Search')}</h1>${body('',3)}</section>`;
  else if(name.startsWith('class')) html=V.classView(name.slice(5));
  else html=V[name]();
  const app=$('#app');
  app.className=name==='wall'?'wallpg':'';
  app.innerHTML=html;
  document.title=(labels[name]&&name!=='home'?labels[name]+' – ':'')+'BEYOND – Learn. Think. Grow.';
  $('#menu').innerHTML=NAV.map(([k,t])=>`<a href="#${k}"${k===name?' class="on" aria-current="page"':''}>${t}</a>`).join('');
  setMenu(false);
}
let lastView='';
function onHash(){ render(); const v=(location.hash||'#home'); if(v!==lastView){ window.scrollTo(0,0); lastView=v; } }

/* ---------- events ---------- */
function setMenu(o){ document.body.classList.toggle('open',o); $('#burger').setAttribute('aria-expanded',o); $('#burger').setAttribute('aria-label',o?'Close menu':'Open menu'); }
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-go],[data-chip],[data-wcat],[data-clear],[data-retry],#burger,#scrim,#menu a');
  if(!t) return;
  if(t.id==='burger') return setMenu(!document.body.classList.contains('open'));
  if(t.id==='scrim'||t.closest('#menu')) return setMenu(false);
  if(t.hasAttribute('data-retry')) return load();
  if(t.dataset.go){ (state.f[t.dataset.go]=state.f[t.dataset.go]||{}).subject=t.dataset.sub||''; state.f[t.dataset.go].chapter=''; state.f[t.dataset.go].type=''; if(location.hash==='#'+t.dataset.go) render(); else location.hash=t.dataset.go; return; }
  if(t.dataset.chip!==undefined){ const f=state.f[t.dataset.chip]=state.f[t.dataset.chip]||{}; f.subject=t.dataset.sub; f.chapter=''; return render(); }
  if(t.dataset.wcat!==undefined){ (state.f.wall=state.f.wall||{}).cat=t.dataset.wcat; return render(); }
  if(t.dataset.clear){ const f=state.f[t.dataset.clear]=state.f[t.dataset.clear]||{}; ['cls','chapter','type'].forEach(k=>f[k]=''); if(t.dataset.clear!=='class9'&&t.dataset.clear!=='class10') f.subject=''; return render(); }
});
document.addEventListener('change',e=>{
  const s=e.target.closest('select[data-k]'); if(!s) return;
  (state.f[s.dataset.v]=state.f[s.dataset.v]||{})[s.dataset.k]=s.value; render();
});
document.addEventListener('submit',e=>{
  if(!e.target.classList.contains('sform')) return;
  e.preventDefault(); state.q=new FormData(e.target).get('q').trim(); state.f.search={};
  if(location.hash==='#search') render(); else location.hash='search';
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape') setMenu(false); });
window.addEventListener('hashchange',onHash);
onHash(); load();
