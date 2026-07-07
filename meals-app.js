// ============================================================
// MEAL PLANNER v2 — Delete/cooked meals, reorder, ingredients,
// save-to-recipe, HEB grocery links, recipe management
// ============================================================
const JSONBIN_ID = '6a465cd8da38895dfe2240b7';
const JSONBIN_KEY = '$2a$10$mwPdOYfA/eT386ORY/YvhOFBhGT2LlLt51.cfjB1gjidZ2sHpEN0K';
const STORAGE_PREFIX = 'meals_';
const HEB_STORE_ID = '449'; // Round Rock - 1700 E Palm Valley Blvd
const HEB_SEARCH_URL = 'https://www.heb.com/search/?q=';
let cloudEnabled = JSONBIN_ID && JSONBIN_KEY;
let storageAvailable = true;
try { localStorage.setItem('_t','1'); localStorage.removeItem('_t'); } catch(e) { storageAvailable = false; }

function ls(k,v) { if(!storageAvailable) return v===undefined?null:undefined; if(v===undefined) return localStorage.getItem(STORAGE_PREFIX+k); localStorage.setItem(STORAGE_PREFIX+k, typeof v==='string'?v:JSON.stringify(v)); }
function lsDel(k) { if(storageAvailable) localStorage.removeItem(STORAGE_PREFIX+k); }

function loadMeals(){const s=ls('plan'); return s?JSON.parse(s):{};}
function saveMeals(d){ls('plan',d); debouncedCloudSave();}
function loadGroceries(){const s=ls('groceries'); return s?JSON.parse(s):DEFAULT_GROCERIES;}
function saveGroceries(d){ls('groceries',d); debouncedCloudSave();}
function loadPantry(){const s=ls('pantry'); return s?JSON.parse(s):DEFAULT_PANTRY;}
function savePantry(d){ls('pantry',d); debouncedCloudSave();}
function loadRecipes(){const s=ls('recipes'); return s?JSON.parse(s):DEFAULT_RECIPES;}
function saveRecipes(d){ls('recipes',d); debouncedCloudSave();}

const DEFAULT_GROCERIES = [
  {id:1,name:"Chicken Breast",qty:"2 lbs",aisle:"Meat",checked:false,notes:""},
  {id:2,name:"Rice",qty:"1 bag",aisle:"Pantry",checked:false,notes:"Jasmine"},
  {id:3,name:"Broccoli",qty:"2 heads",aisle:"Produce",checked:false,notes:""},
  {id:4,name:"Eggs",qty:"1 dozen",aisle:"Dairy",checked:false,notes:""},
  {id:5,name:"Milk",qty:"1 gallon",aisle:"Dairy",checked:false,notes:"2%"},
  {id:6,name:"Bread",qty:"1 loaf",aisle:"Bakery",checked:false,notes:"Whole wheat"},
  {id:7,name:"Bananas",qty:"1 bunch",aisle:"Produce",checked:false,notes:""},
  {id:8,name:"Ground Beef",qty:"1 lb",aisle:"Meat",checked:false,notes:"Lean"},
  {id:9,name:"Pasta",qty:"2 boxes",aisle:"Pantry",checked:false,notes:"Penne"},
  {id:10,name:"Tomato Sauce",qty:"2 jars",aisle:"Pantry",checked:false,notes:""},
];

const DEFAULT_PANTRY = [
  {id:1,name:"Rice",category:"Pantry",status:"good",notes:"Jasmine, 5lb bag"},
  {id:2,name:"Pasta (various)",category:"Pantry",status:"good",notes:""},
  {id:3,name:"Olive Oil",category:"Pantry",status:"full",notes:""},
  {id:4,name:"Soy Sauce",category:"Condiments",status:"good",notes:""},
  {id:5,name:"Salt/Pepper",category:"Spices",status:"full",notes:""},
  {id:6,name:"Garlic Powder",category:"Spices",status:"good",notes:""},
  {id:7,name:"Chicken Broth",category:"Canned",status:"good",notes:"3 cans"},
  {id:8,name:"Frozen Veggies",category:"Freezer",status:"good",notes:"Mixed bag"},
];

