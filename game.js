/* =========================================================
   Football 101 — "Game Day": an arcade football game
   First team to 2 touchdowns wins. Uses the drawing helpers from index.html.
   ========================================================= */
(function(){
TEAM.purple={jersey:'#8e5cf7',helmet:'#6a3fd6',stripe:'#ffc93c'};
TEAM.green={jersey:'#22a55a',helmet:'#16803f',stripe:'#ffffff'};
TEAM.orange={jersey:'#ff8a1f',helmet:'#e56a00',stripe:'#1d2b53'};
TEAM.black={jersey:'#3a3f4f',helmet:'#22252f',stripe:'#ffc93c'};
const COLORS=[['blue','#2f6fed','Blue'],['red','#ff5a4e','Red'],['purple','#8e5cf7','Purple'],['green','#22a55a','Green'],['orange','#ff8a1f','Orange'],['black','#3a3f4f','Black']];
const CPU_NAMES=['Rivals','Raptors','Storm','Titans','Comets','Grizzlies'];
const GS=.82; // overall game speed
const SPD={OL:4.4,DL:5.2,QB:6.2,RB:8.2,WR:8.6,TE:7.2,LB:7.1,CB:8.0,S:7.7};
const SCORE_TO_WIN=2,WIN_PTS=14;
let root,svg,L={},F,cam={x:60,y:C,z:16},G=null,P=null,raf=0,lastT=0,keys={},touch=null,announceT=0;
const $g=id=>document.getElementById(id);
const _st=window.setTimeout.bind(window);
function setTimeout(fn,ms){const id=G&&G.id;return _st(()=>{if(G&&G.id===id)fn();},ms);}
const rnd=(a,b)=>a+Math.random()*(b-a);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const ANN={
 start:'Welcome to the big game! First team to fourteen points wins. That\'s two touchdowns!',firstdown:'First down! The chains are moving!',bigrun:'Look at him go! What a run!',
 short:'Brought down after a short gain.',nogain:'Stuffed at the line! No gain on the play.',loss:'Oh, he\'s dropped for a loss!',
 td:'Touchdown! What a play!',td2:'He\'s in! Touchdown!',catch:'Caught! Great hands!',incomplete:'The pass falls incomplete.',
 int:'Intercepted! What a turnover!',sack:'Sacked! The quarterback goes down!',fourth:'Fourth down. Big decision time.',
 punt:'They\'ll punt it away.',fggood:'The kick is up... and it\'s good!',fgmiss:'The kick is up... and it\'s no good!',
 tod:'Stopped short on fourth down! Turnover on downs!',oob:'He\'s pushed out of bounds.',win:'And that\'s the game! What a performance!',
 lose:'That\'s the game. Better luck next time!',stop:'What a stop by the defense!',cputd:'They score! Touchdown!',
 blitz:'Here comes the blitz!',deep:'He\'s going deep!',third:'Third down. Time to make something happen.',touchback:'Touchback. The ball comes out to the twenty.',kickoff:'The kickoff sails into the end zone. Touchback!',
 xp:'And the extra point is good.',fumble:'Fumble! The ball is loose!',goforit:'They\'re going for it!'};
window.GAME_ANN=ANN;
function say(k,extra){const t=ANN[k];if(!t)return;announceT=performance.now();const b=$g('gAnn');if(b){b.innerHTML=`<span class="mic">🎙️</span><span>${extra?extra.replace(/\{u\}/g,G.u.name).replace(/\{c\}/g,G.c.name):t}</span>`;b.classList.remove('show');void b.offsetWidth;b.classList.add('show');}
 if(typeof NARR!=='undefined'&&NARR['g_'+k]&&!muted){try{stopVoice();voice=new Audio('audio/'+NARR['g_'+k].f);voice.play().catch(()=>{});}catch(e){}}}

/* ---------------- setup screen ---------------- */
function setupScreen(){G=null;cancelAnimationFrame(raf);raf=0;
 root.innerHTML=`<div class="gwrap"><div class="gtop"><button class="btn" id="gMenu">◀ Menu</button><h2>🏈 Game Day</h2><span></span></div>
 <div class="gsetup"><div class="gcard"><h3>Name your team</h3><input id="gName" maxlength="14" value="Thunder" autocomplete="off">
 <h3>Pick your color</h3><div class="gcolors">${COLORS.map(([k,c,n],i)=>`<button class="gcol ${i===0?'on':''}" data-k="${k}" style="--c:${c}" title="${n}"><svg viewBox="-30 -80 60 90" width="58" height="80"></svg></button>`).join('')}</div>
 <h3>Difficulty</h3><div class="gdiff"><button class="gd on" data-d="rookie">Rookie</button><button class="gd" data-d="pro">Pro</button></div>
 <button class="btn primary gstart" id="gStart">▶ Kick off!</button>
 <p class="gwin">First team to <b>14 points</b> (two touchdowns) wins. You call the plays: run, pass, punt or kick!</p></div></div></div>`;
 root.querySelectorAll('.gcol').forEach(b=>{const sv=b.querySelector('svg');const p=drawPlayer(sv,b.dataset.k,'',1);p.g.setAttribute('transform','translate(0,0) scale(1)');
  b.onclick=()=>{root.querySelectorAll('.gcol').forEach(x=>x.classList.remove('on'));b.classList.add('on');SFX.play('pop');};});
 root.querySelectorAll('.gd').forEach(b=>b.onclick=()=>{root.querySelectorAll('.gd').forEach(x=>x.classList.remove('on'));b.classList.add('on');SFX.play('pop');});
 $g('gMenu').onclick=()=>{window.gameStop();showMenu();};
 $g('gStart').onclick=()=>{const name=($g('gName').value||'Thunder').trim().slice(0,14)||'Thunder';const col=root.querySelector('.gcol.on').dataset.k;
  const cc=col==='red'?'blue':'red';const diff=root.querySelector('.gd.on').dataset.d;startGame(name,col,CPU_NAMES[Math.floor(Math.random()*CPU_NAMES.length)],cc,diff);};}

/* ---------------- game screen ---------------- */
function startGame(un,uc,cn,ccol,diff){
 G={id:Date.now()+Math.random(),u:{name:un,color:uc},c:{name:cn,color:ccol},score:{u:0,c:0},tds:{u:0,c:0},poss:'u',los:45,down:1,togo:10,fd:45,diff,dk:diff==='pro'?1:.9,phase:'call',drive:0};
 root.innerHTML=`<div class="gwrap"><div class="gtop"><button class="btn" id="gMenu">◀ Menu</button><div class="gbug" id="gBug"></div><button class="btn round" id="gFs" title="Full screen"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button></div>
 <div class="gstage"><svg id="gSvg" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet"></svg><canvas id="gFx"></canvas>
 <div class="gann" id="gAnn"></div><div class="ghint" id="gHint"></div><div class="gtoast" id="gToast"></div><div class="gpanel" id="gPanel"></div><div class="gjoy" id="gJoy" hidden><i></i></div></div></div>`;
 $g('gMenu').onclick=()=>{window.gameStop();showMenu();};$g('gFs').onclick=()=>window.toggleFS&&toggleFS();
 svg=$g('gSvg');L={};for(const k of ['world','marks','actors','ball','ui'])L[k]=E('g',{},svg);
 F=drawField({field:L.world});
 // recolor end zones with team colors: user attacks right (other team's end zone on the right)
 F.ez1.setAttribute('fill',TEAM[uc].helmet);F.ez2.setAttribute('fill',TEAM[ccol].helmet);
 for(const t of L.world.querySelectorAll('text'))if(t.textContent==='BLUE')t.textContent=un.toUpperCase();else if(t.textContent==='RED')t.textContent=cn.toUpperCase();
 L.los=E('rect',{y:0,width:.34,height:53.33,fill:'#3d8bff'},L.marks);L.fdl=E('rect',{y:0,width:.34,height:53.33,fill:YEL},L.marks);
 L.ballG=E('g',{},L.ball);L.shadow=E('ellipse',{rx:9,ry:3.5,fill:'rgba(20,30,60,.3)'},L.ballG);L.glow=E('circle',{r:16,fill:'rgba(255,240,90,.3)',stroke:'#fff04a','stroke-width':3},L.ballG);L.ballEl=drawBall(L.ballG);
 bindInput();updBug();say('start');setTimeout(()=>newPlay(),600);
 lastT=performance.now();if(!raf)raf=requestAnimationFrame(loop);}

function updBug(){const b=$g('gBug');if(!b||!G)return;const u=G.u,c=G.c;const ball=G.poss==='u'?u:c;
 const yl=Math.round(G.poss==='u'?G.los-10:110-G.los);const fp=yl===50?'MIDFIELD':yl<50?'OWN '+yl:'OPP '+(100-yl);const dd=G.down&&G.phase!=='over'?`${['1ST','2ND','3RD','4TH'][G.down-1]} & ${G.goal?'GOAL':G.togo} · ${fp}`:'FINAL';
  const td=k=>Array.from({length:SCORE_TO_WIN},(_,i)=>`<i class="${i<G.tds[k]?'on':''}">🏈</i>`).join('');
 b.innerHTML=`<span class="tm" style="--c:${COLORS.find(x=>x[0]===u.color)[1]}">${G.poss==='u'?'<b class="pos" title="Has the ball">🏈</b>':''}${u.name.toUpperCase()} <b>${G.score.u}</b><em>${td('u')}</em></span>
 <span class="tm" style="--c:${COLORS.find(x=>x[0]===c.color)[1]}">${G.poss==='c'?'<b class="pos" title="Has the ball">🏈</b>':''}${c.name.toUpperCase()} <b>${G.score.c}</b><em>${td('c')}</em></span><span class="dd">${dd}</span>`;}

/* ---------------- play setup ---------------- */
const OFFR=[['C',55,'OL',.8,0],['LG',66,'OL',.8,-1.9],['RG',67,'OL',.8,1.9],['LT',71,'OL',.8,-3.8],['RT',74,'OL',.8,3.8],['TE',88,'TE',1,5.9],['QB',12,'QB',4.6,0],['RB',28,'RB',5.4,0],['WR1',11,'WR',1,-13],['WR2',81,'WR',1,13.5],['WR3',17,'WR',1.5,-8.5]];
const DEFR=[['DL1',91,'DL',1.1,-3],['DL2',93,'DL',1.1,-1],['DL3',97,'DL',1.1,1],['DL4',99,'DL',1.1,3],['LB1',52,'LB',5,-4.5],['LB2',54,'LB',5,0],['LB3',56,'LB',5,4.5],['CB1',24,'CB',6,-13],['CB2',21,'CB',6,13.5],['S1',31,'S',12,-6],['S2',32,'S',12,6]];
function clearPlay(){L.actors.innerHTML='';for(const n of [...L.ui.childNodes])n.remove();}
function mkActor(team,k,num,pos,x,y,face){const a={team,k,num,pos,x,y,vx:0,vy:0,face,fall:0,ph:0,amp:0,hop:0,tried:new Set(),eng:0,engBy:null};a.el=drawPlayer(L.actors,G[team].color,num,face);return a;}
function newPlay(){if(!G||G.phase==='over')return;clearPlay();const d=G.poss==='u'?1:-1;const off=G.poss,def=off==='u'?'c':'u';
 const los=G.los;P={t:0,d,off,def,O:{},D:{},all:[],ball:{x:los,y:C,h:0,holder:null,fly:null},live:false,type:null,result:null,carrier:null,ctrl:false};
 for(const [k,n,pos,dx,dy] of OFFR){const a=mkActor(off,k,n,pos,los-d*dx,C+dy,d);P.O[k]=a;P.all.push(a);}
 for(const [k,n,pos,dx,dy] of DEFR){const j=pos==='DL'?.4:1.5;const a=mkActor(def,k,n,pos,los+d*Math.max(.9,dx+rnd(-j,j)*.6),C+dy+rnd(-j,j),-d);a.readJ=rnd(-.15,.3);P.D[k]=a;P.all.push(a);}
 keys={};touch=null;P.uDef=def==='u'?P.D.LB2:null;P.ball.holder=P.O.C;G.goal=(d===1?110-los:los-10)<=G.togo;if(G.goal)G.togo=Math.round(d===1?110-los:los-10);
 G.fd=G.goal?(d===1?110:10):los+d*G.togo;L.los.setAttribute('x',los-.17);L.fdl.setAttribute('x',G.fd-.17);L.fdl.setAttribute('opacity',G.goal?0:1);
 cam.x=los+d*6;cam.y=C;updBug();G.phase='call';showCall();}

/* ---------------- play calling ---------------- */
function fgDist(){return Math.round((G.poss==='u'?110-G.los:G.los-10)+17);}
function showCall(){const p=$g('gPanel');const h=$g('gHint');h.textContent='';const off=G.poss==='u';
 if(G.down===4&&off)say('fourth');else if(G.down===3&&Math.random()<.5)say('third');
 if(off){const fd=fgDist();const fourth=G.down===4;
  p.innerHTML=`<div class="gq">${fourth?'4th down! Go for it, punt, or kick?':'Your ball! Pick a play:'}</div><div class="gbtns">
  <button class="gb run" data-p="run" data-l="-6"><span>🏃</span>Run left</button><button class="gb run" data-p="run" data-l="0"><span>🏃</span>Run middle</button><button class="gb run" data-p="run" data-l="6"><span>🏃</span>Run right</button><button class="gb pass" data-p="pass"><span>🎯</span>Pass<small>pick a receiver</small></button>
  ${fourth?`<button class="gb kick" data-p="punt"><span>🦵</span>Punt<small>kick it far away</small></button><button class="gb kick" data-p="fg" ${fd>62?'disabled title="Too far for a field goal"':''}><span>🥅</span>Field goal<small>${fd} yds</small></button>`:''}</div>`;
  p.querySelectorAll('.gb').forEach(b=>b.onclick=()=>{if(b.disabled)return;SFX.play('pop');const t=b.dataset.p;p.innerHTML='';if(t==='run')runPlay(+b.dataset.l);else if(t==='pass')passPlay();else if(t==='punt')puntPlay();else fgPlay();});}
 else{const ai=cpuCall();if(ai==='punt'||ai==='fg'){p.innerHTML=`<div class="gq">4th down: ${G.c.name} will ${ai==='punt'?'punt':'try a field goal'}.</div>`;setTimeout(()=>{p.innerHTML='';ai==='punt'?puntPlay():fgPlay();},1300);return;}
  if(G.down===4)say('goforit');
  p.innerHTML=`<div class="gq">${G.c.name} has the ball. Pick your defense:</div><div class="gbtns"><button class="gb run" data-d="run"><span>🧱</span>Stop the run</button><button class="gb pass" data-d="pass"><span>🛡️</span>Cover the pass</button><button class="gb kick" data-d="blitz"><span>⚡</span>Blitz!<small>risky vs. passes</small></button></div>`;
  p.querySelectorAll('.gb').forEach(b=>b.onclick=()=>{SFX.play('pop');p.innerHTML='';P.dcall=b.dataset.d;if(P.dcall==='blitz')say('blitz');ai==='run'?runPlay([-6,0,6][Math.floor(Math.random()*3)]):passPlay();});}}
function cpuCall(){const fd=fgDist();if(G.down===4){if(G.togo<=2&&G.los<75)return Math.random()<.7?(Math.random()<.5?'run':'pass'):fd<=48?'fg':'punt';if(fd<=50)return 'fg';if(G.los<55&&G.togo<=4)return 'pass';return 'punt';}
 const pRun=G.togo<=3?.65:G.togo>=8?.3:.5;return Math.random()<pRun?'run':'pass';}

/* ---------------- plays ---------------- */
function snap(){P.live=true;P.t=0;SFX.play('hut');const d=P.d;P.ball.holder=null;P.ball.fly={x0:P.O.C.x,y0:C,h0:.6,x1:P.O.QB.x+d*.3,y1:C,h1:1.2,t0:0,dur:.28,peak:.2,to:P.O.QB};}
function runPlay(lane){P.type='run';P.lane=lane;P.ctrl=P.off==='u';snap();
 P.handT=.62;const O=P.O,D=P.D;
 assignBlocks(true);hint(P.ctrl?'Steer: arrows or drag. Space or 2nd finger = juke!':'You control the glowing linebacker: arrow keys or drag to chase the runner');}
function passPlay(){P.type='pass';P.ctrl=P.off==='u';snap();assignBlocks(false);const d=P.d,O=P.O;
 const r=(a,pts)=>{a.route=pts.map(([dx,dy])=>({x:a.x+d*dx,y:a.y+dy}));a.wp=0;};
 r(O.WR1,[[22,0],[38,1]]);r(O.WR2,[[9,0],[14,-7],[24,-12]]);r(O.WR3,[[6,0],[9,-6],[12,-12]]);r(O.TE,[[7,0],[11,-3],[16,-3]]);r(O.RB,[[1,6],[4,11],[9,13]]);
 P.targets=[O.WR1,O.WR3,O.TE,O.WR2];P.badges=[];P.cpuThrowAt=P.blitz?rnd(1.3,1.7):rnd(1.8,2.7);
 if(P.ctrl){P.targets.forEach((a,i)=>{const g=G0(L.ui);const cc=E('circle',{r:17,fill:GOLD,stroke:NAVY,'stroke-width':4},g);T(g,0,1,String(i+1),{size:20,fill:NAVY});g.style.cursor='pointer';
  g.addEventListener('pointerdown',e=>{e.stopPropagation();throwTo(a);});P.badges.push({g,a,cc});});hint('Pick a receiver: green = open! Tap a number or press 1-4');}
 else hint(P.dcall==='blitz'?'Blitz! Steer the glowing linebacker at the quarterback!':'Steer the glowing linebacker: arrow keys or drag');}
function G0(par){return E('g',{},par);}
function assignBlocks(run){const O=P.O,D=P.D;const pairs=[[O.LT,D.DL1],[O.LG,D.DL2],[O.RG,D.DL3],[O.RT,D.DL4]];
 for(const [o,d] of pairs){o.block=d;}O.C.block=run?D.LB2:D.DL2;if(run){O.TE.block=D.LB3;O.WR1.block=D.CB1;O.WR2.block=D.CB2;O.WR3.block=D.S1;}
 const shedR=run?[1.6,3.0]:[2.7,4.3];for(const k of ['DL1','DL2','DL3','DL4'])D[k].shed=rnd(...shedR)*(P.dcall==='run'&&run?.8:1);
 for(const k of ['LB1','LB2','LB3','CB1','CB2','S1','S2'])D[k].shed=rnd(1.2,2.4);
 if(P.dcall==='blitz'||(P.off==='u'&&!run&&Math.random()<.25)){P.blitz=[D.LB1,D.LB2];}}
function throwTo(a){if(!P||P.thrown||P.type!=='pass'||P.ball.holder!==P.O.QB||P.result)return;P.thrown=true;hint('');for(const b of P.badges)b.g.remove();P.badges=[];
 const q=P.O.QB;let T=dist(q,a)/22;for(let i=0;i<3;i++){const tx=a.x+a.vx*T,ty=a.y+a.vy*T;T=Math.hypot(tx-q.x,ty-q.y)/22;}
 const tx=clamp(a.x+a.vx*T*.95,1,119),ty=clamp(a.y+a.vy*T*.95,.8,52.5);P.ball.holder=null;P.ball.fly={x0:q.x,y0:q.y,h0:1.4,x1:tx,y1:ty,h1:1.3,t0:P.t,dur:Math.max(.45,T/GS),peak:Math.min(5,T*3.6),to:a,pass:true};P.target=a;SFX.play('swoosh');if(P.ctrl&&Math.hypot(tx-q.x,ty-q.y)>22)say('deep');}
function puntPlay(){P.type='punt';P.ctrl=false;const d=P.d,O=P.O;O.QB.x=G.los-d*13;O.QB.y=C;O.RB.x=G.los-d*10;snap();P.ball.fly.x1=O.QB.x+d*.3;P.ball.fly.dur=.55;say('punt');hint('');
 P.D.S1.x=G.los+d*42;P.D.S1.y=C;P.D.S2.x=G.los+d*30;}
function fgPlay(){P.type='fg';P.ctrl=false;const d=P.d,O=P.O;O.QB.x=G.los-d*7;O.QB.y=C;O.RB.x=G.los-d*9.5;O.RB.y=C-1.6;O.RB.k='K';hint('');
 if(P.off==='u'){kickMeter(acc=>{P.acc=acc;snap();P.ball.fly.x1=O.QB.x+d*.3;});}else{P.acc=rnd(.5,1)*(fgDist()<40?1:.85);setTimeout(()=>{if(P&&P.type==='fg')snap();},700);P.ball&&0;}}
function kickMeter(cb){const p=$g('gPanel');p.innerHTML=`<div class="gq">Stop the needle in the green to kick it straight!</div><div class="gmeter"><div class="gm"><i class="zone" style="--w:${clamp((36-fgDist()*.35)*(G.diff==='pro'?1:1.35),10,34)}%"></i><i class="needle" id="gNeedle"></i></div><button class="btn primary" id="gKick">🥅 KICK!</button></div>`;
 let t0=performance.now(),stop=false;const nd=$g('gNeedle');const anim=()=>{if(stop||!nd.isConnected)return;const ph=((performance.now()-t0)/1000*.45)%1;const v=ph<.5?ph*2:2-ph*2;nd.style.left=(v*100)+'%';nd._v=v;requestAnimationFrame(anim);};anim();
 const go=()=>{if(stop)return;stop=true;const v=nd._v??.5;const w=clamp((36-fgDist()*.35)*(G.diff==='pro'?1:1.35),10,34)/100;const off=Math.abs(v-.5);const acc=off<w/2?1-off/(w/2)*.3:clamp(.7-(off-w/2)*2.2,0,.7);p.innerHTML='';document.removeEventListener('keydown',kk);cb(acc);};
 const kk=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();go();}};document.addEventListener('keydown',kk);$g('gKick').onclick=go;}

