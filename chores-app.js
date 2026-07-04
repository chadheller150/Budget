// ============================================================
// CHORE TRACKER — Editable, synced, with streaks and overdue alerts
// ============================================================
const DEFAULT_CHORES = [
  { id:1, name:"Dishes / Load Dishwasher", room:"Kitchen", assignee:"Alternate", frequency:"daily", day:"", priority:"high", duration:15, notes:"" },
  { id:2, name:"Wipe Down Counters", room:"Kitchen", assignee:"Alternate", frequency:"daily", day:"", priority:"medium", duration:5, notes:"" },
  { id:3, name:"Take Out Trash", room:"Kitchen", assignee:"Alternate", frequency:"every-other-day", day:"", priority:"high", duration:5, notes:"Recycling on Tuesdays" },
  { id:4, name:"Clean Stovetop", room:"Kitchen", assignee:"Chad", frequency:"weekly", day:"Sat", priority:"medium", duration:10, notes:"" },
  { id:5, name:"Mop Kitchen Floor", room:"Kitchen", assignee:"Eric", frequency:"weekly", day:"Sun", priority:"medium", duration:20, notes:"" },
  { id:6, name:"Clean Toilets", room:"Bathroom", assignee:"Alternate", frequency:"weekly", day:"Sat", priority:"high", duration:10, notes:"" },
  { id:7, name:"Clean Shower/Tub", room:"Bathroom", assignee:"Chad", frequency:"weekly", day:"Sat", priority:"medium", duration:15, notes:"" },
  { id:8, name:"Wipe Mirrors/Sinks", room:"Bathroom", assignee:"Eric", frequency:"weekly", day:"Wed", priority:"low", duration:5, notes:"" },
  { id:9, name:"Vacuum All Floors", room:"Living Room", assignee:"Alternate", frequency:"weekly", day:"Sat", priority:"high", duration:30, notes:"Include under furniture" },
  { id:10, name:"Dust Surfaces", room:"Living Room", assignee:"Eric", frequency:"weekly", day:"Sun", priority:"low", duration:15, notes:"" },
  { id:11, name:"Laundry - Wash/Dry/Fold", room:"Laundry", assignee:"Both", frequency:"biweekly", day:"Sun", priority:"high", duration:60, notes:"Separate colors" },
  { id:12, name:"Change Bed Sheets", room:"Bedroom", assignee:"Both", frequency:"biweekly", day:"Sun", priority:"medium", duration:15, notes:"" },
  { id:13, name:"Organize Closet", room:"Bedroom", assignee:"Both", frequency:"monthly", day:"", priority:"low", duration:30, notes:"" },
  { id:14, name:"Clean Fridge", room:"Kitchen", assignee:"Chad", frequency:"biweekly", day:"", priority:"medium", duration:20, notes:"Check expiration dates" },
  { id:15, name:"Vacuum Car Interior", room:"Garage", assignee:"Both", frequency:"monthly", day:"", priority:"low", duration:20, notes:"" },
  { id:16, name:"Water Plants", room:"Living Room", assignee:"Eric", frequency:"weekly", day:"Wed", priority:"medium", duration:10, notes:"" },
  { id:17, name:"Scoop Litter / Pet Cleanup", room:"Whole House", assignee:"Alternate", frequency:"daily", day:"", priority:"high", duration:5, notes:"" },
  { id:18, name:"Wipe Down Doorknobs/Switches", room:"Whole House", assignee:"Chad", frequency:"weekly", day:"", priority:"low", duration:10, notes:"" },
  { id:19, name:"Take Out Recycling", room:"Kitchen", assignee:"Eric", frequency:"weekly", day:"Tue", priority:"medium", duration:5, notes:"" },
  { id:20, name:"Deep Clean Bathroom", room:"Bathroom", assignee:"Both", frequency:"monthly", day:"", priority:"high", duration:45, notes:"Grout, behind toilet, etc." }
];

// DATA LAYER
const JSONBIN_ID = '6a465cd8da38895dfe2240b7';
const JSONBIN_KEY = '$2a$10$mwPdOYfA/eT386ORY/YvhOFBhGT2LlLt51.cfjB1gjidZ2sHpEN0K';
const STORAGE_PREFIX = 'chore_';
let cloudEnabled = JSONBIN_ID && JSONBIN_KEY;
let storageAvailable = true;
try { localStorage.setItem('_t','1'); localStorage.removeItem('_t'); } catch(e) { storageAvailable = false; }

