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
 const p=pill(S.L.top,1112,96,text.replace(/!+$/,'!'),{size:24,bg,fg,sw:4});S.pop(p,t);S.hide(p,t+(o.dur||2.8),t+(o.dur||2.8)+.3);if(o.sfx)S.sfx(t,o.sfx);return p;}
function quietBursts(S){S.burst=(t,text,o={})=>tag(S,t,text,{sfx:o.sfx});}

/* ---------- booth: two announcers with name labels ---------- */
function booth(S){
 const pb=pill(S.L.top,1128,38,'🎙️ MIKE · PLAY-BY-PLAY',{size:17,bg:NAVY,sw:3}),cc=pill(S.L.top,1160,38,'💬 DANA · COLOR',{size:17,bg:'#b5428f',sw:3});
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
  for(const [a,p] of ringPos(D.all,dhx(),3.1,0))m.set(a,p);return m;};
 // where the players start this step
 const start=o.start||'huddle';
 if(start==='sideline'){O.all.forEach((a,i)=>S.place(a,0,L-dir*(4+i*1.4),56+(i%3)*1.2));D.all.forEach((a,i)=>S.place(a,0,L+dir*(1+i*1.4),-2.5-(i%3)*1.2));S.ballAt(0,L-dir*.7,C,.15);}
 else if(start==='scatter'){for(const a of all)S.place(a,0,L+dir*(R()*5-1.5),C+(R()-.5)*14);S.ballAt(0,L-dir*.7,C,.15);[O.RB,D.LB2,D.DL3].forEach(a=>{S.fall(a,0,.01,1);S.fall(a,.6,.4,0);});}
 else if(start==='huddle'){for(const [a,p] of G.huddleMap())S.place(a,0,p[0],p[1]);S.ballAt(0,L-dir*.7,C,.15);}
 // jog/walk everyone somewhere
 const moveTo=(m,t0,speed)=>{let end=t0;for(const [a,[x,y]] of m){const d=Math.hypot(x-planOf(a,'x'),y-planOf(a,'y'));if(d<.05)continue;const s=t0+R()*.35,e=s+clamp(d/speed,.8,5);S.move(a,s,e,[[x,y]]);end=Math.max(end,e);}return end;};
 G.toHuddle=(t0)=>moveTo(G.huddleMap(),t0,6.5);
 G.formMap=(of='base',df='base')=>{const m=new Map();for(const [k] of OFF_F){const [dx,dy]=offAt(of,k);m.set(O[k],[L-dir*dx,C+dy]);}
  for(const [k] of DEF_F){let [dx,dy]=defAt(df,k);if((k==='CB1'||k==='CB2')&&!DEF_FORMS[df]?.[k]){const w=offAt(of,k==='CB1'?'WR1':'WR2')[1];dy=w+(w<0?-.9:.9);if(Math.abs(w)<10)dx=Math.min(dx,4);}m.set(D[k],[L+dir*dx,C+dy]);}return m;};
 G.setT=0;G.toForm=(t0,of,df,speed=4.2)=>{const e=moveTo(G.formMap(of,df),t0,speed);S.give(e+.1,O.C);G.setT=e;return e;};
 G.snapAt=d=>Math.max(S.T+d,G.setT+1.1);
 G.hi=(t,grp)=>S.highlight(t,all,grp);G.clr=t=>S.clearHi(t,all);
 // the ball is spotted where the play ended; lines move; the fallen get up
 G.endPlay=(tt,newL,fallen=[],fd)=>{L=newL;const ca=fallen[0];if(ca&&S.ball){const bx=planOf(ca,'x'),by=planOf(ca,'y');S.thr(tt+1.3,tt+2.1,[bx,by,.4],[L-dir*.7,C,.15],1.6,{spins:2});}else S.ballAt(tt+1.3,L-dir*.7,C,.15);S.tw(los,tt+1.3,tt+1.9,{x:L});if(fd!=null)S.tw(fdl,tt+1.3,tt+1.9,{x:fd});for(const a of fallen)S.fall(a,tt+1.5+R()*.4,.4,0);};
 // game clock helpers
 G.clk=()=>clk;G.tick=(t0,t1,sec)=>{bug.run(t0,t1,clk,clk-sec);clk-=sec;};G.setClk=(t,sec)=>{clk=sec;bug.at(t,{c:fmt(sec)});};
 // play clock: runs from the end of the last play to the snap
 G.pcStart=null;G.pc=(t0)=>{G.pcStart=t0;};G.snapPC=(ts)=>{if(G.pcStart!=null){bug.pc(G.pcStart,ts,40,7+Math.floor(R()*8));bug.pcOff(ts+.15);G.pcStart=null;}};
 // huddle rings
 G.ring=(t0,t1,off=true)=>{const c=E('ellipse',{cx:off?hx():dhx(),cy:C,rx:4.4,ry:4.4,fill:'none',stroke:GOLD,'stroke-width':.35,'stroke-dasharray':'1 .7',opacity:0},S.wfx);S.attr(c,t0,t0+.4,'opacity',0,1);S.attr(c,t1-.4,t1,'opacity',1,0);
  const p=pill(S.wfx2,off?hx():dhx(),C-6.6,off?'OFFENSE HUDDLE':'DEFENSE HUDDLE',{size:1.5,bg:off?(dir===1?BLUE:RED):(dir===1?RED:BLUE),sw:.25});S.pop(p,t0);S.hide(p,t1-.4,t1);};
 S.follow(0,99999,4*dir);
 return G;}

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
   1 — Welcome
   ========================================================= */