/* ---------------- simulation ---------------- */
function loop(ts){raf=requestAnimationFrame(loop);if(!G||document.getElementById('gamePage').hidden)return;const dt=Math.min(.05,(ts-lastT)/1000||0);lastT=ts;
 if(P&&P.live)step(dt*GS);render(dt);}
function steer(a,tx,ty,sp,dt,k=8){const dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy);const want=d>.05?Math.min(sp,d*4):0;const vx=d>1e-6?dx/d*want:0,vy=d>1e-6?dy/d*want:0;a.vx+=(vx-a.vx)*Math.min(1,dt*k);a.vy+=(vy-a.vy)*Math.min(1,dt*k);}
function spd(a){let s=SPD[a.pos]||7;if(a.team===P.def){if(a.team==='c')s*=G.dk;if(P.dcall==='pass'&&['CB','S','LB'].includes(a.pos)&&P.type==='pass')s*=1.06;}if(a.team==='u'&&P.ctrl&&a===P.carrier&&G.diff!=='pro')s*=1.04;if(a.team==='c'&&P.off==='c')s*=G.diff==='pro'?1.02:.96;return s;}
function step(dt){const t=(P.t+=dt);const d=P.d,O=P.O,D=P.D,b=P.ball;
 // ball flight
 if(b.fly){const f=b.fly;const r=clamp((t-f.t0)/f.dur);b.x=lerp(f.x0,f.x1,r);b.y=lerp(f.y0,f.y1,r);b.h=lerp(f.h0,f.h1,r)+f.peak*4*r*(1-r);b.spin=(b.spin||0)+dt*20;
  if(r>=1){b.fly=null;if(f.pass)arrivePass(f);else if(f.kick)kickLand(f);else if(f.to){b.holder=f.to;}}}
 if(P.type==='run'&&!P.handed&&t>=P.handT&&b.holder===O.QB){b.holder=O.RB;P.handed=true;P.carrier=O.RB;}
 const car=b.holder&&b.holder!==O.C?b.holder:null;P.carrier=car;
 for(const a of P.all){if(a.fall>0){a.vx*=.8;a.vy*=.8;continue;}
  const off=a.team===P.off;
  if(a===car){moveCarrier(a,dt);continue;}
  if(off)offAI(a,dt,car);else if(a===P.uDef&&!a.eng&&userInput())userMove(a,dt);else defAI(a,dt,car);}
 // engagement (blocking): blocker near its target holds it
 for(const a of P.all){if(a.team!==P.off||!a.block||a.fall)continue;const df=a.block;if(df.fall)continue;if(dist(a,df)<1.45&&t<(df.shed||2)+.3&&(!df.engBy||df.engBy===a)){df.engBy=a;df.eng=1;}else if(df.engBy===a&&(t>=(df.shed||2)||dist(a,df)>2.2)){df.eng=0;df.engBy=null;df.shed=-1;a.block=null;}}
 // integrate + separation
 for(const a of P.all){if(a.eng&&a.engBy){a.vx*=.18;a.vy*=.18;const o=a.engBy;const px=P.type==='run'?d*.55:-d*.45;o.vx=o.vx*.5+px;a.vx+=px;}
  a.x+=a.vx*dt;a.y+=a.vy*dt;}
 for(let i=0;i<P.all.length;i++)for(let j=i+1;j<P.all.length;j++){const a=P.all[i],c=P.all[j];const dx=a.x-c.x,dy=a.y-c.y,e=Math.hypot(dx,dy);if(e<.9&&e>1e-4&&a!==car&&c!==car){const f=(.9-e)/2;a.x+=dx/e*f;a.y+=dy/e*f;c.x-=dx/e*f;c.y-=dy/e*f;}}
 if(P.result)return;
 // sack
 if(car===O.QB&&P.type==='pass'&&!P.thrown){for(const df of P.all)if(df.team===P.def&&!df.eng&&!df.fall&&dist(df,O.QB)<1.05){tackle(O.QB,df,'sack');return;}
  if(!P.ctrl&&t>P.cpuThrowAt&&!P.cpuThrow){P.cpuThrow=true;const best=bestTarget();setTimeout(()=>P&&throwTo(best),rnd(0,250));}}
 if(car&&car!==O.QB||(car&&P.type==='run')){
  // touchdown / safety / out of bounds
  const own=car.team===P.off?d:-d;
  if(own===1&&car.x>=110||own===-1&&car.x<=10){return endPlay({kind:'td',team:car.team});}
  if(car.y<.4||car.y>52.9){return endPlay({kind:'oob',x:car.x});}
  for(const df of P.all){if(df.team===car.team||df.fall||df.eng)continue;if(dist(df,car)<.95&&!df.tried.has(car)){df.tried.add(car);const sp=Math.hypot(car.vx,car.vy)||1,ex=df.x-car.x,ey=df.y-car.y,el=Math.hypot(ex,ey)||1;const cosA=(car.vx*ex+car.vy*ey)/(sp*el);const user=car.team==='u'&&(P.ctrl||P.type!=='run');let brk=user?.05+.32*clamp(1-cosA,0,1.6)/1.6+(P.juke&&t<P.juke+.45?.55:0):.1;if(user&&sp<4)brk*=.5;if(Math.random()<brk){df.fall=1;df.recover=t+1.1;SFX.play('thud');toast(P.juke&&t<P.juke+.45?'Juke! Broken tackle!':'Broken tackle!');}else{tackle(car,df);return;}}}}
 for(const a of P.all)if(a.fall&&a.recover&&t>a.recover&&!P.result){a.fall=0;a.recover=0;}}