function ls(k,v) { if(!storageAvailable) return v===undefined?null:undefined; if(v===undefined) return localStorage.getItem(STORAGE_PREFIX+k); localStorage.setItem(STORAGE_PREFIX+k, typeof v==='string'?v:JSON.stringify(v)); }
function lsDel(k) { if(storageAvailable) localStorage.removeItem(STORAGE_PREFIX+k); }
function loadChores() { const s=ls('data'); if(s) return JSON.parse(s); ls('data',DEFAULT_CHORES); return [...DEFAULT_CHORES]; }
function saveChores(d) { ls('data',d); debouncedCloudSave(); }

// Completion tracking: keyed by chore ID, value is array of completion dates (ISO strings)
function getCompletions(id) { const s=ls('done_'+id); return s?JSON.parse(s):[]; }
function saveCompletions(id,arr) { ls('done_'+id,arr); debouncedCloudSave(); }
function markDone(id) { const c=getCompletions(id); c.push(new Date().toISOString().split('T')[0]); saveCompletions(id,c); }
function undoLast(id) { const c=getCompletions(id); c.pop(); saveCompletions(id,c); }
function getLastDone(id) { const c=getCompletions(id); return c.length?c[c.length-1]:null; }
function getStreak(id) { const c=getCompletions(id); return c.length; }

let chores = loadChores();

// CLOUD SYNC (shares bin with bill tracker — uses chore_ namespace)
function getAllData() {
  const completions={};
  chores.forEach(c=>{ const h=getCompletions(c.id); if(h.length>0) completions[c.id]=h; });
  return {chores,completions,supplies,updated:new Date().toISOString()};
}
function applyCloudData(data) {
  if(!data||!data.chores) return;
  chores=data.chores; ls('data',chores);
  if(data.completions) Object.keys(data.completions).forEach(id=>ls('done_'+id,data.completions[id]));
  if(data.supplies) { ls('supplies',data.supplies); }
}
async function cloudSave() {
  if(!cloudEnabled) return;
  updateSyncStatus('Saving...');
  try {
    // Read existing bin first to not overwrite bill data
    const r=await fetch('https://api.jsonbin.io/v3/b/'+JSONBIN_ID+'/latest',{headers:{'X-Master-Key':JSONBIN_KEY}});
    let existing={};
    if(r.ok){const j=await r.json(); existing=j.record||{};}
    existing.choreTracker=getAllData();
    const w=await fetch('https://api.jsonbin.io/v3/b/'+JSONBIN_ID,{method:'PUT',headers:{'Content-Type':'application/json','X-Master-Key':JSONBIN_KEY},body:JSON.stringify(existing)});
    updateSyncStatus(w.ok?'Saved':'Error');
  } catch(e){ updateSyncStatus('Offline'); }
}
async function cloudLoad() {
  if(!cloudEnabled) return false;
  updateSyncStatus('Loading...');
  try {
    const r=await fetch('https://api.jsonbin.io/v3/b/'+JSONBIN_ID+'/latest',{headers:{'X-Master-Key':JSONBIN_KEY}});
    if(r.ok){const j=await r.json(); if(j.record&&j.record.choreTracker){applyCloudData(j.record.choreTracker); updateSyncStatus('Synced'); return true;}}
    updateSyncStatus('Loaded');
  } catch(e){ updateSyncStatus('Offline'); }
  return false;
}
function updateSyncStatus(s) { const el=document.getElementById('syncStatus'); if(el) el.textContent=cloudEnabled?'\u{2601}\u{FE0F} '+s:'\u{1F4F1} Local'; }
let saveTimeout=null;
function debouncedCloudSave() { if(saveTimeout) clearTimeout(saveTimeout); saveTimeout=setTimeout(cloudSave,1500); }

// HELPERS
const ROOM_EMOJI={Kitchen:'\u{1F373}',Bathroom:'\u{1F6BF}',Bedroom:'\u{1F6CF}\u{FE0F}','Living Room':'\u{1F6CB}\u{FE0F}',Laundry:'\u{1F9FA}',Outdoor:'\u{1F333}',Garage:'\u{1F697}',Office:'\u{1F4BB}','Whole House':'\u{1F3E0}'};
function roomEmoji(r){return ROOM_EMOJI[r]||'\u{1F4CC}';}
const FREQ_LABEL={daily:'Daily','every-other-day':'Every Other Day',weekly:'Weekly',biweekly:'Bi-Weekly',monthly:'Monthly',quarterly:'Quarterly','as-needed':'As Needed'};
function freqLabel(f){return FREQ_LABEL[f]||f;}

