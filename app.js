// ============================================================
// BILL TRACKER v4 — Charts, Insights, Forecasts, Frequencies
// ============================================================
const DEFAULT_BILLS = [
  { id:1, name:"Mortgage", amount:2700, estimated:2700, due:1, owner:"Joint", split:"$1500/$1200", chad:1500, eric:1200, category:"Housing", frequency:"monthly", autopay:"no" },
  { id:2, name:"HOA", amount:200, estimated:200, due:1, owner:"Joint", split:"$100/$100", chad:100, eric:100, category:"Housing", frequency:"monthly", autopay:"no" },
  { id:3, name:"Water/Trash", amount:100, estimated:100, due:10, owner:"Joint", split:"$50/$50", chad:50, eric:50, category:"Housing", frequency:"monthly", autopay:"no" },
  { id:4, name:"Utilities", amount:200, estimated:200, due:4, owner:"Joint", split:"$100/$100", chad:50, eric:50, category:"Housing", frequency:"monthly", autopay:"no" },
  { id:5, name:"Car Insurance - Chad", amount:160, estimated:160, due:6, owner:"Solo", split:null, chad:160, eric:0, category:"Transport", frequency:"monthly", autopay:"no" },
  { id:6, name:"Car Insurance - Eric", amount:177.25, estimated:177.25, due:null, owner:"E Solo", split:null, chad:0, eric:177.25, category:"Transport", frequency:"monthly", autopay:"no" },
  { id:7, name:"Kona", amount:401, estimated:401, due:null, owner:"E Solo", split:null, chad:0, eric:401, category:"Financing", frequency:"monthly", autopay:"no" },
  { id:8, name:"Santa Fe", amount:620, estimated:620, due:25, owner:"Solo", split:null, chad:620, eric:0, category:"Transport", frequency:"monthly", autopay:"no" },
  { id:9, name:"Paramount+", amount:9, estimated:9, due:14, owner:"Solo", split:null, chad:9, eric:0, category:"Subscriptions", frequency:"monthly", autopay:"no" },
  { id:10, name:"Netflix", amount:25, estimated:25, due:9, owner:"Solo", split:null, chad:25, eric:0, category:"Subscriptions", frequency:"monthly", autopay:"no" },
  { id:11, name:"Apple TV+", amount:10, estimated:10, due:15, owner:"Solo", split:null, chad:10, eric:0, category:"Subscriptions", frequency:"monthly", autopay:"no" },
  { id:12, name:"Peacock", amount:15.14, estimated:15.14, due:null, owner:"E Solo", split:null, chad:0, eric:15.14, category:"Subscriptions", frequency:"monthly", autopay:"no" },
  { id:13, name:"PayPal", amount:50, estimated:50, due:6, owner:"Solo", split:null, chad:50, eric:0, category:"Financing", frequency:"monthly", autopay:"no" },
  { id:14, name:"Credit Card(s) - Eric", amount:100, estimated:100, due:null, owner:"E Solo", split:null, chad:0, eric:100, category:"Financing", frequency:"monthly", autopay:"no" },
  { id:15, name:"Benji Insurance", amount:24.87, estimated:24.87, due:null, owner:"E Solo", split:null, chad:0, eric:24.87, category:"Pet", frequency:"monthly", autopay:"no" },
  { id:16, name:"Benji Thrive", amount:14.95, estimated:14.95, due:null, owner:"E Solo", split:null, chad:0, eric:14.95, category:"Pet", frequency:"monthly", autopay:"no" },
  { id:17, name:"Affirm - Samsung", amount:37, estimated:37, due:25, owner:"Solo", split:null, chad:37, eric:0, category:"Financing", frequency:"monthly", autopay:"no" },
  { id:18, name:"Affirm - Samsung (2)", amount:14.52, estimated:14.52, due:30, owner:"Solo", split:null, chad:15, eric:0, category:"Financing", frequency:"monthly", autopay:"no" },
  { id:19, name:"Groceries", amount:800, estimated:800, due:null, owner:"Joint", split:"$400/$400", chad:400, eric:400, category:"Essentials", frequency:"monthly", autopay:"no" },
  { id:20, name:"Phone Bill - Chad", amount:45, estimated:45, due:null, owner:"Solo", split:null, chad:45, eric:0, category:"Essentials", frequency:"monthly", autopay:"no" },
  { id:21, name:"Spotify", amount:22, estimated:22, due:6, owner:"Solo", split:null, chad:22, eric:0, category:"Subscriptions", frequency:"monthly", autopay:"no" },
  { id:22, name:"Gas (Eric)", amount:80, estimated:80, due:null, owner:"E Solo", split:null, chad:0, eric:80, category:"Transport", frequency:"monthly", autopay:"no" },
  { id:23, name:"Toll Tag", amount:100, estimated:100, due:null, owner:"Solo", split:null, chad:100, eric:0, category:"Transport", frequency:"monthly", autopay:"no" },
  { id:24, name:"Gas - Chad", amount:80, estimated:80, due:null, owner:"Solo", split:null, chad:80, eric:0, category:"Transport", frequency:"monthly", autopay:"no" },
  { id:25, name:"Go Car Wash", amount:28, estimated:28, due:null, owner:"Solo", split:null, chad:28, eric:0, category:"Transport", frequency:"monthly", autopay:"no" },
  { id:26, name:"Thrive - Levi/Penny", amount:30, estimated:30, due:null, owner:"Solo", split:null, chad:30, eric:0, category:"Pet", frequency:"monthly", autopay:"no" },
  { id:27, name:"Savings - Chad", amount:500, estimated:500, due:null, owner:"Solo", split:null, chad:500, eric:0, category:"Savings", frequency:"monthly", autopay:"no" },
  { id:28, name:"Student Loans - Chad", amount:350, estimated:350, due:null, owner:"Solo", split:null, chad:0, eric:0, category:"Financing", frequency:"monthly", autopay:"no" },
  { id:29, name:"Savings - Eric", amount:500, estimated:500, due:null, owner:"E Solo", split:null, chad:0, eric:500, category:"Savings", frequency:"monthly", autopay:"no" },
  { id:30, name:"Spending - Chad", amount:500, estimated:500, due:null, owner:"Solo", split:null, chad:500, eric:0, category:"Essentials", frequency:"monthly", autopay:"no" },
  { id:31, name:"Spending - Eric", amount:500, estimated:500, due:null, owner:"E Solo", split:null, chad:0, eric:500, category:"Essentials", frequency:"monthly", autopay:"no" }
];