function moveCarrier(a,dt){const d=a.team===P.off?P.d:-P.d;const s=spd(a)*(a.pos==='QB'?.8:1);
 if(a.pos==='QB'&&a.team===P.off&&(P.type==='pass'&&!P.thrown||P.type==='run'&&!P.handed)){steer(a,G.los-P.d*(P.type==='pass'?7:4.6),C,4.5,dt);return;}
 if(a.team==='u'&&(P.ctrl||P.type!=='run')){let [ix,iy]=readStick(a);
  if(P.juke&&P.t<P.juke+.3){const m0=Math.hypot(ix,iy)||1;const jy=P.jukeDir||1;steer(a,a.x+d*2,a.y+jy*5,s*1.25,dt,16);return;}
  if(!ix&&!iy){if(P.type==='run'&&a.team===P.off&&P.t<P.handT+1.1){const tx=G.los+d*1.5-a.x,ty=C+P.lane-a.y;const mm=Math.hypot(tx,ty)||1;ix=tx/mm;iy=ty/mm;}else ix=d;} const m=Math.hypot(ix,iy)||1;steer(a,a.x+ix/m*5,a.y+iy/m*5,s,dt,9);return;}
 // AI runner: run toward goal, avoid defenders
 let vx=d*1.2,vy=(P.type==='run'&&a.team===P.off&&P.t<P.handT+1)?Math.sign(P.lane-(a.y-C))*.8:0;for(const df of P.all){if(df.team===a.team||df.fall)continue;const dx=a.x-df.x,dy=a.y-df.y,e=Math.hypot(dx,dy);if(e<7&&e>.01){const w=(7-e)/7;vx+=dx/e*w*.6;vy+=dy/e*w*1.5;}}
 if(a.y<6)vy+=(6-a.y)*.3;if(a.y>47)vy-=(a.y-47)*.3;const m=Math.hypot(vx,vy)||1;steer(a,a.x+vx/m*5,a.y+vy/m*5,s,dt,6);}