const DEFAULT_RECIPES = [
  {id:1,name:"Chicken Stir Fry",category:"Quick/Easy",time:25,ingredients:"2 chicken breasts\n2 cups mixed veggies\n3 tbsp soy sauce\n1 tbsp sesame oil\nRice",instructions:"1. Cut chicken into strips\n2. Stir fry chicken 5 min\n3. Add veggies, cook 4 min\n4. Add soy sauce and sesame oil\n5. Serve over rice",url:"",notes:""},
  {id:2,name:"Spaghetti Bolognese",category:"Comfort Food",time:35,ingredients:"1 lb ground beef\n1 jar tomato sauce\nSpaghetti\n3 cloves garlic\n1 onion\nParmesan",instructions:"1. Brown beef with garlic and onion\n2. Add sauce, simmer 20 min\n3. Boil pasta\n4. Top with parmesan",url:"",notes:""},
  {id:3,name:"Sheet Pan Fajitas",category:"Quick/Easy",time:30,ingredients:"2 chicken breasts sliced\n3 bell peppers\n1 onion\nFajita seasoning\nTortillas\nSour cream",instructions:"1. Slice chicken and veggies\n2. Toss with seasoning and oil\n3. Spread on sheet pan\n4. Bake 425F for 20 min\n5. Serve in tortillas",url:"",notes:""},
];

let meals=loadMeals(), groceries=loadGroceries(), pantry=loadPantry(), recipes=loadRecipes();
let currentWeekStart=getMonday(new Date());

// CLOUD
function getAllData(){return {meals,groceries,pantry,recipes,updated:new Date().toISOString()};}
function applyCloudData(data){
  if(!data) return;
  if(data.meals){meals=data.meals;ls('plan',meals);}
  if(data.groceries){groceries=data.groceries;ls('groceries',groceries);}
  if(data.pantry){pantry=data.pantry;ls('pantry',pantry);}
  if(data.recipes){recipes=data.recipes;ls('recipes',recipes);}
}
async function cloudSave(){
  if(!cloudEnabled) return; updateSyncStatus('Saving...');
  try{const r=await fetch('https://api.jsonbin.io/v3/b/'+JSONBIN_ID+'/latest',{headers:{'X-Master-Key':JSONBIN_KEY}});let ex={};if(r.ok){const j=await r.json();ex=j.record||{};}ex.mealPlanner=getAllData();const w=await fetch('https://api.jsonbin.io/v3/b/'+JSONBIN_ID,{method:'PUT',headers:{'Content-Type':'application/json','X-Master-Key':JSONBIN_KEY},body:JSON.stringify(ex)});updateSyncStatus(w.ok?'Saved':'Error');}catch(e){updateSyncStatus('Offline');}
}
async function cloudLoad(){
  if(!cloudEnabled) return false; updateSyncStatus('Loading...');
  try{const r=await fetch('https://api.jsonbin.io/v3/b/'+JSONBIN_ID+'/latest',{headers:{'X-Master-Key':JSONBIN_KEY}});if(r.ok){const j=await r.json();if(j.record&&j.record.mealPlanner){applyCloudData(j.record.mealPlanner);updateSyncStatus('Synced');return true;}}updateSyncStatus('Loaded');}catch(e){updateSyncStatus('Offline');}return false;
}
function updateSyncStatus(s){const el=document.getElementById('syncStatus');if(el)el.textContent=cloudEnabled?'\u{2601}\u{FE0F} '+s:'\u{1F4F1} Local';}
let saveTimeout=null;
function debouncedCloudSave(){if(saveTimeout)clearTimeout(saveTimeout);saveTimeout=setTimeout(cloudSave,1500);}

// HELPERS
function getMonday(d){const day=d.getDay();const diff=d.getDate()-day+(day===0?-6:1);return new Date(d.getFullYear(),d.getMonth(),diff);}
function formatDate(d){return d.toISOString().split('T')[0];}
function getDayShort(d){return d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});}
const MEAL_EMOJI={breakfast:'\u{1F95E}',lunch:'\u{1F96A}',dinner:'\u{1F372}',snack:'\u{1F34E}'};
function hebLink(item){return HEB_SEARCH_URL+encodeURIComponent(item);}

