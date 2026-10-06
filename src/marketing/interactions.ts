// @ts-nocheck
/* eslint-disable */
export function initMarketing(): () => void {
  const ac=new AbortController();
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const idr=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const qty=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,',');
  let nextOrder=1045;

  /* ── nav ── */
  const nav=$('#nav'), burger=$('#burger'), menu=$('#menu');
  burger.addEventListener('click',()=>{
    const open=menu.hidden; menu.hidden=!open;
    burger.setAttribute('aria-expanded',String(open));
    burger.setAttribute('aria-label',open?'Close menu':'Open menu');
    nav.classList.toggle('scrolled',open||scrollY>12);
  });
  $$('a',menu).forEach(a=>a.addEventListener('click',()=>{menu.hidden=true;burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Open menu');}));

  /* ── hero chart ── */
  const H=[2.1,4.6,5.4,4.8,6.3,9.7,8.2,1.75], MAX=9.7;
  $('#bars').innerHTML=Array.from({length:15},(_,i)=>{
    const v=H[i]; const cls=i===7?'now':(v?'':'ghost'); const h=v?Math.max(6,v/MAX*100):3;
    return `<i class="${cls}" style="height:${h}%"></i>`;
  }).join('');
  $('#blabels').innerHTML=Array.from({length:15},(_,i)=>`<span>${(i%3===0||i===14)?String(7+i).padStart(2,'0'):''}</span>`).join('');

  /* ── scroll-driven: nav, hero tilt, story ── */
  const stage=$('#stage'), tilt=$('#tilt'), storyP=$$('#storyList p');
  let ticking=false;
  function update(){
    ticking=false;
    nav.classList.toggle('scrolled',scrollY>12||!menu.hidden);
    const vh=innerHeight;
    if(!reduce && innerWidth>760){
      const r=stage.getBoundingClientRect();
      const p=clamp((vh*.9-r.top)/(vh*.6),0,1);
      tilt.style.transform=`rotateX(${((1-p)*8).toFixed(2)}deg) scale(${(.95+.05*p).toFixed(4)})`;
      stage.style.setProperty('--p',p.toFixed(3));
    }
    if(!reduce){
      storyP.forEach(el=>{
        const r=el.getBoundingClientRect();
        const d=Math.abs(r.top+r.height/2-vh*.5)/(vh*.42);
        el.style.opacity=clamp(1.3-d*1.15,.16,1).toFixed(3);
      });
    }
  }
  const req=()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}};
  addEventListener('scroll',req,{passive:true,signal:ac.signal}); addEventListener('resize',req,{signal:ac.signal}); update();

  /* ── diagram reveal (one-time) ── */
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.3});
  $$('[data-reveal]').forEach(el=>io.observe(el));

  /* ── POS demo ── */
  const MENU={
    Coffee:[['Espresso',25000],['Americano',28000],['Cafe Latte',35000],['Cappuccino',35000],['Mocha',42000],['Flat White',38000]],
    Pastry:[['Butter Croissant',25000],['Pain au Chocolat',32000],['Cinnamon Roll',30000],['Banana Bread',22000]],
    Retail:[['House Blend 250 g',95000],['Tumbler 350 ml',150000],['Drip Bags (5)',60000]]
  };
  let tab='Coffee', charging=false;
  let cart=[
    {key:'Cafe Latte|oat|less',name:'Cafe Latte',mods:['Oat milk (+10.000)','Less sugar'],unit:45000,qty:2},
    {key:'Butter Croissant',name:'Butter Croissant',mods:[],unit:25000,qty:1}
  ];
  const ptabs=$('#ptabs'), items=$('#items'), lines=$('#cartLines'), foot=$('#cartFoot');
  function renderMenu(){
    ptabs.innerHTML=Object.keys(MENU).map(k=>`<button class="ptab" role="tab" aria-selected="${k===tab}" data-tab="${k}">${k}</button>`).join('');
    items.innerHTML=MENU[tab].map(([n,p])=>`<button class="item" data-add="${n}" data-price="${p}"><b>${n}</b><span>${idr(p)}</span></button>`).join('');
  }
  function totals(){const sub=cart.reduce((s,l)=>s+l.unit*l.qty,0);const tax=Math.round(sub*.1);return{sub,tax,total:sub+tax};}
  function renderCart(){
    lines.innerHTML=cart.length?cart.map((l,i)=>`
      <div class="cl"><div><div class="cl-n">${l.qty}× ${l.name}</div>${l.mods.map(m=>`<div class="cl-m">${m}</div>`).join('')}
        <div class="stepper"><button data-dec="${i}" aria-label="Remove one ${l.name}">−</button><button data-inc="${i}" aria-label="Add one ${l.name}">+</button></div></div>
        <div class="cl-p">${idr(l.unit*l.qty)}</div></div>`).join('')
      :'<p class="cart-empty">Select items to start an order.</p>';
    const t=totals();
    foot.innerHTML=`<div class="tot"><span>Subtotal</span><span>${idr(t.sub)}</span></div>
      <div class="tot"><span>Tax (PB1, 10%)</span><span>${idr(t.tax)}</span></div>
      <div class="tot grand"><span>Total</span><span>Rp ${idr(t.total)}</span></div>
      <button class="charge${charging?' paid':''}" data-charge ${(!cart.length&&!charging)?'disabled':''}>${charging?`Paid · Order #${nextOrder-1}`:`Charge Rp ${idr(t.total)}`}</button>`;
  }
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-tab],[data-add],[data-inc],[data-dec],[data-charge]'); if(!t||charging&&!t.matches('[data-tab]'))return;
    if(t.dataset.tab){tab=t.dataset.tab;renderMenu();$(`[data-tab="${tab}"]`).focus();return;}
    if(t.dataset.add){
      const key=t.dataset.add; const ex=cart.find(l=>l.key===key);
      if(ex)ex.qty++; else cart.push({key,name:key,mods:[],unit:+t.dataset.price,qty:1});
      t.classList.add('hit'); setTimeout(()=>t.classList.remove('hit'),260); renderCart(); lines.scrollTop=lines.scrollHeight; return;
    }
    if(t.dataset.inc){cart[+t.dataset.inc].qty++;renderCart();return;}
    if(t.dataset.dec){const l=cart[+t.dataset.dec];l.qty--;if(l.qty<=0)cart.splice(+t.dataset.dec,1);renderCart();return;}
    if(t.hasAttribute('data-charge')){
      if(!cart.length)return; charging=true; nextOrder++; renderCart();
      setTimeout(()=>{cart=[];charging=false;renderCart();},1800);
    }
  },{signal:ac.signal});
  renderMenu(); renderCart();

  /* ── KDS demo ── */
  const STAGES=['New','Preparing','Ready','Completed'], ACT=['Start preparing','Mark ready','Complete'];
  const nowMs=()=>Date.now();
  const T=[
    {id:1043,age:42,stage:0,items:[['2×','Cafe Latte',['Oat milk','Less sugar']],['1×','Butter Croissant',['!Warm up']]]},
    {id:1044,age:15,stage:0,items:[['1×','Cappuccino',[]],['1×','Banana Bread',[]]]},
    {id:1042,age:312,stage:1,items:[['3×','Americano',[]],['1×','Flat White',['Extra shot']]]},
    {id:1041,age:525,stage:1,items:[['4×','Americano',[]],['2×','Butter Croissant',['!Warm up']]]},
    {id:1040,age:150,stage:2,items:[['1×','Mocha',['Less sugar']]]},
    {id:1039,age:260,stage:3,items:[['2×','Espresso',[]]]}
  ].map(t=>({...t,start:nowMs()-t.age*1000,end:t.stage===3?nowMs()-t.age*1000+t.age*1000:null}));
  const board=$('#board');
  const el=t=>Math.floor(((t.end||nowMs())-t.start)/1000);
  const mmss=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  const tcls=t=>{if(t.stage>=2)return'';const s=el(t);return s>480?'late':s>300?'warn':'';};
  function ticket(t,moved){
    return `<article class="tk ${tcls(t)}${moved===t.id?' moved':''}" data-tk="${t.id}">
      <div class="tk-h"><b>#${t.id}</b><span class="t" data-t="${t.id}">${mmss(el(t))}</span></div>
      <ul>${t.items.map(([q,n,m])=>`<li><b>${q} ${n}</b>${m.map(x=>x[0]==='!'?`<div class="hot">${x.slice(1)}</div>`:`<div>— ${x}</div>`).join('')}</li>`).join('')}</ul>
      ${t.stage<3?`<button class="kbtn" data-adv="${t.id}">${ACT[t.stage]}</button>`:''}</article>`;
  }
  function renderKDS(moved){
    board.innerHTML=STAGES.map((s,i)=>{
      const list=T.filter(t=>t.stage===i); const shown=i===3?list.slice(-3):list;
      return `<section class="kcol" aria-label="${s}"><h3 class="kh"><span>${s}</span><span class="kc">${list.length}</span></h3>${shown.map(t=>ticket(t,moved)).join('')||'<p class="kempty">No tickets</p>'}</section>`;
    }).join('');
  }
  board.addEventListener('click',e=>{
    const b=e.target.closest('[data-adv]'); if(!b)return;
    const t=T.find(x=>x.id===+b.dataset.adv); t.stage++; if(t.stage===3)t.end=nowMs();
    renderKDS(t.id);
    const nb=board.querySelector(`[data-adv="${t.id}"]`); if(nb)nb.focus();
  });
  const iv=setInterval(()=>{
    $$('[data-t]',board).forEach(s=>{
      const t=T.find(x=>x.id===+s.dataset.t); if(!t||t.stage===3)return;
      s.textContent=mmss(el(t)); const a=s.closest('.tk'); const c=tcls(t);
      a.classList.toggle('late',c==='late'); a.classList.toggle('warn',c==='warn');
    });
  },1000);
  renderKDS();

  /* ── Inventory demo ── */
  const stock={
    beans:{n:'Espresso beans (House Blend)',v:4200,u:'g',low:1000},
    milk:{n:'Fresh milk',v:9500,u:'ml',low:2000},
    cup:{n:'Paper cup 8 oz',v:1240,u:'pcs',low:200},
    oat:{n:'Oat milk (Barista Ed)',v:2500,u:'ml',low:3000}
  };
  const ledger=[
    {t:'14:09',ty:'Adjustment',it:'Fresh milk',ch:'−500 ml',ref:'Spillage · Rina S.'},
    {t:'14:02',ty:'Sale',it:'Paper cup 8 oz',ch:'−4 pcs',ref:'Order #1041'},
    {t:'13:52',ty:'Restock',it:'Espresso beans',ch:'+5,000 g',ref:'Shift 2 · Central Hub',pos:true}
  ];
  let clock=14*60+22;
  const sTb=$('#stockTbl tbody'), lTb=$('#ledgerTbl tbody');
  function renderStock(deltas){
    sTb.innerHTML=Object.entries(stock).map(([k,s])=>{
      const low=s.v<s.low; const d=deltas&&deltas[k]?`<span class="delta">−${deltas[k]} ${s.u}</span>`:'';
      return `<tr><td>${s.n}</td><td class="r tnum">${qty(s.v)} ${s.u}${d}</td><td><span class="badge ${low?'warn':'ok'}">${low?'Low':'Optimal'}</span></td></tr>`;
    }).join('');
  }
  function renderLedger(fresh){
    lTb.innerHTML=ledger.slice(0,6).map((r,i)=>`<tr class="${fresh&&i<fresh?'new':''}"><td>${r.t}</td><td>${r.ty}</td><td>${r.it}</td><td class="r tnum ${r.pos?'pos-v':'neg'}">${r.ch}</td><td>${r.ref}</td></tr>`).join('');
  }
  const chain=$$('#chain li'), sell=$('#sellBtn'); let busy=false;
  sell.addEventListener('click',()=>{
    if(busy)return; busy=true; sell.disabled=true; sell.style.opacity='.6';
    chain.forEach(li=>li.classList.remove('on'));
    const step=reduce?0:240, order=nextOrder++;
    chain.forEach((li,i)=>setTimeout(()=>{
      li.classList.add('on');
      if(i===3){stock.beans.v-=18;stock.milk.v-=150;stock.cup.v-=1;renderStock({beans:18,milk:150,cup:1});}
      if(i===4){
        clock++; const t=`${Math.floor(clock/60)}:${String(clock%60).padStart(2,'0')}`; const ref=`Order #${order}`;
        ledger.unshift({t,ty:'Sale',it:'Paper cup 8 oz',ch:'−1 pcs',ref},{t,ty:'Sale',it:'Fresh milk',ch:'−150 ml',ref},{t,ty:'Sale',it:'Espresso beans',ch:'−18 g',ref});
        renderLedger(3);
      }
      if(i===4){busy=false;sell.disabled=false;sell.style.opacity='';}
    },i*step));
  });
  renderStock(); renderLedger();

  /* ── Branch HQ tabs ── */
  const B={
    sales:{h:['Branch','Transactions','Net sales','Share of today'],rows:[
      ['Central Hub','351','Rp 18.45M',43],['North Outlet','279','Rp 14.10M',33],['South Kiosk','212','Rp 10.30M',24]],
      f:r=>`<td>${r[0]}</td><td class="r tnum">${r[1]}</td><td class="r tnum">${r[2]}</td><td><span class="share" style="width:${r[3]*1.2}px"></span><span class="tnum">${r[3]}%</span></td>`,
      al:[0,1,1,0]},
    inventory:{h:['Branch','Low-stock items','Most urgent'],rows:[
      ['Central Hub','5','Oat milk (Barista Ed) · 2,500 ml'],['North Outlet','4','Vanilla syrup · 400 ml'],['South Kiosk','3','Paper cup 8 oz · 140 pcs']],
      f:r=>`<td>${r[0]}</td><td class="r tnum">${r[1]}</td><td>${r[2]}</td>`,al:[0,1,0]},
    cash:{h:['Branch','Open shifts','Cashiers on shift','Drawer expected'],rows:[
      ['Central Hub','2','Andi K., Maya P.','Rp 6.18M'],['North Outlet','1','Dewi A.','Rp 3.40M'],['South Kiosk','1','Raka S.','Rp 2.15M']],
      f:r=>`<td>${r[0]}</td><td class="r tnum">${r[1]}</td><td>${r[2]}</td><td class="r tnum">${r[3]}</td>`,al:[0,1,0,1]},
    status:{h:['Branch','Connection','Last sync'],rows:[
      ['Central Hub','<span class="badge ok">Online</span>','Just now'],['North Outlet','<span class="badge ok">Online</span>','Just now'],['South Kiosk','<span class="badge warn">Syncing</span>','2 min ago · 3 orders queued']],
      f:r=>`<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>`,al:[0,0,0]}
  };
  const bpanel=$('#bpanel'), btabs=$$('#btabs [data-bt]');
  function showB(k){
    const d=B[k];
    bpanel.innerHTML=`<table class="tbl"><thead><tr>${d.h.map((x,i)=>`<th class="${d.al[i]?'r':''}">${x}</th>`).join('')}</tr></thead><tbody>${d.rows.map(r=>`<tr>${d.f(r)}</tr>`).join('')}</tbody></table>`;
    btabs.forEach(b=>{const on=b.dataset.bt===k;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;});
    bpanel.setAttribute('aria-labelledby','bt-'+k);
  }
  btabs.forEach((b,i)=>{
    b.addEventListener('click',()=>showB(b.dataset.bt));
    b.addEventListener('keydown',e=>{
      if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
      const n=btabs[(i+(e.key==='ArrowRight'?1:btabs.length-1))%btabs.length]; showB(n.dataset.bt); n.focus();
    });
  });
  showB('sales');
  return ()=>{ac.abort();clearInterval(iv);io.disconnect();};
}