function userInput(){return !!(touch||keys.ArrowRight||keys.ArrowLeft||keys.ArrowUp||keys.ArrowDown||keys.w||keys.a||keys.s||keys.d);}
function readStick(a){let ix=0,iy=0;if(keys.ArrowRight||keys.d)ix+=1;if(keys.ArrowLeft||keys.a)ix-=1;if(keys.ArrowUp||keys.w)iy-=1;if(keys.ArrowDown||keys.s)iy+=1;
 if(touch&&toWorld){const w=toWorld(touch.cx,touch.cy);const tx=w.x-a.x,ty=w.y-a.y,m=Math.hypot(tx,ty);if(m>.6){ix=tx/m;iy=ty/m;}else{ix=0;iy=0;}}return [ix,iy];}
function userMove(a,dt){const [ix,iy]=readStick(a);const m=Math.hypot(ix,iy);if(!m){steer(a,a.x,a.y,0,dt);return;}steer(a,a.x+ix/m*5,a.y+iy/m*5,spd(a)*1.05,dt,9);}
function offAI(a,dt,car){const d=P.d,t=P.t,O=P.O;
 if(P.type==='punt'||P.type==='fg'){if(a.k==='K'||a===O.QB&&P.type==='punt'){steer(a,a.x,a.y,0,dt);return;}if(P.type==='punt'&&P.kicked){const r=P.D.S1;steer(a,r.x,r.y,a.pos==='OL'?5:7,dt);return;}steer(a,a.x,a.y,0,dt);return;}
 if(car&&car.team!==P.off){steer(a,car.x,car.y,spd(a)*.9,dt);return;} // chase after turnover
 if(a.block&&!a.block.fall){const df=a.block;steer(a,df.x-d*1.05,df.y,spd(a),dt);return;}
 if(P.type==='pass'&&a.route&&!P.caught){const w=a.route[Math.min(a.wp,a.route.length-1)];steer(a,w.x,w.y,spd(a),dt);if(Math.hypot(w.x-a.x,w.y-a.y)<.8&&a.wp<a.route.length-1)a.wp++;
  if(P.thrown&&P.target===a&&P.ball.fly){const f=P.ball.fly;steer(a,f.x1,f.y1,spd(a),dt);}return;}
 if(a===O.QB){steer(a,G.los-d*(P.type==='pass'?7:5),C,4,dt);return;}
 if(car&&car!==a){const lead=[car.x+d*3,car.y];let near=null,nd=9;for(const df of P.all)if(df.team===P.def&&!df.fall){const e=Math.hypot(df.x-lead[0],df.y-lead[1]);if(e<nd){nd=e;near=df;}}
  if(near){steer(a,near.x-d*.9,near.y,spd(a)*.95,dt);if(dist(a,near)<1.3&&!near.engBy){near.engBy=a;near.eng=1;near.shed=P.t+rnd(.6,1.2);a.block=near;}return;}}
 steer(a,a.x+d*2,a.y,spd(a)*.4,dt);}
