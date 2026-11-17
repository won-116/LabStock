const KEY='lapstock_personal_v1';
let db=load();
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{items:[],history:[],orders:[],locations:[]}}catch{return{items:[],history:[],orders:[],locations:[]}}}
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function page(p){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===p));document.querySelectorAll('[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===p));window.scrollTo(0,0)}
function status(i){return Number(i.qty)<=0?'out':Number(i.qty)<=Number(i.min)?'low':'ok'}
function ensureAutoOrder(i){
  const st=status(i);
  if(st==='ok') return;
  const exists=db.orders.some(o=>o.itemId===i.id&&!o.done);
  if(!exists) db.orders.push({id:crypto.randomUUID(),itemId:i.id,name:i.name,qty:1,unit:i.unit,price:'',requester:'',note:'재고 기준 이하로 자동 생성',done:false,auto:true});
}
function syncAutoOrders(){db.items.forEach(ensureAutoOrder)}
function render(){
  syncAutoOrders();
  $('total').textContent=db.items.length;
  $('low').textContent=db.items.filter(i=>status(i)==='low').length;
  $('out').textContent=db.items.filter(i=>status(i)==='out').length;
  $('pending').textContent=db.orders.filter(o=>!o.done).length;
  const low=db.items.filter(i=>status(i)!=='ok');
  $('lowItems').innerHTML=low.length?low.map(i=>`<div class="log"><div><strong>${esc(i.name)}</strong><small>${Number(i.qty)} ${esc(i.unit)}</small></div><span class="pill ${status(i)}">${status(i)==='out'?'품절':'부족'}</span></div>`).join(''):'<div class="empty">재고 부족 품목이 없어.</div>';
  const q=$('search').value.toLowerCase(),cat=$('category').value,st=$('stock').value;
  const list=db.items.filter(i=>(!q||[i.name,i.maker,i.location].join(' ').toLowerCase().includes(q))&&(!cat||i.category===cat)&&(!st||status(i)===st));
  $('rows').innerHTML=list.map(i=>`<tr><td><b>${esc(i.name)}</b></td><td>${esc(i.category)}</td><td><div class="qty-edit"><input class="qty-input" type="number" min="0" step="any" value="${Number(i.qty)}" data-qty="${i.id}" aria-label="${esc(i.name)} 현재 수량"><span>${esc(i.unit)}</span></div></td><td>${Number(i.min)} ${esc(i.unit)}</td><td><span class="pill ${status(i)}">${status(i)==='ok'?'충분':status(i)==='low'?'부족':'품절'}</span></td></tr>`).join('');
  $('invEmpty').classList.toggle('hidden',list.length>0);
  const of=$('orderFilter').value;
  const orders=db.orders.filter(o=>of==='all'||!o.done);
  $('orderList').innerHTML=orders.map(o=>`<div class="order"><div><strong>${esc(o.name)} ${o.auto?'<span class="pill">자동 요청</span>':''}</strong><small>${Number(o.qty)||1} ${esc(o.unit||'')} ${o.note?'· '+esc(o.note):''}</small></div><div class="order-actions"><button class="rowbtn complete-order" data-complete-order="${o.id}">주문요청 완료</button></div></div>`).join('')||'<div class="empty">현재 주문 요청이 없어.</div>';
  const iq=($('infoSearch')?.value||'').toLowerCase();
  const infoItems=db.items.filter(i=>!iq||[i.name,i.category,i.maker,i.catalog].join(' ').toLowerCase().includes(iq));
  $('infoList').innerHTML=infoItems.map(i=>`<div class="info-row"><div class="info-line"><strong>${esc(i.name)}</strong><span>${esc(i.category||'-')}</span><span>${Number(i.qty)} ${esc(i.unit)} / 최소 ${Number(i.min)} ${esc(i.unit)}</span><span>${esc(i.maker||'-')}</span><span>${esc(i.catalog||'-')}</span><span>${esc(i.location||'-')}</span><span>${esc(i.storageTemp||'-')}</span><span>${esc(i.memo||'-')}</span><span class="pill ${status(i)}">${status(i)==='ok'?'충분':status(i)==='low'?'부족':'품절'}</span><button class="rowbtn" data-edit="${i.id}">수정</button></div></div>`).join('')||'<div class="empty">등록된 품목이 없어.</div>' 
}
document.addEventListener('click',e=>{
 const p=e.target.closest('[data-page]');if(p){e.preventDefault();page(p.dataset.page)}
 const a=e.target.closest('[data-action]');if(a){if(a.dataset.action==='item')openItem();if(a.dataset.action==='order')$('orderDialog').showModal()}
 if(e.target.matches('[data-close]'))e.target.closest('dialog').close();
 const t=e.target;
 if(t.dataset.edit)openItem(t.dataset.edit);
 if(t.dataset.completeOrder){db.orders=db.orders.filter(o=>o.id!==t.dataset.completeOrder);save();toast('주문 요청을 목록에서 제거했어.')}
});
function openItem(id){
 const i=db.items.find(x=>x.id===id);$('itemForm').reset();$('itemId').value=i?.id||'';$('itemTitle').textContent=i?'품목 정보 수정':'품목 추가';
 $('itemName').value=i?.name||'';$('itemCat').value=i?.category||'시약';$('itemQty').value=i?.qty??0;$('itemUnit').value=i?.unit||'';$('itemMin').value=i?.min??0;$('itemMaker').value=i?.maker||'';$('itemCatalog').value=i?.catalog||'';$('itemLoc').value=i?.location||'';$('itemStorageTemp').value=i?.storageTemp||'';$('itemMemo').value=i?.memo||'';$('itemDialog').showModal()
}
$('itemForm').onsubmit=e=>{
 e.preventDefault();const id=$('itemId').value,old=db.items.find(x=>x.id===id);
 const item={id:id||crypto.randomUUID(),name:$('itemName').value.trim(),category:$('itemCat').value,qty:Number($('itemQty').value),unit:$('itemUnit').value.trim(),min:Number($('itemMin').value),maker:$('itemMaker').value,catalog:$('itemCatalog').value,location:$('itemLoc').value,storageTemp:$('itemStorageTemp').value,memo:$('itemMemo').value};
 if(old)Object.assign(old,item);else db.items.push(item);
 ensureAutoOrder(item);$('itemDialog').close();save();toast('품목을 저장했어.')
};
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.matches('[data-qty]')){
  const i=db.items.find(x=>x.id===t.dataset.qty);if(!i)return;
  const n=Number(t.value);if(!Number.isFinite(n)||n<0){t.value=i.qty;toast('수량은 0 이상으로 입력해 줘.');return}
  const before=status(i);i.qty=n;ensureAutoOrder(i);save();
  const after=status(i);
  if(after!=='ok'&&before==='ok')toast(after==='out'?'품절되어 주문 요청에 추가했어.':'재고 부족으로 주문 요청에 추가했어.');
  else toast('재고 수량을 변경했어.')
 }
});
$('orderForm').onsubmit=e=>{
 e.preventDefault();db.orders.push({id:crypto.randomUUID(),name:$('orderName').value,qty:Number($('orderQty').value),unit:$('orderUnit').value,price:$('orderPrice').value,requester:$('orderRequester').value,note:$('orderNote').value,done:false,auto:false});
 $('orderDialog').close();e.target.reset();save();toast('주문 요청을 추가했어.')
};
['search','category','stock','orderFilter','infoSearch'].forEach(id=>$(id)?.addEventListener('input',render));
function download(name,text,type='text/plain'){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([text],{type}));a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)}
$('backupBtn').onclick=()=>download('LabStock_backup_'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(db,null,2),'application/json');
function csv(rows,name){const data=rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');download(name,'\ufeff'+data,'text/csv;charset=utf-8')}
$('csvBtn').onclick=()=>csv([['품목명','분류','현재수량','단위','최소재고','제조사','제품번호','보관위치','보관온도','메모'],...db.items.map(i=>[i.name,i.category,i.qty,i.unit,i.min,i.maker,i.catalog,i.location,i.expiry,i.memo])],'LabStock_inventory.csv');
$('importBtn').onclick=()=>$('fileInput').click();
$('fileInput').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{
  let rows;
  if(f.name.toLowerCase().endsWith('.csv')){const txt=await f.text();rows=txt.replace(/^\uFEFF/,'').split(/\r?\n/).map(x=>x.split(','))}
  else{if(!window.XLSX)throw Error('엑셀 라이브러리를 불러오지 못했어.');const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''})}
  const headers=rows.shift().map(x=>String(x).trim().toLowerCase()),find=names=>headers.findIndex(h=>names.some(n=>h.includes(n)));
  const ix={name:find(['품목명','품목','시약명','제품명','name']),cat:find(['분류','category']),qty:find(['수량','재고','quantity']),unit:find(['단위','unit']),min:find(['최소 재고','최소재고','min']),maker:find(['제조사','제조원','maker']),catalog:find(['제품 번호','제품번호','cat. no','catalog']),loc:find(['보관 위치','보관위치','위치','location']),temp:find(['보관온도','보관 온도','보관온도(°c)','storage temperature','temperature']),memo:find(['메모','비고','memo'])};
  if(ix.name<0)throw Error('품목명 열을 찾지 못했어. 첫 행에 품목명이라는 제목을 넣어줘.');
  let count=0;
  rows.forEach(r=>{const name=String(r[ix.name]??'').trim();if(!name)return;const item={id:crypto.randomUUID(),name,category:ix.cat>=0?(r[ix.cat]||'기타'):'기타',qty:Number(ix.qty>=0?r[ix.qty]:0)||0,unit:ix.unit>=0?(r[ix.unit]||'개'):'개',min:Number(ix.min>=0?r[ix.min]:0)||0,maker:ix.maker>=0?r[ix.maker]||'':'',catalog:ix.catalog>=0?r[ix.catalog]||'':'',location:ix.loc>=0?r[ix.loc]||'':'',storageTemp:(ix.temp>=0?r[ix.temp]||'':'') ,memo:ix.memo>=0?r[ix.memo]||'':''};db.items.push(item);ensureAutoOrder(item);count++});
  save();toast(`${count}개 품목을 가져왔어.`)
 }catch(err){alert(err.message||'파일을 읽지 못했어.')}finally{e.target.value=''}
};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
