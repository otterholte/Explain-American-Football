/* =========================================================
   Football 101 — "Watch a Game": a narrated broadcast of Thunder vs. Titans.
   Mike (play-by-play, <i class="vp">) calls what happens; Dana (color, <i class="vc">)
   explains it for beginners. Every play runs huddle → walk to the line → snap → whistle.
   The extended version (watchx) adds Rules & Penalties and Football Smarts moments.
   ========================================================= */
(function(){
const WB=[],WX=[];
COURSES.watch={key:'watch',short:'Game',list:WB,cap:'w',ask:'wq',fq:'wf',fin:'wfin_',quiz:[],auto:true,pad:1.1};
COURSES.watchx={key:'watchx',short:'Game+',list:WX,cap:'wx',ask:'wxq',fq:'wxf',fin:'wxfin_',quiz:[],auto:true,pad:1.1};
const W=d=>{WB.push({title:d.title,build:S=>d.build(S,false)});WX.push({title:d.title,build:S=>d.build(S,true)});};
const CH=()=>window.CH||{};
const TH='blue',TI='red';
const rng=seed=>()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
const fmt=s=>{s=Math.max(0,Math.round(s));return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};

/* ---------- small pop-up in the top-right corner (replaces big bursts) ---------- */
const TAGC={'🚩':['#ffd84a',NAVY],'TOUCHDOWN':[GOLD,NAVY],'INTERCEPT':['#2f6fed','#fff'],'FUMBLE':['#e2483f','#fff'],'INCOMPLETE':['#dfe5f2',NAVY],'FIRST DOWN':['#ffd84a',NAVY],"IT'S GOOD":['#1f9d55','#fff'],'FLAG':['#ffd84a',NAVY],'TURNOVER':['#e2483f','#fff']};
function tag(S,t,text,o={}){const k=Object.keys(TAGC).find(k=>text.toUpperCase().includes(k));const [bg,fg]=k?TAGC[k]:[NAVY,'#fff'];
 const tx=text.replace(/!+$/,'!');const p=pill(S.L.top,1262-(tx.length*12.5+40)/2,96,tx,{size:24,bg,fg,sw:4});S.pop(p,t);S.hide(p,t+(o.dur||2.8),t+(o.dur||2.8)+.3);if(o.sfx)S.sfx(t,o.sfx);return p;}
function quietBursts(S){S.burst=(t,text,o={})=>tag(S,t,text,{sfx:o.sfx});}

/* ---------- booth: two announcers with name labels ---------- */
function booth(S){
 const pb=pill(S.L.top,1190,38,'🎙️ MIKE',{size:18,bg:NAVY,sw:3}),cc=pill(S.L.top,1190,38,'💬 DANA',{size:18,bg:'#b5428f',sw:3});S.set(0,()=>window.R3&&R3.hide());window.R3&&R3.load();
 const iv={p:[],c:[]};let last=null;
 S.track(0,1e6,(p,r,t)=>{for(const [k,el] of [['p',pb],['c',cc]])el.setAttribute('opacity',iv[k].some(([a,b])=>t>=a&&t<b)?1:0);},Ease.lin);
 const say=(v,h,min,fn,pinned)=>{const t0=S.T;const html=(v==='p'?'<i class="vp"></i>':'<i class="vc"></i>')+h;
  if(last)last[1]=Math.min(last[1],t0);last=[t0,1e6];iv[v].push(last);
  S.caps.push(pinned?{t:t0,html,pad:.2}:{t:t0,html});if(fn)fn(t0);S.T+=pinned?.05:Math.max(min||0,EST(html));return t0;};
 return{P:(h,min,fn)=>say('p',h,min,fn),A:(h,min,fn)=>say('c',h,min,fn),Q:(h,fn)=>say('p',h,0,fn,true),at:t=>{if(t>S.T)S.wait(t-S.T);}};}

/* ---------- TV score bug ---------- */
function tvBug(S,init){const g=G(S.L.top,640,672);const st={a:0,b:0,q:'1ST',c:'15:00',dd:'KICKOFF',pos:null,...init};
 E('rect',{x:-452,y:-34,width:904,height:68,rx:16,fill:NAVY,stroke:'#fff','stroke-width':3},g);
 const seg=[[-444,190,BLUE],[-248,190,RED],[-52,166,'#ffffff'],[120,210,'#33406a'],[336,108,'#0f1730']];const tx=[],hl=[];
 seg.forEach(([x,w,c],i)=>{E('rect',{x,y:-26,width:w,height:52,rx:11,fill:c},g);tx.push(T(g,x+w/2+(i<2?12:0),2,'',{size:i>=3?24:26,fill:i===2?NAVY:i===3?GOLD:'#fff'}));hl.push(E('rect',{x:x-5,y:-31,width:w+10,height:62,rx:14,fill:'none',stroke:GOLD,'stroke-width':6,opacity:0},g));});
 T(g,390,-19,'PLAY CLOCK',{size:9,fill:'#9fb0d9'});
 const balls=[G(g,-420,0),G(g,-224,0)];balls.forEach(b=>{b.appendChild(drawBall(b,1.15));b.setAttribute('opacity',0);});
 const apply=s=>{tx[0].textContent=`THUNDER  ${s.a}`;tx[1].textContent=`TITANS  ${s.b}`;tx[2].textContent=s.c?`${s.q}  ${s.c}`:s.q;tx[3].textContent=s.dd;balls[0].setAttribute('opacity',s.pos==='a'?1:0);balls[1].setAttribute('opacity',s.pos==='b'?1:0);};
 const s0={...st};S.set(0,()=>{apply(s0);tx[4].textContent='';});
 const applyPart=(s,ks)=>{if(ks.includes('a'))tx[0].textContent=`THUNDER  ${s.a}`;if(ks.includes('b'))tx[1].textContent=`TITANS  ${s.b}`;if(ks.includes('q')||ks.includes('c'))tx[2].textContent=s.c?`${s.q}  ${s.c}`:s.q;if(ks.includes('dd'))tx[3].textContent=s.dd;if(ks.includes('pos')){balls[0].setAttribute('opacity',s.pos==='a'?1:0);balls[1].setAttribute('opacity',s.pos==='b'?1:0);}};
 const B={g,get clock(){return st.c;},
  at(t,patch){Object.assign(st,patch);const snap={...st},ks=Object.keys(patch);S.set(t,()=>applyPart(snap,ks));S.track(t,t+.45,(p,r)=>setS(g,1+.04*Math.sin(Math.PI*r)),Ease.lin);},
  run(t0,t1,from,to){const q=st.q;S.track(t0,t1,(p,r)=>{tx[2].textContent=`${q}  ${fmt(lerp(from,to,r))}`;},Ease.lin);st.c=fmt(to);const c2=st.c;S.set(t1,()=>{tx[2].textContent=`${q}  ${c2}`;});},
  pc(t0,t1,from,to){S.track(t0,t1,(p,r)=>{const v=Math.ceil(lerp(from,to,r));tx[4].textContent=v;tx[4].setAttribute('fill',v<=5?'#ff6b5e':'#fff');},Ease.lin);},
  pcOff(t){S.set(t,()=>{tx[4].textContent='';});},
  pulse(t0,t1,idx){for(const i of idx)S.track(t0,t1,(p,r,t)=>hl[i].setAttribute('opacity',r>=1?0:.6+.4*Math.sin(t*9)),Ease.lin);},
  call(t0,t1,idx,text){B.pulse(t0,t1,idx);const xs=idx.map(i=>seg[i][0]+seg[i][1]/2);const x=640+(Math.min(...xs)+Math.max(...xs))/2;
   const c=pill(S.L.top,clamp(x,230,1050),588,text,{size:22,bg:'#fff',fg:NAVY,sw:4});S.pop(c,t0);S.hide(c,t1-.3,t1);S.sfx(t0,'pop');
   const ar=arrow(S.L.top,{w:5,color:'#fff',head:2.4});S.track(t0,t0+.4,p=>{ar.setAttribute('opacity',1);ar.set(x,608,x,632,p);});S.hide(ar,t1-.3,t1);}};
 return B;}
function wpill(S,text,bg,t0,t1){const p=pill(S.L.ui,640,84,text,{size:22,bg,sw:4});S.pop(p,t0);S.hide(p,t1-.3,t1);return p;}
function renameEZ(S){for(const t of S.field.querySelectorAll('text')){if(t.textContent==='BLUE')t.textContent='THUNDER';else if(t.textContent==='RED')t.textContent='TITANS';}}
function lineAt(S,color,x){const f=S.lineObj(color,null);f.x=x;f.op=1;setPlan(f,'x',x);setPlan(f,'op',1);return f;}
function pulseLine(S,obj,t0,t1){S.track(t0,t1,(p,r,t)=>obj.op=r>=1?1:.45+.55*Math.abs(Math.sin(t*5)),Ease.lin);}
function showKick(S,kv,t0){S.attr(kv.g,t0,t0+.5,'opacity',0,1);S.set(t0+.4,()=>S.ball.op=0);S.attr(kv.zone,t0+.6,t0+1.1,'opacity',0,1);kvKick(S,kv,t0+.6);
 tag(S,t0+3.4,"IT'S GOOD!",{sfx:'cheer'});S.attr(kv.zone,t0+3.4,t0+4,'opacity',1,0);kvParty(S,kv,t0+3.5,3);}
function hideKick(S,kv,t){S.attr(kv.g,t,t+.5,'opacity',1,0);S.set(t+.4,()=>S.ball.op=1);}

/* ---------- formations (dx = yards from the ball, dy = yards across) ---------- */
const OFF_FORMS={base:{},heavy:{WR1:[1,-5.9],WR2:[1.3,8],WR3:[6.9,0]},spread:{TE:[1,9.5]},
 fg:{QB:[7,0],RB:[9.6,-1.6],WR1:[1,-5.9],WR3:[1.4,-7.6],WR2:[1.4,7.6],TE:[1,5.9]},
 punt:{QB:[13.5,0],RB:[6.5,1.8],WR3:[6.5,-1.8],WR1:[1,-20],WR2:[1,20]},
 kneel:{QB:[1.4,0],RB:[6,0],WR3:[3.2,-1.8],TE:[3.2,1.8],WR1:[1,-6.2],WR2:[1,6.2]}};
const DEF_FORMS={base:{},run:{LB1:[3.4,-4.5],LB2:[3.4,0],LB3:[3.4,4.5],S1:[8.5,-6],S2:[8.5,6]},
 pass:{LB1:[5.5,-5],LB2:[5.5,0],LB3:[5.5,5],S1:[14,-9],S2:[14,9]},
 nickel:{LB1:[5,-3],LB2:[5,3],LB3:[5.5,8.5],S1:[14,-9],S2:[14,9]},
 onehigh:{S1:[15,0],S2:[5.5,4.5]},
 fg:{LB1:[3.5,-3],LB2:[3.5,0],LB3:[3.5,3],CB1:[1.5,-8],CB2:[1.5,8],S1:[8,-2],S2:[8,2]},
 punt:{CB1:[1.5,-20.5],CB2:[1.5,20.5],LB1:[4,-4],LB2:[4,0],LB3:[4,4],S2:[20,-3],S1:[35.5,2]},
 kneel:{LB1:[3,-3],LB2:[3,0],LB3:[3,3],CB1:[2,-7],CB2:[2,7],S1:[7,-3],S2:[7,3]}};
const offAt=(form,k)=>{const b=OFF_F.find(r=>r[0]===k);const f=OFF_FORMS[form]||{};return f[k]||[b[3],b[4]];};
const defAt=(form,k)=>{const b=DEF_F.find(r=>r[0]===k);const f=DEF_FORMS[form]||{};return f[k]||[b[3],b[4]];};

/* ---------- a drive: the 22 players, the lines, the clock, and the between-play routine ---------- */
function drive(S,o){const dir=o.dir,R=rng(o.seed||7);let L=o.L;
 const r=playSetup(S,L,14.5,4*dir,dir);S.camSet(L+4*dir,C+.6,14.5);renameEZ(S);quietBursts(S);
 const {O,D}=r,all=[...O.all,...D.all];const los=lineAt(S,'#3d8bff',L),fdl=lineAt(S,YEL,o.fd??L+dir*10);
 const bug=tvBug(S,o.bug||{});let clk=o.clk??900;
 const hx=()=>L-dir*7.6,dhx=()=>L+dir*6.6;
 const G={S,O,D,all,los,fdl,bug,dir,get L(){return L;},set L(v){L=v;}};
 const ringPos=(list,cx,rad,lead)=>{const out=new Map();list.forEach((a,i)=>{const an=(i/list.length)*Math.PI*2+lead;out.set(a,[cx+Math.cos(an)*rad,C+Math.sin(an)*rad]);});return out;};
 G.huddleMap=()=>{const m=ringPos([O.QB,O.C,O.LG,O.LT,O.WR1,O.WR3,O.RB,O.TE,O.WR2,O.RT,O.RG],hx(),2.7,dir===1?0:Math.PI);
  for(const [k] of DEF_F){const [dx,dy]=defAt('base',k);m.set(D[k],[L+dir*(dx+2.2+((D[k].num*7)%3)*.5),C+dy*1.05+((D[k].num*5)%3-1)*.6]);}return m;};
 // where the players start this step
 const start=o.start||'huddle';
 if(start==='sideline'){const oy=O.team===TH?1:-1;O.all.forEach((a,i)=>S.place(a,0,L-dir*(4+i*1.4),oy>0?56+(i%3)*1.2:-2.5-(i%3)*1.2));D.all.forEach((a,i)=>S.place(a,0,L+dir*(1+i*1.4),oy>0?-2.5-(i%3)*1.2:56+(i%3)*1.2));S.ballAt(0,L-dir*.7,C,.15);}
 else if(start==='scatter'){for(const a of all)S.place(a,0,L+dir*(R()*5-1.5),C+(R()-.5)*14);S.ballAt(0,L-dir*.7,C,.15);[O.RB,D.LB2,D.DL3].forEach(a=>{S.fall(a,0,.01,1);S.fall(a,.6,.4,0);});}
 else if(start==='huddle'){for(const [a,p] of G.huddleMap())S.place(a,0,p[0],p[1]);S.ballAt(0,L-dir*.7,C,.15);}
 // jog/walk everyone somewhere
 const moveTo=(m,t0,speed)=>{let end=t0;for(const [a,[x,y]] of m){const d=Math.hypot(x-planOf(a,'x'),y-planOf(a,'y'));if(d<.05)continue;const s=t0+R()*.35,e=s+clamp(d/speed,.8,8);S.move(a,s,e,[[x,y]]);end=Math.max(end,e);}return end;};
 G.toHuddle=(t0)=>{const _=0;const m=G.huddleMap();for(const a of D.all){const p=m.get(a);m.delete(a);const d=Math.hypot(p[0]-planOf(a,'x'),p[1]-planOf(a,'y')),s0=t0+.4+R()*.8;S.move(a,s0,s0+clamp(d/5.5,1.6,8),[p]);}return moveTo(m,t0,6.5);};
 G.formMap=(of='base',df='base')=>{const m=new Map();for(const [k] of OFF_F){const [dx,dy]=offAt(of,k);m.set(O[k],[L-dir*dx,C+dy]);}
  for(const [k] of DEF_F){let [dx,dy]=defAt(df,k);if((k==='CB1'||k==='CB2')&&!DEF_FORMS[df]?.[k]){const w=offAt(of,k==='CB1'?'WR1':'WR2')[1];dy=w+(w<0?-.9:.9);if(Math.abs(w)<10)dx=Math.min(dx,4);}m.set(D[k],[L+dir*dx,C+dy]);}return m;};
 G.setT=0;G.toForm=(t0,of,df,speed=4.2,skip=[])=>{const fm=G.formMap(of,df);for(const a of skip)fm.delete(a);const e=moveTo(fm,t0,speed);S.give(e+.1,O.C);G.setT=e;return e;};
 G.snapAt=d=>Math.max(S.T+d,G.setT+1.1);
 G.hi=(t,grp)=>S.highlight(t,all,grp);G.clr=t=>S.clearHi(t,all);
 // the ball is spotted where the play ended; lines move; the fallen get up
 G.endPlay=(tt,newL,fallen=[],fd,from)=>{L=newL;const ca=fallen[0];if(from||ca&&S.ball){const bx=from?from[0]:planOf(ca,'x'),by=from?from[1]:planOf(ca,'y');S.thr(tt+1.3,tt+2.1,[bx,by,.4],[L-dir*.7,C,.15],1.6,{spins:2});}else S.ballAt(tt+1.3,L-dir*.7,C,.15);S.tw(los,tt+1.3,tt+1.9,{x:L});if(fd!=null)S.tw(fdl,tt+1.3,tt+1.9,{x:fd});for(const a of fallen)S.fall(a,tt+1.5+R()*.4,.4,0);};
 // game clock helpers
 G.clk=()=>clk;G.tick=(t0,t1,sec)=>{bug.run(t0,t1,clk,clk-sec);clk-=sec;};G.setClk=(t,sec)=>{clk=sec;bug.at(t,{c:fmt(sec)});};
 // play clock: runs from the end of the last play to the snap
 G.pcStart=null;G.pc=(t0)=>{G.pcStart=t0;};G.snapPC=(ts)=>{if(G.pcStart!=null){bug.pc(G.pcStart,ts,40,7+Math.floor(R()*8));bug.pcOff(ts+.15);G.pcStart=null;}};
 // huddle rings
 G.ring=(t0,t1,off=true)=>{if(!off)return;const c=E('ellipse',{cx:off?hx():dhx(),cy:C,rx:4.4,ry:4.4,fill:'none',stroke:GOLD,'stroke-width':.35,'stroke-dasharray':'1 .7',opacity:0},S.wfx);S.attr(c,t0,t0+.4,'opacity',0,1);S.attr(c,t1-.4,t1,'opacity',1,0);
  const p=pill(S.wfx2,off?hx():dhx(),C-6.6,off?'OFFENSE HUDDLE':'DEFENSE HUDDLE',{size:1.5,bg:off?(dir===1?BLUE:RED):(dir===1?RED:BLUE),sw:.25});S.pop(p,t0);S.hide(p,t1-.4,t1);};
 // substitutions: some players jog off to their sideline, new ones jog on
 G.sub=(t0,outs,ins)=>{const side=team=>team===(dir===1?TH:TI)?(O.team===TH?57:-4):(O.team===TH?-4:57);
  outs.forEach((a,i)=>{const tx=planOf(a,'x')-dir*2,ty=a.team===TH?58:-5,d=Math.hypot(ty-planOf(a,'y'),2);S.move(a,t0+i*.15,t0+i*.15+clamp(d/6,2,7),[[tx,ty]]);});
  return ins.map((q,i)=>{const sy=q.team===TH?58:-5;const a=S.player({team:q.team,num:q.num,pos:q.pos,x:q.x-dir*3,y:sy,face:q.team===TH?1:-1});a.autoFace=true;const d=Math.hypot(q.y-sy,3);S.move(a,t0+.4+i*.2,t0+.4+i*.2+clamp(d/6.5,2,7),[[q.x,q.y]]);return a;});};
 S.follow(0,99999,4*dir);
 return G;}
/* a 3D slow-motion replay over the field */
function replay(S,t0,spec){S.track(t0,t0+spec.dur,(p,r,tt)=>{if(!window.R3)return;if(r<1)R3.render(spec,tt-t0);else R3.hide();},Ease.lin);return t0+spec.dur;}

/* run with an optional fumble at the end (recovered by `rec`) */
function fumbleRun(S,G,ts,gain,rec){const {O,D,dir}=G,L=G.L,X=dx=>L+dir*dx,lane=1.6,th=ts+.9,tt=ts+3.2+gain*.08;S.give(th,O.RB);snapTo(S,O,L,ts,dir);
 const loose=[X(gain+1.6),C+lane+2.2],grab=[X(gain+2.2),C+lane+3];
 simPlay(S,O,D,L,{dir,type:'run',ts,tEnd:tt+3,th,tt,carrier:'RB',lane,script:{RB:[[ts,X(-4.6),C-2.4],[th,X(-4.3),C-.6],[th+.8,X(-.5),C+lane-.2],[tt,X(gain),C+lane]],QB:[[ts,X(-4.6),C],[th+.1,X(-4.6),C-.3],[th+1.3,X(-7.5),C-3.5]],[rec]:[[ts,planOf(D[rec],'x'),planOf(D[rec],'y')],[tt,X(gain+6),C+lane+5],[tt+1.9,grab[0],grab[1]]]},meet:[{a:'LB3',t:tt,x:X(gain+.7),y:C+lane+.3}]});
 S.fall(O.RB,tt+.05,.35);S.fall(D.LB3,tt+.1,.35);S.sfx(tt,'thud');
 S.thr(tt,tt+.7,[X(gain),C+lane,.9],[loose[0],loose[1],0],1.1,{tumble:true});S.thr(tt+.7,tt+1.9,[loose[0],loose[1],0],[grab[0],grab[1],0],.5,{tumble:true});
 S.fall(D[rec],tt+1.8,.3);S.give(tt+1.95,D[rec]);S.sfx(tt+2.3,'whistle');return{tt,rec:tt+1.95,spot:grab[0]};}

/* pass play that accepts extra scripted players (used for the play-action fake) */
function passPlay2(S,O,D,L,ts,o){const dir=o.dir||1,X=dx=>L+dir*dx;const tth=ts+(o.throwAt||1.9),tc=tth+(o.air||1.1);snapTo(S,O,L,ts,dir);
 const tgt=o.target;const r=o.route.map(([t,dx,y])=>[ts+t,X(dx),y]);const cp=[X(o.catchDx),o.catchY];const yac=o.yac.map(([t,dx,y])=>[tc+t,X(dx),y]);const tt=yac.at(-1)[0];
 simPlay(S,O,D,L,{dir,type:'pass',ts,tEnd:tt+1.3,tth,tc,tt,carrier:tgt,catchPt:cp,script:{...(o.script||{}),[tgt]:[...r,[tc,cp[0],cp[1]],...yac],QB:[[ts,X(-4.6),C],[ts+1.3,X(-7),C],[tth+.6,X(-6.8),C]]}});
 S.thr(tth,tc,[X(-6.45),C,1.2],[cp[0]+dir*.55,cp[1],1.2],o.peak||3.2);S.sfx(tth,'swoosh');S.give(tc,O[tgt]);S.sfx(tc,'pop');return{tc,tt};}

/* =========================================================
   3D replay specs (yards; x along the field, z across)
   ========================================================= */
const RP={
 catch:{dur:7,title:'THE CATCH',fd:47,
  actors:[{team:TH,num:81,key:[[0,46,40],[2.6,50.6,39.3],[3.4,51.4,39],[5.8,53,38.2],[6.6,53.3,38.1]],pose:[[0,'run'],[2.1,'catch',.3],[3.3,'run',.3],[5.7,'fall',.35]]},
         {team:TI,num:21,key:[[0,49.5,41.5],[2.6,51.6,40.6],[3.4,52.2,40.1],[5.6,53.4,39],[6.4,53.9,38.7]],pose:[[0,'run'],[5.0,'tackle',.3],[5.8,'fall',.35]]},
         {team:TI,num:32,key:[[0,62,45],[6,56.6,41.4],[6.6,56.4,41.2]],pose:[[0,'run'],[6,'stand',.4]]}],
  ball:[[0,34,2.2,26.7],[1.3,42.5,4.6,33],[2.6,51,1.75,39.2]],hold:[[2.62,0]],
  cam:[[0,[56,2.2,33.5],[47,1.6,39]],[2.6,[54.6,1.7,35],[50.8,1.7,39.2]],[5.6,[56,2,34.8],[53,1,38.6]],[7,[56.6,2.8,34.2],[53.4,.7,38.4]]]},
 tackle:{dur:6.6,title:'THE STOP',fd:63,
  actors:[{team:TH,num:17,key:[[0,56.2,19.4],[1.6,58.2,19.4],[3.4,59.6,20],[4.2,60,20.2]],pose:[[0,'catch'],[.7,'run',.3],[3.3,'fall',.35]]},
          {team:TI,num:52,key:[[0,62,14.5],[2.8,59.8,18.8],[3.4,59.9,19.25],[4.2,60.4,20.3]],pose:[[0,'run'],[2.7,'tackle',.25],[3.5,'fall',.35]]}],
  hold:[[0,0]],notes:[[4.4,6.4,'SHORT OF THE YELLOW LINE']],
  cam:[[0,[52.5,1.8,21.5],[58,1.3,19]],[3.4,[55,1.3,21],[59.8,.9,19.8]],[6.6,[55.8,2.6,22.4],[60.6,.4,20]]]},
 toetap:{dur:6.6,title:'ON THE SIDELINE',
  actors:[{team:TI,num:11,key:[[0,77,4.5],[2.4,69.6,1.6],[3.0,68.4,1.0],[4.4,67.6,.7],[5.2,67.1,-.6],[6.4,66.8,-1.6]],pose:[[0,'run'],[1.9,'catch',.3],[3.0,'tiptoe',.25],[4.6,'fall',.4]]},
          {team:TH,num:24,key:[[0,75.5,4.6],[3.0,69.8,2.4],[4.6,68.6,1.6],[5.6,68.2,1.3]],pose:[[0,'run'],[2.6,'reach',.3],[5.2,'stand',.4]]}],
  ball:[[0,94,2.2,24],[1.5,81,8,12],[3.0,68.5,1.6,1.1]],hold:[[3.02,0]],marks:[[3.25,68.2,1.0],[3.85,67.9,.78]],notes:[[4.2,6.4,'✓ BOTH FEET IN']],
  cam:[[0,[63,2,9.5],[70,1.4,2]],[3.0,[65.8,1.3,6.8],[68.2,.8,.9]],[4.4,[66,1.1,6.2],[67.7,.5,.6]],[6.6,[64.5,2.5,9],[67,.8,-.3]]]},
 td:{dur:8,title:'THE TOUCHDOWN',
  actors:[{team:TH,num:11,key:[[0,90,14.2],[3.4,101,16.67],[5.6,107.5,17.9],[6.4,110.3,18.4],[7.6,111.5,18.7]],pose:[[0,'run'],[2.7,'shoulder',.3],[3.7,'run',.3],[6.6,'celebrate',.3]]},
          {team:TI,num:24,key:[[0,90.5,12.6],[3.4,99.4,15.1],[5.2,104.6,16.2],[6.2,105.6,16.3]],pose:[[0,'run'],[5.1,'dive',.35]]}],
  ball:[[0,74,2.2,26.6],[1.7,88,11,21],[3.4,101.3,1.6,16.8]],hold:[[3.42,0]],
  cam:[[0,[84,5,25],[95,2,16]],[3.4,[96,1.6,22],[101,1.4,16.7]],[6.4,[104.5,1.9,23.5],[110,1,18.4]],[8,[106,2.8,24.5],[111.5,1.2,18.7]]]},
 pick:{dur:6.4,title:'THE INTERCEPTION',
  actors:[{team:TI,num:17,key:[[0,64.5,21],[2.2,61.4,22.7],[2.8,60.9,23],[3.8,60.6,22.6]],pose:[[0,'run'],[1.8,'reach',.3],[3.2,'stand',.4]]},
          {team:TH,num:31,key:[[0,56.5,20.8],[2.3,59.2,23.9],[2.8,59.5,24.4],[4.4,62.4,24.8],[6.4,65.8,23.8]],pose:[[0,'run'],[2.15,'leap',.2],[3.0,'run',.3]]}],
  ball:[[0,78.4,2.3,26.67],[1.4,69,5,25.5],[2.75,59.7,2.4,24.25]],hold:[[2.78,1]],
  cam:[[0,[55,2.2,31],[60,1.6,24]],[2.8,[57.2,1.6,29],[59.7,2,24.2]],[4.6,[60,2.2,29.5],[62.5,1,24.5]],[6.4,[62,3,30],[65.6,1,23.8]]]},
 fumble:{dur:5.6,title:'THE FUMBLE',
  actors:[{team:TI,num:28,key:[[0,49,27],[1.8,44.5,28.2],[2.4,44.9,28.3],[3.2,45.1,28.4]],pose:[[0,'run'],[1.9,'fallback',.35]]},
          {team:TH,num:56,key:[[0,40.5,27.6],[1.8,43.5,28.1],[2.4,43.7,28.2]],pose:[[0,'run'],[1.4,'tackle',.25],[2.2,'fall',.4]]},
          {team:TH,num:32,key:[[0,36.5,33.5],[2.7,41.2,31.8],[3.5,41.8,31.3]],pose:[[0,'run'],[2.9,'dive',.35]]}],
  ball:[[1.9,44,1.2,28.4],[2.4,43,1.0,29.6],[2.9,42.4,.15,30.5],[3.4,41.9,.12,31.2]],hold:[[0,0],[1.9,null],[3.45,2]],
  cam:[[0,[45,1.7,20],[44.8,1,27.8]],[1.9,[45.4,1.2,22.2],[44.2,1.1,28.3]],[3.2,[43.6,1.4,24],[42.2,.4,30.6]],[5.6,[42.4,2.8,23.4],[41.8,.4,30.8]]]},
};

/* =========================================================
   1 — Welcome
   ========================================================= */
W({title:'Welcome to the Broadcast',build(S,X){
 S.fieldInit();renameEZ(S);S.camSet(60,C+1.6,9.6);quietBursts(S);const {P,A}=booth(S);const bug=tvBug(S,{});
 const th=[],ti=[];for(let i=0;i<11;i++){const a=i%4,b=Math.floor(i/4);th.push(S.player({team:TH,num:[12,28,11,81,88,55,66,67,71,74,17][i],pos:'',x:30+a*2.4-b*1.2,y:C-3.6+b*3.6+(a%2)*.6,face:1}));ti.push(S.player({team:TI,num:[9,22,10,80,85,91,93,97,99,52,24][i],pos:'',x:90-a*2.4+b*1.2,y:C-3.6+b*3.6+(a%2)*.6,face:-1}));}
 S.wait(.6);
 P('Hey, everybody, welcome in! I\'m Mike, and it is a <b>beautiful</b> day for football. It\'s the <b>Thunder</b> and the <b>Titans</b>!',0,t0=>{th.forEach((a,i)=>S.hopA(a,t0+2.4+i*.04,t0+3.8,2,16));ti.forEach((a,i)=>S.hopA(a,t0+4.2+i*.04,t0+5.6,2,16));
  const p1=pill(S.wfx2,32,C-9,'THUNDER',{size:2.4,bg:BLUE,sw:.4}),p2=pill(S.wfx2,88,C-9,'TITANS',{size:2.4,bg:RED,sw:.4});S.pop(p1,t0+2.4);S.pop(p2,t0+4.2);S.hide(p1,t0+30);S.hide(p2,t0+30);});
 A('And I\'m Dana! Mike, I\'ve been looking forward to this one all week. I even wore my <b>lucky socks</b>.');
 P('Bold move. Let\'s hope they\'re lucky for <i>somebody</i>. Zero to zero, first quarter, a full fifteen minutes on the clock.',0,t0=>{bug.pulse(t0+1.5,t0+4,[0,1]);bug.pulse(t0+4,t0+6.5,[2]);});
 A('Thunder in blue, going right. Titans in red, going left. Down and distance and the play clock are down there on the scoreboard, like always.',0,t0=>{
  const a1=arrow(S.wfx2,{w:1.2,color:BLUE});S.track(t0+.2,t0+1.4,p=>{a1.setAttribute('opacity',1);a1.set(40,C+12,106,C+12,p);});S.hide(a1,t0+9);
  const a2=arrow(S.wfx2,{w:1.2,color:RED});S.track(t0+1.8,t0+3,p=>{a2.setAttribute('opacity',1);a2.set(80,C-12,14,C-12,p);});S.hide(a2,t0+9);bug.pulse(t0+4.5,t0+8,[3,4]);});
 if(X)A('And keep an eye out for <b>yellow flags</b> today. Somebody always gets a little too excited.');
 P('Teams are heading to the sidelines. Kickoff is coming right up!',0,t0=>{th.forEach((a,i)=>S.move(a,t0+.5+i*.05,t0+8,[[20+i*3,70]]));ti.forEach((a,i)=>S.move(a,t0+.5+i*.05,t0+8,[[100-i*3,-16]]));});
 S.wait(2);
}});

/* =========================================================
   2 — Opening kickoff (newer kickoff rules: nobody moves until the catch)
   ========================================================= */
W({title:'Opening Kickoff',build(S,X){
 S.fieldInit();renameEZ(S);S.ringHolder=true;S.camSet(46,C+1,10.5);S.follow(0,99999,0);quietBursts(S);const {P,A,Q,at}=booth(S);const bug=tvBug(S,{});
 const K=S.player({team:TI,num:3,pos:'K',x:81,y:C});const cov=[-22,-17,-12,-7,-3,3,7,12,17,22].map((dy,i)=>S.player({team:TI,num:40+i,pos:'',x:51,y:C+dy}));
 const front=[-16,-8,0,8,16].map((dy,i)=>S.player({team:TH,num:50+i,pos:'',x:45,y:C+dy})),mid=[-12,-4,4,12].map((dy,i)=>S.player({team:TH,num:60+i,pos:'',x:41,y:C+dy}));
 const KR=S.player({team:TH,num:84,pos:'KR',x:13,y:C}),KR2=S.player({team:TH,num:22,pos:'',x:14,y:C+10});const ko=[K,...cov,...front,...mid,KR,KR2];ko.forEach(a=>a.autoFace=true);
 S.ballAt(0,75,C,.3);S.wait(.6);
 P('The Titans will kick it off. And look at this setup: the two teams are lined up just a few yards apart.',0,t=>{const p=pill(S.wfx2,63,C-8,'FREEZE UNTIL THE CATCH',{size:1.6,bg:NAVY,sw:.3});S.pop(p,t+2);S.hide(p,t+15);});
 A('That\'s the newer kickoff rule. Nobody\'s allowed to move until the ball lands or somebody catches it. It\'s basically the world\'s most intense game of <b>freeze tag</b>.');
 const tk=S.T+1.6;S.move(K,tk-1.2,tk,[[75.6,C]],Ease.in);
 const tc=tk+3,tEnd=tc+4.6;S.thr(tk,tc,[75,C,.3],[13.5,C,1.2],22,{spins:10});S.sfx(tk,'kick');S.give(tc,KR);
 chaseSim(S,{t0:tc,t1:tEnd+1.2,carrier:KR,kf:[[tc,13,C],[tc+.6,16,C-1],[tc+2,24,C-5],[tc+3.4,32,C-3],[tEnd,37,C-2]],tEndCar:tEnd,chasers:[...cov,K],blockers:[...front,...mid,KR2],chaseStart:tc,meet:[{a:cov[4],t:tEnd,x:37.7,y:C-2.4,lead:1}]});
 S.fall(KR,tEnd,.35);S.fall(cov[4],tEnd,.35);S.sfx(tEnd,'thud');S.sfx(tEnd+.2,'whistle');
 at(tk+.25);Q('Here\'s the kick. High, and deep…');
 at(tc+.15);Q('Taken at the 3. And <i>now</i> everybody can go!');
 at(tEnd+.15);P('He\'s brought down at the <b>27</b>. Nice return!',0,t0=>{
  S.fall(KR,t0+1.4,.4,0);S.fall(cov[4],t0+1.6,.4,0);ko.forEach((a,i)=>{const top=cov.includes(a)||a===K;S.move(a,t0+1.8+(i%5)*.3,t0+16+(i%4)*.8,[[30+i*2.2,top?-15:69]]);});S.ballAt(t0+1.5,36.3,C,.15);});
 A('And now that the play\'s over, the kickoff teams jog off and the offense and defense come on. There\'s the little football on the scoreboard. <b>Thunder ball</b>, first and ten.',0,t0=>{bug.at(t0+4,{pos:'a',dd:'1ST & 10',c:'14:54'});bug.call(t0+4.1,t0+9,[0,3],'Thunder ball · 1st & 10');});
 S.wait(1.5);
}});

/* =========================================================
   3 — The first drive: a run, then a pass (+ replay)
   ========================================================= */
W({title:'The First Drive',build(S,X){
 const G=drive(S,{L:37,dir:1,fd:47,start:'sideline',clk:894,bug:{pos:'a',dd:'1ST & 10',c:'14:54'},seed:3});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);S.wait(.4);
 P('Here comes the Thunder offense, jogging out for the first drive.',0,t=>{G.toHuddle(t+.2);G.pc(t+.5);});
 A('The quarterback\'s calling the play in the huddle. The defense doesn\'t huddle up like that, though. They\'re just watching their coach on the sideline for the call.',0,t=>G.ring(t+.4,t+7));
 P('And they break the huddle.',0,t=>G.toForm(t+.3,'heavy','base'));
 A('Ooh, look at that. <b>Nobody split out wide</b>, extra blocker in the backfield. Mike, I\'d bet my lucky socks this is a <b>run</b>.',0,t=>{G.hi(t+.5,[O.WR1,O.WR2,O.WR3,O.TE]);wpill(S,'EVERYBODY IN TIGHT → RUN',BLUE,t+1.2,t+7.5);});
 P('And the linebackers agree with you. They\'re creeping right up.',0,t=>{G.hi(t+.2,D.LB);for(const a of D.LB)S.nudge(a,t+.6,t+2.4,-1.6,0);});
 let ts=G.snapAt(1.2);G.clr(ts-1);G.snapPC(ts);let tt=runPlay(S,O,D,G.L,ts,4);G.tick(ts,tt,6);
 at(ts+.05);Q('Snap, handoff to the running back…');
 at(tt+.15);P('…and he\'s brought down at the 31. A pickup of four.',0,t=>{G.endPlay(tt,41,[O.RB,D.LB3]);G.pc(tt+.5);G.tick(tt+1,tt+12,30);});
 A('Four yards a carry, and the coach is a happy camper. Second and six.',0,t=>{bug.at(t+.4,{dd:'2ND & 6'});G.toHuddle(t+1.5);});
 P('Second and six, and here they come out of the huddle. Oh, now they\'re spreading out.',0,t=>G.toForm(t+2.2,'spread',X?'base':'pass'));
 A('Receivers wide on both sides. That smells like a <b>pass</b> to me.',0,t=>{G.hi(t+.3,[O.WR1,O.WR2,O.WR3]);wpill(S,'RECEIVERS WIDE → PASS',BLUE,t+.8,t+5.2);});
 if(X){A('And watch this motion. The receiver goes across, and one Titan follows him the whole way. That\'s <b>man coverage</b>. He\'s got a shadow.',0,t=>{
   G.hi(t+.2,[O.WR3,D.CB1]);S.move(O.WR3,t+1,t+4.4,[[G.L-4,C-4],[G.L-4,C+4],[G.L-1.5,C+6]],Ease.inOut);S.move(D.CB1,t+1.3,t+4.6,[[G.L+5,C+6.6]],Ease.inOut);wpill(S,'DEFENDER FOLLOWS → MAN',RED,t+4.8,t+9.5);});}
 else P('And the Titans back off a few steps to cover them.',0,t=>{G.hi(t+.2,[...D.CB,...D.S]);for(const a of [...D.CB,...D.S])S.nudge(a,t+.6,t+2.4,2,0);});
 ts=G.snapAt(1.2);G.clr(ts-1);G.snapPC(ts);let r=passPlay(S,O,D,G.L,ts,{target:'WR2',route:[[0,-1,C+13.5],[1.7,9,C+13.5]],catchDx:10,catchY:C+12.3,yac:[[1,12,C+11.4]],tackler:'CB2'});G.tick(ts,r.tt,6);
 at(ts+.05);Q('Quarterback drops back…');
 at(r.tc-.85);Q('…fires to the right side… <b>caught</b>!');
 at(r.tt+.15);P('…and he\'s dragged down at the 43. <b>First down</b>, Thunder!',0,t=>{tag(S,t+.2,'FIRST DOWN!',{sfx:'ding'});G.endPlay(r.tt,53,[O.WR2,D.CB2],63);G.pc(r.tt+.5);});
 const t0=S.T+.3;replay(S,t0,RP.catch);G.toHuddle(t0+2);bug.at(t0+1,{dd:'1ST & 10'});at(t0);
 A('Ooh, let\'s see that one again. Look at the hands! Ball comes in hot, and he just <b>plucks</b> it out of the air.');
 P('He could catch an egg out of a cannon. And he slips past the yellow line for a fresh set of downs.');
 at(t0+RP.catch.dur+.2);
}});

/* =========================================================
   4 — Third down (+ false start, nickel, replay of the stop)
   ========================================================= */
W({title:'Third Down',build(S,X){
 const G=drive(S,{L:55,dir:1,fd:63,start:'scatter',clk:772,bug:{pos:'a',dd:'2ND & 8',c:'12:52'},seed:11});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);
 G.pc(0);G.toHuddle(.8);S.wait(.4);
 P('A couple of plays later, it\'s second and eight for the Thunder at their own 45.',0,t=>bug.pulse(t+2,t+5,[3]));
 A('Nice, steady drive so far. Little by little, like a road trip with a <i>lot</i> of snack stops.',0,t=>G.ring(t+.5,t+6));
 let L=55,dd3='3RD & 8';
 if(X){P('They come to the line…',0,t=>{G.toForm(t+.3,'base','base');});
  const tf=Math.max(S.T+.6,G.setT+.8);S.nudge(O.RT,tf,tf+.25,1.4,0,Ease.out);S.nudge(O.RT,tf+.4,tf+.8,-1.4,0);S.sfx(tf+.3,'whistle');CH().flagThrow&&CH().flagThrow(S,tf+.4,[L+6,C+17],[L+1,C+5],4);tag(S,tf+.6,'🚩 FALSE START · 5 YARDS',{dur:8});
  at(tf+.7);Q('Oh, and there\'s a flag!',t=>G.hi(t,[O.RT]));
  A('<b>False start</b>. The lineman flinched early, so it\'s five yards back. Happens to the best of us. Mike, you did it at dinner last night, reaching for the bread.',0,t=>{G.clr(t+2);CH().spotTo&&CH().spotTo(S,O,D,G.los,t+3,L-5,1.4);bug.at(t+4,{dd:'2ND & 13'});});
  G.L=L=50;dd3='3RD & 13';P('In my defense, it was a <i>really</i> good basket of bread.',0,t=>G.pc(t));}
 P(X?'Second and thirteen. They line up again, spread out wide.':'Out of the huddle, spread out wide.',0,t=>G.toForm(t+.3,'spread','pass'));
 let ts=G.snapAt(1.3);G.snapPC(ts);let r=passPlay(S,O,D,G.L,ts,{target:'WR1',route:[[0,-1,C-13],[1.9,9,C-13]],catchDx:11,catchY:C-15,incomplete:true});G.tick(ts,r.tc,5);
 at(ts+.05);Q('Quarterback drops back…');
 at(r.tc+.1);P('…throws to the left side… and it falls <b>incomplete</b>.',0,t=>{G.endPlay(r.tc,G.L,[],undefined,r.end);S.fall(O.WR1,r.tc+1.6,.4,0);G.pc(r.tc+.5);});
 A(X?'Clock stops on that one. Third and thirteen. Yikes.':'Clock stops on that one. Third and eight coming up.',0,t=>{bug.at(t+.3,{dd:dd3});bug.pulse(t+.4,t+3,[2]);G.toHuddle(t+1);});
 P('Big third down here. Let\'s see what they\'ve got.',0,t=>G.toForm(t+2,'spread',X?'nickel':'pass'));
 if(X)A('And the Titans sneak in an extra defensive back. <b>Nickel</b> defense. They know a pass is coming.',0,t=>{G.hi(t+.3,[...D.CB,...D.S,D.LB3]);wpill(S,'NICKEL: 5 DEFENSIVE BACKS',RED,t+1,t+6);});
 A('Everybody in the stadium knows it\'s a pass. The question is, can they get to that yellow line?',0,t=>{G.clr(t);pulseLine(S,G.fdl,t+.5,t+5);});
 const gain=60-G.L;ts=G.snapAt(1.3);G.clr(ts-1);G.snapPC(ts);r=passPlay(S,O,D,G.L,ts,{target:'WR3',route:[[0,-2,C-8.5],[1.6,gain-1.6,C-8.5]],catchDx:gain-1.2,catchY:C-7.4,yac:[[.9,gain,C-6.6]],tackler:'LB1'});G.tick(ts,r.tt,5);
 at(ts+.05);Q('Quarterback looks…');
 at(r.tc-.85);Q('…over the middle, and it\'s <b>caught</b>…');
 at(r.tt+.15);P('…but the linebacker wraps him up at the 50. <b>Short</b> of the first down!',0,t=>{G.endPlay(r.tt,60,[O.WR3,D.LB1]);G.tick(r.tt+1,r.tt+10,25);});
 const t0=S.T+.3;replay(S,t0,RP.tackle);bug.at(t0+1,{dd:'4TH & 3'});at(t0);
 A('Let\'s look at that tackle. The linebacker reads it the whole way, hits him right at the waist, and <b>wraps</b> him up. Textbook.');
 P('That\'s the kind of tackle they put in the coaching videos. And that brings up <b>fourth down</b>.');
 at(t0+RP.tackle.dur+.2);
}});