function defAI(a,dt,car){const d=P.d,t=P.t,O=P.O;const s=spd(a);
 if(P.type==='punt'||P.type==='fg'){if(P.type==='punt'&&a.k==='S1'){if(P.ball.holder===a)return;const b=P.ball;if(b.fly)steer(a,b.fly.x1,b.fly.y1,s,dt);return;}
  if(P.type==='punt'&&P.ball.holder===P.D.S1){steer(a,a.x-d*2,a.y,3,dt);return;}if(a.pos==='DL'&&P.type==='fg'){steer(a,G.los-d*2,a.y,2,dt);return;}steer(a,a.x,a.y,0,dt);return;}
 if(a.eng)return;
 if(car&&car.team===a.team){/* returning a turnover: block nearest */const near=P.all.filter(o=>o.team!==a.team&&!o.fall).sort((p,q)=>dist(p,a)-dist(q,a))[0];if(near)steer(a,near.x,near.y,s*.8,dt);return;}
 const pursue=(sp=s)=>{const tgt=car||P.O.QB;const e=dist(a,tgt);const lead=clamp(e/(sp+1),0,1.6);steer(a,tgt.x+tgt.vx*lead,tgt.y+tgt.vy*lead,sp,dt);};
 const blitzer=P.blitz&&P.blitz.includes(a);
 if(P.type==='run'){if(a.pos==='DL'){pursue(s);return;}
  const read=(P.dcall==='run'?.2:a.pos==='LB'?.45:a.pos==='S'?.8:.7)+(a.readJ||0);if(t<read){steer(a,a.x+(a.pos==='S'?-d*.5:0),a.y,2,dt);return;}pursue();return;}
 // pass
 if(P.caught||P.ball.holder&&P.ball.holder!==O.QB){pursue();return;}
 if(P.thrown&&P.ball.fly){const f=P.ball.fly;const e=Math.hypot(f.x1-a.x,f.y1-a.y);if(e<14||a.pos==='CB'||a.pos==='S'){steer(a,f.x1,f.y1,s,dt);return;}}
 if(a.pos==='DL'||blitzer){pursue(s*(blitzer?1:1));return;}
 const man={CB1:O.WR1,CB2:O.WR2,S1:O.WR3,LB3:O.TE,LB2:O.RB}[a.k];
 const cover=P.dcall==='pass'?.35:P.dcall==='blitz'?1.6:.9;
 if(man){steer(a,man.x+d*cover*.8,man.y+(man.y<C?.5:-.5)*cover,s*(a.pos==='LB'?.92:.97),dt);return;}
 if(a.k==='S2'){let deep=null,dx=-99;for(const r of (P.targets||[]))if((r.x-G.los)*d>dx){dx=(r.x-G.los)*d;deep=r;}if(deep){steer(a,deep.x+d*6,lerp(a.y,deep.y,.6),s*.95,dt);return;}}
 steer(a,G.los+d*(a.pos==='S'?16:7),a.y,s*.7,dt);}
function bestTarget(){const ds=P.targets||[P.O.WR1,P.O.WR3,P.O.TE,P.O.WR2];let best=ds[0],bv=-1;
 for(const r of ds){let sep=9;for(const df of P.all)if(df.team===P.def&&!df.fall)sep=Math.min(sep,dist(df,r));const depth=(r.x-G.los)*P.d;const v=sep*1.4+clamp(depth,0,20)*.12+Math.random()*.8;if(v>bv){bv=v;best=r;}}return best;}
function arrivePass(f){const r=f.to;const b=P.ball;let sep=9,nd=null;for(const df of P.all)if(df.team===P.def&&!df.fall){const e=Math.hypot(df.x-f.x1,df.y-f.y1);if(e<sep){sep=e;nd=df;}}
 const rd=Math.hypot(r.x-f.x1,r.y-f.y1);let pc=sep<.8?.3:sep<1.6?.62:.9;if(rd>1.6)pc=0;const pi=(sep<.9?(P.dcall==='pass'?.4:.25):sep<1.4?.08:0)*(P.off==='u'&&G.diff!=='pro'?.5:1);const roll=Math.random();
 if(roll<pi&&nd&&rd<4){b.holder=nd;P.caught=true;SFX.play('pop');say('int');P.turnover=true;flash('INTERCEPTED!','#ffb3ad');return;}
 if(roll<pi+pc&&rd<=1.6){b.holder=r;P.caught=true;SFX.play('pop');if(Math.random()<.5)say('catch');return;}
 b.h=0;b.x=f.x1;b.y=f.y1;SFX.play('buzz');endPlay({kind:'inc'});}
function kickBall(){const d=P.d;const q=P.O.QB;P.kicked=true;SFX.play('kick');const dist0=rnd(38,52);let x1=q.x+d*dist0;P.ball.holder=null;
 P.ball.fly={x0:q.x,y0:q.y,h0:1.2,x1:clamp(x1,-2,122),y1:C+rnd(-8,8),h1:1.2,t0:P.t,dur:3.2,peak:16,kick:'punt'};P.D.S1.y=P.ball.fly.y1;}
function kickLand(f){const d=P.d;if(f.kick==='punt'){const x=f.x1;if(d===1&&x>=110||d===-1&&x<=10){P.ball.holder=null;P.ball.h=0;say('touchback');return endPlay({kind:'change',x:d===1?90:30,touchback:true});}
  P.ball.holder=P.D.S1;P.D.S1.x=x;P.D.S1.y=f.y1;P.retEnd=P.t+rnd(2.6,4);P.returning=true;return;}
 if(f.kick==='fg'){const good=P.fgGood;flash(good?"IT'S GOOD!":'NO GOOD!',good?'#bfffcf':'#dfe5f2');say(good?'fggood':'fgmiss');SFX.play(good?'cheer':'buzz');
  setTimeout(()=>endPlay({kind:good?'fg':'fgmiss'}),900);}}