// DATA LAYER
const JSONBIN_ID = '6a465cd8da38895dfe2240b7';
const JSONBIN_KEY = '$2a$10$mwPdOYfA/eT386ORY/YvhOFBhGT2LlLt51.cfjB1gjidZ2sHpEN0K';
let cloudEnabled = JSONBIN_ID && JSONBIN_KEY;
let storageAvailable = true;
try { localStorage.setItem('_t','1'); localStorage.removeItem('_t'); } catch(e) { storageAvailable = false; }

function ls(k,v) { if(!storageAvailable) return v===undefined?null:undefined; if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k, typeof v==='string'?v:JSON.stringify(v)); }
function lsDel(k) { if(storageAvailable) localStorage.removeItem(k); }
function loadBills() { const s=ls('bill_tracker_data'); if(s) return JSON.parse(s); ls('bill_tracker_data',DEFAULT_BILLS); return [...DEFAULT_BILLS]; }
function saveBills(d) { ls('bill_tracker_data',d); debouncedCloudSave(); }
function getExtras(id) { const s=ls('bill_extras_'+id); return s?JSON.parse(s):{url:'',username:'',password:'',notes:''}; }
function saveExtras(id,e) { ls('bill_extras_'+id,e); debouncedCloudSave(); }
function getHistory(id) { const s=ls('bill_history_'+id); return s?JSON.parse(s):[]; }
function saveHistory(id,h) { ls('bill_history_'+id,h); debouncedCloudSave(); }
function addHistoryEntry(id,amt,dt) { const h=getHistory(id); h.push({date:dt,amount:amt}); h.sort((a,b)=>a.date.localeCompare(b.date)); saveHistory(id,h); }
function getBalances() { const s=ls('bill_balances'); return s?JSON.parse(s):{checking:0,savings:0}; }
function saveBalances(b) { ls('bill_balances',b); debouncedCloudSave(); }
// Income / Paycheck tracking
function getIncome() {
  const s=ls('bill_income');
  return s?JSON.parse(s):{chad:{amount:2200,frequency:'biweekly'},eric:{amount:1800,frequency:'biweekly'},nextPayday:'2026-07-03'};
}
function saveIncome(inc) { ls('bill_income',inc); debouncedCloudSave(); }
function getNextPayday() {
  const inc=getIncome();
  let next=new Date(inc.nextPayday+'T00:00:00');
  const today=new Date(); today.setHours(0,0,0,0);
  // Advance until next payday is in the future
  while(next<today) { next.setDate(next.getDate()+14); }
  return next;
}
function getDaysUntilPayday() {
  const next=getNextPayday();
  const today=new Date(); today.setHours(0,0,0,0);
  return Math.ceil((next-today)/86400000);
}
function getMonthlyIncome() {
  const inc=getIncome();
  const chadMonthly=inc.chad.frequency==='biweekly'?inc.chad.amount*2.17:inc.chad.frequency==='weekly'?inc.chad.amount*4.33:inc.chad.amount;
  const ericMonthly=inc.eric.frequency==='biweekly'?inc.eric.amount*2.17:inc.eric.frequency==='weekly'?inc.eric.amount*4.33:inc.eric.amount;
  return {chad:chadMonthly,eric:ericMonthly,total:chadMonthly+ericMonthly};
}
function getCurrentMonthKey() { const n=new Date(); return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0'); }
function getPaidThisMonth() { const s=ls('bill_paid_'+getCurrentMonthKey()); return s?JSON.parse(s):[]; }
function savePaidThisMonth(p) { ls('bill_paid_'+getCurrentMonthKey(),p); debouncedCloudSave(); }
function isBillPaid(id) { return getPaidThisMonth().includes(id); }
function markBillPaid(id) { const p=getPaidThisMonth(); if(p.includes(id)) return; p.push(id); savePaidThisMonth(p); const b=bills.find(x=>x.id===id); if(b){const bal=getBalances(); bal.checking=Math.max(0,bal.checking-b.amount); saveBalances(bal);} }
function unmarkBillPaid(id) { let p=getPaidThisMonth(); p=p.filter(x=>x!==id); savePaidThisMonth(p); const b=bills.find(x=>x.id===id); if(b){const bal=getBalances(); bal.checking+=b.amount; saveBalances(bal);} }

let bills = loadBills();

// CLOUD SYNC
function getAllData() {
  const extras={}, history={};
  bills.forEach(b=>{ extras[b.id]=getExtras(b.id); const h=getHistory(b.id); if(h.length>0) history[b.id]=h; });
  return {bills,extras,history,balances:getBalances(),income:getIncome(),paid:getPaidThisMonth(),paidMonth:getCurrentMonthKey(),updated:new Date().toISOString()};
}
function applyCloudData(data) {
  if(!data||!data.bills) return;
  bills=data.bills; ls('bill_tracker_data',bills);
  if(data.extras) Object.keys(data.extras).forEach(id=>ls('bill_extras_'+id,data.extras[id]));
  if(data.history) Object.keys(data.history).forEach(id=>ls('bill_history_'+id,data.history[id]));
  if(data.balances) ls('bill_balances',data.balances);
  if(data.income) ls('bill_income',data.income);
  if(data.paid&&data.paidMonth) ls('bill_paid_'+data.paidMonth,data.paid);
}
async function cloudSave() {
  if(!cloudEnabled) return;
  updateSyncStatus('Saving...');
  try { const r=await fetch('https://api.jsonbin.io/v3/b/'+JSONBIN_ID,{method:'PUT',headers:{'Content-Type':'application/json','X-Master-Key':JSONBIN_KEY},body:JSON.stringify(getAllData())}); updateSyncStatus(r.ok?'Saved':'Error'); } catch(e){ updateSyncStatus('Offline'); }
}
async function cloudLoad() {
  if(!cloudEnabled) return false;
  updateSyncStatus('Loading...');
  try { const r=await fetch('https://api.jsonbin.io/v3/b/'+JSONBIN_ID+'/latest',{headers:{'X-Master-Key':JSONBIN_KEY}}); if(r.ok){const j=await r.json(); if(j.record&&j.record.bills){applyCloudData(j.record); updateSyncStatus('Synced'); return true;}} updateSyncStatus('Error'); } catch(e){ updateSyncStatus('Offline'); }
  return false;
}
function updateSyncStatus(s) { const el=document.getElementById('syncStatus'); if(el) el.textContent=cloudEnabled?'\u{2601}\u{FE0F} '+s:'\u{1F4F1} Local'; }
let saveTimeout=null;
function debouncedCloudSave() { if(saveTimeout) clearTimeout(saveTimeout); saveTimeout=setTimeout(cloudSave,1500); }

// HELPERS
function getHostname(u) { try{return new URL(u).hostname;}catch(e){return u;} }
const CAT_EMOJI={Housing:'\u{1F3E0}',Transport:'\u{1F697}',Subscriptions:'\u{1F4FA}',Financing:'\u{1F4B3}',Pet:'\u{1F436}',Essentials:'\u{1F6D2}',Savings:'\u{1F48E}'};
function catEmoji(c){return CAT_EMOJI[c]||'\u{1F4CC}';}
const FREQ_LABEL={monthly:'Monthly',biweekly:'Bi-Weekly',weekly:'Weekly',quarterly:'Quarterly',annually:'Annually','one-time':'One-Time'};
function freqLabel(f){return FREQ_LABEL[f]||'Monthly';}
function monthlyEquivalent(b){const a=b.amount; switch(b.frequency){case'weekly':return a*4.33;case'biweekly':return a*2.17;case'quarterly':return a/3;case'annually':return a/12;default:return a;}}
function statusEmoji(c){return c==='badge-overdue'?'\u{1F534}':c==='badge-due-soon'?'\u{1F7E0}':c==='badge-upcoming'?'\u{1F7E2}':'\u{26AA}';}

function getUrgency(b) {
  if(!b.due) return {label:'No date',cls:'badge-no-date'};
  if(isBillPaid(b.id)) return {label:'Paid',cls:'badge-paid'};
  const today=new Date(), dueDate=new Date(today.getFullYear(),today.getMonth(),b.due);
  if(dueDate<today) {
    // Past due this month and not paid = OVERDUE
    return {label:'OVERDUE',cls:'badge-overdue'};
  }
  const days=Math.ceil((dueDate-today)/(86400000));
  if(days<=3) return {label:days+'d left',cls:'badge-overdue'};
  if(days<=7) return {label:days+'d left',cls:'badge-due-soon'};
  return {label:days+'d',cls:'badge-upcoming'};
}

function getDueDateStr(d){if(!d) return '\u{2014}'; const s=d===1?'st':d===2?'nd':d===3?'rd':'th'; return d+s;}
function getAverage(id){const h=getHistory(id); if(!h.length) return null; return h.reduce((s,e)=>s+e.amount,0)/h.length;}

// RENDER
let activeFilter='All', activeOwnerFilter='All', summaryDrilldown=null;
let catChart=null, forecastChart=null;

function renderSummary() {
  const bal=getBalances();
  const totalMonthly=bills.reduce((s,b)=>s+monthlyEquivalent(b),0);
  const paidCount=getPaidThisMonth().length;
  const overdueCount=bills.filter(b=>!isBillPaid(b.id)&&b.due&&getUrgency(b).cls==='badge-overdue').length;
  const remaining=totalMonthly-bills.filter(b=>isBillPaid(b.id)).reduce((s,b)=>s+b.amount,0);
  const active=k=>summaryDrilldown===k?' stat-card-active':'';

  const daysUntilPay=getDaysUntilPayday();
  const inc=getIncome();
  const paydayLabel=daysUntilPay===0?'Today!':daysUntilPay+'d';

  document.getElementById('summary').innerHTML=
    '<div class="stat-card'+active('checking')+'" data-summary="checking"><div class="emoji">\u{1F3E6}</div><div class="value">$'+bal.checking.toLocaleString(undefined,{minimumFractionDigits:2})+'</div><div class="label">Checking</div></div>'+
    '<div class="stat-card'+active('savings')+'" data-summary="savings"><div class="emoji">\u{1F48E}</div><div class="value">$'+bal.savings.toLocaleString(undefined,{minimumFractionDigits:2})+'</div><div class="label">Savings</div></div>'+
    '<div class="stat-card" data-summary="payday"><div class="emoji">\u{1F4B5}</div><div class="value">'+paydayLabel+'</div><div class="label">Next Payday</div></div>'+
    '<div class="stat-card'+active('all')+'" data-summary="all"><div class="emoji">\u{1F4B0}</div><div class="value">$'+Math.round(totalMonthly).toLocaleString()+'</div><div class="label">Bills Total</div></div>'+
    '<div class="stat-card'+active('chad')+'" data-summary="chad"><div class="emoji">\u{1F468}</div><div class="value">$'+bills.reduce((s,b)=>s+b.chad,0).toLocaleString()+'</div><div class="label">Chad</div></div>'+
    '<div class="stat-card'+active('eric')+'" data-summary="eric"><div class="emoji">\u{1F9D1}</div><div class="value">$'+bills.reduce((s,b)=>s+b.eric,0).toLocaleString()+'</div><div class="label">Eric</div></div>'+
    '<div class="stat-card'+(overdueCount>0?' stat-card-active':'')+'" data-summary="overdue"><div class="emoji">\u{1F6A8}</div><div class="value">'+overdueCount+'</div><div class="label">Overdue</div></div>'+
    '<div class="stat-card'+active('paid')+'" data-summary="paid"><div class="emoji">\u{2705}</div><div class="value">'+paidCount+'/'+bills.length+'</div><div class="label">Paid</div></div>';

  document.querySelectorAll('[data-summary]').forEach(card=>{
    card.addEventListener('click',function(){
      const k=this.dataset.summary;
      if(k==='checking'||k==='savings'){const bal=getBalances();const cur=k==='checking'?bal.checking:bal.savings;const v=prompt('Update '+(k==='checking'?'Checking':'Savings')+' balance:',cur.toFixed(2));if(v!==null&&!isNaN(parseFloat(v))){bal[k]=parseFloat(v);saveBalances(bal);render();}return;}
      if(k==='payday'){const inc=getIncome();const cAmt=prompt('Chad paycheck amount:',inc.chad.amount);if(cAmt===null)return;const eAmt=prompt('Eric paycheck amount:',inc.eric.amount);if(eAmt===null)return;const nextPay=prompt('Next payday (YYYY-MM-DD):',inc.nextPayday);if(nextPay===null)return;inc.chad.amount=parseFloat(cAmt)||0;inc.eric.amount=parseFloat(eAmt)||0;inc.nextPayday=nextPay;saveIncome(inc);render();return;}
      if(summaryDrilldown===k){summaryDrilldown=null;activeOwnerFilter='All';}
      else{summaryDrilldown=k;activeOwnerFilter=k==='chad'?'Chad':k==='eric'?'Eric':'All';activeFilter='All';}
      render();
    });
  });
}

function renderInsights() {
  const bal=getBalances();
  const totalMonthly=bills.reduce((s,b)=>s+monthlyEquivalent(b),0);
  const paidAmt=bills.filter(b=>isBillPaid(b.id)).reduce((s,b)=>s+b.amount,0);
  const remaining=totalMonthly-paidAmt;
  const overdues=bills.filter(b=>!isBillPaid(b.id)&&b.due&&getUrgency(b).cls==='badge-overdue');
  const afterBills=bal.checking-remaining;
  const income=getMonthlyIncome();
  const inc=getIncome();
  const netMonthly=income.total-totalMonthly;
  const daysUntilPay=getDaysUntilPayday();
  const nextPay=getNextPayday();
  const paydayStr=nextPay.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});

  let html='';
  // Payday info
  html+='<div class="insight-card insight-good"><div class="insight-title">\u{1F4B5} Next Payday</div><div class="insight-value good">'+paydayStr+(daysUntilPay===0?' (Today!)':' ('+daysUntilPay+' days)')+'</div><div style="font-size:11px;color:var(--text-secondary);margin-top:4px">Chad: $'+inc.chad.amount.toLocaleString()+' + Eric: $'+inc.eric.amount.toLocaleString()+' = $'+(inc.chad.amount+inc.eric.amount).toLocaleString()+'</div></div>';
  // Monthly income vs expenses
  html+='<div class="insight-card '+(netMonthly>=0?'insight-good':'insight-warn')+'"><div class="insight-title">\u{1F4CA} Monthly Net</div><div class="insight-value '+(netMonthly>=0?'good':'warn')+'">$'+income.total.toFixed(0)+' income - $'+totalMonthly.toFixed(0)+' bills = '+(netMonthly>=0?'+':'')+netMonthly.toFixed(0)+'</div></div>';
  // Overdue warning
  if(overdues.length>0){
    html+='<div class="insight-card insight-warn"><div class="insight-title">\u{1F6A8} Overdue Bills</div><div class="insight-value warn">'+overdues.map(b=>b.name).join(', ')+'</div></div>';
  }
  // Remaining this month
  html+='<div class="insight-card insight-info"><div class="insight-title">\u{1F4B8} Still Owed This Month</div><div class="insight-value">$'+remaining.toFixed(2)+' remaining of $'+totalMonthly.toFixed(2)+'</div></div>';
  // After all bills
  html+='<div class="insight-card '+(afterBills>=0?'insight-good':'insight-warn')+'"><div class="insight-title">\u{1F52E} After All Bills Paid</div><div class="insight-value '+(afterBills>=0?'good':'warn')+'">$'+afterBills.toFixed(2)+(afterBills<0?' (shortfall)':' remaining')+'</div></div>';
  // Savings rate
  const savingsBills=bills.filter(b=>b.category==='Savings');
  const savingsAmt=savingsBills.reduce((s,b)=>s+b.amount,0);
  if(savingsAmt>0){
    const rate=((savingsAmt/income.total)*100).toFixed(1);
    html+='<div class="insight-card insight-good"><div class="insight-title">\u{1F4C8} Savings Rate</div><div class="insight-value good">'+rate+'% of income ($'+savingsAmt.toLocaleString()+'/mo)</div></div>';
  }
  // Budget variance
  const totalEstimated=bills.reduce((s,b)=>s+(b.estimated||b.amount),0);
  const totalActual=bills.reduce((s,b)=>s+b.amount,0);
  const variance=totalActual-totalEstimated;
  if(variance!==0){
    const over=variance>0;
    html+='<div class="insight-card '+(over?'insight-warn':'insight-good')+'"><div class="insight-title">\u{1F4CA} Budget Variance</div><div class="insight-value '+(over?'warn':'good')+'">'+(over?'+':'')+variance.toFixed(2)+(over?' over budget':' under budget')+' (Est: $'+totalEstimated.toLocaleString()+' vs Actual: $'+totalActual.toLocaleString()+')</div></div>';
  }
  document.getElementById('insightsPanel').innerHTML=html;
}