/* =========================================================
   5 — The punt (substitution: the punter comes on)
   ========================================================= */
W({title:'Fourth Down: The Punt',build(S,X){
 const G=drive(S,{L:60,dir:1,fd:63,start:'scatter',clk:737,bug:{pos:'a',dd:'4TH & 3',c:'12:17'},seed:21});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);
 G.pc(0);G.toHuddle(.8);S.wait(.4);
 A('Fourth and three at midfield. Too far for a field goal, and going for it is risky. I think they\'ll <b>punt</b>.');
 let pun;P('Yep, here comes the punt team. The quarterback and a receiver head off, and on comes the <b>punter</b>.',0,t=>{G.toForm(t+.3,'punt','punt',4.2,[O.QB,O.WR3]);
  [pun]=G.sub(t+.6,[O.QB,O.WR3],[{team:TH,num:8,pos:'P',x:G.L-13.5,y:C},{team:TH,num:48,pos:'',x:G.L-6.5,y:C-1.8}]);G.setT=Math.max(G.setT,t+6.8);});
 A('Punter is my dream job. You work about six seconds a game, and everybody cheers if you kick it far.');
 const px=G.L-13.5,land=95;let ts=G.snapAt(1.2);G.snapPC(ts);
 S.thr(ts,ts+.6,[G.L-.8,C,.6],[px+.4,C,1.1],.6);S.give(ts+.6,pun);S.sfx(ts,'thud');const tk=ts+1.3;S.thr(tk,tk+3.4,[px+.4,C,1.1],[land-.4,C+2,1.2],16,{spins:8});S.sfx(tk,'kick');S.give(tk+3.4,D.S1);
 for(const a of [O.WR1,O.WR2,O.TE,O.LG,O.RG])S.move(a,ts+.3,tk+3.4,[[land-6-Math.abs(planOf(a,'y')-C)*.15,C+(planOf(a,'y')-C)*.3]]);for(const a of [D.CB1,D.CB2])S.move(a,ts+.3,tk+3.4,[[land-8,C+(planOf(a,'y')-C)*.3]]);
 S.camTo(ts,tk+3.4,{z:11.5});S.track(tk+2.3,tk+3.4,(p,r,t)=>{D.S1.hop=r>0&&r<1?Math.abs(Math.sin(t*10))*8:0;},Ease.lin);S.sfx(tk+3.6,'whistle');G.tick(ts,tk+3.4,6);
 at(ts+.1);Q('Here\'s the snap…');
 at(tk+.1);Q('…and that is a <b>booming</b> kick…');
 at(tk+2.4);P('…and the returner waves for a <b>fair catch</b> at the 15.',0,t=>{tag(S,tk+3.4,'✋ FAIR CATCH');});
 A('Fair catch, so no return, and nobody can touch him. The Titans take over, way back near their own end zone.',0,t=>{bug.at(t+.4,{pos:'b',dd:'1ST & 10'});bug.call(t+.5,t+6,[1],'Titans ball 🏈');});
 P('Exactly what you want from a punt. That\'s a long way to go.');
}});