function kickFG(){const d=P.d,q=P.O.QB;SFX.play('kick');const dd=fgDist();const pGood=clamp((P.acc??.8)*(dd<=35?1.05:dd<=45?.95:dd<=52?.82:.62),0,.98);P.fgGood=Math.random()<pGood;
 const gx=d===1?120.6:-.6;const miss=P.fgGood?0:(Math.random()<.5?-1:1)*rnd(3.8,7);P.ball.holder=null;P.ball.fly={x0:q.x,y0:q.y,h0:.6,x1:gx,y1:C+miss,h1:4,t0:P.t,dur:1.5,peak:7,kick:'fg'};}
function tackle(car,df,kind){SFX.play('thud');car.fall=1;df.fall=1;endPlay({kind:kind||'tackle',x:car.x,team:car.team});}

/* ---------------- results ---------------- */
function endPlay(res){if(P.result)return;P.result=res;P.live=true;hint('');SFX.play('whistle');setTimeout(()=>{if(P)P.live=false;resolve(res);},res.kind==='td'?1700:1200);}
function resolve(res){if(!G)return;const d=P.d;const off=P.off;const gainOf=x=>Math.round((x-G.los)*d);
 if(P.returning&&res.kind!=='change'){const x=P.D.S1.x;return changePoss(x,'punt');}
 if(res.kind==='td'){const tm=res.team;const scorer=tm;G.score[scorer]+=7;G.tds[scorer]++;flash('TOUCHDOWN!','#ffe08a');say(scorer==='u'?(Math.random()<.5?'td':'td2'):'cputd');if(window.confetti&&scorer==='u')confetti(140,true);SFX.play('cheer');updBug();
  setTimeout(()=>say('xp'),2600);if(G.score[scorer]>=WIN_PTS)return setTimeout(()=>gameOver(scorer),3600);return setTimeout(()=>{G.poss=scorer==='u'?'c':'u';G.los=G.poss==='u'?45:75;G.down=1;G.togo=10;say('kickoff');newPlay();},4200);}
 if(res.kind==='fg'){G.score[off]+=3;updBug();if(G.score[off]>=WIN_PTS)return setTimeout(()=>gameOver(off),1800);return setTimeout(()=>{G.poss=off==='u'?'c':'u';G.los=G.poss==='u'?45:75;G.down=1;G.togo=10;newPlay();},1400);}
 if(res.kind==='fgmiss'){return changePoss(G.los-d*7,'miss');}
 if(res.kind==='change'){return changePoss(res.x,'touchback');}
 if(P.turnover||(res.team&&res.team!==off)){const x=res.x??P.ball.x;return changePoss(x,'turnover');}
 let x=res.kind==='inc'?G.los:res.x;if(res.kind==='sack')say('sack');
 // safety (tackled in own end zone)
 if(res.kind!=='inc'&&(d===1&&x<10||d===-1&&x>110)){const de=off==='u'?'c':'u';G.score[de]+=2;flash('SAFETY! +2','#ffb3ad');updBug();if(G.score[de]>=WIN_PTS)return setTimeout(()=>gameOver(de),1800);return setTimeout(()=>{G.poss=de;G.los=de==='u'?45:75;G.down=1;G.togo=10;newPlay();},2000);}
 const gain=gainOf(x);G.los=clamp(Math.round(x),11,109);
 if(res.kind==='inc')say('incomplete');else if(res.kind==='oob')say('oob');else if(res.kind!=='sack'){if(gain>=15)say('bigrun');else if(gain<0)say('loss');else if(gain===0)say('nogain');else if(Math.random()<.4)say('short');}
 const reached=(G.los-G.fd)*d>=0;
 if(reached){G.down=1;G.togo=10;toast((gain>=0?'+':'')+gain+' yards · FIRST DOWN!');if(res.kind!=='td')setTimeout(()=>say('firstdown'),900);}
 else{G.togo=Math.round((G.fd-G.los)*d);G.down++;toast(res.kind==='inc'?'Incomplete · no gain':((gain>=0?'+':'')+gain+' yards'));
  if(G.down>4){flash('TURNOVER ON DOWNS','#ffb3ad');say('tod');return setTimeout(()=>changePoss(G.los,'downs',true),1200);}
  if(off==='c'&&gain<=1&&res.kind!=='inc'&&Math.random()<.4)setTimeout(()=>say('stop'),900);}
 setTimeout(newPlay,reached?1600:1100);}
function changePoss(x,why,noFlip){G.poss=P.off==='u'?'c':'u';if(why==='turnover'||why==='punt'){if(G.poss==='u'&&x<=10)x=30;if(G.poss==='c'&&x>=110)x=90;}G.los=clamp(Math.round(x),11,109);G.down=1;G.togo=10;if(why==='turnover'){}updBug();setTimeout(newPlay,why==='downs'?400:1300);}
function gameOver(w){G.phase='over';updBug();const p=$g('gPanel');const won=w==='u';say(won?'win':'lose');if(won){SFX.play('fanfare');if(window.confetti){confetti(260,true);setTimeout(()=>confetti(200,true),900);}}
 p.innerHTML=`<div class="gover"><div class="big">${won?'🏆':'🏈'}</div><h2>${won?`${esc(G.u.name)} win!`:`${esc(G.c.name)} win this time!`}</h2><p>Final score: ${esc(G.u.name)} ${G.score.u}, ${esc(G.c.name)} ${G.score.c}</p>
 <div class="row"><button class="btn primary" id="gAgain">↺ Play again</button><button class="btn" id="gNew">🎨 New team</button><button class="btn" id="gMenu2">◀ Menu</button></div></div>`;
 $g('gAgain').onclick=()=>startGame(G.u.name,G.u.color,G.c.name,G.c.color,G.diff);$g('gNew').onclick=setupScreen;$g('gMenu2').onclick=()=>{window.gameStop();showMenu();};}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function hint(t){const h=$g('gHint');if(h){h.textContent=t;h.classList.toggle('show',!!t);}}
let toastT=0;function toast(t){const e=$g('gToast');if(!e)return;e.textContent=t;e.classList.remove('show');void e.offsetWidth;e.classList.add('show');}
function flash(text,color){const g=G0(L.ui);g.setAttribute('transform','translate(640,300)');E('path',{d:starPath(1,.8,16),fill:'#fff',stroke:NAVY,'stroke-width':6,'vector-effect':'non-scaling-stroke',transform:`scale(${30*text.length+60},80)`},g);T(g,0,4,text,{size:80,fill:color,stroke:NAVY,sw:10});
 const t0=performance.now();const an=()=>{const u=(performance.now()-t0)/1000;if(u>1.9||!g.isConnected){g.remove();return;}const s=u<.3?Ease.back(u/.3):1;g.setAttribute('transform',`translate(640,300) scale(${s}) rotate(-5)`);g.setAttribute('opacity',u>1.6?(1.9-u)/.3:1);requestAnimationFrame(an);};an();}