function renderCharts() {
  // Category donut
  const catTotals={};
  bills.forEach(b=>{catTotals[b.category]=(catTotals[b.category]||0)+monthlyEquivalent(b);});
  const cats=Object.keys(catTotals);
  const catColors=['#10b981','#60a5fa','#a78bfa','#f59e0b','#f472b6','#4ecdc4','#8b5cf6'];

  if(catChart) catChart.destroy();
  const ctx1=document.getElementById('categoryChart').getContext('2d');
  catChart=new Chart(ctx1,{type:'doughnut',data:{labels:cats,datasets:[{data:cats.map(c=>Math.round(catTotals[c])),backgroundColor:catColors.slice(0,cats.length),borderWidth:0}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{font:{size:10},padding:8}}}}});

  // 6-month forecast bar — estimated vs actual
  const months=[];const now=new Date();
  for(let i=0;i<6;i++){const d=new Date(now.getFullYear(),now.getMonth()+i,1);months.push(d.toLocaleString('default',{month:'short'}));}
  const monthlyActual=bills.reduce((s,b)=>s+monthlyEquivalent(b),0);
  const monthlyEstimated=bills.reduce((s,b)=>s+monthlyEquivalent({...b,amount:b.estimated||b.amount}),0);

  if(forecastChart) forecastChart.destroy();
  const ctx2=document.getElementById('forecastChart').getContext('2d');
  forecastChart=new Chart(ctx2,{type:'bar',data:{labels:months,datasets:[
    {label:'Estimated',data:months.map(()=>Math.round(monthlyEstimated)),backgroundColor:'rgba(167,139,250,0.3)',borderColor:'#a78bfa',borderWidth:2,borderRadius:6},
    {label:'Actual',data:months.map(()=>Math.round(monthlyActual)),backgroundColor:'rgba(232,99,165,0.3)',borderColor:'#e863a5',borderWidth:2,borderRadius:6}
  ]},options:{responsive:true,plugins:{legend:{position:'top',labels:{font:{size:10}}}},scales:{y:{beginAtZero:true,ticks:{callback:v=>'$'+v.toLocaleString()}}}}});
}