/* =========================================================
   6 — The Titans' drive and a field goal (+ toe-tap replay, holding)
   ========================================================= */
W({title:'The Titans Answer',build(S,X){
 const G=drive(S,{L:95,dir:-1,fd:85,start:'sideline',clk:731,bug:{pos:'b',dd:'1ST & 10',c:'12:11'},seed:31});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);S.wait(.4);
 P('Here comes the Titans\' offense for the first time today.',0,t=>{G.toHuddle(t+.2);G.pc(t+.5);});
 A('Big crowd of Titans fans down by that end zone too. They\'ve been waiting all quarter for this.',0,t=>G.ring(t+2,t+7));
 P('Titans come to the line.',0,t=>G.toForm(t+.3,'base','base'));
 let ts=G.snapAt(1.2);G.snapPC(ts);let tt=runPlay(S,O,D,G.L,ts,6,{dir:-1,lane:-1.8});G.tick(ts,tt,6);
 at(ts+.05);Q('Handoff to the Titans running back…');
 at(tt+.15);P('…he picks up six before they bring him down.',0,t=>{G.endPlay(tt,89,[O.RB,D.LB3]);G.pc(tt+.5);G.tick(tt+1,tt+12,30);});
 A('Not a bad way to start. Second and four.',0,t=>{bug.at(t+.3,{dd:'2ND & 4'});G.toHuddle(t+1);});
 P('Second and four. They spread it out.',0,t=>G.toForm(t+1.5,'spread','base'));
 ts=G.snapAt(1.2);G.snapPC(ts);let r=passPlay(S,O,D,G.L,ts,{dir:-1,target:'WR1',route:[[0,-1,C-13],[1.9,14,C-22]],catchDx:21,catchY:C-25.8,yac:[[.7,21.6,-.7]],tackler:null,air:1.6,peak:4.5});G.tick(ts,r.tt,7);
 at(ts+.05);Q('The quarterback drops back…');
 at(r.tc-1.55);Q('…throws deep down the sideline, and he\'s <b>got it</b>!');
 at(r.tt+.2);P('Twenty-one yards! But wait, did he stay <b>in bounds</b>?',0,t=>{G.endPlay(r.tt,68,[O.WR1],58);G.pc(r.tt+.5);});
 const t0=S.T+.3;replay(S,t0,RP.toetap);at(t0);
 A('Let\'s look. He catches it… there\'s one foot… there\'s the other… <b>both feet in</b>! By about an inch!',0,t=>{tag(S,t0+RP.toetap.dur-.5,'FIRST DOWN!',{sfx:'ding'});bug.at(t0+RP.toetap.dur-.4,{dd:'1ST & 10'});G.toHuddle(t0+1);});
 P('Ballet lessons are paying off for that guy. First down, Titans.');
 at(t0+RP.toetap.dur+.2);
 if(X){P('First and ten from their own 42.',0,t=>G.toForm(t+.3,'base','base'));
  ts=G.snapAt(1.2);G.snapPC(ts);tt=runPlay(S,O,D,G.L,ts,15,{dir:-1,lane:1.8});G.tick(ts,tt,7);
  at(ts+.05);Q('Handoff…');
  at(tt+.15);P('…and he breaks free for fifteen more!',0,t=>{G.endPlay(tt,53,[O.RB,D.LB3]);});
  A('Ooh, but there\'s a <b>flag</b>. <b>Holding</b> on the Titans. A blocker grabbed a jersey, so that run comes back, and they lose ten.',0,t=>{CH().flagThrow&&CH().flagThrow(S,t+.3,[66,C+16],[60,C+4],4);tag(S,t+.5,'🚩 HOLDING · 10 YARDS',{dur:7});
   const tb=t+3.4;G.L=78;S.thr(tb,tb+1.1,[planOf(O.RB,'x'),planOf(O.RB,'y'),.4],[78.7,C,.15],3,{spins:2});S.tw(G.los,tb,tb+.6,{x:78});S.tw(G.fdl,tb,tb+.6,{x:58});bug.at(tb,{dd:'1ST & 20'});G.toHuddle(tb+.2);});
  P('Ouch. That\'s like finding a twenty-dollar bill on the ground, and then realizing it\'s a coupon.');}
 const kv=kickView(S,TI);const L2=32;let kk=[];
 A('The Titans keep chipping away, though. A few plays later, they\'re at the Thunder\'s <b>22</b>.',0,t=>{S.wipe(t);const tw=t+.35;S.follow(tw,99999,null);for(const a of G.all)S.fall(a,tw,.05,0);
  G.L=L2;const m=G.formMap('base','fg');for(const [a,[x,y]] of m)S.place(a,tw,x,y);S.tw(G.los,tw,tw+.01,{x:L2});S.tw(G.fdl,tw,tw+.01,{x:L2-3});S.ballAt(tw,L2+.7,C,.15);S.give(tw+.02,O.C);S.camTo(tw,tw+.01,{x:L2-4,z:14.5},Ease.lin);
  G.setClk(tw,21);bug.at(tw,{dd:'4TH & 3'});});
 P('Fourth and three, and here comes the <b>field goal team</b>. The kicker and the holder jog on.',0,t=>{kk=G.sub(t+.3,[O.QB,O.RB,O.WR1,O.WR2],[{team:TI,num:3,pos:'K',x:L2+9.6,y:C-1.6},{team:TI,num:4,pos:'H',x:L2+7,y:C},{team:TI,num:87,pos:'',x:L2+1.4,y:C-7.6},{team:TI,num:86,pos:'',x:L2+1.4,y:C+7.6}]);});
 A('The kicker\'s been out there practicing into that net on the sideline all quarter. He\'s ready.');
 P('Here\'s the snap… the kick is up…',0,t=>showKick(S,kv,t+.3));
 S.wait(1.2);P('…and it\'s <b>good</b>! Titans lead, three to nothing.',0,t=>{bug.at(t+.1,{b:3});bug.pulse(t+.1,t+3,[1]);});
 A('Right down the middle. And after the kickoff, that\'s the end of the <b>first quarter</b>.',0,t=>{G.tick(t+.5,t+2.8,21);bug.at(t+3,{q:'END 1ST',c:''});bug.call(t+3.2,t+6,[2],'End of the 1st quarter');hideKick(S,kv,t+6.4);});
}});