W({title:'Welcome to the Broadcast',build(S,X){
 S.fieldInit();renameEZ(S);S.camSet(60,C+1.6,9.6);quietBursts(S);const {P,A}=booth(S);const bug=tvBug(S,{});
 const th=[],ti=[];for(let i=0;i<11;i++){const a=i%4,b=Math.floor(i/4);th.push(S.player({team:TH,num:[12,28,11,81,88,55,66,67,71,74,17][i],pos:'',x:30+a*2.4-b*1.2,y:C-3.6+b*3.6+(a%2)*.6,face:1}));ti.push(S.player({team:TI,num:[9,22,10,80,85,91,93,97,99,52,24][i],pos:'',x:90-a*2.4+b*1.2,y:C-3.6+b*3.6+(a%2)*.6,face:-1}));}
 S.wait(.6);
 P('Good afternoon, everybody, and welcome to the big game! I\'m Mike Carter, and today it\'s the <b>Thunder</b> against the <b>Titans</b>.',0,t0=>{th.forEach((a,i)=>S.hopA(a,t0+2+i*.04,t0+3.4,2,16));ti.forEach((a,i)=>S.hopA(a,t0+4+i*.04,t0+5.4,2,16));
  const p1=pill(S.wfx2,32,C-9,'THUNDER',{size:2.4,bg:BLUE,sw:.4}),p2=pill(S.wfx2,88,C-9,'TITANS',{size:2.4,bg:RED,sw:.4});S.pop(p1,t0+2);S.pop(p2,t0+4);S.hide(p1,t0+40);S.hide(p2,t0+40);});
 A('And I\'m Dana Brooks. If you\'re brand new to football, you\'re in the right place. Mike will tell you what happens, and I\'ll explain why it matters.');
 P('Let\'s start with the <b>scoreboard</b> at the bottom of your screen.',0,t0=>bug.pulse(t0+.3,t0+3.4,[0,1,2,3,4]));
 A('On the left are the two teams and their scores. Right now, it\'s <b>zero to zero</b>.',0,t0=>bug.call(t0,t0+4.6,[0,1],'Team names & scores'));
 A('Next is the <b>quarter</b> and the <b>game clock</b>. A game has four quarters, and each one is fifteen minutes long.',0,t0=>bug.call(t0,t0+5.6,[2],'1st quarter · 15:00 left'));
 A('The gold box shows the <b>down and distance</b>. It\'ll make sense in a minute, once a team has the ball.',0,t0=>bug.call(t0,t0+5,[3],'Down & distance'));
 A('And on the end is the <b>play clock</b>. Between plays, the offense gets forty seconds to start the next one.',0,t0=>{bug.call(t0,t0+5.4,[4],'Play clock');bug.pc(t0+.6,t0+5.2,40,30);bug.pcOff(t0+5.4);});
 P('The <b>Thunder</b>, in blue, are going to the <b>right</b>. The <b>Titans</b>, in red, are going to the <b>left</b>.',0,t0=>{
  const a1=arrow(S.wfx2,{w:1.2,color:BLUE});S.track(t0+.4,t0+1.8,p=>{a1.setAttribute('opacity',1);a1.set(40,C+12,106,C+12,p);});S.hide(a1,t0+12);
  const a2=arrow(S.wfx2,{w:1.2,color:RED});S.track(t0+2.6,t0+4,p=>{a2.setAttribute('opacity',1);a2.set(80,C-12,14,C-12,p);});S.hide(a2,t0+12);});
 A('Each team is trying to get the ball into the <b>end zone</b> it\'s facing. That\'s a <b>touchdown</b>, and it\'s the best way to score.',0,t0=>{
  for(const [x,t] of [[110,t0+.4],[0,t0+.4]]){const r=E('rect',{x,y:0,width:10,height:53.33,fill:GOLD,opacity:0},S.wfx);S.track(t,t0+6,(p,r2,tt)=>r.setAttribute('opacity',r2>=1?0:.22+.12*Math.sin(tt*6)),Ease.lin);}});
 if(X)A('Today we\'ll also keep an eye out for <b>yellow flags</b> and some sneaky <b>coaching strategy</b>.');
 P('Alright, the teams are heading to their sidelines. It\'s almost time for kickoff!',0,t0=>{th.forEach((a,i)=>S.move(a,t0+.5+i*.05,t0+8,[[20+i*3,70]]));ti.forEach((a,i)=>S.move(a,t0+.5+i*.05,t0+8,[[100-i*3,-16]]));});
}});

/* =========================================================
   2 — Opening kickoff
   ========================================================= */
W({title:'Opening Kickoff',build(S,X){
 S.fieldInit();renameEZ(S);S.ringHolder=true;S.camSet(50,C+1,11);S.follow(0,99999,0);quietBursts(S);const {P,A,Q,at}=booth(S);const bug=tvBug(S,{});
 const K=S.player({team:TI,num:3,pos:'K',x:81,y:C});const cov=[-22,-17,-12,-7,-3,3,7,12,17,22].map((dy,i)=>S.player({team:TI,num:40+i,pos:'',x:76,y:C+dy}));
 const front=[-14,-7,0,7,14].map((dy,i)=>S.player({team:TH,num:50+i,pos:'',x:42,y:C+dy})),mid=[-12,-4,4,12].map((dy,i)=>S.player({team:TH,num:60+i,pos:'',x:30,y:C+dy}));
 const KR=S.player({team:TH,num:84,pos:'KR',x:13,y:C}),KR2=S.player({team:TH,num:22,pos:'',x:17,y:C+9});const ko=[K,...cov,...front,...mid,KR,KR2];ko.forEach(a=>a.autoFace=true);
 S.ballAt(0,75,C,.3);S.wait(.6);
 P('The Titans line up to kick off. Here we go!',0);
 A('A <b>kickoff</b> starts every game. One team kicks the ball deep, and the other team tries to catch it and run it back.');
 const tk=S.T+1.6;S.move(K,tk-1.2,tk,[[75.6,C]],Ease.in);for(const a of cov)S.move(a,tk-1.1,tk,[[75,a.y]],Ease.in);
 const tc=tk+3,tEnd=tc+4.8;S.thr(tk,tc,[75,C,.3],[13.5,C,1.2],22,{spins:10});S.sfx(tk,'kick');S.give(tc,KR);
 chaseSim(S,{t0:tk,t1:tEnd+1.2,carrier:KR,kf:[[tk,13,C],[tc,13,C],[tc+.6,16,C-1],[tc+2,24,C-5],[tc+3.6,33,C-3],[tEnd,37,C-2]],tEndCar:tEnd,chasers:[K,...cov],blockers:[...front,...mid,KR2],chaseStart:tk,meet:[{a:cov[5],t:tEnd,x:37.7,y:C-2.4,lead:1}]});
 S.fall(KR,tEnd,.35);S.fall(cov[5],tEnd,.35);S.sfx(tEnd,'thud');S.sfx(tEnd+.2,'whistle');
 at(tk+.25);Q('And there\'s the kick. It\'s high, and it\'s deep…');
 at(tc+.2);Q('Thomas catches it at the 3 and heads up the field…');
 at(tEnd+.15);P('…and he\'s brought down at the <b>27-yard line</b>. A nice return!',0,t0=>{
  S.fall(KR,t0+1.4,.4,0);S.fall(cov[5],t0+1.6,.4,0);ko.forEach((a,i)=>{const top=cov.includes(a)||a===K;S.move(a,t0+1.8+(i%5)*.3,t0+16+(i%4)*.8,[[30+i*2.2,top?-15:69]]);});S.ballAt(t0+1.5,36.3,C,.15);});
 A('Now the Thunder have the ball, so they\'re on <b>offense</b>. See the little football on the scoreboard? It shows which team has the ball.',0,t0=>{bug.at(t0+.3,{pos:'a',dd:'1ST & 10',c:'14:54'});bug.call(t0+.4,t0+6,[0],'Thunder have the ball 🏈');});
 A('And this is the <b>down and distance</b>: <b>1st & 10</b>. The offense gets four tries, called <b>downs</b>, to move the ball ten yards.',0,t0=>bug.call(t0,t0+6.6,[3],'1st down · 10 yards to go'));
 A('If they make it, they earn four brand-new downs. That\'s called getting a <b>first down</b>.');
}});