/* ---------------- rendering ---------------- */
const toScr=(x,y)=>[640+(x-cam.x)*cam.z,360+(y-cam.y)*cam.z];
function render(dt){if(!P)return;const b=P.ball;const focus=b.holder||b;const fx=focus.x+(P.live&&!P.result?P.d*(b.holder&&b.holder.team===P.off?5:0):0);
 const narrow=matchMedia('(max-height:540px)').matches;cam.z=narrow?13:16;
 cam.x+=(clamp(fx,640/cam.z-2,122-640/cam.z)-cam.x)*Math.min(1,dt*2.6);const ty=C+(focus.y-C)*.55;cam.y+=(ty-cam.y)*Math.min(1,dt*2.4);
 L.world.setAttribute('transform',`translate(${640-cam.x*cam.z},${360-cam.y*cam.z}) scale(${cam.z})`);L.marks.setAttribute('transform',L.world.getAttribute('transform'));
 const sc=clamp(cam.z/20,.55,1.2);const order=[];
 for(const a of P.all){const [sx,sy]=toScr(a.x,a.y);const sp=Math.hypot(a.vx,a.vy);a.amp+=((sp>.8?1:0)-a.amp)*Math.min(1,dt*10);a.ph+=dt*(10+Math.min(8,sp*.6));
  if(Math.abs(a.vx)>1.5)a.face=Math.sign(a.vx);const bob=-Math.abs(Math.sin(a.ph))*6*a.amp,leg=Math.sin(a.ph)*32*a.amp;const hi=(P.ball.holder===a&&a!==P.O.C)||(a===P.uDef&&P.live&&!P.result&&!['punt','fg'].includes(P.type))?1:0;
  a.el.g.setAttribute('transform',`translate(${sx},${sy}) scale(${sc*(1+.14*hi)})`);a.el.rot.setAttribute('transform',`rotate(${a.face*82*a.fall})`);a.el.bob.setAttribute('transform',`translate(0,${bob})`);a.el.flip.setAttribute('transform',`scale(${a.face},1)`);
  a.el.legL.setAttribute('transform',`rotate(${leg},-6,-15)`);a.el.legR.setAttribute('transform',`rotate(${-leg},6,-15)`);a.el.ring.setAttribute('opacity',hi);order.push([sy,a]);}
 order.sort((p,q)=>p[0]-q[0]);for(const [,a] of order)L.actors.appendChild(a.el.g);
 let sx,sy,lift,bs=sc;if(b.holder){const a=b.holder;[sx,sy]=toScr(a.x,a.y);sx+=a.face*14*sc;lift=27*sc;L.shadow.setAttribute('opacity',0);L.ballEl.setAttribute('transform',`translate(${sx},${sy-lift}) rotate(${-25*a.face}) scale(${bs})`);}
 else{[sx,sy]=toScr(b.x,b.y);lift=b.h*cam.z*1.08;const sq=.62+.38*Math.abs(Math.cos(b.spin||0));L.shadow.setAttribute('opacity',.8);L.shadow.setAttribute('cx',sx);L.shadow.setAttribute('cy',sy);L.shadow.setAttribute('rx',9*bs);L.shadow.setAttribute('ry',3.5*bs);
  const ang=b.fly?Math.atan2(b.fly.y1-b.fly.y0,b.fly.x1-b.fly.x0)*180/Math.PI:0;L.ballEl.setAttribute('transform',`translate(${sx},${sy-lift}) rotate(${ang}) scale(${bs},${bs*sq})`);}
 const pul=1+.14*Math.sin(performance.now()/140);L.glow.setAttribute('cx',sx);L.glow.setAttribute('cy',sy-lift);L.glow.setAttribute('r',17*bs*pul+4);
 {const an=$g('gAnn');if(an)an.classList.toggle('hid',!!(P.badges&&P.badges.length));}
 if(P.badges)for(const bd of P.badges){const [x,y]=toScr(bd.a.x,bd.a.y);bd.g.setAttribute('transform',`translate(${x},${y-78*sc}) scale(${1+.08*Math.sin(performance.now()/160)})`);let sp=9;for(const df of P.all)if(df.team===P.def&&!df.fall)sp=Math.min(sp,dist(df,bd.a));bd.cc.setAttribute('fill',sp>3?'#4ade80':sp>1.7?GOLD:'#ff8a80');}
 if(P.returning&&P.ball.holder===P.D.S1&&P.D.S1.team==='u'&&!P.retHint){P.retHint=true;hint('Return the punt! Steer with the arrow keys or your finger');}
 if(P.returning&&P.D.S1.team==='c'&&P.t>P.retEnd&&!P.result){const r=P.D.S1;r.fall=1;SFX.play('thud');endPlay({kind:'change',x:r.x});}
 // punt: start punt kick after the snap reaches the punter
 if(P.type==='punt'&&P.ball.holder===P.O.QB&&!P.kicked&&P.t>.9)kickBall();
 if(P.type==='fg'&&P.ball.holder===P.O.QB&&!P.fgK&&P.t>.5){P.fgK=true;kickFG();}}

/* ---------------- input ---------------- */
let bound=false,toWorld=null;
function bindInput(){if(bound)return;bound=true;
 document.addEventListener('keydown',e=>{if(document.getElementById('gamePage').hidden||['INPUT','TEXTAREA'].includes(e.target.tagName))return;const k=e.key.length===1?e.key.toLowerCase():e.key;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys[k]=true;
  if(k===' ')doJuke();
  if(P&&P.type==='pass'&&P.ctrl&&!P.thrown&&['1','2','3','4'].includes(k)){const a=P.targets[+k-1];if(a)throwTo(a);}});
 document.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=false;});
 toWorld=(cx,cy)=>{const r=svg.getBoundingClientRect();const s=Math.min(r.width/1280,r.height/720);const ox=r.left+(r.width-1280*s)/2,oy=r.top+(r.height-720*s)/2;const vx=(cx-ox)/s,vy=(cy-oy)/s;return{x:cam.x+(vx-640)/cam.z,y:cam.y+(vy-360)/cam.z};};
 const st=()=>root.querySelector('.gstage');
 root.addEventListener('pointerdown',e=>{if(!P||!e.target.closest('.gstage')||e.target.closest('.gpanel'))return;const w=toWorld(e.clientX,e.clientY);
  if(P.type==='pass'&&P.ctrl&&!P.thrown){let best=null,bd=4;for(const a of P.targets){const dd=Math.hypot(a.x-w.x,a.y-w.y);if(dd<bd){bd=dd;best=a;}}if(best){throwTo(best);return;}}
  if(touch&&e.pointerId!==touch.id){doJuke();return;}touch={cx:e.clientX,cy:e.clientY,id:e.pointerId};});
 root.addEventListener('pointermove',e=>{if(touch&&e.pointerId===touch.id){touch.cx=e.clientX;touch.cy=e.clientY;}});
 const up=e=>{if(touch&&e.pointerId===touch.id)touch=null;};root.addEventListener('pointerup',up);root.addEventListener('pointercancel',up);window.addEventListener('blur',()=>{keys={};touch=null;});}
function doJuke(){if(!P||!P.live||P.result)return;const c=P.carrier;if(!c||c.team!=='u'||c.pos==='QB')return;if(P.juke&&P.t<P.juke+3){toast('Juke recharging…');return;}P.juke=P.t;let near=null,nd=9;for(const df of P.all)if(df.team!==c.team&&!df.fall){const e=dist(df,c);if(e<nd){nd=e;near=df;}}P.jukeDir=near?(near.y>c.y?-1:1):1;SFX.play('swoosh');}

window.openGame=function(){stopVoice();hideOvl();mode='game';playing=false;showPage('game');root=$g('gamePage');setupScreen();};
window.gameStop=function(){if(G)G.phase='over';G=null;P=null;cancelAnimationFrame(raf);raf=0;};