/* =========================================================
   7 — Touchdown, Thunder! (+ play action, TD replay)
   ========================================================= */
W({title:'Touchdown, Thunder!',build(S,X){
 const G=drive(S,{L:80,dir:1,fd:90,start:'huddle',clk:552,bug:{a:0,b:3,q:'2ND',c:'9:12',pos:'a',dd:'1ST & 10'},seed:41});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);G.pc(0);S.wait(.4);
 P('Second quarter, and the Thunder are knocking on the door at the Titans\' 30.',0,t=>bug.pulse(t+.5,t+4,[2,3]));
 A('Scoring territory. Even if this drive stalls, they can kick a field goal from here. But I want more than three, Mike.',0,t=>G.ring(t+.3,t+6));
 P('They break the huddle.',0,t=>G.toForm(t+.3,'base','onehigh'));
 A('Look at the <b>safeties</b>. Only one of them is deep. That is a <i>lot</i> of open grass back there.',0,t=>{G.hi(t+.3,D.S);wpill(S,'ONE SAFETY DEEP → ROOM FOR A DEEP PASS',RED,t+1.5,t+7.5);});
 if(X)A('And I bet they fake the handoff to pull those linebackers up. <b>Play action</b>.',0,t=>G.clr(t));
 const ts=G.snapAt(1.3);G.clr(ts-1.1);G.snapPC(ts);const tA=X?2.3:1.9;
 const fake=X?{RB:[[ts,G.L-4.6,C-2.4],[ts+.9,G.L-1.6,C-.6],[ts+2.4,G.L-1.2,C+1.5]],...Object.fromEntries(['LB1','LB2','LB3'].map(k=>{const x=planOf(D[k],'x'),y=planOf(D[k],'y');return[k,[[ts,x,y],[ts+1.3,x-2.2,y],[ts+2.6,x+1.5,y]]];}))}:{};
 const r=passPlay2(S,O,D,G.L,ts,{script:fake,target:'WR1',route:[[0,-1,C-13],[2.3,18,C-12]],catchDx:21,catchY:C-10,yac:[[2.6,31,C-8]],throwAt:tA,air:1.3,peak:5});const tdT=ts+tA+1.3+2.45;G.tick(ts,tdT,8);
 at(ts+.05);Q(X?'Fake handoff… the linebackers bite…':'Quarterback drops back…');
 at(r.tc-1.35);Q('…he throws deep down the left side…');
 at(r.tc+.15);Q('…<b>caught</b>! He\'s at the ten, the five…');
 at(tdT);P('…<b>touchdown</b>, Thunder!',0,t=>{bug.at(t+.4,{a:6});tag(S,t,'TOUCHDOWN!',{sfx:'cheer',dur:4});S.once(t+.1,()=>window.confetti&&confetti(120));S.hopA(O.WR1,t+.3,t+2.3,3,24);});
 const t0=S.T+.4;replay(S,t0,RP.td);at(t0);
 A('Oh, we have to see that again. Over the shoulder, in stride, and he never slows down.');
 P('Dropped it right in the bread basket.');
 A('You and the bread, Mike. Six points, Thunder!');
 at(t0+RP.td.dur+.2);
 const kv=kickView(S,TH);
 P('Here\'s the extra point…',0,t=>showKick(S,kv,t+.2));
 S.wait(1.4);P('…and it\'s good. Thunder seven, Titans three.',0,t=>{bug.at(t+.1,{a:7});bug.pulse(t+.1,t+3,[0]);hideKick(S,kv,t+3.6);});
}});