/* =========================================================
   3 — The first drive: a run, then a pass
   ========================================================= */
W({title:'The First Drive',build(S,X){
 const G=drive(S,{L:37,dir:1,fd:47,start:'sideline',clk:894,bug:{pos:'a',dd:'1ST & 10',c:'14:54'},seed:3});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);S.wait(.4);
 P('The Thunder offense jogs onto the field for its first drive.',0,t=>{G.toHuddle(t+.2);G.pc(t+.5);});
 A('Before every play, the offense gathers in a circle called a <b>huddle</b>. The <b>quarterback</b>, Cole Parker, tells everyone which play they\'re running.',0,t=>G.ring(t+.4,t+7));
 A('The defense huddles too. On the first drive, both teams are still getting a feel for each other.',0,t=>G.ring(t+.2,t+5,false));
 P('They break the huddle and walk up to the line.',0,t=>G.toForm(t+.3,'heavy','base'));
 A('Look at how they lined up. <b>No receivers</b> are spread out wide, and there\'s an extra blocker behind the quarterback. That usually means a <b>run</b>.',0,t=>{G.hi(t+.5,[O.WR1,O.WR2,O.WR3,O.TE]);wpill(S,'BLOCKERS PACKED IN → PROBABLY A RUN 🏃',BLUE,t+1.2,t+8.5);});
 A('The Titans see it too. Watch their <b>linebackers</b> creep closer to the line, ready to stop a run.',0,t=>{G.hi(t+.2,D.LB);for(const a of D.LB)S.nudge(a,t+.8,t+2.6,-1.6,0);});
 let ts=G.snapAt(1.2);G.clr(ts-1);G.snapPC(ts);let tt=runPlay(S,O,D,G.L,ts,4);G.tick(ts,tt,6);
 at(ts+.05);Q('Parker takes the snap and hands it to Jones…');
 at(tt+.15);P('…and he\'s brought down at the 31. A gain of four.',0,t=>{G.endPlay(tt,41,[O.RB,D.LB3]);G.pc(tt+.5);G.tick(tt+1,tt+12,30);});
 A('That\'s a <b>tackle</b>. Once the runner is pulled to the ground, the play is over, and the next one starts from that spot.',0,t=>{bug.at(t+.4,{dd:'2ND & 6'});G.toHuddle(t+1.5);});
 P('Second down, and six to go.',0,t=>bug.call(t,t+3,[3],'2nd down · 6 yards to go'));
 A('So it\'s their second try, and they need six more yards to reach that <b>yellow line</b>. Fun fact: the line isn\'t really on the field. It\'s drawn in just for TV.',0,t=>pulseLine(S,G.fdl,t+.5,t+7));
 P('Here they come out of the huddle. This time, they spread out.',0,t=>G.toForm(t+.3,'spread',X?'base':'pass'));
 A('Now there are receivers out wide on both sides. That\'s a <b>passing</b> look.',0,t=>{G.hi(t+.3,[O.WR1,O.WR2,O.WR3]);wpill(S,'RECEIVERS SPREAD WIDE → PROBABLY A PASS 🎯',BLUE,t+.8,t+5.6);});
 if(X){A('Watch number 17 go in <b>motion</b> across the formation. One Titan follows him the whole way. That tells us it\'s <b>man coverage</b>: each defender is shadowing one player.',0,t=>{
   G.hi(t+.2,[O.WR3,D.CB1]);S.move(O.WR3,t+1,t+4.4,[[G.L-4,C-4],[G.L-4,C+4],[G.L-1.5,C+6]],Ease.inOut);S.move(D.CB1,t+1.3,t+4.6,[[G.L+5,C+6.6]],Ease.inOut);wpill(S,'A DEFENDER FOLLOWED HIM → MAN COVERAGE',RED,t+4.8,t+10);});}
 else A('And the Titans back off a few steps, so they can stay with those receivers.',0,t=>{G.hi(t+.2,[...D.CB,...D.S]);for(const a of [...D.CB,...D.S])S.nudge(a,t+.6,t+2.4,2,0);});
 ts=G.snapAt(1.2);G.clr(ts-1);G.snapPC(ts);let r=passPlay(S,O,D,G.L,ts,{target:'WR2',route:[[0,-1,C+13.5],[1.7,9,C+13.5]],catchDx:10,catchY:C+12.3,yac:[[1,12,C+11.4]],tackler:'CB2'});G.tick(ts,r.tt,6);
 at(ts+.05);Q('Parker drops back to pass…');
 at(r.tc-.85);Q('…he throws to the right side… complete to Miller!');
 at(r.tt+.15);P('…and he\'s brought down at the 43. That\'s a <b>first down</b>!',0,t=>{tag(S,t+.2,'FIRST DOWN!',{sfx:'ding'});G.endPlay(r.tt,53,[O.WR2,D.CB2],63);G.pc(r.tt+.5);});
 A('He made it past the yellow line, so the Thunder get a fresh set of four downs. It\'s <b>first and ten</b> again, and the yellow line moves ten yards ahead.',0,t=>{bug.at(t+.4,{dd:'1ST & 10'});bug.call(t+.5,t+6,[3],'New set of downs: 1st & 10');pulseLine(S,G.fdl,t+3,t+7);G.toHuddle(t+1.5);});
}});