const st=document.createElement('style');st.textContent=`
#gamePage{background:#0f1838;border:5px solid var(--navy);border-radius:26px;box-shadow:9px 9px 0 var(--navy);overflow:hidden}
.gwrap{display:flex;flex-direction:column;height:100%;position:relative}
body[data-page=game] .wrap{width:min(1240px,calc((100vh - 150px)*1.7778),calc(100vw - 24px));width:min(1240px,calc((100dvh - 150px)*1.7778),calc(100vw - 24px))}
body.fs[data-page=game] .wrap{width:min(calc(100vw - 24px),calc((100dvh - 80px)*1.7778))}
.gtop{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;background:var(--navy);color:#fff}.gtop h2{font-family:'Lilita One';font-weight:400;margin:0;font-size:28px}
.gtop .btn{font-size:15px;padding:5px 12px}.gtop .btn.round{width:40px;height:40px;padding:0}
.gbug{display:flex;gap:6px;font-family:'Lilita One';font-size:clamp(12px,1.5vw,18px);flex-wrap:nowrap;white-space:nowrap;justify-content:center}
.gbug .tm{background:var(--c);border:3px solid #fff;border-radius:10px;padding:3px 10px;display:flex;align-items:center;gap:6px;color:#fff}.gbug .tm b{font-weight:400;background:rgba(0,0,0,.25);border-radius:6px;padding:0 6px}
.gbug .tm em{font-style:normal;display:flex;gap:1px}.gbug .tm em i{font-style:normal;opacity:.25;font-size:.8em}.gbug .tm em i.on{opacity:1}.gbug .pos{color:var(--gold);background:none!important}
.gbug .dd{background:#2a3a6b;border:3px solid #fff;border-radius:10px;padding:3px 10px;color:var(--gold)}
.gstage{position:relative;aspect-ratio:16/9;background:#2f8a3a;container-type:size;touch-action:none;user-select:none;-webkit-user-select:none}
.gstage svg{position:absolute;inset:0;width:100%;height:100%}#gFx{position:absolute;inset:0;pointer-events:none}
.gpanel{position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;gap:1.4cqh;padding:2cqh 2cqw}
.gq{background:rgba(15,24,56,.9);color:#fff;font-weight:900;font-size:max(13px,3.3cqh);padding:.8cqh 2.4cqw;border-radius:999px;border:3px solid #fff}
.gbtns{display:flex;gap:1.2cqw;flex-wrap:wrap;justify-content:center}
.gb{font-family:'Lilita One';font-size:max(13px,3.4cqh);border:4px solid var(--navy);border-radius:18px;background:#fff;color:var(--navy);padding:1.2cqh 1.6cqw;cursor:pointer;box-shadow:4px 4px 0 var(--navy);display:flex;flex-direction:column;align-items:center;min-width:12cqw;line-height:1.1}
.gb span{font-size:5cqh}.gb small{font-family:Nunito;font-weight:800;font-size:max(10px,2.2cqh);opacity:.7}.gb:hover:not(:disabled){transform:translateY(-3px)}.gb:disabled{opacity:.45;cursor:not-allowed}
.gb.run{background:#e3f0ff}.gb.pass{background:#fff3c4}.gb.kick{background:#e5f6ea}
.gann{position:absolute;left:2cqw;top:2cqh;max-width:56cqw;display:flex;gap:10px;align-items:center;background:#fff;border:4px solid var(--navy);border-radius:16px;padding:.9cqh 1.4cqw;font-weight:900;font-size:max(13px,3cqh);opacity:0;transform:translateY(-10px);transition:.3s;box-shadow:4px 4px 0 var(--navy)}
.gann.hid{visibility:hidden}.gann.show{opacity:1;transform:none;animation:annFade 5.5s forwards}@keyframes annFade{0%,85%{opacity:1}100%{opacity:0}}.gann .mic{font-size:4cqh}
.ghint{position:absolute;left:50%;bottom:2cqh;transform:translateX(-50%);background:rgba(15,24,56,.88);color:#fff;font-weight:900;font-size:max(13px,2.8cqh);padding:.7cqh 2cqw;border-radius:999px;opacity:0;transition:opacity .3s;white-space:nowrap;pointer-events:none}.ghint.show{opacity:1}
.gtoast{position:absolute;left:50%;bottom:4cqh;transform:translateX(-50%);background:var(--gold);color:var(--navy);font-family:'Lilita One';font-size:4.4cqh;padding:.6cqh 2.4cqw;border:4px solid var(--navy);border-radius:16px;opacity:0;pointer-events:none}
.gtoast.show{animation:toast 2.2s forwards}@keyframes toast{0%{opacity:0;transform:translate(-50%,20px)}12%,80%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}
.gmeter{display:flex;gap:2cqw;align-items:center;background:rgba(15,24,56,.9);padding:1.4cqh 2cqw;border-radius:18px;border:3px solid #fff}
.gm{position:relative;width:46cqw;height:5cqh;background:#ff8a80;border:4px solid var(--navy);border-radius:12px;overflow:hidden}
.gm .zone{position:absolute;left:calc(50% - var(--w)/2);width:var(--w);top:0;bottom:0;background:#62ff7a}.gm .needle{position:absolute;top:-2px;bottom:-2px;width:6px;margin-left:-3px;background:var(--navy);border-radius:3px}
.gmeter .btn{font-size:3.4cqh}
.gover{background:#fff;border:5px solid var(--navy);border-radius:24px;padding:2.4cqh 3cqw;text-align:center;box-shadow:8px 8px 0 var(--gold);margin-bottom:12cqh}.gover .big{font-size:12cqh;line-height:1}.gover h2{font-family:'Lilita One';font-weight:400;font-size:6cqh;margin:1cqh 0}.gover p{font-weight:800;font-size:3cqh;margin:0 0 1.6cqh}
.gsetup{flex:1;display:grid;place-items:center;padding:2vh;background:radial-gradient(circle at 50% 30%,#24346a,#0f1838)}
.gcard{background:#fff;border:5px solid var(--navy);border-radius:24px;box-shadow:8px 8px 0 var(--gold);padding:2.4vh 3vw;text-align:center;width:min(640px,100%);box-sizing:border-box}
.gcard h3{font-family:'Lilita One';font-weight:400;font-size:24px;margin:1.2vh 0 .8vh}
#gName{font-family:'Lilita One';font-size:28px;text-align:center;border:4px solid var(--navy);border-radius:14px;padding:6px 12px;width:min(360px,80%);color:var(--navy)}
.gcolors{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.gcol{border:4px solid var(--navy);border-radius:16px;background:var(--cream);cursor:pointer;padding:2px 4px}.gcol.on{background:#fff3c4;box-shadow:0 0 0 5px var(--gold)}
.gdiff{display:flex;gap:8px;justify-content:center}.gd{font-family:'Lilita One';font-size:18px;border:4px solid var(--navy);border-radius:999px;background:#fff;color:var(--navy);padding:6px 18px;cursor:pointer}.gd.on{background:var(--gold)}
.gstart{font-size:24px;margin-top:2vh}.gwin{font-weight:800;opacity:.75;margin:1.4vh 0 0}
@media (max-height:540px){#gamePage{border-width:3px;border-radius:14px}.gtop{padding:4px 8px}.gtop h2{font-size:18px}.gtop .btn{font-size:12px;padding:3px 8px}.gtop .btn.round{width:32px;height:32px}
 .gsetup{padding:6px}.gcard{padding:8px 14px}.gcard h3{font-size:16px;margin:4px 0}#gName{font-size:20px;padding:2px 8px}.gcol svg{width:40px;height:54px}.gstart{font-size:18px;margin-top:6px}.gwin{font-size:12px;margin-top:4px}
 body[data-page=game] header{display:none}body[data-page=game] .wrap{width:min(calc(100vw - 16px),calc((100dvh - 58px)*1.7778))}.gbug{font-size:12px;gap:4px}.gbug .tm,.gbug .dd{padding:1px 6px;border-width:2px}}
`;document.head.appendChild(st);
})();