/* =========================================================
   8 — Picked off! (+ zone coverage clue, interception replay)
   ========================================================= */
W({title:'Picked Off!',build(S,X){
 const G=drive(S,{L:72,dir:-1,fd:62,start:'huddle',clk:160,bug:{a:7,b:3,q:'2ND',c:'2:40',pos:'b',dd:'1ST & 10'},seed:51});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);G.pc(0);S.wait(.4);
 P('Titans ball at their own 38, two-forty left in the half.',0,t=>bug.pulse(t+.4,t+4,[1,2]));
 A('They\'re behind, and the clock\'s ticking, so they\'ll want to <b>throw</b>. And that\'s exactly when defenses get greedy.',0,t=>G.ring(t+.3,t+6));
 P('Titans come to the line.',0,t=>G.toForm(t+.3,'spread','pass'));
 if(X){const L=G.L;const zones=[[L-12,C-17,9,10.6,BLUE],[L-12,C-6.2,9,12.4,TEAL],[L-12,C+6.4,9,10.6,GOLD],[L-22.5,C-17,10,17.2,'#ff8fd1'],[L-22.5,C+.4,10,16.6,'#b48cff']].map(([x,y,w,h,c])=>E('rect',{x,y,width:w,height:h,rx:1,fill:c,opacity:0,stroke:NAVY,'stroke-width':.15},S.wfx));
  A('Motion… and nobody follows him. The Thunder are sitting in <b>zone</b>. Everybody\'s guarding an area, not a person.',0,t=>{
   G.hi(t+.3,[O.WR3]);S.move(O.WR3,t+.6,t+3.6,[[L+4,C+4],[L+4,C-4],[L+1.5,C-8]],Ease.inOut);G.hi(t+3.9,[O.WR3,...D.LB,...D.S,...D.CB]);
   zones.forEach((z,i)=>{S.attr(z,t+4.2+i*.2,t+4.6+i*.2,'opacity',0,.28);S.attr(z,t+9,t+9.4,'opacity',.28,0);});wpill(S,'NOBODY FOLLOWED → ZONE',BLUE,t+4.2,t+9.3);});}
 const L=G.L,ts=G.snapAt(1.3),tth=ts+1.8,tc=tth+.9,cp=[L-12.5,C-2.4],tk=tc+2.6;G.clr(ts-1.1);G.snapPC(ts);snapTo(S,O,L,ts,-1);
 simPlay(S,O,D,L,{dir:-1,type:'pass',ts,tEnd:tc+3.4,tth,tc,tt:tk,int:{a:'S1'},catchPt:cp,script:{WR3:[[ts,L+2,C-8.5],[ts+1.6,L-6,C-6],[tc,L-11.6,C-3]],S1:[[ts,planOf(D.S1,'x'),planOf(D.S1,'y')],[tc,cp[0],cp[1]],[tk,L-4,C-5]],QB:[[ts,L+4.6,C],[ts+1.3,L+7,C],[tth+.6,L+6.8,C]]},meet:[{a:'WR3',t:tk,x:L-3.4,y:C-5.2}]});
 S.thr(tth,tc,[L+6.45,C,1.2],[cp[0],cp[1],1.2],2.6);S.sfx(tth,'swoosh');S.give(tc,D.S1);S.fall(D.S1,tk,.35);S.fall(O.WR3,tk,.35);S.sfx(tk,'thud');S.sfx(tk+.2,'whistle');G.tick(ts,tk,6);
 at(ts+.05);Q('The quarterback drops back…');
 at(tth-.25);Q('…throws over the middle…');
 at(tc+.05);Q('…<b>picked off</b>! The Thunder safety jumps the route!',t=>tag(S,t+.05,'INTERCEPTED!',{sfx:'cheer'}));
 at(tk+.2);P('He takes it back to the Titans\' 42. What a play!',0,t=>{G.endPlay(tk,L-4,[D.S1,O.WR3]);});
 const t0=S.T+.3;replay(S,t0,RP.pick);bug.at(t0+1,{pos:'a'});at(t0);
 A('Watch the safety. He\'s reading the quarterback\'s eyes the whole way, and then <b>boom</b>, jumps right in front of it.');
 P('He knew where that ball was going before the receiver did. <b>Turnover</b>, Thunder ball!',0,t=>tag(S,t+3,'TURNOVER'));
 at(t0+RP.pick.dur+.2);
 P('Neither team scores again before the break, and that\'s <b>halftime</b>. Thunder seven, Titans three.',0,t=>{bug.run(t+.3,t+4.5,151,0);bug.at(t+4.6,{q:'HALFTIME',c:'',dd:'THUNDER 7–3'});G.all.forEach((a,i)=>S.move(a,t+.5+(i%6)*.25,t+11,[[45+i,O.all.includes(a)?-14:68]]));});
 A('Halftime snacks! Mike, I\'m getting nachos.');
 P('Save me some. See you in the second half!');
}});