/* =========================================================
   4 — Third down (+ false start, nickel)
   ========================================================= */
W({title:'Third Down',build(S,X){
 const G=drive(S,{L:55,dir:1,fd:63,start:'scatter',clk:772,bug:{pos:'a',dd:'2ND & 8',c:'12:52'},seed:11});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);
 G.pc(0);G.toHuddle(.8);S.wait(.4);
 P('A couple of plays later, it\'s <b>second and eight</b> for the Thunder at their own 45.',0,t=>bug.call(t+.3,t+5,[3],'2nd down · 8 yards to go'));
 A('A team\'s trip down the field is called a <b>drive</b>. Think of it like a road trip to the end zone, and every first down keeps the trip going.',0,t=>G.ring(t+.5,t+7));
 let L=55,dd3='3RD & 8';
 if(X){P('The Thunder come to the line…',0,t=>G.toForm(t+.3,'base','base'));
  A('Wait, there\'s a <b>yellow flag</b>! A Thunder lineman jumped before the snap. That\'s a <b>false start</b>, and it moves the offense back <b>five yards</b>.',0,t=>{G.hi(t+.2,[O.RT]);S.nudge(O.RT,t+.6,t+.85,1.4,0,Ease.out);S.nudge(O.RT,t+1,t+1.4,-1.4,0);S.sfx(t+.9,'whistle');
   CH().flagThrow&&CH().flagThrow(S,t+1,[L+6,C+17],[L+1,C+5],4);tag(S,t+1.2,'🚩 FALSE START · 5 YARDS',{dur:7});
   G.clr(t+3);CH().spotTo&&CH().spotTo(S,O,D,G.los,t+5,L-5,1.4);bug.at(t+6,{dd:'2ND & 13'});});
  G.L=L=50;dd3='3RD & 13';A('Penalties like that are mistakes. They usually happen when players are nervous or the crowd is loud.',0,t=>{G.pc(t);});}
 else P('The Thunder come out of the huddle, spread out wide.',0,t=>G.toForm(t+.3,'spread','pass'));
 if(X)P('They line up again, spread out wide.',0,t=>G.toForm(t+.3,'spread','pass'));
 ts=G.snapAt(1.3);G.snapPC(ts);let r=passPlay(S,O,D,G.L,ts,{target:'WR1',route:[[0,-1,C-13],[1.9,9,C-13]],catchDx:11,catchY:C-15,incomplete:true});G.tick(ts,r.tc,5);
 at(ts+.05);Q('Parker drops back…');
 at(r.tc+.1);P('…throws to the left side… and it\'s <b>incomplete</b>! The ball hit the ground.',0,t=>{G.endPlay(r.tc,G.L,[]);S.fall(O.WR1,r.tc+1.6,.4,0);G.pc(r.tc+.5);});
 A('When a pass hits the ground, it\'s <b>incomplete</b>. The ball goes back to where the play started, and the <b>game clock stops</b>.',0,t=>{bug.at(t+.3,{dd:dd3});bug.call(t+.4,t+6,[2],'Clock stopped ⏸');G.toHuddle(t+1);});
 P(X?'That brings up third and thirteen.':'That brings up third and eight.',0,t=>bug.call(t,t+3.5,[3],X?'3rd down · 13 yards to go':'3rd down · 8 yards to go'));
 A('Third down is a big moment. If they don\'t get the first down on this play, they\'ll probably have to kick the ball away.',0,t=>{pulseLine(S,G.fdl,t+1,t+6);});
 P('Here comes the offense out of the huddle.',0,t=>G.toForm(t+.3,'spread',X?'nickel':'pass'));
 if(X)A('The Titans bring in an extra defensive back for this play. With <b>five</b> of them, it\'s called a <b>nickel</b> defense, because a nickel is worth five cents.',0,t=>{G.hi(t+.3,[...D.CB,...D.S,D.LB3]);wpill(S,'NICKEL DEFENSE = 5 DEFENSIVE BACKS 🪙',RED,t+1,t+8);});
 A('With that many yards to go, everyone expects a <b>pass</b>. The defense is playing back to protect the yellow line.',0,t=>{G.clr(t);G.hi(t+.3,[...D.S,...D.CB]);});
 const gain=60-G.L;ts=G.snapAt(1.3);G.clr(ts-1);G.snapPC(ts);r=passPlay(S,O,D,G.L,ts,{target:'WR3',route:[[0,-2,C-8.5],[1.6,gain-1.6,C-8.5]],catchDx:gain-1.2,catchY:C-7.4,yac:[[.9,gain,C-6.6]],tackler:'LB1'});G.tick(ts,r.tt,5);
 at(ts+.05);Q('Parker looks for a receiver…');
 at(r.tc-.85);Q('…he throws over the middle… caught by Lee!');
 at(r.tt+.15);P('…and Lee is tackled at the 50-yard line, <b>short</b> of the first down.',0,t=>{G.endPlay(r.tt,60,[O.WR3,D.LB1]);G.tick(r.tt+1,r.tt+10,25);});
 A('He didn\'t reach the yellow line. Now it\'s <b>fourth down</b>, and the Thunder have a big decision to make.',0,t=>{bug.at(t+.3,{dd:'4TH & 3'});bug.call(t+.4,t+6,[3],'4th down · 3 yards to go');});
}});

/* =========================================================
   5 — The punt
   ========================================================= */