// ============================================================
// MEAL PLAN
// ============================================================
function renderWeekNav(){
  const end=new Date(currentWeekStart);end.setDate(end.getDate()+6);
  document.getElementById('mealWeekNav').innerHTML=
    '<button id="prevWeek">\u{2190}</button><span>'+currentWeekStart.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' - '+end.toLocaleDateString('en-US',{month:'short',day:'numeric'})+'</span><button id="nextWeek">\u{2192}</button>';
  document.getElementById('prevWeek').addEventListener('click',()=>{currentWeekStart.setDate(currentWeekStart.getDate()-7);renderMeals();});
  document.getElementById('nextWeek').addEventListener('click',()=>{currentWeekStart.setDate(currentWeekStart.getDate()+7);renderMeals();});
}

function renderMeals(){
  renderWeekNav();
  const today=formatDate(new Date());
  let html='';
  for(let i=0;i<7;i++){
    const d=new Date(currentWeekStart);d.setDate(d.getDate()+i);
    const key=formatDate(d);
    const isToday=key===today;
    const dayMeals=meals[key]||[];
    html+='<div class="day-card"><div class="day-header'+(isToday?' today':'')+'">'+getDayShort(d)+'</div>';
    dayMeals.forEach((m,idx)=>{
      const cookedClass=m.cooked?' meal-cooked':'';
      html+='<div class="meal-item'+cookedClass+'" data-meal-date="'+key+'" data-meal-idx="'+idx+'">'+
        '<div class="meal-type">'+(MEAL_EMOJI[m.type]||'')+' '+m.type+(m.cooked?' \u{2705}':'')+'</div>'+
        '<div class="meal-name">'+m.name+'</div>'+
        '<div class="meal-actions">'+
          (idx>0?'<span class="meal-move" data-move-date="'+key+'" data-move-idx="'+idx+'" data-move-dir="up">\u{2191}</span>':'')+
          (idx<dayMeals.length-1?'<span class="meal-move" data-move-date="'+key+'" data-move-idx="'+idx+'" data-move-dir="down">\u{2193}</span>':'')+
          '<span class="meal-del" data-del-date="'+key+'" data-del-idx="'+idx+'">\u{2715}</span>'+
        '</div>'+
      '</div>';
    });
    html+='<div class="add-meal-btn" data-add-date="'+key+'">+ Add</div></div>';
  }
  document.getElementById('mealGrid').innerHTML=html;

  // Bind events
  document.querySelectorAll('[data-add-date]').forEach(btn=>{btn.addEventListener('click',function(){openMealModal(this.dataset.addDate,null);});});
  document.querySelectorAll('.meal-item[data-meal-date]').forEach(item=>{
    item.addEventListener('click',function(e){
      if(e.target.closest('.meal-move')||e.target.closest('.meal-del')) return;
      openMealModal(this.dataset.mealDate,parseInt(this.dataset.mealIdx));
    });
  });
  document.querySelectorAll('.meal-move').forEach(btn=>{
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      const date=this.dataset.moveDate, idx=parseInt(this.dataset.moveIdx), dir=this.dataset.moveDir;
      const arr=meals[date];
      const swapIdx=dir==='up'?idx-1:idx+1;
      [arr[idx],arr[swapIdx]]=[arr[swapIdx],arr[idx]];
      saveMeals(meals);renderMeals();
    });
  });
  document.querySelectorAll('.meal-del').forEach(btn=>{
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      const date=this.dataset.delDate, idx=parseInt(this.dataset.delIdx);
      meals[date].splice(idx,1);
      if(meals[date].length===0) delete meals[date];
      saveMeals(meals);renderMeals();
    });
  });
}