/* =========================================================
   9 — Fumble! (fourth quarter, fumble replay)
   ========================================================= */
W({title:'Fumble!',build(S,X){
 const G=drive(S,{L:47,dir:-1,fd:37,start:'huddle',clk:X?100:135,bug:{a:7,b:6,q:'4TH',c:X?'1:40':'2:15',pos:'b',dd:'1ST & 10'},seed:61});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);G.pc(0);S.wait(.4);
 P('We\'re back, and it\'s the <b>fourth quarter</b>. The Titans kicked a field goal in the third, so it\'s seven to six.',0,t=>bug.pulse(t+3,t+6.5,[0,1]));
 A(X?'And the Titans are driving. They\'re at the Thunder\'s 37 with a minute-forty left. A field goal wins it for them.':'And the Titans are driving. They\'re at the Thunder\'s 37 with just over two minutes left. A field goal wins it for them.',0,t=>{bug.pulse(t+2,t+5,[2]);G.ring(t+.4,t+6);});
 P('My palms are sweaty, and I\'m not even playing. Titans come to the line.',0,t=>G.toForm(t+2.5,'heavy','run'));
 A('Everybody packed in tight. They want to <b>run</b> it, play it safe, and keep the clock moving.',0,t=>{G.hi(t+.3,[O.WR1,O.WR2,O.WR3,...D.LB]);});
 const ts=G.snapAt(1.2);G.clr(ts-1);G.snapPC(ts);const f=fumbleRun(S,G,ts,3,'S2');G.tick(ts,f.tt,5);
 at(ts+.05);Q('Handoff to the running back…');
 at(f.tt+.05);Q('…he\'s hit… <b>fumble!</b>',t=>tag(S,t+.1,'FUMBLE!',{sfx:'buzz'}));
 at(f.rec+.2);P('And the Thunder <b>recover</b>! The safety dives right on it!',0,t=>{G.endPlay(f.rec,f.spot,[D.S2,O.RB,D.LB3]);});
 const t0=S.T+.3;replay(S,t0,RP.fumble);bug.at(t0+1,{pos:'a',dd:'1ST & 10'});at(t0);
 A('Look at this. The linebacker puts his helmet <b>right on the ball</b>, it pops loose, and the safety is right there to scoop it up.');
 P('A huge play, at the biggest moment of the game. <b>Turnover</b>!',0,t=>tag(S,t+.3,'TURNOVER'));
 at(t0+RP.fumble.dur+.2);
 A(X?'Thunder ball, with the lead, and about a minute and a half to play.':'Thunder ball, with the lead, and just over two minutes to play.');
}});