function renderFilters() {
  const categories=['All',...new Set(bills.map(b=>b.category))];
  const owners=['All','Chad','Eric','Joint'];
  let html='<div class="filter-section">Category:</div><div class="filters">';
  categories.forEach(c=>{html+='<button class="filter-btn'+(activeFilter===c?' active':'')+'" data-cat-filter="'+c+'">'+c+'</button>';});
  html+='</div><div class="filter-section">Owner:</div><div class="filters">';
  owners.forEach(o=>{html+='<button class="filter-btn'+(activeOwnerFilter===o?' active':'')+'" data-owner-filter="'+o+'">'+o+'</button>';});
  html+='</div>';
  document.getElementById('filters').innerHTML=html;
  document.querySelectorAll('[data-cat-filter]').forEach(btn=>{btn.addEventListener('click',function(){activeFilter=this.dataset.catFilter;summaryDrilldown=null;render();});});
  document.querySelectorAll('[data-owner-filter]').forEach(btn=>{btn.addEventListener('click',function(){activeOwnerFilter=this.dataset.ownerFilter;summaryDrilldown=null;render();});});
}

function getFilteredBills() {
  let f=bills.filter(b=>{
    if(activeFilter!=='All'&&b.category!==activeFilter) return false;
    if(activeOwnerFilter==='Chad'&&b.owner==='E Solo') return false;
    if(activeOwnerFilter==='Eric'&&b.owner==='Solo') return false;
    if(activeOwnerFilter==='Joint'&&b.owner!=='Joint') return false;
    return true;
  });
  if(summaryDrilldown==='overdue') f=f.filter(b=>!isBillPaid(b.id)&&b.due&&getUrgency(b).cls==='badge-overdue');
  else if(summaryDrilldown==='paid') f=f.filter(b=>isBillPaid(b.id));
  return f;
}