function isDueToday(chore) {
  const last=getLastDone(chore.id);
  const today=new Date().toISOString().split('T')[0];
  if(last===today) return false; // Already done today
  const dayOfWeek=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  if(chore.day && chore.day!==dayOfWeek) return false;
  return true;
}

function isOverdue(chore) {
  const last=getLastDone(chore.id);
  if(!last) return chore.frequency==='daily'; // Never done and it's daily = overdue
  const lastDate=new Date(last+'T00:00:00');
  const today=new Date(); today.setHours(0,0,0,0);
  const daysSince=Math.floor((today-lastDate)/86400000);
  switch(chore.frequency){
    case 'daily': return daysSince>1;
    case 'every-other-day': return daysSince>2;
    case 'weekly': return daysSince>7;
    case 'biweekly': return daysSince>14;
    case 'monthly': return daysSince>31;
    case 'quarterly': return daysSince>92;
    default: return false;
  }
}

function isDoneToday(id) { const last=getLastDone(id); return last===new Date().toISOString().split('T')[0]; }

function getStatus(chore) {
  if(isDoneToday(chore.id)) return {label:'Done',cls:'badge-done',emoji:'\u{2705}'};
  if(isOverdue(chore)) return {label:'Overdue',cls:'badge-overdue',emoji:'\u{1F534}'};
  if(isDueToday(chore)) return {label:'Due Today',cls:'badge-today',emoji:'\u{1F7E1}'};
  return {label:'Upcoming',cls:'badge-upcoming',emoji:'\u{1F535}'};
}

// RENDER
let activeFilter='All', activeAssignee='All', summaryDrilldown=null;

function renderSummary() {
  const doneToday=chores.filter(c=>isDoneToday(c.id)).length;
  const dueToday=chores.filter(c=>isDueToday(c)&&!isDoneToday(c.id)).length;
  const overdue=chores.filter(c=>isOverdue(c)&&!isDoneToday(c.id)).length;
  const totalMin=chores.filter(c=>isDueToday(c)&&!isDoneToday(c.id)).reduce((s,c)=>s+(c.duration||0),0);
  const active=k=>summaryDrilldown===k?' stat-card-active':'';

  document.getElementById('summary').innerHTML=
    '<div class="stat-card'+active('done')+'" data-summary="done"><div class="emoji">\u{2705}</div><div class="value">'+doneToday+'</div><div class="label">Done Today</div></div>'+
    '<div class="stat-card'+active('due')+'" data-summary="due"><div class="emoji">\u{1F4CB}</div><div class="value">'+dueToday+'</div><div class="label">Due Today</div></div>'+
    '<div class="stat-card'+active('overdue')+'" data-summary="overdue"><div class="emoji">\u{1F6A8}</div><div class="value">'+overdue+'</div><div class="label">Overdue</div></div>'+
    '<div class="stat-card" data-summary="time"><div class="emoji">\u{23F1}\u{FE0F}</div><div class="value">'+totalMin+'m</div><div class="label">Time Left</div></div>'+
    '<div class="stat-card'+active('all')+'" data-summary="all"><div class="emoji">\u{1F9F9}</div><div class="value">'+chores.length+'</div><div class="label">Total Chores</div></div>';

  document.querySelectorAll('[data-summary]').forEach(card=>{
    card.addEventListener('click',function(){
      const k=this.dataset.summary;
      if(k==='time') return;
      if(summaryDrilldown===k){summaryDrilldown=null;}else{summaryDrilldown=k;}
      activeFilter='All';activeAssignee='All';
      render();
    });
  });
}