/* =========================================================
   10 — The final two minutes (+ timeouts)
   ========================================================= */
W({title:'The Final Two Minutes',build(S,X){
 const G=drive(S,{L:41,dir:1,fd:51,start:'sideline',clk:X?95:130,bug:{a:7,b:6,q:'4TH',c:X?'1:35':'2:10',pos:'a',dd:'1ST & 10'},seed:71});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);S.wait(.4);
 P(X?'The Thunder offense comes out with a minute thirty-five to go.':'The Thunder offense comes out with two-ten to go.',0,t=>{G.toHuddle(t+.2);G.pc(t+.5);});
 A('Easy plan now. <b>Run</b> the ball, stay <b>in bounds</b>, and keep that clock moving.',0,t=>G.ring(t+2,t+7));
 P('They come to the line.',0,t=>G.toForm(t+.3,'heavy','run'));
 let ts=G.snapAt(1.2);G.snapPC(ts);let tt=runPlay(S,O,D,G.L,ts,5);G.tick(ts,tt,5);
 at(ts+.05);Q('Handoff to the running back…');
 at(tt+.15);P('…five yards, and he goes down <b>in bounds</b>. The clock keeps rolling.',0,t=>{G.endPlay(tt,46,[O.RB,D.LB3]);G.pc(tt+.5);G.tick(tt+.6,tt+9,X?3:36);});
 A('Every second that runs off is a second the Titans don\'t get. I can hear their fans getting nervous.',0,t=>{bug.at(t+.3,{dd:'2ND & 5'});bug.pulse(t+.3,t+4,[2]);G.toHuddle(t+1);});
 if(X){A('And there\'s the Titans\' <b>last timeout</b>. That stops the clock, but now they\'re out.',0,t=>{bug.at(t+.3,{dd:'TIMEOUT'});tag(S,t+.3,'⏱ TIMEOUT · TITANS');bug.at(t+5,{dd:'2ND & 5'});bug.pcOff(t+.3);G.pc(t+5);});}
 P('Second and five.',0,t=>G.toForm(t+.3,'heavy','run'));
 ts=G.snapAt(1.2);G.snapPC(ts);tt=runPlay(S,O,D,G.L,ts,6,{lane:-1.6});G.tick(ts,tt,5);
 at(ts+.05);Q('Handoff again, to the left side…');
 at(tt+.15);P('…and he gets it! Six yards and a <b>first down</b>!',0,t=>{tag(S,t+.1,'FIRST DOWN!',{sfx:'ding'});G.endPlay(tt,52,[O.RB,D.LB3],62);G.pc(tt+.5);G.tick(tt+.6,tt+9,40);});
 A('And that should just about do it. Time for the <b>kneel-down</b>.',0,t=>{bug.at(t+.3,{dd:'1ST & 10'});G.toHuddle(t+1);});
 P('Here comes the <b>victory formation</b>.',0,t=>{G.toForm(t+1.5,'kneel','kneel');wpill(S,'🧎 VICTORY FORMATION',NAVY,t+3,t+9);});
 ts=G.snapAt(1);G.snapPC(ts);snapTo(S,O,G.L,ts);S.tw(O.QB,ts+.5,ts+.9,{fall:.35},Ease.out);const c0=G.clk(),tz=ts+10;bug.run(ts+.6,tz-3.4,c0,3);bug.run(tz-3.4,tz,3,0);
 at(ts+.2);Q('The quarterback takes a knee, and the clock keeps running…');
 at(tz-3.4);Q('Three… two… one…');
 at(tz+.1);P('That\'s the game! The <b>Thunder win</b>, seven to six!',0,t=>{bug.at(t,{q:'FINAL',c:'',dd:'THUNDER WIN'});bug.pulse(t,t+4,[0,1,2]);tag(S,t,'🏆 FINAL: THUNDER 7–6',{sfx:'cheer',dur:6});
  S.once(t+.2,()=>window.confetti&&confetti(200,true));S.once(t+1.4,()=>window.confetti&&confetti(140,true));O.all.forEach((a,i)=>S.hopA(a,t+.4+i*.05,t+4.5,5,22));});
 A(X?'What a game! Flags, coverages, a pick, a fumble. You saw it all. And my lucky socks are still <b>undefeated</b>.':'What a game! A pick, a fumble, and a toe-tap catch. And my lucky socks are still <b>undefeated</b>.');
 P('Somebody frame those socks. For Dana, I\'m Mike. Thanks for hanging out with us!');
 S.wait(2);
}});