function renderCards() {
  const filtered=getFilteredBills();
  const catSlug=c=>c.toLowerCase().replace(/\s/g,'');
  const cards=filtered.map(b=>{
    const urgency=getUrgency(b);const extras=getExtras(b.id);const history=getHistory(b.id);const avg=getAverage(b.id);
    const paid=isBillPaid(b.id);const ownerText=b.owner==='Joint'?'\u{1F91D} Joint':b.owner==='E Solo'?'Eric':'Chad';
    const payUrl=extras.url||'';const isOverdue=urgency.cls==='badge-overdue'&&!paid;
    const paidClass=paid?' bill-card-paid':'';const overdueClass=isOverdue?' bill-overdue':'';
    const payBtn=payUrl?'<a href="'+payUrl+'" target="_blank" class="btn-pay pay-link-inline">\u{1F4B8} Pay</a>':'';
    const markBtn=paid?'<button class="btn-unpaid" data-unpaid-id="'+b.id+'">\u{21A9}\u{FE0F} Undo</button>':'<button class="btn-mark-paid" data-paid-id="'+b.id+'">\u{2705} Mark Paid</button>';
    const est=b.estimated||b.amount;
    const amountDisplay=est!==b.amount?'$'+b.amount.toFixed(2)+' <span style="font-size:10px;color:var(--text-secondary);text-decoration:none;-webkit-text-fill-color:var(--text-secondary)">(est: $'+est.toFixed(2)+')</span>':'$'+b.amount.toFixed(2);
    let histHtml='';
    if(history.length>0){const recent=history.slice(-5);const mx=Math.max(...recent.map(h=>h.amount));histHtml='<div class="history-section"><div class="detail-label">\u{1F4C8} History</div><div class="history-bars">';recent.forEach(h=>{const pct=mx>0?Math.round(h.amount/mx*100):0;histHtml+='<div class="history-bar-wrap"><div class="history-bar" style="height:'+pct+'%"></div><div class="history-label">$'+h.amount+'</div><div class="history-date">'+h.date+'</div></div>';});histHtml+='</div>';if(avg!==null)histHtml+='<div class="history-avg">\u{1F4CA} Avg: $'+avg.toFixed(2)+'</div>';histHtml+='</div>';}

    return '<div class="bill-card cat-'+catSlug(b.category)+paidClass+overdueClass+'" data-id="'+b.id+'">'+
      '<div class="bill-header">'+
        '<span class="bill-name">'+catEmoji(b.category)+' '+b.name+'</span>'+
        '<span class="bill-amount">'+amountDisplay+'</span>'+
        '<span class="badge '+urgency.cls+'">'+statusEmoji(urgency.cls)+' '+urgency.label+'</span>'+
      '</div>'+
      '<div class="bill-meta">'+
        '<span class="cat-badge '+catSlug(b.category)+'">'+b.category+'</span>'+
        '<span class="owner-badge">'+ownerText+'</span>'+
        '<span class="badge badge-freq">'+freqLabel(b.frequency||'monthly')+'</span>'+
        (b.autopay==='yes'?'<span class="badge badge-autopay">\u{26A1} Auto</span>':'')+
        (b.due?'<span class="bill-due">\u{1F4C5} '+getDueDateStr(b.due)+'</span>':'')+
        (avg!==null?'<span class="bill-due">\u{1F4CA} ~$'+avg.toFixed(0)+'</span>':'')+
      '</div>'+
      '<div class="bill-details">'+
        '<div class="detail-grid">'+
          '<div class="detail-item"><div class="detail-label">\u{1F468} Chad</div><div class="detail-value">$'+b.chad.toFixed(2)+'</div></div>'+
          '<div class="detail-item"><div class="detail-label">\u{1F9D1} Eric</div><div class="detail-value">$'+b.eric.toFixed(2)+'</div></div>'+
          '<div class="detail-item"><div class="detail-label">\u{1F517} Pay Link</div><div class="detail-value">'+(payUrl?'<a href="'+payUrl+'" target="_blank" class="pay-link-inline">'+getHostname(payUrl)+'</a>':'<span class="detail-empty">Not set</span>')+'</div></div>'+
          '<div class="detail-item"><div class="detail-label">\u{1F511} Login</div><div class="detail-value">'+(extras.username||'<span class="detail-empty">Not set</span>')+'</div></div>'+
          '<div class="detail-item"><div class="detail-label">\u{1F512} Password</div><div class="detail-value">'+(extras.password?'\u{2022}\u{2022}\u{2022}\u{2022}\u{2022}\u{2022}':'<span class="detail-empty">Not set</span>')+'</div></div>'+
          '<div class="detail-item"><div class="detail-label">\u{1F4DD} Notes</div><div class="detail-value">'+(extras.notes||'<span class="detail-empty">None</span>')+'</div></div>'+
        '</div>'+histHtml+
        '<div class="detail-actions">'+markBtn+payBtn+
          '<button class="btn-history" data-history-id="'+b.id+'">\u{1F4C8}</button>'+
          '<button class="btn-edit" data-edit-id="'+b.id+'">\u{270F}\u{FE0F}</button>'+
          '<button class="btn-delete" data-delete-id="'+b.id+'">\u{1F5D1}\u{FE0F}</button>'+
        '</div></div></div>';
  }).join('');
  document.getElementById('billCards').innerHTML=cards;
  bindCardEvents();
}