W({title:'Fourth Down: The Punt',build(S,X){
 const G=drive(S,{L:60,dir:1,fd:63,start:'scatter',clk:737,bug:{pos:'a',dd:'4TH & 3',c:'12:17'},seed:21});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);
 G.pc(0);G.toHuddle(.8);S.wait(.4);
 A('On fourth down, a team has three choices. Go for it and risk giving the ball away right here, kick a <b>field goal</b> if they\'re close enough, or <b>punt</b>.',0,t=>G.ring(t+1.5,t+8));
 A('At midfield, they\'re too far for a field goal. So they\'ll punt: kick the ball far down the field, so the other team has a long way to go.');
 P('Here comes the punt team. The punter lines up way back, fifteen yards behind the line.',0,t=>{G.toForm(t+.3,'punt','punt');});
 const px=G.L-13.5,land=95;let ts=G.snapAt(1.2);G.snapPC(ts);
 S.thr(ts,ts+.6,[G.L-.8,C,.6],[px+.4,C,1.1],.6);S.give(ts+.6,O.QB);S.sfx(ts,'thud');const tk=ts+1.3;S.thr(tk,tk+3.4,[px+.4,C,1.1],[land-.4,C+2,1.2],16,{spins:8});S.sfx(tk,'kick');S.give(tk+3.4,D.S1);
 for(const a of [O.WR1,O.WR2,O.WR3,O.TE,O.LG,O.RG])S.move(a,ts+.3,tk+3.4,[[land-6-Math.abs(a.y-C)*.15,C+(planOf(a,'y')-C)*.3]]);for(const a of [D.CB1,D.CB2])S.move(a,ts+.3,tk+3.4,[[land-8,C+(planOf(a,'y')-C)*.3]]);
 S.camTo(ts,tk+3.4,{z:11.5});S.track(tk+2.3,tk+3.4,(p,r,t)=>{D.S1.hop=r>0&&r<1?Math.abs(Math.sin(t*10))*8:0;},Ease.lin);S.sfx(tk+3.6,'whistle');G.tick(ts,tk+3.4,6);
 at(ts+.1);Q('Here\'s the snap…');
 at(tk+.1);Q('…he kicks it high and far…');
 at(tk+2.4);P('…and Price waves his arm. He\'ll make a <b>fair catch</b> at the Titans\' 15.',0,t=>{tag(S,tk+3.4,'✋ FAIR CATCH');});
 A('Waving his hand like that means <b>fair catch</b>: he promises not to run, and in return, nobody is allowed to hit him.',0,t=>{G.hi(t+.2,[D.S1]);});
 A('Now the <b>Titans</b> have the ball, way back near their own end zone. That\'s exactly why the Thunder punted.',0,t=>{G.clr(t);bug.at(t+.4,{pos:'b',dd:'1ST & 10'});bug.call(t+.5,t+6,[1],'Titans have the ball 🏈');});
}});

/* =========================================================
   6 — The Titans' drive and a field goal (+ holding)
   ========================================================= */
W({title:'The Titans Answer',build(S,X){
 const G=drive(S,{L:95,dir:-1,fd:85,start:'sideline',clk:731,bug:{pos:'b',dd:'1ST & 10',c:'12:11'},seed:31});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);S.wait(.4);
 P('The Titans\' offense takes the field, led by quarterback Marcus Hayes.',0,t=>{G.toHuddle(t+.2);G.pc(t+.5);});
 A('The teams switch places now. The Titans are on <b>offense</b>, going left, and the Thunder\'s <b>defense</b> comes out to stop them.',0,t=>{G.ring(t+3,t+8);});
 P('Hayes brings them to the line.',0,t=>G.toForm(t+.3,'base','base'));
 let ts=G.snapAt(1.2);G.snapPC(ts);let tt=runPlay(S,O,D,G.L,ts,6,{dir:-1,lane:-1.8});G.tick(ts,tt,6);
 at(ts+.05);Q('Handoff to Walker…');
 at(tt+.15);P('…he picks up six before he\'s tackled.',0,t=>{G.endPlay(tt,89,[O.RB,D.LB3]);G.pc(tt+.5);G.tick(tt+1,tt+12,30);});
 A('A good start for the Titans. <b>Second and four</b>.',0,t=>{bug.at(t+.3,{dd:'2ND & 4'});G.toHuddle(t+1);});
 P('Hayes lines them up, spread out wide.',0,t=>G.toForm(t+.3,'spread','base'));
 ts=G.snapAt(1.2);G.snapPC(ts);let r=passPlay(S,O,D,G.L,ts,{dir:-1,target:'WR1',route:[[0,-1,C-13],[1.9,14,C-13]],catchDx:16,catchY:C-12,yac:[[1.2,21,C-10]],tackler:'CB1'});G.tick(ts,r.tt,7);
 at(ts+.05);Q('Hayes drops back…');
 at(r.tc-.85);Q('…he throws deep down the sideline… and it\'s caught!');
 at(r.tt+.15);P('Twenty-one yards! First down, Titans!',0,t=>{tag(S,t+.1,'FIRST DOWN!',{sfx:'ding'});G.endPlay(r.tt,68,[O.WR1,D.CB1],58);G.pc(r.tt+.5);});
 A('That was a big play. When a team gains lots of yards at once, it\'s called a <b>chunk play</b>, and it really fires up the sideline.',0,t=>{bug.at(t+.3,{dd:'1ST & 10'});G.toHuddle(t+1);});
 if(X){P('First and ten from their own 42.',0,t=>G.toForm(t+.3,'base','base'));
  ts=G.snapAt(1.2);G.snapPC(ts);tt=runPlay(S,O,D,G.L,ts,15,{dir:-1,lane:1.8});G.tick(ts,tt,7);
  at(ts+.05);Q('Handoff to Walker…');
  at(tt+.15);P('…and he breaks free for fifteen more!',0,t=>{G.endPlay(tt,53,[O.RB,D.LB3]);});
  A('But look, there\'s a <b>flag</b>. A Titans blocker grabbed a defender\'s jersey. That\'s <b>holding</b>. The run doesn\'t count, and they lose <b>ten yards</b>.',0,t=>{CH().flagThrow&&CH().flagThrow(S,t+.3,[66,C+16],[60,C+4],4);tag(S,t+.5,'🚩 HOLDING · 10 YARDS',{dur:7});
   const tb=t+3.4;G.L=78;S.ballAt(tb,78.7,C,.15);S.tw(G.los,tb,tb+.6,{x:78});S.tw(G.fdl,tb,tb+.6,{x:58});bug.at(tb,{dd:'1ST & 20'});G.toHuddle(tb+.2);});
  A('Holding is one of the most common penalties. Blockers can push, but they can\'t grab and hang on.');}
 const kv=kickView(S,TI);const L2=32;
 A('The Titans keep moving down the field. A few plays later, they\'ve reached the Thunder\'s <b>22-yard line</b>.',0,t=>{S.wipe(t);const tw=t+.35;S.follow(tw,99999,null);for(const a of G.all)S.fall(a,tw,.05,0);
  G.L=L2;const m=G.formMap('fg','fg');for(const [a,[x,y]] of m)S.place(a,tw,x,y);S.tw(G.los,tw,tw+.01,{x:L2});S.tw(G.fdl,tw,tw+.01,{x:L2-3});S.ballAt(tw,L2+.7,C,.15);S.give(tw+.02,O.C);S.camTo(tw,tw+.01,{x:L2-4,z:14.5},Ease.lin);
  G.setClk(tw,21);bug.at(tw,{dd:'4TH & 3'});bug.call(tw+.4,t+6,[3],'4th down · 3 yards to go');});
 A('It\'s fourth down again, but this time they\'re close enough to kick a <b>field goal</b>. That\'s worth <b>three points</b>.');
 P('Here\'s the snap… the kick is up…',0,t=>showKick(S,kv,t+.3));
 S.wait(1.2);P('…and it\'s <b>good</b>! The Titans take the lead, three to nothing.',0,t=>{bug.at(t+.1,{b:3});bug.pulse(t+.1,t+3,[1]);});
 A('The ball has to fly <b>between the two posts</b> and <b>over the crossbar</b>. After the kickoff, the clock runs out on the <b>first quarter</b>.',0,t=>{G.tick(t+.5,t+2.8,21);bug.at(t+3,{q:'END 1ST',c:''});bug.call(t+2.2,t+6,[2],'End of the 1st quarter');hideKick(S,kv,t+6.4);});
}});