/* ---------------- the "Watch a Game" chooser ---------------- */
const prog=k=>{try{return +localStorage.getItem('f101_prog_'+k)||0;}catch(e){return 0;}};
const watched=k=>{const C_=COURSES[k];if(!C_)return false;const n=C_.list.filter(d=>!d.quiz).length;return prog(k)>=n;};
window.openWatch=function(){const o=document.createElement('div');o.className='wchoose';const cc=watched('basics'),rr=watched('rules'),ss=watched('smarts');
 o.innerHTML=`<div class="wbox"><h2>📺 Watch a Game</h2><p class="wlead">Sit back and watch the <b style="color:#2f6fed">Thunder</b> play the <b style="color:#e2483f">Titans</b>. The announcers explain everything as it happens, using what you learned.</p>
 <div class="wopts"><button class="wopt ${rr&&ss?'':'on'}" data-x="0"><b>🏈 The basics</b><small>Score, clock, downs, formations · about 11 min</small></button>
 <button class="wopt ${rr&&ss?'on':''}" data-x="1"><b>🧠 Basics + Rules & Smarts</b><small>Adds penalties and coaching strategy · about 13 min</small></button></div>
 <div class="wrow"><button class="btn" id="wCancel">Cancel</button><button class="btn primary" id="wGo">▶ Watch the game</button></div></div>`;
 document.body.appendChild(o);const close=()=>o.remove();
 o.querySelectorAll('.wopt').forEach(b=>b.onclick=()=>{o.querySelectorAll('.wopt').forEach(x=>x.classList.remove('on'));b.classList.add('on');SFX.play('pop');});
 o.querySelector('#wCancel').onclick=close;o.onclick=e=>{if(e.target===o)close();};
 o.querySelector('#wGo').onclick=()=>{const x=o.querySelector('.wopt.on').dataset.x==='1';close();begin();setCourse(x?'watchx':'watch');};};
const st=document.createElement('style');st.textContent=`
.wchoose{position:fixed;inset:0;z-index:90;background:rgba(8,14,32,.6);display:flex;align-items:center;justify-content:center;padding:14px}
.wbox{background:#fff;border:5px solid var(--navy);border-radius:24px;box-shadow:8px 8px 0 var(--gold);padding:22px 26px;width:min(620px,100%);max-height:96vh;overflow:auto;text-align:center;font-family:Nunito,sans-serif;color:var(--navy)}
.wbox h2{font-family:'Lilita One';font-weight:400;font-size:34px;margin:0 0 6px}.wlead{font-weight:800;font-size:17px;margin:0 0 12px;line-height:1.4}
.wopts{display:flex;gap:10px;margin:12px 0}.wopt{flex:1;font-family:Nunito;border:4px solid #d5dbe8;border-radius:16px;background:#f4f7fc;color:var(--navy);padding:12px 10px;cursor:pointer;display:flex;flex-direction:column;gap:4px}
.wopt b{font-family:'Lilita One';font-weight:400;font-size:20px}.wopt small{font-weight:800;font-size:13px;opacity:.75}.wopt.on{border-color:var(--navy);background:#fff4d6;box-shadow:4px 4px 0 var(--gold)}
.wrow{display:flex;gap:10px;justify-content:center}.wrow .btn.primary{font-size:20px}
@media (max-height:540px){.wbox{padding:10px 14px}.wbox h2{font-size:24px}.wlead{font-size:14px;margin-bottom:6px}.wopt{padding:6px}.wopt b{font-size:16px}.wopts{margin:6px 0}}
@media (max-width:560px){.wopts{flex-direction:column}}
`;document.head.appendChild(st);
})();