function renderInsights() {
  const overdue=chores.filter(c=>isOverdue(c)&&!isDoneToday(c.id));
  const totalStreak=chores.reduce((s,c)=>s+getStreak(c.id),0);
  let html='';
  if(overdue.length>0){
    html+='<div class="insight-card insight-warn"><div class="insight-title">\u{1F6A8} Overdue</div><div class="insight-value warn">'+overdue.map(c=>c.name).slice(0,5).join(', ')+(overdue.length>5?' +more':'')+'</div></div>';
  }
  html+='<div class="insight-card insight-good"><div class="insight-title">\u{1F525} Total Completions</div><div class="insight-value good">'+totalStreak+' all time</div></div>';
  // Who's doing more
  const chadDone=chores.filter(c=>c.assignee==='Chad'||c.assignee==='Alternate').reduce((s,c)=>s+getCompletions(c.id).length,0);
  const ericDone=chores.filter(c=>c.assignee==='Eric'||c.assignee==='Alternate').reduce((s,c)=>s+getCompletions(c.id).length,0);
  html+='<div class="insight-card insight-info"><div class="insight-title">\u{1F4CA} Completions Split</div><div class="insight-value">Chad: '+chadDone+' | Eric: '+ericDone+'</div></div>';
  document.getElementById('insightsPanel').innerHTML=html;
}

function renderFilters() {
  const rooms=['All',...new Set(chores.map(c=>c.room))];
  const assignees=['All','Chad','Eric','Both','Alternate'];
  let html='<div class="filter-section">Room:</div><div class="filters">';
  rooms.forEach(r=>{html+='<button class="filter-btn'+(activeFilter===r?' active':'')+'" data-room-filter="'+r+'">'+r+'</button>';});
  html+='</div><div class="filter-section">Assigned To:</div><div class="filters">';
  assignees.forEach(a=>{html+='<button class="filter-btn'+(activeAssignee===a?' active':'')+'" data-assignee-filter="'+a+'">'+a+'</button>';});
  html+='</div>';
  document.getElementById('filters').innerHTML=html;
  document.querySelectorAll('[data-room-filter]').forEach(btn=>{btn.addEventListener('click',function(){activeFilter=this.dataset.roomFilter;summaryDrilldown=null;render();});});
  document.querySelectorAll('[data-assignee-filter]').forEach(btn=>{btn.addEventListener('click',function(){activeAssignee=this.dataset.assigneeFilter;summaryDrilldown=null;render();});});
}

function getFilteredChores() {
  let f=chores.filter(c=>{
    if(activeFilter!=='All'&&c.room!==activeFilter) return false;
    if(activeAssignee!=='All'&&c.assignee!==activeAssignee) return false;
    return true;
  });
  if(summaryDrilldown==='done') f=f.filter(c=>isDoneToday(c.id));
  else if(summaryDrilldown==='due') f=f.filter(c=>isDueToday(c)&&!isDoneToday(c.id));
  else if(summaryDrilldown==='overdue') f=f.filter(c=>isOverdue(c)&&!isDoneToday(c.id));
  return f;
}