/* =========================================================
   7 — Touchdown, Thunder! (+ play action)
   ========================================================= */
W({title:'Touchdown, Thunder!',build(S,X){
 const G=drive(S,{L:80,dir:1,fd:90,start:'huddle',clk:552,bug:{a:0,b:3,q:'2ND',c:'9:12',pos:'a',dd:'1ST & 10'},seed:41});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);G.pc(0);S.wait(.4);
 P('We\'re in the <b>second quarter</b>, and the Thunder have put together a great drive. They\'re at the Titans\' 30-yard line.',0,t=>bug.call(t+.3,t+6,[2,3],'2nd quarter · 1st & 10'));
 A('This close to the end zone, people call it <b>scoring territory</b>. Even if they stall, they could kick a field goal from here.',0,t=>G.ring(t+.3,t+6));
 P('The Thunder break the huddle.',0,t=>G.toForm(t+.3,'base','onehigh'));
 A('Look at the deepest defenders, the <b>safeties</b>. One of them has walked up close to the line, so there\'s only one left deep. That leaves <b>room</b> down the field for a long pass.',0,t=>{G.hi(t+.3,D.S);wpill(S,'ONLY ONE SAFETY DEEP → ROOM FOR A LONG PASS',RED,t+1.5,t+9);});
 if(X)A('And the Thunder have a trick ready: <b>play action</b>. Parker will <b>fake</b> a handoff, so the linebackers think it\'s a run.',0,t=>G.clr(t));
 const ts=G.snapAt(1.3);G.clr(ts-1.1);G.snapPC(ts);const tA=X?2.3:1.9;
 const fake=X?{RB:[[ts,G.L-4.6,C-2.4],[ts+.9,G.L-1.6,C-.6],[ts+2.4,G.L-1.2,C+1.5]],...Object.fromEntries(['LB1','LB2','LB3'].map(k=>{const x=planOf(D[k],'x'),y=planOf(D[k],'y');return[k,[[ts,x,y],[ts+1.3,x-2.2,y],[ts+2.6,x+1.5,y]]];}))}:{};
 const r=passPlay2(S,O,D,G.L,ts,{script:fake,target:'WR1',route:[[0,-1,C-13],[2.3,18,C-12]],catchDx:21,catchY:C-10,yac:[[2.6,31,C-8]],throwAt:tA,air:1.3,peak:5,tackler:null});const tdT=ts+tA+1.3+2.45;G.tick(ts,tdT,8);
 at(ts+.05);Q(X?'Parker fakes the handoff… the linebackers bite…':'Parker drops back…');
 at(r.tc-1.35);Q('…he throws deep for Davis…');
 at(r.tc+.15);Q('…<b>caught</b>! He\'s at the ten, the five…');
 at(tdT);P('…<b>touchdown</b>, Thunder!',0,t=>{tag(S,t,'TOUCHDOWN!',{sfx:'cheer',dur:4});S.once(t+.1,()=>window.confetti&&confetti(120));S.hopA(O.WR1,t+.3,t+2.3,3,24);});
 A('A <b>touchdown</b> is worth <b>six points</b>. Davis got the ball into the end zone, so the Thunder go ahead, six to three.',0,t=>{bug.at(t+.3,{a:6});bug.call(t+.4,t+6,[0],'Touchdown: +6');});
 A('After a touchdown, the team gets a bonus try. Most teams kick the <b>extra point</b>, a short kick worth one more.');
 const kv=kickView(S,TH);
 P('Here\'s the extra point…',0,t=>showKick(S,kv,t+.2));
 S.wait(1.4);P('…and it\'s good! Thunder seven, Titans three.',0,t=>{bug.at(t+.1,{a:7});bug.pulse(t+.1,t+3,[0]);hideKick(S,kv,t+3.6);});
}});

/* =========================================================
   8 — Picked off! (+ zone coverage clue)
   ========================================================= */