let editingMealDate=null,editingMealIdx=null;
function openMealModal(date,idx){
  editingMealDate=date;editingMealIdx=idx;
  const existing=idx!==null?(meals[date]||[])[idx]:null;
  document.getElementById('mealModalTitle').textContent=existing?'Edit Meal':'Add Meal';
  document.getElementById('editMealName').value=existing?existing.name:'';
  document.getElementById('editMealType').value=existing?existing.type:'dinner';
  document.getElementById('editMealCook').value=existing?existing.cook:'Chad';
  document.getElementById('editMealIngredients').value=existing?(existing.ingredients||''):'';
  document.getElementById('editMealInstructions').value=existing?(existing.instructions||''):'';
  document.getElementById('editMealNotes').value=existing?(existing.notes||''):'';
  // Show/hide cooked and delete buttons
  const cookedBtn=document.getElementById('mealCookedBtn');
  const delBtn=document.getElementById('mealDeleteBtn');
  const saveRecBtn=document.getElementById('mealSaveRecipeBtn');
  if(existing){
    cookedBtn.style.display='inline-block';
    cookedBtn.textContent=existing.cooked?'\u{21A9}\u{FE0F} Unmark Cooked':'\u{2705} Mark Cooked';
    delBtn.style.display='inline-block';
    saveRecBtn.style.display='inline-block';
  } else {
    cookedBtn.style.display='none';
    delBtn.style.display='none';
    saveRecBtn.style.display='none';
  }
  document.getElementById('mealModal').classList.add('active');
}
function closeMealModal(){document.getElementById('mealModal').classList.remove('active');}
function saveMealModal(){
  const name=document.getElementById('editMealName').value.trim();if(!name){alert('Name required');return;}
  const type=document.getElementById('editMealType').value;
  const cook=document.getElementById('editMealCook').value;
  const ingredients=document.getElementById('editMealIngredients').value;
  const instructions=document.getElementById('editMealInstructions').value;
  const notes=document.getElementById('editMealNotes').value.trim();
  if(!meals[editingMealDate])meals[editingMealDate]=[];
  const mealObj={name,type,cook,ingredients,instructions,notes,cooked:false};
  if(editingMealIdx!==null){
    mealObj.cooked=meals[editingMealDate][editingMealIdx].cooked||false;
    meals[editingMealDate][editingMealIdx]=mealObj;
  } else {
    meals[editingMealDate].push(mealObj);
  }
  saveMeals(meals);closeMealModal();renderMeals();
}
function toggleMealCooked(){
  if(editingMealIdx===null) return;
  const m=meals[editingMealDate][editingMealIdx];
  m.cooked=!m.cooked;
  saveMeals(meals);closeMealModal();renderMeals();
}
function deleteMeal(){
  if(editingMealIdx===null) return;
  meals[editingMealDate].splice(editingMealIdx,1);
  if(meals[editingMealDate].length===0) delete meals[editingMealDate];
  saveMeals(meals);closeMealModal();renderMeals();
}
function saveAsRecipe(){
  if(editingMealIdx===null) return;
  const m=meals[editingMealDate][editingMealIdx];
  const cat=prompt('Recipe category? (Quick/Easy, Meal Prep, Comfort Food, Healthy, Date Night, Crockpot, Other)','Quick/Easy');
  if(cat===null) return;
  const nid=recipes.length?Math.max(...recipes.map(r=>r.id))+1:1;
  recipes.push({id:nid,name:m.name,category:cat,time:0,ingredients:m.ingredients||'',instructions:m.instructions||'',url:'',notes:m.notes||''});
  saveRecipes(recipes);
  alert(m.name+' saved to recipes!');
  renderRecipes();
}

// ============================================================
// GROCERY LIST — with HEB links + cart status
// ============================================================
function renderGrocerySummary(){
  const total=groceries.length;
  const inCart=groceries.filter(g=>g.inCart).length;
  const checked=groceries.filter(g=>g.checked).length;
  const needToFind=total-inCart;
  document.getElementById('grocerySummary').innerHTML=
    '<div class="stat-card"><div class="emoji">\u{1F6D2}</div><div class="value">'+total+'</div><div class="label">Total Items</div></div>'+
    '<div class="stat-card"><div class="emoji">\u{1F4E6}</div><div class="value">'+inCart+'</div><div class="label">In HEB Cart</div></div>'+
    '<div class="stat-card"><div class="emoji">\u{2705}</div><div class="value">'+checked+'</div><div class="label">Got It</div></div>'+
    '<div class="stat-card"><div class="emoji">\u{1F50D}</div><div class="value">'+needToFind+'</div><div class="label">Still Need</div></div>';
}