function renderCards() {
  const filtered=getFilteredChores();
  const roomSlug=r=>r.toLowerCase().replace(/\s/g,'');
  const cards=filtered.map(c=>{
    const status=getStatus(c);
    const done=isDoneToday(c.id);
    const overdue=isOverdue(c)&&!done;
    const streak=getStreak(c.id);
    const lastDone=getLastDone(c.id);
    const doneClass=done?' chore-done':'';
    const overdueClass=overdue?' chore-overdue':'';
    const markBtn=done?'<button class="btn-undo" data-undo-id="'+c.id+'">\u{21A9}\u{FE0F} Undo</button>':'<button class="btn-complete" data-done-id="'+c.id+'">\u{2705} Done</button>';

    return '<div class="chore-card room-'+roomSlug(c.room)+doneClass+overdueClass+'" data-id="'+c.id+'">'+
      '<div class="chore-header">'+
        '<span class="chore-name">'+roomEmoji(c.room)+' '+c.name+'</span>'+
        '<span class="badge '+status.cls+'">'+status.emoji+' '+status.label+'</span>'+
      '</div>'+
      '<div class="chore-meta">'+
        '<span class="room-badge">'+c.room+'</span>'+
        '<span class="assignee-badge">'+c.assignee+'</span>'+
        '<span class="badge badge-freq">'+freqLabel(c.frequency)+'</span>'+
        (c.day?'<span style="font-size:10px;color:var(--text-secondary)">'+c.day+'</span>':'')+
        (c.duration?'<span style="font-size:10px;color:var(--text-secondary)">\u{23F1}\u{FE0F} '+c.duration+'min</span>':'')+
      '</div>'+
      '<div class="chore-details">'+
        '<div class="detail-grid">'+
          '<div class="detail-item"><div class="detail-label">\u{1F4C5} Last Done</div><div class="detail-value">'+(lastDone||'<span class="detail-empty">Never</span>')+'</div></div>'+
          '<div class="detail-item"><div class="detail-label">\u{1F525} Completions</div><div class="detail-value">'+streak+' total</div></div>'+
          '<div class="detail-item"><div class="detail-label">\u{26A1} Priority</div><div class="detail-value"><span class="badge badge-priority-'+c.priority+'">'+c.priority+'</span></div></div>'+
          '<div class="detail-item"><div class="detail-label">\u{1F4DD} Notes</div><div class="detail-value">'+(c.notes||'<span class="detail-empty">None</span>')+'</div></div>'+
        '</div>'+
        '<div class="detail-actions">'+markBtn+
          '<button class="btn-edit" data-edit-id="'+c.id+'">\u{270F}\u{FE0F} Edit</button>'+
          '<button class="btn-delete" data-delete-id="'+c.id+'">\u{1F5D1}\u{FE0F}</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  }).join('');
  document.getElementById('choreCards').innerHTML=cards;
  bindCardEvents();
}

function bindCardEvents() {
  document.querySelectorAll('.chore-card').forEach(c=>{c.addEventListener('click',function(e){if(e.target.closest('.detail-actions'))return;this.classList.toggle('expanded');});});
  document.querySelectorAll('[data-edit-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();openModal(parseInt(this.dataset.editId));});});
  document.querySelectorAll('[data-delete-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();deleteChore(parseInt(this.dataset.deleteId));});});
  document.querySelectorAll('[data-done-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();markDone(parseInt(this.dataset.doneId));render();});});
  document.querySelectorAll('[data-undo-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();undoLast(parseInt(this.dataset.undoId));render();});});
}

function render(){renderSummary();renderInsights();renderFilters();renderCards();}

// MODAL
let editingId=null;
function openModal(id){
  editingId=id;const c=chores.find(x=>x.id===id);
  document.getElementById('modalTitle').textContent=c?'Edit Chore':'Add Chore';
  document.getElementById('editName').value=c?c.name:'';
  document.getElementById('editRoom').value=c?c.room:'Kitchen';
  document.getElementById('editAssignee').value=c?c.assignee:'Chad';
  document.getElementById('editFrequency').value=c?c.frequency:'weekly';
  document.getElementById('editDay').value=c?(c.day||''):'';
  document.getElementById('editPriority').value=c?c.priority:'medium';
  document.getElementById('editDuration').value=c?(c.duration||''):'';
  document.getElementById('editNotes').value=c?(c.notes||''):'';
  document.getElementById('modalOverlay').classList.add('active');
}
function openAddModal(){editingId=null;document.getElementById('modalTitle').textContent='Add New Chore';['editName','editDuration','editNotes'].forEach(id=>{document.getElementById(id).value='';});document.getElementById('editRoom').value='Kitchen';document.getElementById('editAssignee').value='Chad';document.getElementById('editFrequency').value='weekly';document.getElementById('editDay').value='';document.getElementById('editPriority').value='medium';document.getElementById('modalOverlay').classList.add('active');}
function closeModal(){document.getElementById('modalOverlay').classList.remove('active');editingId=null;}
function saveModal(){
  const name=document.getElementById('editName').value.trim();if(!name){alert('Name required');return;}
  const room=document.getElementById('editRoom').value;
  const assignee=document.getElementById('editAssignee').value;
  const frequency=document.getElementById('editFrequency').value;
  const day=document.getElementById('editDay').value;
  const priority=document.getElementById('editPriority').value;
  const duration=parseInt(document.getElementById('editDuration').value)||0;
  const notes=document.getElementById('editNotes').value.trim();
  if(editingId!==null){const idx=chores.findIndex(x=>x.id===editingId);if(idx!==-1)chores[idx]={...chores[idx],name,room,assignee,frequency,day,priority,duration,notes};}
  else{const nid=chores.length?Math.max(...chores.map(x=>x.id))+1:1;chores.push({id:nid,name,room,assignee,frequency,day,priority,duration,notes});}
  saveChores(chores);closeModal();render();
}
function deleteChore(id){const c=chores.find(x=>x.id===id);if(!confirm('Delete "'+c.name+'"?'))return;chores=chores.filter(x=>x.id!==id);saveChores(chores);lsDel('done_'+id);render();}
function resetAllData(){if(!confirm('Reset all data to defaults?'))return;lsDel('data');chores.forEach(c=>lsDel('done_'+c.id));lsDel('supplies');chores=loadChores();supplies=loadSupplies();summaryDrilldown=null;render();renderSupplies();}

// ============================================================
// SUPPLIES TRACKER
// ============================================================
const DEFAULT_SUPPLIES = [
  {id:1, name:"Dish Soap", category:"Kitchen", status:"good", brand:"Dawn", store:"Target", url:"", notes:""},
  {id:2, name:"Sponges", category:"Kitchen", status:"good", brand:"Scotch-Brite", store:"Amazon", url:"", notes:"Replace weekly"},
  {id:3, name:"All-Purpose Cleaner", category:"All-Purpose", status:"full", brand:"Method", store:"Target", url:"", notes:"Lavender scent"},
  {id:4, name:"Disinfecting Wipes", category:"Disinfectant", status:"good", brand:"Clorox", store:"Costco", url:"", notes:""},
  {id:5, name:"Glass Cleaner", category:"Glass", status:"full", brand:"Windex", store:"Target", url:"", notes:""},
  {id:6, name:"Toilet Bowl Cleaner", category:"Bathroom", status:"good", brand:"Lysol", store:"Amazon", url:"", notes:""},
  {id:7, name:"Shower Spray", category:"Bathroom", status:"full", brand:"Scrubbing Bubbles", store:"Target", url:"", notes:"Daily use after shower"},
  {id:8, name:"Laundry Detergent", category:"Laundry", status:"good", brand:"Tide", store:"Costco", url:"", notes:"Pods"},
  {id:9, name:"Dryer Sheets", category:"Laundry", status:"full", brand:"Bounce", store:"Amazon", url:"", notes:""},
  {id:10, name:"Floor Cleaner", category:"Floor", status:"good", brand:"Swiffer", store:"Target", url:"", notes:"Wet pads"},
  {id:11, name:"Vacuum Bags/Filters", category:"Tools", status:"full", brand:"", store:"Amazon", url:"", notes:"Check model"},
  {id:12, name:"Paper Towels", category:"Paper Goods", status:"good", brand:"Bounty", store:"Costco", url:"", notes:""},
  {id:13, name:"Trash Bags (Kitchen)", category:"Paper Goods", status:"good", brand:"Glad", store:"Amazon", url:"", notes:"13 gallon"},
  {id:14, name:"Trash Bags (Large)", category:"Paper Goods", status:"full", brand:"Hefty", store:"Amazon", url:"", notes:"33 gallon"},
  {id:15, name:"Broom/Dustpan", category:"Tools", status:"full", brand:"", store:"", url:"", notes:"Replace as needed"},
  {id:16, name:"Toilet Paper", category:"Paper Goods", status:"good", brand:"Charmin", store:"Costco", url:"", notes:""},
  {id:17, name:"Hand Soap", category:"Bathroom", status:"good", brand:"Mrs. Meyer's", store:"Target", url:"", notes:"Refill bottles"},
  {id:18, name:"Stain Remover", category:"Laundry", status:"full", brand:"OxiClean", store:"Amazon", url:"", notes:""},
];

function loadSupplies(){const s=ls('supplies'); if(s) return JSON.parse(s); ls('supplies',DEFAULT_SUPPLIES); return [...DEFAULT_SUPPLIES];}
function saveSupplies(d){ls('supplies',d); debouncedCloudSave();}
let supplies = loadSupplies();

const STOCK_EMOJI={full:'\u{1F7E2}',good:'\u{1F535}',low:'\u{1F7E1}',out:'\u{1F534}'};
const STOCK_LABEL={full:'Full',good:'Good',low:'Low',out:'Need to Order'};

function renderSuppliesSummary(){
  const full=supplies.filter(s=>s.status==='full').length;
  const good=supplies.filter(s=>s.status==='good').length;
  const low=supplies.filter(s=>s.status==='low').length;
  const out=supplies.filter(s=>s.status==='out').length;
  document.getElementById('suppliesSummary').innerHTML=
    '<div class="stat-card"><div class="emoji">\u{1F7E2}</div><div class="value">'+full+'</div><div class="label">Full</div></div>'+
    '<div class="stat-card"><div class="emoji">\u{1F535}</div><div class="value">'+good+'</div><div class="label">Good</div></div>'+
    '<div class="stat-card"><div class="emoji">\u{1F7E1}</div><div class="value">'+low+'</div><div class="label">Low</div></div>'+
    '<div class="stat-card"><div class="emoji">\u{1F534}</div><div class="value">'+out+'</div><div class="label">Need to Order</div></div>'+
    '<div class="stat-card"><div class="emoji">\u{1F9F4}</div><div class="value">'+supplies.length+'</div><div class="label">Total Items</div></div>';
}

function renderSupplyCards(){
  // Sort: out first, then low, then good, then full
  const sorted=[...supplies].sort((a,b)=>{const order={out:0,low:1,good:2,full:3};return (order[a.status]||3)-(order[b.status]||3);});
  const cards=sorted.map(s=>{
    const orderBtn=s.url?'<a href="'+s.url+'" target="_blank" class="btn-reorder pay-link-inline">\u{1F6D2} Order</a>':'';
    return '<div class="supply-card stock-'+s.status+'" data-supply-id="'+s.id+'">'+
      '<div class="supply-header">'+
        '<span class="supply-name">\u{1F9F4} '+s.name+'</span>'+
        '<span class="badge badge-stock-'+s.status+'">'+STOCK_EMOJI[s.status]+' '+STOCK_LABEL[s.status]+'</span>'+
      '</div>'+
      '<div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">'+
        '<span class="room-badge">'+s.category+'</span>'+
        (s.brand?'<span style="font-size:10px;color:var(--text-secondary)">'+s.brand+'</span>':'')+
        (s.store?'<span style="font-size:10px;color:var(--text-secondary)">\u{1F3EA} '+s.store+'</span>':'')+
      '</div>'+
      '<div class="supply-details">'+
        '<div class="detail-grid">'+
          '<div class="detail-item"><div class="detail-label">\u{1F3F7}\u{FE0F} Brand</div><div class="detail-value">'+(s.brand||'<span class="detail-empty">Not set</span>')+'</div></div>'+
          '<div class="detail-item"><div class="detail-label">\u{1F3EA} Store</div><div class="detail-value">'+(s.store||'<span class="detail-empty">Not set</span>')+'</div></div>'+
          '<div class="detail-item"><div class="detail-label">\u{1F517} Order Link</div><div class="detail-value">'+(s.url?'<a href="'+s.url+'" target="_blank" class="pay-link-inline" style="color:var(--accent)">Link</a>':'<span class="detail-empty">Not set</span>')+'</div></div>'+
          '<div class="detail-item"><div class="detail-label">\u{1F4DD} Notes</div><div class="detail-value">'+(s.notes||'<span class="detail-empty">None</span>')+'</div></div>'+
        '</div>'+
        '<div class="detail-actions">'+
          (s.status!=='full'?'<button class="btn-restock" data-restock-id="'+s.id+'">\u{2705} Mark Restocked</button>':'')+
          (s.status==='full'||s.status==='good'?'<button class="btn-undo" data-marklow-id="'+s.id+'">\u{1F7E1} Mark Low</button>':'')+
          orderBtn+
          '<button class="btn-edit" data-supply-edit-id="'+s.id+'">\u{270F}\u{FE0F}</button>'+
          '<button class="btn-delete" data-supply-delete-id="'+s.id+'">\u{1F5D1}\u{FE0F}</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  }).join('');
  document.getElementById('supplyCards').innerHTML=cards;
  bindSupplyEvents();
}

function bindSupplyEvents(){
  document.querySelectorAll('.supply-card').forEach(c=>{c.addEventListener('click',function(e){if(e.target.closest('.detail-actions')||e.target.closest('.pay-link-inline'))return;this.classList.toggle('expanded');});});
  document.querySelectorAll('[data-supply-edit-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();openSupplyModal(parseInt(this.dataset.supplyEditId));});});
  document.querySelectorAll('[data-supply-delete-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();const id=parseInt(this.dataset.supplyDeleteId);const s=supplies.find(x=>x.id===id);if(confirm('Delete "'+s.name+'"?')){supplies=supplies.filter(x=>x.id!==id);saveSupplies(supplies);renderSupplies();}});});
  document.querySelectorAll('[data-restock-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();const id=parseInt(this.dataset.restockId);const idx=supplies.findIndex(x=>x.id===id);if(idx!==-1){supplies[idx].status='full';saveSupplies(supplies);renderSupplies();}});});
  document.querySelectorAll('[data-marklow-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();const id=parseInt(this.dataset.marklowId);const idx=supplies.findIndex(x=>x.id===id);if(idx!==-1){supplies[idx].status='low';saveSupplies(supplies);renderSupplies();}});});
}

function renderSupplies(){renderSuppliesSummary();renderSupplyCards();}

// Supply Modal
let editingSupplyId=null;
function openSupplyModal(id){
  editingSupplyId=id;const s=supplies.find(x=>x.id===id);
  document.getElementById('supplyModalTitle').textContent=s?'Edit Supply':'Add Supply';
  document.getElementById('editSupplyName').value=s?s.name:'';
  document.getElementById('editSupplyCategory').value=s?s.category:'All-Purpose';
  document.getElementById('editSupplyStatus').value=s?s.status:'full';
  document.getElementById('editSupplyBrand').value=s?(s.brand||''):'';
  document.getElementById('editSupplyStore').value=s?(s.store||''):'';
  document.getElementById('editSupplyUrl').value=s?(s.url||''):'';
  document.getElementById('editSupplyNotes').value=s?(s.notes||''):'';
  document.getElementById('supplyModalOverlay').classList.add('active');
}
function openAddSupplyModal(){editingSupplyId=null;document.getElementById('supplyModalTitle').textContent='Add New Supply';['editSupplyName','editSupplyBrand','editSupplyStore','editSupplyUrl','editSupplyNotes'].forEach(id=>{document.getElementById(id).value='';});document.getElementById('editSupplyCategory').value='All-Purpose';document.getElementById('editSupplyStatus').value='full';document.getElementById('supplyModalOverlay').classList.add('active');}
function closeSupplyModal(){document.getElementById('supplyModalOverlay').classList.remove('active');editingSupplyId=null;}
function saveSupplyModal(){
  const name=document.getElementById('editSupplyName').value.trim();if(!name){alert('Name required');return;}
  const category=document.getElementById('editSupplyCategory').value;
  const status=document.getElementById('editSupplyStatus').value;
  const brand=document.getElementById('editSupplyBrand').value.trim();
  const store=document.getElementById('editSupplyStore').value.trim();
  const url=document.getElementById('editSupplyUrl').value.trim();
  const notes=document.getElementById('editSupplyNotes').value.trim();
  if(editingSupplyId!==null){const idx=supplies.findIndex(x=>x.id===editingSupplyId);if(idx!==-1)supplies[idx]={...supplies[idx],name,category,status,brand,store,url,notes};}
  else{const nid=supplies.length?Math.max(...supplies.map(x=>x.id))+1:1;supplies.push({id:nid,name,category,status,brand,store,url,notes});}
  saveSupplies(supplies);closeSupplyModal();renderSupplies();
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded',async function(){
  if(cloudEnabled){const ok=await cloudLoad();if(ok){chores=loadChores();supplies=loadSupplies();}}
  render();renderSupplies();updateSyncStatus(cloudEnabled?'Synced':'Local');

  // Chore bindings
  document.getElementById('addChoreBtn').addEventListener('click',openAddModal);
  document.getElementById('modalCancelBtn').addEventListener('click',closeModal);
  document.getElementById('modalSaveBtn').addEventListener('click',saveModal);
  document.getElementById('modalOverlay').addEventListener('click',function(e){if(e.target===e.currentTarget)closeModal();});

  // Supply bindings
  document.getElementById('addSupplyBtn').addEventListener('click',openAddSupplyModal);
  document.getElementById('supplyModalCancelBtn').addEventListener('click',closeSupplyModal);
  document.getElementById('supplyModalSaveBtn').addEventListener('click',saveSupplyModal);
  document.getElementById('supplyModalOverlay').addEventListener('click',function(e){if(e.target===e.currentTarget)closeSupplyModal();});

  // Shared
  document.getElementById('resetLink').addEventListener('click',function(e){e.preventDefault();resetAllData();});
  document.getElementById('syncBtn').addEventListener('click',async function(){const ok=await cloudLoad();if(ok){chores=loadChores();supplies=loadSupplies();render();renderSupplies();}});
});