W({title:'Picked Off!',build(S,X){
 const G=drive(S,{L:72,dir:-1,fd:62,start:'huddle',clk:160,bug:{a:7,b:3,q:'2ND',c:'2:40',pos:'b',dd:'1ST & 10'},seed:51});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);G.pc(0);S.wait(.4);
 P('After the kickoff, the Titans have the ball at their own 38, with two minutes and forty seconds left in the half.',0,t=>bug.call(t+.3,t+6,[1,2],'Titans ball · 2:40 left'));
 A('They\'re behind, and time is running short. So expect them to <b>throw</b>. Passes can gain more yards in a hurry.',0,t=>G.ring(t+.3,t+6));
 P('Hayes and the Titans come to the line.',0,t=>G.toForm(t+.3,'spread','pass'));
 if(X){const L=G.L;const zones=[[L-12,C-17,9,10.6,BLUE],[L-12,C-6.2,9,12.4,TEAL],[L-12,C+6.4,9,10.6,GOLD],[L-22.5,C-17,10,17.2,'#ff8fd1'],[L-22.5,C+.4,10,16.6,'#b48cff']].map(([x,y,w,h,c])=>E('rect',{x,y,width:w,height:h,rx:1,fill:c,opacity:0,stroke:NAVY,'stroke-width':.15},S.wfx));
  A('Watch the receiver go in motion, and this time <b>nobody follows him</b>. The Thunder defenders just stay in their areas. That\'s a clue they\'re playing <b>zone</b> coverage.',0,t=>{
   G.hi(t+.3,[O.WR3]);S.move(O.WR3,t+1,t+4.2,[[L+4,C+4],[L+4,C-4],[L+1.5,C-8]],Ease.inOut);G.hi(t+4.5,[O.WR3,...D.LB,...D.S,...D.CB]);
   zones.forEach((z,i)=>{S.attr(z,t+5+i*.25,t+5.4+i*.25,'opacity',0,.28);S.attr(z,t+11,t+11.4,'opacity',.28,0);});wpill(S,'NOBODY FOLLOWED → ZONE COVERAGE',BLUE,t+5,t+11.3);});}
 else A('The Thunder defense is spread out too, with players dropping back to guard different parts of the field.',0,t=>G.hi(t+.3,[...D.S,...D.CB]));
 const L=G.L,ts=G.snapAt(1.3),tth=ts+1.8,tc=tth+.9,cp=[L-12.5,C-2.4],tk=tc+2.6;G.clr(ts-1.1);G.snapPC(ts);snapTo(S,O,L,ts,-1);
 simPlay(S,O,D,L,{dir:-1,type:'pass',ts,tEnd:tc+3.4,tth,tc,tt:tk,int:{a:'S1'},catchPt:cp,script:{WR3:[[ts,L+2,C-8.5],[ts+1.6,L-6,C-6],[tc,L-11.6,C-3]],S1:[[ts,planOf(D.S1,'x'),planOf(D.S1,'y')],[tc,cp[0],cp[1]],[tk,L-4,C-5]],QB:[[ts,L+4.6,C],[ts+1.3,L+7,C],[tth+.6,L+6.8,C]]},meet:[{a:'WR3',t:tk,x:L-3.4,y:C-5.2}]});
 S.thr(tth,tc,[L+6.45,C,1.2],[cp[0],cp[1],1.2],2.6);S.sfx(tth,'swoosh');S.give(tc,D.S1);S.fall(D.S1,tk,.35);S.fall(O.WR3,tk,.35);S.sfx(tk,'thud');S.sfx(tk+.2,'whistle');G.tick(ts,tk,6);
 at(ts+.05);Q('Hayes drops back…');
 at(tth-.25);Q('…he throws over the middle…');
 at(tc+.05);Q('…<b>intercepted</b>! Owens picks it off!',t=>tag(S,t+.05,'INTERCEPTED!',{sfx:'cheer'}));
 at(tk+.2);P('He\'s tackled at the Titans\' 42, but what a play by the Thunder!',0,t=>{G.endPlay(tk,L-4,[D.S1,O.WR3]);});
 A('That\'s an <b>interception</b>: a defender caught the pass. It\'s one kind of <b>turnover</b>, because the ball changes teams in the middle of a play.',0,t=>{bug.at(t+.3,{pos:'a',c:'2:31'});bug.call(t+.4,t+6,[0],'Turnover! Thunder ball 🏈');tag(S,t+.3,'TURNOVER');});
 P('Neither team scores again before the break, and that\'s <b>halftime</b>. Thunder seven, Titans three.',0,t=>{bug.run(t+.3,t+4.5,151,0);bug.at(t+4.6,{q:'HALFTIME',c:'',dd:'THUNDER 7–3'});bug.call(t+4.7,t+8,[2],'Halftime');});
 A('At halftime, the teams head to the locker room for about thirteen minutes. Then the second half starts with another kickoff.',0,t=>{G.all.forEach((a,i)=>S.move(a,t+.5+(i%6)*.25,t+11,[[45+i,O.all.includes(a)?-14:68]]));});
}});

/* =========================================================
   9 — Fumble! (fourth quarter)
   ========================================================= */
W({title:'Fumble!',build(S,X){
 const G=drive(S,{L:47,dir:-1,fd:37,start:'huddle',clk:X?100:135,bug:{a:7,b:6,q:'4TH',c:X?'1:40':'2:15',pos:'b',dd:'1ST & 10'},seed:61});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);G.pc(0);S.wait(.4);
 P('Let\'s jump ahead to the <b>fourth quarter</b>. The Titans kicked a field goal in the third, so it\'s a close one: <b>seven to six</b>.',0,t=>bug.call(t+.3,t+6,[0,1],'Thunder lead 7–6'));
 A(X?'And the Titans are on the move. They\'re at the Thunder\'s 37-yard line, with <b>a minute and forty seconds</b> left.':'And the Titans are on the move. They\'re at the Thunder\'s 37-yard line, with <b>just over two minutes</b> left.',0,t=>{bug.call(t,t+5.5,[2],X?'4th quarter · 1:40 left':'4th quarter · 2:15 left');G.ring(t+.4,t+6);});
 A('A field goal would put them ahead. So the Thunder defense really needs a big play here.');
 P('Hayes takes them to the line.',0,t=>G.toForm(t+.3,'heavy','run'));
 A('Two tight receivers and an extra blocker in the backfield. That\'s a <b>run</b> look, and the Thunder linebackers are creeping up.',0,t=>{G.hi(t+.3,[O.WR1,O.WR2,O.WR3,...D.LB]);});
 const ts=G.snapAt(1.2);G.clr(ts-1);G.snapPC(ts);const f=fumbleRun(S,G,ts,3,'S2');G.tick(ts,f.tt,5);
 at(ts+.05);Q('Handoff to Walker…');
 at(f.tt+.05);Q('…he\'s hit… <b>fumble!</b>',t=>tag(S,t+.1,'FUMBLE!',{sfx:'buzz'}));
 at(f.rec+.2);P('And the Thunder recover it! Riley dives on the ball!',0,t=>{G.endPlay(f.rec,f.spot,[D.S2,O.RB,D.LB3]);});
 A('That\'s a <b>fumble</b>. The runner dropped the ball before he was tackled, so it was a loose ball, and <b>anyone</b> could grab it.',0,t=>{tag(S,t+.3,'TURNOVER');});
 A(X?'The Thunder grabbed it, so that\'s another <b>turnover</b>. Now they have the ball, and the lead, with about a minute and a half to play.':'The Thunder grabbed it, so that\'s another <b>turnover</b>. Now they have the ball, and the lead, with just over two minutes to play.',0,t=>{bug.at(t+.3,{pos:'a',dd:'1ST & 10'});bug.call(t+.4,t+6,[0],'Thunder ball 🏈');});
}});