function bindCardEvents() {
  document.querySelectorAll('.bill-card').forEach(c=>{c.addEventListener('click',function(e){if(e.target.closest('.detail-actions')||e.target.closest('.pay-link-inline'))return;this.classList.toggle('expanded');});});
  document.querySelectorAll('[data-edit-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();openModal(parseInt(this.dataset.editId));});});
  document.querySelectorAll('[data-delete-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();deleteBill(parseInt(this.dataset.deleteId));});});
  document.querySelectorAll('[data-history-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();openHistoryModal(parseInt(this.dataset.historyId));});});
  document.querySelectorAll('[data-paid-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();markBillPaid(parseInt(this.dataset.paidId));render();});});
  document.querySelectorAll('[data-unpaid-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();unmarkBillPaid(parseInt(this.dataset.unpaidId));render();});});
}

function render(){renderSummary();renderInsights();renderCharts();renderFilters();renderCards();}

// MODALS
let editingBillId=null;
function openModal(id){
  editingBillId=id;const b=bills.find(x=>x.id===id);const ex=getExtras(id);
  document.getElementById('modalTitle').textContent=b?'Edit Bill':'Add Bill';
  document.getElementById('editName').value=b?b.name:'';
  document.getElementById('editAmount').value=b?b.amount:'';
  document.getElementById('editEstimated').value=b?(b.estimated||b.amount):'';
  document.getElementById('editDue').value=b?(b.due||''):'';
  document.getElementById('editCategory').value=b?b.category:'Essentials';
  document.getElementById('editOwner').value=b?b.owner:'Solo';
  document.getElementById('editFrequency').value=b?(b.frequency||'monthly'):'monthly';
  document.getElementById('editAutopay').value=b?(b.autopay||'no'):'no';
  document.getElementById('editSplit').value=b?(b.split||''):'';
  document.getElementById('editChad').value=b?b.chad:'';
  document.getElementById('editEric').value=b?b.eric:'';
  document.getElementById('editUrl').value=ex.url||'';
  document.getElementById('editUsername').value=ex.username||'';
  document.getElementById('editPassword').value=ex.password||'';
  document.getElementById('editNotes').value=ex.notes||'';
  document.getElementById('modalOverlay').classList.add('active');
}
function openAddModal(){editingBillId=null;document.getElementById('modalTitle').textContent='Add New Bill';['editName','editAmount','editEstimated','editDue','editSplit','editChad','editEric','editUrl','editUsername','editPassword','editNotes'].forEach(id=>{document.getElementById(id).value='';});document.getElementById('editCategory').value='Essentials';document.getElementById('editOwner').value='Solo';document.getElementById('editFrequency').value='monthly';document.getElementById('editAutopay').value='no';document.getElementById('modalOverlay').classList.add('active');}
function closeModal(){document.getElementById('modalOverlay').classList.remove('active');document.getElementById('historyModal').classList.remove('active');editingBillId=null;}
function saveModal(){
  const name=document.getElementById('editName').value.trim();if(!name){alert('Name required');return;}
  const amount=parseFloat(document.getElementById('editAmount').value)||0;
  const estimated=parseFloat(document.getElementById('editEstimated').value)||amount;
  const dv=document.getElementById('editDue').value.trim();const due=dv?parseInt(dv):null;
  const category=document.getElementById('editCategory').value;
  const owner=document.getElementById('editOwner').value;
  const frequency=document.getElementById('editFrequency').value;
  const autopay=document.getElementById('editAutopay').value;
  const split=document.getElementById('editSplit').value.trim()||null;
  const chad=parseFloat(document.getElementById('editChad').value)||0;
  const eric=parseFloat(document.getElementById('editEric').value)||0;
  if(editingBillId!==null){const idx=bills.findIndex(x=>x.id===editingBillId);if(idx!==-1)bills[idx]={...bills[idx],name,amount,estimated,due,category,owner,frequency,autopay,split,chad,eric};}
  else{const nid=bills.length?Math.max(...bills.map(x=>x.id))+1:1;bills.push({id:nid,name,amount,estimated,due,owner,split,chad,eric,category,frequency,autopay});editingBillId=nid;}
  saveBills(bills);
  const extras={url:document.getElementById('editUrl').value.trim(),username:document.getElementById('editUsername').value.trim(),password:document.getElementById('editPassword').value.trim(),notes:document.getElementById('editNotes').value.trim()};
  saveExtras(editingBillId,extras);closeModal();render();
}

let historyBillId=null;
function openHistoryModal(id){historyBillId=id;const b=bills.find(x=>x.id===id);document.getElementById('historyModalTitle').textContent='\u{1F4C8} '+b.name;renderHistoryList();document.getElementById('historyModal').classList.add('active');const now=new Date();document.getElementById('historyDate').value=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');document.getElementById('historyAmount').value=b.amount;}
function renderHistoryList(){const h=getHistory(historyBillId);const avg=getAverage(historyBillId);let html='';if(!h.length){html='<p class="detail-empty">No history yet.</p>';}else{html='<div class="history-list">';h.forEach((e,i)=>{html+='<div class="history-row"><span>'+e.date+'</span><span>$'+e.amount.toFixed(2)+'</span><button class="history-remove-btn" data-history-remove="'+i+'">\u{2715}</button></div>';});html+='</div>';if(avg!==null)html+='<div class="history-avg-big">\u{1F4CA} Average: <strong>$'+avg.toFixed(2)+'</strong> over '+h.length+' months</div>';}document.getElementById('historyEntries').innerHTML=html;document.querySelectorAll('[data-history-remove]').forEach(b=>{b.addEventListener('click',function(){const idx=parseInt(this.dataset.historyRemove);const h=getHistory(historyBillId);h.splice(idx,1);saveHistory(historyBillId,h);renderHistoryList();});});}
function saveHistoryEntry(){const d=document.getElementById('historyDate').value.trim();const a=parseFloat(document.getElementById('historyAmount').value);if(!d||isNaN(a)){alert('Enter month and amount');return;}addHistoryEntry(historyBillId,a,d);renderHistoryList();document.getElementById('historyAmount').value='';}
function closeHistoryModal(){document.getElementById('historyModal').classList.remove('active');historyBillId=null;render();}

function deleteBill(id){const b=bills.find(x=>x.id===id);if(!confirm('Delete "'+b.name+'"?'))return;bills=bills.filter(x=>x.id!==id);saveBills(bills);lsDel('bill_extras_'+id);lsDel('bill_history_'+id);render();}
function resetAllData(){if(!confirm('Reset all bills to defaults?'))return;lsDel('bill_tracker_data');bills.forEach(b=>{lsDel('bill_extras_'+b.id);lsDel('bill_history_'+b.id);});lsDel('bill_balances');lsDel('bill_paid_'+getCurrentMonthKey());bills=loadBills();summaryDrilldown=null;render();}

// INIT
document.addEventListener('DOMContentLoaded',async function(){
  if(cloudEnabled){const ok=await cloudLoad();if(ok)bills=loadBills();}
  render();updateSyncStatus(cloudEnabled?'Synced':'Local');
  document.getElementById('addBillBtn').addEventListener('click',openAddModal);
  document.getElementById('modalCancelBtn').addEventListener('click',closeModal);
  document.getElementById('modalSaveBtn').addEventListener('click',saveModal);
  document.getElementById('resetLink').addEventListener('click',function(e){e.preventDefault();resetAllData();});
  document.getElementById('modalOverlay').addEventListener('click',function(e){if(e.target===e.currentTarget)closeModal();});
  document.getElementById('historyModal').addEventListener('click',function(e){if(e.target===e.currentTarget)closeHistoryModal();});
  document.getElementById('historyCloseBtn').addEventListener('click',closeHistoryModal);
  document.getElementById('historyAddBtn').addEventListener('click',saveHistoryEntry);
  document.getElementById('syncBtn').addEventListener('click',async function(){const ok=await cloudLoad();if(ok){bills=loadBills();render();}});
});