function renderGroceryList(){
  renderGrocerySummary();
  const aisles=[...new Set(groceries.map(g=>g.aisle))].sort();
  let html='';
  aisles.forEach(aisle=>{
    const items=groceries.filter(g=>g.aisle===aisle);
    html+='<div class="grocery-section-title">'+aisle+'</div>';
    items.forEach(item=>{
      const link=hebLink(item.name);
      const cartClass=item.inCart?' in-cart':'';
      const checkedClass=item.checked?' checked':'';
      html+='<div class="grocery-item'+checkedClass+cartClass+'" data-grocery-id="'+item.id+'">'+
        '<div class="check-box" data-check-id="'+item.id+'">'+(item.checked?'\u{2713}':'')+'</div>'+
        '<span class="item-name">'+item.name+(item.inCart&&!item.checked?' <span class="cart-badge">\u{1F4E6} In Cart</span>':'')+'</span>'+
        '<span class="item-qty">'+item.qty+'</span>'+
        '<span class="item-actions">'+
          '<button class="cart-toggle'+(item.inCart?' carted':'')+'" data-cart-id="'+item.id+'" title="'+(item.inCart?'Remove from cart':'Mark added to HEB cart')+'">\u{1F6D2}</button>'+
          '<a href="'+link+'" target="_blank" class="heb-link" title="Search on HEB.com">\u{1F50D}</a>'+
          '<button data-grocery-edit="'+item.id+'">\u{270F}\u{FE0F}</button>'+
          '<button data-grocery-del="'+item.id+'">\u{2715}</button>'+
        '</span>'+
      '</div>';
    });
  });
  document.getElementById('groceryList').innerHTML=html;
  document.querySelectorAll('[data-check-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();const id=parseInt(this.dataset.checkId);const idx=groceries.findIndex(g=>g.id===id);groceries[idx].checked=!groceries[idx].checked;saveGroceries(groceries);renderGroceryList();});});
  document.querySelectorAll('[data-cart-id]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();const id=parseInt(this.dataset.cartId);const idx=groceries.findIndex(g=>g.id===id);groceries[idx].inCart=!groceries[idx].inCart;saveGroceries(groceries);renderGroceryList();});});
  document.querySelectorAll('[data-grocery-edit]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();openGroceryModal(parseInt(this.dataset.groceryEdit));});});
  document.querySelectorAll('[data-grocery-del]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();groceries=groceries.filter(g=>g.id!==parseInt(this.dataset.groceryDel));saveGroceries(groceries);renderGroceryList();});});
}

let editingGroceryId=null;
function openGroceryModal(id){
  editingGroceryId=id;const g=id?groceries.find(x=>x.id===id):null;
  document.getElementById('groceryModalTitle').textContent=g?'Edit Item':'Add Item';
  document.getElementById('editGroceryName').value=g?g.name:'';
  document.getElementById('editGroceryQty').value=g?g.qty:'';
  document.getElementById('editGroceryAisle').value=g?g.aisle:'Produce';
  document.getElementById('editGroceryNotes').value=g?(g.notes||''):'';
  document.getElementById('groceryModal').classList.add('active');
}
function closeGroceryModal(){document.getElementById('groceryModal').classList.remove('active');editingGroceryId=null;}
function saveGroceryModal(){
  const name=document.getElementById('editGroceryName').value.trim();if(!name){alert('Name required');return;}
  const qty=document.getElementById('editGroceryQty').value.trim();
  const aisle=document.getElementById('editGroceryAisle').value;
  const notes=document.getElementById('editGroceryNotes').value.trim();
  if(editingGroceryId){const idx=groceries.findIndex(g=>g.id===editingGroceryId);groceries[idx]={...groceries[idx],name,qty,aisle,notes};}
  else{const nid=groceries.length?Math.max(...groceries.map(g=>g.id))+1:1;groceries.push({id:nid,name,qty,aisle,checked:false,notes});}
  saveGroceries(groceries);closeGroceryModal();renderGroceryList();
}

// ============================================================
// PANTRY
// ============================================================
function renderPantry(){
  const STATUS_E={full:'\u{1F7E2}',good:'\u{1F535}',low:'\u{1F7E1}',out:'\u{1F534}'};
  const STATUS_L={full:'Full',good:'Have Some',low:'Running Low',out:'Out'};
  const sorted=[...pantry].sort((a,b)=>{const o={out:0,low:1,good:2,full:3};return(o[a.status]||3)-(o[b.status]||3);});
  const cards=sorted.map(p=>{
    return '<div class="pantry-card" data-pantry-id="'+p.id+'">'+
      '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'+
        '<span style="font-weight:700;font-size:13px;flex:1">\u{1F4E6} '+p.name+'</span>'+
        '<span class="badge badge-'+p.status+'">'+STATUS_E[p.status]+' '+STATUS_L[p.status]+'</span>'+
      '</div>'+
      '<div style="margin-top:4px;font-size:10px;color:var(--text-secondary)">'+p.category+(p.notes?' \u{2022} '+p.notes:'')+'</div>'+
      '<div class="pantry-details"><div class="detail-actions">'+
        '<button class="btn-edit" data-pantry-edit="'+p.id+'">\u{270F}\u{FE0F} Edit</button>'+
        '<button class="btn-delete" data-pantry-del="'+p.id+'">\u{1F5D1}\u{FE0F}</button>'+
      '</div></div></div>';
  }).join('');
  document.getElementById('pantryList').innerHTML=cards;
  document.querySelectorAll('.pantry-card').forEach(c=>{c.addEventListener('click',function(e){if(e.target.closest('.detail-actions'))return;this.classList.toggle('expanded');});});
  document.querySelectorAll('[data-pantry-edit]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();openPantryModal(parseInt(this.dataset.pantryEdit));});});
  document.querySelectorAll('[data-pantry-del]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();pantry=pantry.filter(p=>p.id!==parseInt(this.dataset.pantryDel));savePantry(pantry);renderPantry();});});
}

let editingPantryId=null;
function openPantryModal(id){
  editingPantryId=id;const p=id?pantry.find(x=>x.id===id):null;
  document.getElementById('pantryModalTitle').textContent=p?'Edit Item':'Add Item';
  document.getElementById('editPantryName').value=p?p.name:'';
  document.getElementById('editPantryCategory').value=p?p.category:'Pantry';
  document.getElementById('editPantryStatus').value=p?p.status:'full';
  document.getElementById('editPantryNotes').value=p?(p.notes||''):'';
  document.getElementById('pantryModal').classList.add('active');
}
function closePantryModal(){document.getElementById('pantryModal').classList.remove('active');editingPantryId=null;}
function savePantryModal(){
  const name=document.getElementById('editPantryName').value.trim();if(!name){alert('Name required');return;}
  const category=document.getElementById('editPantryCategory').value;
  const status=document.getElementById('editPantryStatus').value;
  const notes=document.getElementById('editPantryNotes').value.trim();
  if(editingPantryId){const idx=pantry.findIndex(p=>p.id===editingPantryId);pantry[idx]={...pantry[idx],name,category,status,notes};}
  else{const nid=pantry.length?Math.max(...pantry.map(p=>p.id))+1:1;pantry.push({id:nid,name,category,status,notes});}
  savePantry(pantry);closePantryModal();renderPantry();
}

// ============================================================
// RECIPES — grouped by category, reorderable, deletable
// ============================================================
function renderRecipes(){
  const cats=[...new Set(recipes.map(r=>r.category))].sort();
  let html='';
  cats.forEach(cat=>{
    const catRecipes=recipes.filter(r=>r.category===cat);
    html+='<div class="recipe-category-title">'+cat+' ('+catRecipes.length+')</div>';
    catRecipes.forEach((r,localIdx)=>{
      const globalIdx=recipes.indexOf(r);
      const ingLines=(r.ingredients||'').split('\n').filter(i=>i.trim());
      const instrLines=(r.instructions||'').split('\n').filter(i=>i.trim());
      const ingBullets=ingLines.map(i=>'\u{2022} '+i).join('<br>');
      const instrSteps=instrLines.map((s,i)=>s).join('<br>');

      html+='<div class="recipe-card" data-recipe-id="'+r.id+'">'+
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'+
          '<span style="font-weight:700;font-size:13px;flex:1">\u{1F4D6} '+r.name+'</span>'+
          '<span class="badge badge-good">'+r.category+'</span>'+
          (r.time?'<span style="font-size:10px;color:var(--text-secondary)">\u{23F1}\u{FE0F} '+r.time+'min</span>':'')+
        '</div>'+
        '<div style="margin-top:4px;font-size:10px;color:var(--text-secondary)">'+ingLines.slice(0,3).join(' \u{2022} ')+(ingLines.length>3?' +more':'')+'</div>'+
        '<div class="recipe-details">'+
          '<div class="detail-grid">'+
            '<div class="detail-item" style="grid-column:1/-1"><div class="detail-label">\u{1F955} Ingredients</div><div class="detail-value">'+
              (ingBullets||'<span class="detail-empty">None</span>')+'</div></div>'+
            (instrSteps?'<div class="detail-item" style="grid-column:1/-1"><div class="detail-label">\u{1F4DD} Instructions</div><div class="detail-value">'+instrSteps+'</div></div>':'')+
            (r.url?'<div class="detail-item"><div class="detail-label">\u{1F517} Link</div><div class="detail-value"><a href="'+r.url+'" target="_blank" style="color:var(--accent)">Open Recipe</a></div></div>':'')+
            (r.notes?'<div class="detail-item"><div class="detail-label">\u{1F4AC} Notes</div><div class="detail-value">'+r.notes+'</div></div>':'')+
          '</div>'+
          '<div class="detail-actions">'+
            '<button class="add-btn" data-recipe-to-plan="'+r.id+'" style="font-size:10px;padding:4px 10px">+ Meal Plan</button>'+
            '<button class="btn-edit" data-recipe-edit="'+r.id+'">\u{270F}\u{FE0F}</button>'+
            (globalIdx>0?'<button class="btn-move" data-recipe-move-id="'+r.id+'" data-recipe-move-dir="up">\u{2191}</button>':'')+
            (globalIdx<recipes.length-1?'<button class="btn-move" data-recipe-move-id="'+r.id+'" data-recipe-move-dir="down">\u{2193}</button>':'')+
            '<button class="btn-delete" data-recipe-del="'+r.id+'">\u{1F5D1}\u{FE0F}</button>'+
          '</div>'+
        '</div></div>';
    });
  });
  if(recipes.length===0) html='<p style="color:var(--text-secondary);text-align:center;padding:20px">No recipes saved yet. Add one or save from a meal!</p>';
  document.getElementById('recipeCards').innerHTML=html;

  document.querySelectorAll('.recipe-card').forEach(c=>{c.addEventListener('click',function(e){if(e.target.closest('.detail-actions'))return;this.classList.toggle('expanded');});});
  document.querySelectorAll('[data-recipe-edit]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();openRecipeModal(parseInt(this.dataset.recipeEdit));});});
  document.querySelectorAll('[data-recipe-del]').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();if(confirm('Delete this recipe?')){recipes=recipes.filter(r=>r.id!==parseInt(this.dataset.recipeDel));saveRecipes(recipes);renderRecipes();}});});
  document.querySelectorAll('[data-recipe-move-id]').forEach(b=>{b.addEventListener('click',function(e){
    e.stopPropagation();
    const id=parseInt(this.dataset.recipeMoveId);const dir=this.dataset.recipeMoveDir;
    const idx=recipes.findIndex(r=>r.id===id);
    const swapIdx=dir==='up'?idx-1:idx+1;
    if(swapIdx<0||swapIdx>=recipes.length) return;
    [recipes[idx],recipes[swapIdx]]=[recipes[swapIdx],recipes[idx]];
    saveRecipes(recipes);renderRecipes();
  });});
  document.querySelectorAll('[data-recipe-to-plan]').forEach(b=>{b.addEventListener('click',function(e){
    e.stopPropagation();
    const r=recipes.find(x=>x.id===parseInt(this.dataset.recipeToPlan));
    const date=prompt('Add to which date? (YYYY-MM-DD)',formatDate(new Date()));
    if(!date) return;
    if(!meals[date])meals[date]=[];
    meals[date].push({name:r.name,type:'dinner',cook:'Both',ingredients:r.ingredients||'',instructions:r.instructions||'',notes:r.notes||'',cooked:false});
    saveMeals(meals);alert(r.name+' added to '+date);renderMeals();
  });});
}

let editingRecipeId=null;
function openRecipeModal(id){
  editingRecipeId=id;const r=id?recipes.find(x=>x.id===id):null;
  document.getElementById('recipeModalTitle').textContent=r?'Edit Recipe':'Add Recipe';
  document.getElementById('editRecipeName').value=r?r.name:'';
  document.getElementById('editRecipeCategory').value=r?r.category:'Quick/Easy';
  document.getElementById('editRecipeTime').value=r?(r.time||''):'';
  document.getElementById('editRecipeIngredients').value=r?(r.ingredients||''):'';
  document.getElementById('editRecipeInstructions').value=r?(r.instructions||''):'';
  document.getElementById('editRecipeUrl').value=r?(r.url||''):'';
  document.getElementById('editRecipeNotes').value=r?(r.notes||''):'';
  document.getElementById('recipeModal').classList.add('active');
}
function closeRecipeModal(){document.getElementById('recipeModal').classList.remove('active');editingRecipeId=null;}
function saveRecipeModal(){
  const name=document.getElementById('editRecipeName').value.trim();if(!name){alert('Name required');return;}
  const category=document.getElementById('editRecipeCategory').value;
  const time=parseInt(document.getElementById('editRecipeTime').value)||0;
  const ingredients=document.getElementById('editRecipeIngredients').value;
  const instructions=document.getElementById('editRecipeInstructions').value;
  const url=document.getElementById('editRecipeUrl').value.trim();
  const notes=document.getElementById('editRecipeNotes').value.trim();
  if(editingRecipeId){const idx=recipes.findIndex(r=>r.id===editingRecipeId);recipes[idx]={...recipes[idx],name,category,time,ingredients,instructions,url,notes};}
  else{const nid=recipes.length?Math.max(...recipes.map(r=>r.id))+1:1;recipes.push({id:nid,name,category,time,ingredients,instructions,url,notes});}
  saveRecipes(recipes);closeRecipeModal();renderRecipes();
}

// ============================================================
// INIT
// ============================================================
function renderAll(){renderMeals();renderGroceryList();renderPantry();renderRecipes();}

document.addEventListener('DOMContentLoaded',async function(){
  if(cloudEnabled){const ok=await cloudLoad();if(ok){meals=loadMeals();groceries=loadGroceries();pantry=loadPantry();recipes=loadRecipes();}}
  renderAll();updateSyncStatus(cloudEnabled?'Synced':'Local');

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn=>{btn.addEventListener('click',function(){document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));this.classList.add('active');document.getElementById(this.dataset.tab+'Tab').classList.add('active');});});

  // Meal modal
  document.getElementById('mealModalCancelBtn').addEventListener('click',closeMealModal);
  document.getElementById('mealModalSaveBtn').addEventListener('click',saveMealModal);
  document.getElementById('mealCookedBtn').addEventListener('click',toggleMealCooked);
  document.getElementById('mealDeleteBtn').addEventListener('click',deleteMeal);
  document.getElementById('mealSaveRecipeBtn').addEventListener('click',saveAsRecipe);
  document.getElementById('mealModal').addEventListener('click',function(e){if(e.target===e.currentTarget)closeMealModal();});

  // Grocery modal
  document.getElementById('addGroceryBtn').addEventListener('click',function(){openGroceryModal(null);});
  document.getElementById('groceryModalCancelBtn').addEventListener('click',closeGroceryModal);
  document.getElementById('groceryModalSaveBtn').addEventListener('click',saveGroceryModal);
  document.getElementById('groceryModal').addEventListener('click',function(e){if(e.target===e.currentTarget)closeGroceryModal();});
  document.getElementById('clearCheckedBtn').addEventListener('click',function(){groceries=groceries.filter(g=>!g.checked);saveGroceries(groceries);renderGroceryList();});

  // Pantry modal
  document.getElementById('addPantryBtn').addEventListener('click',function(){openPantryModal(null);});
  document.getElementById('pantryModalCancelBtn').addEventListener('click',closePantryModal);
  document.getElementById('pantryModalSaveBtn').addEventListener('click',savePantryModal);
  document.getElementById('pantryModal').addEventListener('click',function(e){if(e.target===e.currentTarget)closePantryModal();});

  // Recipe modal
  document.getElementById('addRecipeBtn').addEventListener('click',function(){openRecipeModal(null);});
  document.getElementById('recipeModalCancelBtn').addEventListener('click',closeRecipeModal);
  document.getElementById('recipeModalSaveBtn').addEventListener('click',saveRecipeModal);
  document.getElementById('recipeModal').addEventListener('click',function(e){if(e.target===e.currentTarget)closeRecipeModal();});

  // Sync + Reset
  document.getElementById('syncBtn').addEventListener('click',async function(){const ok=await cloudLoad();if(ok){meals=loadMeals();groceries=loadGroceries();pantry=loadPantry();recipes=loadRecipes();renderAll();}});
  document.getElementById('resetLink').addEventListener('click',function(e){e.preventDefault();if(!confirm('Reset all meal data?'))return;['plan','groceries','pantry','recipes'].forEach(k=>lsDel(k));meals=loadMeals();groceries=loadGroceries();pantry=loadPantry();recipes=loadRecipes();renderAll();});
});