/* =========================================================
   10 — The final two minutes (+ timeouts)
   ========================================================= */
W({title:'The Final Two Minutes',build(S,X){
 const G=drive(S,{L:41,dir:1,fd:51,start:'sideline',clk:X?95:130,bug:{a:7,b:6,q:'4TH',c:X?'1:35':'2:10',pos:'a',dd:'1ST & 10'},seed:71});const {O,D,bug}=G;const {P,A,Q,at}=booth(S);S.wait(.4);
 P(X?'The Thunder offense comes back out with a minute and thirty-five seconds left.':'The Thunder offense comes back out with two minutes and ten seconds left.',0,t=>{G.toHuddle(t+.2);G.pc(t+.5);});
 A('Here\'s the plan when you\'re ahead late in a game: keep the <b>clock running</b>. Every second that ticks away is one less second for the other team.',0,t=>G.ring(t+3,t+8));
 A('So the Thunder will <b>run</b> the ball and try to stay <b>in bounds</b>. When a play ends inside the field, the clock keeps going.');
 P('They come to the line.',0,t=>G.toForm(t+.3,'heavy','run'));
 let ts=G.snapAt(1.2);G.snapPC(ts);let tt=runPlay(S,O,D,G.L,ts,5);G.tick(ts,tt,5);
 at(ts+.05);Q('Handoff to Jones…');
 at(tt+.15);P('…five yards, and he\'s tackled <b>in bounds</b>. The clock keeps ticking.',0,t=>{G.endPlay(tt,46,[O.RB,D.LB3]);G.pc(tt+.5);G.tick(tt+.6,tt+9,X?3:36);});
 A('Watch the game clock. It\'s still running. An <b>incomplete pass</b> or a runner going <b>out of bounds</b> would have stopped it.',0,t=>{bug.at(t+.3,{dd:'2ND & 5'});bug.pulse(t+.3,t+6,[2]);G.toHuddle(t+1);});
 if(X){A('The Titans call a <b>timeout</b> to stop the clock. Each team gets <b>three</b> timeouts per half, and that was their last one.',0,t=>{bug.at(t+.3,{dd:'TIMEOUT'});tag(S,t+.3,'⏱ TIMEOUT · TITANS');bug.at(t+6,{dd:'2ND & 5'});});}
 P('Second and five.',0,t=>G.toForm(t+.3,'heavy','run'));
 ts=G.snapAt(1.2);G.snapPC(ts);tt=runPlay(S,O,D,G.L,ts,6,{lane:-1.6});G.tick(ts,tt,5);
 at(ts+.05);Q('Jones again, to the left side…');
 at(tt+.15);P('…and he gets it! Six yards and a <b>first down</b>, Thunder!',0,t=>{tag(S,t+.1,'FIRST DOWN!',{sfx:'ding'});G.endPlay(tt,52,[O.RB,D.LB3],62);G.pc(tt+.5);G.tick(tt+.6,tt+9,40);});
 A('That first down seals it. Now the Thunder can do a <b>kneel-down</b>: the quarterback takes the snap and drops to one knee. The play ends right away, and the clock keeps running.',0,t=>{bug.at(t+.3,{dd:'1ST & 10'});G.toHuddle(t+1);});
 P('Here comes the <b>victory formation</b>.',0,t=>{G.toForm(t+.3,'kneel','kneel');wpill(S,'🧎 VICTORY FORMATION',NAVY,t+3,t+9);});
 ts=G.snapAt(1);G.snapPC(ts);snapTo(S,O,G.L,ts);S.tw(O.QB,ts+.5,ts+.9,{fall:.35},Ease.out);const c0=G.clk(),tz=ts+10;bug.run(ts+.6,tz,c0,0);
 at(ts+.2);Q('Parker kneels down, and the clock keeps running…');
 at(tz-3.4);Q('Three… two… one…');
 at(tz+.1);P('That\'s the game! The <b>Thunder win</b>, seven to six!',0,t=>{bug.at(t,{q:'FINAL',c:'',dd:'THUNDER WIN'});bug.pulse(t,t+4,[0,1,2]);tag(S,t,'🏆 FINAL: THUNDER 7–6',{sfx:'cheer',dur:6});
  S.once(t+.2,()=>window.confetti&&confetti(200,true));S.once(t+1.4,()=>window.confetti&&confetti(140,true));O.all.forEach((a,i)=>S.hopA(a,t+.4+i*.05,t+4.5,5,22));});
 A(X?'What a game! You followed the scoreboard, the downs, the formations, the penalties and the strategy. You\'re ready to watch the NFL.':'What a game! Next time you watch a real one, look for the <b>scoreboard</b>, the <b>down and distance</b>, and the <b>formation clues</b> before each snap.');
 P('For Dana Brooks, I\'m Mike Carter. Thanks for watching!',0);
}});

/* ---------------- the "Watch a Game" chooser ---------------- */
const prog=k=>{try{return +localStorage.getItem('f101_prog_'+k)||0;}catch(e){return 0;}};
const watched=k=>{const C_=COURSES[k];if(!C_)return false;const n=C_.list.filter(d=>!d.quiz).length;return prog(k)>=n;};
window.openWatch=function(){const o=document.createElement('div');o.className='wchoose';const cc=watched('basics'),rr=watched('rules'),ss=watched('smarts');
 o.innerHTML=`<div class="wbox"><h2>📺 Watch a Game</h2><p class="wlead">Sit back and watch the <b style="color:#2f6fed">Thunder</b> play the <b style="color:#e2483f">Titans</b>. The announcers explain everything as it happens, using what you learned.</p>
 <div class="wopts"><button class="wopt ${rr&&ss?'':'on'}" data-x="0"><b>🏈 The basics</b><small>Score, clock, downs, formations · about 13 min</small></button>
 <button class="wopt ${rr&&ss?'on':''}" data-x="1"><b>🧠 Basics + Rules & Smarts</b><small>Adds penalties and coaching strategy · about 15 min</small></button></div>
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
