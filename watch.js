/* =========================================================
   Football 101 — "Watch a Game": a narrated broadcast of Thunder vs. Titans.
   Two voices: play-by-play (marked with <i class="vp">) and the analyst.
   The extended version (watchx) adds Rules & Penalties and Football Smarts moments.
   Uses the engine and helpers in index.html (+ window.CH from courses.js).
   ========================================================= */
(function(){
const WB=[],WX=[];
COURSES.watch={key:'watch',short:'Game',list:WB,cap:'w',ask:'wq',fq:'wf',fin:'wfin_',quiz:[],auto:true};
COURSES.watchx={key:'watchx',short:'Game+',list:WX,cap:'wx',ask:'wxq',fq:'wxf',fin:'wxfin_',quiz:[],auto:true};
const W=d=>{WB.push({title:d.title,build:S=>d.build(S,false)});WX.push({title:d.title,build:S=>d.build(S,true)});};
const CH=()=>window.CH||{};
const TH='blue',TI='red';

/* ---------- broadcast helpers ---------- */
function renameEZ(S){for(const t of S.field.querySelectorAll('text')){if(t.textContent==='BLUE')t.textContent='THUNDER';else if(t.textContent==='RED')t.textContent='TITANS';}}
// speaker label + beat wrappers
function booth(S){const pb=pill(S.L.top,1150,38,'🎙️ PLAY-BY-PLAY',{size:19,bg:NAVY,sw:3}),an=pill(S.L.top,1170,38,'🎓 ANALYST',{size:19,bg:'#138a7e',sw:3});pb.setAttribute('opacity',0);an.setAttribute('opacity',0);
 const lab=(el,t0,dur)=>S.track(t0,t0+dur,(p,r)=>el.setAttribute('opacity',r>0&&r<1?1:0),Ease.lin);
 return{P:(h,dur,fn)=>S.beat('<i class="vp"></i>'+h,dur,t0=>{lab(pb,t0,dur);fn&&fn(t0);}),A:(h,dur,fn)=>S.beat(h,dur,t0=>{lab(an,t0,dur);fn&&fn(t0);})};}
// TV score bug at the bottom of the screen
function tvBug(S,init){const g=G(S.L.top,640,672);const st={a:0,b:0,q:'1ST',c:'15:00',dd:'KICKOFF',pos:null,...init};
 E('rect',{x:-410,y:-34,width:820,height:68,rx:16,fill:NAVY,stroke:'#fff','stroke-width':3},g);
 const seg=[[-402,200,BLUE],[-196,200,RED],[10,170,'#ffffff'],[186,216,'#33406a']];const tx=[],hl=[];
 seg.forEach(([x,w,c],i)=>{E('rect',{x,y:-26,width:w,height:52,rx:11,fill:c},g);tx.push(T(g,x+w/2+(i<2?12:0),2,'',{size:i===3?24:26,fill:i===2?NAVY:i===3?GOLD:'#fff'}));hl.push(E('rect',{x:x-5,y:-31,width:w+10,height:62,rx:14,fill:'none',stroke:GOLD,'stroke-width':6,opacity:0},g));});
 const balls=[G(g,-378,0),G(g,-172,0)];balls.forEach(b=>{b.appendChild(drawBall(b,1.15));b.setAttribute('opacity',0);});
 const apply=s=>{tx[0].textContent=`THUNDER  ${s.a}`;tx[1].textContent=`TITANS  ${s.b}`;tx[2].textContent=s.c?`${s.q}  ${s.c}`:s.q;tx[3].textContent=s.dd;balls[0].setAttribute('opacity',s.pos==='a'?1:0);balls[1].setAttribute('opacity',s.pos==='b'?1:0);};
 const s0={...st};S.set(0,()=>apply(s0));
 const B={g,at(t,patch){Object.assign(st,patch);const snap={...st};S.set(t,()=>apply(snap));S.track(t,t+.45,(p,r)=>setS(g,1+.05*Math.sin(Math.PI*r)),Ease.lin);},
  run(t0,t1,from,to){const snap={...st};S.track(t0,t1,(p,r)=>{const v=Math.max(0,Math.round(lerp(from,to,r)));apply({...snap,c:`${Math.floor(v/60)}:${String(v%60).padStart(2,'0')}`});},Ease.lin);st.c=`${Math.floor(to/60)}:${String(to%60).padStart(2,'0')}`;const s2={...st};S.set(t1,()=>apply(s2));},
  pulse(t0,t1,idx){for(const i of idx)S.track(t0,t1,(p,r,t)=>hl[i].setAttribute('opacity',r>=1?0:.6+.4*Math.sin(t*9)),Ease.lin);},
  call(t0,t1,idx,text){B.pulse(t0,t1,idx);const xs=idx.map(i=>seg[i][0]+seg[i][1]/2);const x=640+(Math.min(...xs)+Math.max(...xs))/2;
   const c=pill(S.L.top,clamp(x,230,1050),585,text,{size:24,bg:'#fff',fg:NAVY,sw:4});S.pop(c,t0);S.hide(c,t1-.3,t1);S.sfx(t0,'pop');
   const ar=arrow(S.L.top,{w:5,color:'#fff',head:2.4});S.track(t0,t0+.4,p=>{ar.setAttribute('opacity',1);ar.set(x,606,x,632,p);});S.hide(ar,t1-.3,t1);}};
 return B;}
function wpill(S,x,y,text,bg,t0,t1,layer='ui',size=26){const p=pill(S.L[layer],x,y,text,{size,bg,sw:4});S.pop(p,t0);S.hide(p,t1-.3,t1);return p;}
function field(S,L,dir,z,lead){z=Math.min(z,14.5);const r=playSetup(S,L,z,lead,dir);S.camSet(L+lead,C+.6,z);renameEZ(S);const los=S.lineObj('#3d8bff',null);los.x=L;los.op=1;setPlan(los,'x',L);setPlan(los,'op',1);r.los=los;return r;}
function fdLine(S,x){const f=S.lineObj(YEL,null);f.x=x;f.op=1;setPlan(f,'x',x);setPlan(f,'op',1);return f;}
function pulseLine(S,obj,t0,t1){S.track(t0,t1,(p,r,t)=>obj.op=r>=1?1:.45+.55*Math.abs(Math.sin(t*5)),Ease.lin);}
function td(S,t){S.burst(t,'TOUCHDOWN!',{size:96,y:250,sfx:'cheer'});S.once(t+.1,()=>window.confetti&&confetti(170));S.once(t+1.2,()=>window.confetti&&confetti(110));}
function showKick(S,kv,t0,good=true){S.attr(kv.g,t0,t0+.5,'opacity',0,1);S.set(t0+.4,()=>S.ball.op=0);
 S.attr(kv.zone,t0+.6,t0+1.1,'opacity',0,1);kvKick(S,kv,t0+.6);
 S.burst(t0+3.4,"IT'S GOOD!",{size:72,y:560,sfx:'cheer',layer:'top',dur:2.2});S.attr(kv.zone,t0+3.4,t0+4,'opacity',1,0);kvParty(S,kv,t0+3.5,3);}

/* =========================================================
   1 — Welcome
   ========================================================= */
W({title:'Welcome to the Game',build(S,X){
 S.fieldInit();renameEZ(S);S.camSet(60,C+1.6,9.6);const {P,A}=booth(S);const bug=tvBug(S,{});
 const th=[],ti=[];for(let i=0;i<11;i++){const a=i%4,b=Math.floor(i/4);th.push(S.player({team:TH,num:[12,28,11,81,88,55,66,67,71,74,17][i],pos:'',x:30+a*2.4-b*1.2,y:C-3.6+b*3.6+(a%2)*.6,face:1}));ti.push(S.player({team:TI,num:[9,22,10,80,85,91,93,97,99,52,24][i],pos:'',x:90-a*2.4+b*1.2,y:C-3.6+b*3.6+(a%2)*.6,face:-1}));}
 P('Hello, everyone, and welcome to the big game! The <b>Thunder</b> take on the <b>Titans</b>.',6.0,t0=>{th.forEach((a,i)=>S.hopA(a,t0+0.92+i*.04,t0+2.22,2,16));ti.forEach((a,i)=>S.hopA(a,t0+2.77+i*.04,t0+4.06,2,16));
  const p1=pill(S.wfx2,32,C-9,'THUNDER',{size:2.4,bg:BLUE,sw:.4}),p2=pill(S.wfx2,88,C-9,'TITANS',{size:2.4,bg:RED,sw:.4});S.pop(p1,t0+0.92);S.pop(p2,t0+2.77);S.hide(p1,t0+14.77);S.hide(p2,t0+14.77);});
 A('I\'ll help you follow along. First, the <b>scoreboard</b> at the bottom of the screen. Every TV broadcast has one.',8,t0=>{bug.pulse(t0+.5,t0+7.8,[0,1,2,3]);});
 A('It shows each team\'s <b>score</b>. It\'s <b>zero to zero</b>, since the game hasn\'t started.',5.75,t0=>{bug.call(t0,t0+5.57,[0,1],'Team names & scores');});
 A('Next, the <b>quarter</b> and the <b>clock</b>. There are four quarters of fifteen minutes, and we\'re at the very start.',7.0,t0=>{bug.call(t0,t0+6.84,[2],'1st quarter · 15:00 left');});
 A('The <b>Thunder</b>, in blue, want to score in the end zone on the <b>right</b>. The <b>Titans</b>, in red, go the other way.',7.0,t0=>{
  const r1=E('rect',{x:110,y:0,width:10,height:53.33,fill:GOLD,opacity:0},S.wfx);S.track(t0+0.82,t0+6.59,(p,r,t)=>r1.setAttribute('opacity',r>=1?0:.2+.12*Math.sin(t*6)),Ease.lin);
  const a1=arrow(S.wfx2,{w:1.2,color:BLUE});S.track(t0+.6,t0+1.65,p=>{a1.setAttribute('opacity',1);a1.set(40,C+12,106,C+12,p);});S.hide(a1,t0+6.75);
  const a2=arrow(S.wfx2,{w:1.2,color:RED});S.track(t0+3.46,t0+4.61,p=>{a2.setAttribute('opacity',1);a2.set(80,C-12,14,C-12,p);});S.hide(a2,t0+6.75);
  const r2=E('rect',{x:0,y:0,width:10,height:53.33,fill:GOLD,opacity:0},S.wfx);S.track(t0+3.79,t0+6.59,(p,r,t)=>r2.setAttribute('opacity',r>=1?0:.2+.12*Math.sin(t*6)),Ease.lin);});
 if(X)A('Today we\'ll also watch for <b>penalties</b> and <b>coaching strategy</b>, so keep an eye out for yellow flags and sneaky tricks!',7);
}});

/* =========================================================
   2 — Opening kickoff
   ========================================================= */
W({title:'Opening Kickoff',build(S,X){
 S.fieldInit();renameEZ(S);S.ringHolder=true;S.camSet(50,C+1,11);S.follow(0,9999,0);const {P,A}=booth(S);const bug=tvBug(S,{});
 const K=S.player({team:TI,num:3,pos:'K',x:79,y:C});const cov=[-22,-17,-12,-7,-3,3,7,12,17,22].map((dy,i)=>S.player({team:TI,num:40+i,pos:'',x:76,y:C+dy}));
 const front=[-14,-7,0,7,14].map((dy,i)=>S.player({team:TH,num:50+i,pos:'',x:42,y:C+dy})),mid=[-12,-4,4,12].map((dy,i)=>S.player({team:TH,num:60+i,pos:'',x:30,y:C+dy}));
 const KR=S.player({team:TH,num:84,pos:'KR',x:13,y:C}),KR2=S.player({team:TH,num:22,pos:'',x:17,y:C+9});[K,...cov,...front,...mid,KR,KR2].forEach(a=>a.autoFace=true);
 S.ballAt(0,75,C,.3);let tk;
 P('Here\'s the opening <b>kickoff</b>! The Titans kick it deep…',3.75,t0=>{tk=t0+1.77;S.move(K,t0+1.09,tk,[[75.6,C]],Ease.in);});
 const tc=tk+3;S.thr(tk,tc,[75,C,.3],[13.5,C,1.2],22,{spins:10});S.sfx(tk,'kick');S.give(tc,KR);
 P('…the Thunder catch it and bring it back to their own <b>27-yard line</b>!',7.5,t0=>{const tEnd=tc+4.8;
  chaseSim(S,{t0:tk,t1:tEnd+1.2,carrier:KR,kf:[[tk,13,C],[tc,13,C],[tc+.6,16,C-1],[tc+2,24,C-5],[tc+3.6,33,C-3],[tEnd,37,C-2]],tEndCar:tEnd,chasers:[K,...cov],blockers:[...front,...mid,KR2],chaseStart:tk,meet:[{a:cov[5],t:tEnd,x:37.7,y:C-2.4,lead:1}]});
  S.fall(KR,tEnd,.35);S.fall(cov[5],tEnd,.35);S.sfx(tEnd,'thud');S.sfx(tEnd+.2,'whistle');});
 A('Now the Thunder have the ball, so they\'re on <b>offense</b>. The little football on the scoreboard shows who has it.',7.0,t0=>{bug.at(t0+.3,{pos:'a',dd:'1ST & 10',c:'14:52'});bug.call(t0+.4,t0+6.84,[0],'Thunder have the ball 🏈');});
 A('And here\'s the <b>down and distance</b>: <b>1st & 10</b>. First try, with 10 yards to go for a fresh set of downs.',8.0,t0=>{bug.call(t0,t0+7.82,[3],'1st down · 10 yards to go');});
}});

/* =========================================================
   3 — Reading the formation (+ false start in extended)
   ========================================================= */
W({title:'Reading the Offense',build(S,X){
 let L=37;const {O,D,los}=field(S,L,1,19,4);const {P,A}=booth(S);const bug=tvBug(S,{pos:'a',dd:'1ST & 10',c:'14:52'});let fdl=fdLine(S,L+10);const all=[...O.all,...D.all];
 A('Before the snap, watch how the offense lines up. It\'s a <b>clue</b> to what\'s coming.',5.25);
 A('<b>No receivers out wide</b>, and an extra blocker behind the quarterback. Lots of blockers packed in close usually means a <b>run</b>.',8.25,t0=>{
  S.move(O.WR1,t0+.5,t0+1.65,[[L-1,C-7.6]]);S.move(O.WR2,t0+.5,t0+1.65,[[L-1,C+7.8]]);S.move(O.WR3,t0+.5,t0+1.65,[[L-7,C]]);
  S.highlight(t0+1.8,all,[O.WR1,O.WR2,O.WR3,O.TE]);wpill(S,640,84,'BLOCKERS PACKED IN → PROBABLY A RUN 🏃',BLUE,t0+2.25,t0+8.1);});
 A('The Titans see it too. Their <b>linebackers</b> creep up to stop the run.',5.0,t0=>{S.highlight(t0+.3,all,D.LB);for(const a of D.LB)S.nudge(a,t0+0.72,t0+2.15,-1.8,0);});
 if(X){A('Wait, a <b>yellow flag</b>! A Thunder lineman moved before the snap. That\'s a <b>false start</b>, and it costs the offense <b>5 yards</b>.',9.5,t0=>{S.clearHi(t0,all);S.highlight(t0+.3,all,[O.RT]);S.nudge(O.RT,t0+1,t0+1.25,1.4,0,Ease.out);S.nudge(O.RT,t0+1.4,t0+1.8,-1.4,0);
   CH().flagThrow&&CH().flagThrow(S,t0+1.4,[L+6,C+17],[L+1,C+5],4);CH().penCard&&CH().penCard(S,t0+3,t0+9.2,'FALSE START','5 YARDS','Moved before the snap',undefined,108);
   S.clearHi(t0+3,all);CH().spotTo&&CH().spotTo(S,O,D,los,t0+5,L-5,1.4);bug.at(t0+6,{dd:'1ST & 15'});});L-=5;}
 const gain=6;
 P(`Here\'s the snap… handoff… he finds a hole and picks up <b>${gain} yards</b>!`,6.5,t0=>{S.clearHi(t0,all);const tt=runPlay(S,O,D,L,t0+.6,gain);bug.at(tt+.4,{c:'14:20'});});
 A(X?'Six yards gets most of it back. Now it\'s <b>2nd & 9</b>: second try, nine yards to reach the <b>yellow line</b>.':'Now it\'s <b>2nd & 4</b>: second try, four yards to go to reach the <b>yellow line</b>.',8.0,t0=>{bug.at(t0+.3,{dd:X?'2ND & 9':'2ND & 4'});bug.call(t0+.4,t0+7.72,[3],X?'2nd down · 9 yards to go':'2nd down · 4 yards to go');pulseLine(S,fdl,t0+2.35,t0+7.81);});
}});

/* =========================================================
   4 — A passing play (+ motion / man coverage)
   ========================================================= */
W({title:'A Passing Play',build(S,X){
 const L=X?38:43,dd=X?'2ND & 9':'2ND & 4';const {O,D,los}=field(S,L,1,18,5);const {P,A}=booth(S);const bug=tvBug(S,{pos:'a',dd,c:'13:50'});fdLine(S,X?47:47);const all=[...O.all,...D.all];
 A('Now the Thunder <b>spread out</b>: receivers wide, and the quarterback back in the <b>shotgun</b>. That\'s a <b>passing</b> look.',7.0,t0=>{S.highlight(t0+.5,all,[O.WR1,O.WR2,O.WR3,O.QB]);wpill(S,640,84,'RECEIVERS SPREAD WIDE → PROBABLY A PASS 🎯',BLUE,t0+1.03,t0+6.78);});
 A('So the Titans back off a few steps to cover those receivers.',4.5,t0=>{S.highlight(t0+.2,all,[...D.CB,...D.S,...D.LB]);for(const a of [...D.CB,...D.S])S.nudge(a,t0+.6,t0+2.16,2.2,0);for(const a of D.LB)S.nudge(a,t0+.6,t0+2.16,1.2,0);});
 if(X){A('Watch the receiver go in <b>motion</b> across the field. One cornerback follows him the whole way. That\'s a clue the Titans are playing <b>man coverage</b>: each defender sticks to one player, like a shadow.',12,t0=>{
   S.clearHi(t0,all);S.highlight(t0+.3,all,[O.WR3,D.CB1]);S.move(O.WR3,t0+1,t0+4.4,[[L-4,C-4],[L-4,C+4],[L-1.5,C+6]],Ease.inOut);S.move(D.CB1,t0+1.3,t0+4.6,[[L+7,C+6.5]],Ease.inOut);
   const tr=E('path',{d:`M${L+7},${C-13} L${L+7},${C+6.5}`,stroke:RED,'stroke-width':.35,'stroke-dasharray':'.9 .6',fill:'none',opacity:0},S.wfx);S.attr(tr,t0+1.4,t0+2,'opacity',0,.9);S.attr(tr,t0+11,t0+11.5,'opacity',.9,0);
   wpill(S,640,84,'DEFENDER FOLLOWED HIM → MAN COVERAGE',RED,t0+5,t0+11.6);});}
 P('Snap. He drops back… fires… <b>caught</b>! Twelve yards and a <b>first down</b>!',7.5,t0=>{S.clearHi(t0,all);const r=passPlay(S,O,D,L,t0+.5,{target:'WR2',route:[[0,-1,C+13.5],[1.7,9,C+13.5]],catchDx:10,catchY:C+12.3,yac:[[1,12,C+11.4]],tackler:'CB2'});S.burst(t0+5.4,'FIRST DOWN!',{size:64,y:200,sfx:'ding'});});
 A('Past the yellow line, so the downs start over: <b>1st & 10</b>. That\'s how teams move down the field.',7.25,t0=>{bug.at(t0+.3,{dd:'1ST & 10',c:'13:12'});bug.call(t0+.4,t0+7.09,[3],'New set of downs: 1st & 10');});
}});

/* =========================================================
   5 — Third down, then a punt (+ nickel)
   ========================================================= */
W({title:'Third Down & a Punt',build(S,X){
 const L=X?52:57;const {O,D,los}=field(S,L,1,18,4);const {P,A}=booth(S);const bug=tvBug(S,{pos:'a',dd:'3RD & 8',c:'11:40'});const fdl=fdLine(S,L+8);const all=[...O.all,...D.all];
 A('A few plays later, it\'s <b>3rd & 8</b>. With that many yards to go on third down, teams usually <b>pass</b>.',7.0,t0=>{bug.call(t0+.3,t0+6.84,[3],'3rd down · 8 yards to go');pulseLine(S,fdl,t0+2.33,t0+6.84);});
 if(X)A('The Titans bring in an extra defensive back for this play. With <b>five</b> defensive backs, it\'s called a <b>nickel</b> defense, because a nickel is worth five cents.',9.25,t0=>{S.move(D.LB3,t0+.6,t0+2.04,[[L+6,C+7]]);S.highlight(t0+2.13,all,[...D.CB,...D.S,D.LB3]);wpill(S,640,84,'NICKEL DEFENSE = 5 DEFENSIVE BACKS 🪙',RED,t0+2.41,t0+8.88);});
 P('He throws toward the sideline… <b>incomplete</b>!',5.5,t0=>{S.clearHi(t0,all);passPlay(S,O,D,L,t0+.5,{target:'WR1',route:[[0,-1,C-13],[1.9,9,C-13]],catchDx:11,catchY:C-15,incomplete:true});});
 A('Incomplete passes <b>stop the clock</b>. Now it\'s <b>4th down</b>, too far for a field goal, so they\'ll <b>punt</b>.',6.75,t0=>{bug.at(t0+.3,{dd:'4TH & 8'});bug.call(t0+.4,t0+3.38,[2],'Clock stopped');bug.call(t0+3.45,t0+6.6,[3],'4th down');});
 const px=L-13,land=95;
 P('Here\'s the punt. High and deep… <b>fair catch</b> at the Titans\' 15-yard line.',8,t0=>{S.fall(O.WR1,t0,.3,0);S.formTo(O,t0,t0+.6,L);S.formTo(D,t0,t0+.6,L);S.place(O.QB,t0+.7,px,C);S.place(O.RB,t0+.7,L-6,C+1.4);S.place(D.S1,t0+.7,land,C+2);S.place(D.S2,t0+.7,L+22,C-3);S.ballAt(t0+.7,L-.7,C,.15);S.give(t0+.7,O.C);
  const ts=t0+1.4;S.thr(ts,ts+.5,[L-.8,C,.6],[px+.4,C,1.1],.4);S.give(ts+.5,O.QB);S.sfx(ts,'thud');const tk=ts+1.1;S.thr(tk,tk+3.2,[px+.4,C,1.1],[land-.4,C+2,1.2],16,{spins:8});S.sfx(tk,'kick');S.give(tk+3.2,D.S1);
  for(const a of [O.WR1,O.WR2,O.WR3,O.TE])S.move(a,tk,tk+3.2,[[land-7,C+(a.y-C)*.4]]);S.follow(t0,9999,0);S.camTo(t0,t0+.4,{z:12});
  S.track(tk+2.2,tk+3.4,(p,r,t)=>{D.S1.hop=r>0&&r<1?Math.abs(Math.sin(t*10))*8:0;},Ease.lin);wpill(S,640,200,'✋ FAIR CATCH: no return, no hitting',NAVY,tk+3.3,tk+7);S.sfx(tk+3.4,'whistle');});
 A('Now the <b>Titans</b> have the ball, way back near their own end zone. That\'s why teams punt.',6.0,t0=>{bug.at(t0+.3,{pos:'b',dd:'1ST & 10',c:'11:28'});bug.call(t0+.4,t0+5.87,[1],'Titans have the ball 🏈');});
}});

/* =========================================================
   6 — Titans drive & field goal (+ holding)
   ========================================================= */
W({title:'Titans Kick a Field Goal',build(S,X){
 let L=95;const {O,D,los}=field(S,L,-1,18,-4);const {P,A}=booth(S);const bug=tvBug(S,{pos:'b',dd:'1ST & 10',c:'11:28'});const all=[...O.all,...D.all];
 if(X)P('The Titans hand it off… he breaks free! A <b>big run</b>!',6.5,t0=>{runPlay(S,O,D,L,t0+.5,22,{dir:-1,lane:-3});S.burst(t0+4.2,'BIG RUN!',{size:70,y:190,color:'#ffb3ad'});});
 if(X)A('But look, there\'s a <b>flag</b>! A Titans blocker grabbed a defender by the jersey: <b>holding</b>. The big run doesn\'t count, and they lose <b>10 yards</b>.',9.75,t0=>{CH().flagThrow&&CH().flagThrow(S,t0+.4,[L-12,C+16],[L-4,C+4],4);CH().penCard&&CH().penCard(S,t0+1.95,t0+9.36,'HOLDING','10 YARDS','Grabbing a defender to stop him',undefined,108);bug.at(t0+3.9,{dd:'1ST & 20'});});
 const kv=kickView(S,TI);const L2=32;
 A('A few plays later, the Titans reach the Thunder\'s <b>22-yard line</b>. It\'s <b>4th & 3</b>.',7.0,t0=>{S.wipe(t0);const tw=t0+.35;S.fall(O.RB,tw,.2,0);S.fall(D.LB3,tw,.2,0);S.follow(tw,9999,null);
  S.formTo(O,tw,tw+.01,L2);S.formTo(D,tw,tw+.01,L2);S.tw(los,tw,tw+.01,{x:L2});S.ballAt(tw,L2+.7,C,.15);S.give(tw+.02,O.C);S.camTo(tw,tw+.01,{x:L2-4,z:14.5},Ease.lin);
  bug.at(tw,{dd:'4TH & 3',c:'4:45'});bug.call(tw+.4,t0+6.81,[3],'4th down · 3 yards to go');});
 A('Close enough for a <b>field goal</b>, worth <b>3 points</b>. That\'s safer than going for it.',6.25,t0=>{S.place(O.QB,t0+.5,L2+7,C);S.place(O.RB,t0+.5,L2+9.6,C+1.6);});
 P('The kick is up… and it\'s <b>good</b>!',6,t0=>{showKick(S,kv,t0);});
 A('The Titans lead, <b>3 to 0</b>. And that\'s the end of the <b>first quarter</b>.',5.0,t0=>{bug.at(t0+.2,{b:3});bug.call(t0+.3,t0+2.62,[1],'Titans +3');bug.at(t0+2.69,{c:'0:00'});bug.at(t0+3.54,{q:'END 1ST',c:''});bug.call(t0+2.77,t0+4.85,[2],'End of the 1st quarter');S.attr(kv.g,t0+4.46,t0+4.92,'opacity',1,0);});
}});

/* =========================================================
   7 — Touchdown Thunder (+ play action)
   ========================================================= */
W({title:'Touchdown, Thunder!',build(S,X){
 const L=80;const {O,D,los}=field(S,L,1,18,5);const {P,A}=booth(S);const bug=tvBug(S,{a:0,b:3,q:'2ND',c:'9:12',pos:'a',dd:'1ST & 10'});fdLine(S,90);const all=[...O.all,...D.all];
 A('<b>Second quarter</b>. Thunder ball at the Titans\' <b>30-yard line</b>, first and ten.',5.75,t0=>{bug.call(t0+.3,t0+5.58,[2,3],'2nd quarter · 1st & 10');});
 A('Watch the deepest defenders, the <b>safeties</b>. One moved up close, so there\'s <b>room deep</b> downfield.',7.0,t0=>{S.highlight(t0+.3,all,D.S);S.move(D.S2,t0+1.09,t0+2.49,[[L+6,C+3]]);wpill(S,640,84,'ONLY ONE SAFETY DEEP → ROOM FOR A LONG PASS',RED,t0+2.64,t0+6.84);});
 if(X)A('And the Thunder have a trick ready: <b>play action</b>. The quarterback will <b>fake a handoff</b> so the linebackers think it\'s a run.',7.5,t0=>{S.clearHi(t0,all);});
 P(X?'Fake handoff… the linebackers bite… he throws deep… <b>caught</b>! He\'s at the ten, the five… <b>TOUCHDOWN</b>!':'Deep pass… <b>caught</b>! He\'s at the ten, the five… <b>TOUCHDOWN</b>!',X?9:8,t0=>{S.clearHi(t0,all);const ts=t0+.5;
  if(X){S.move(O.RB,ts+.4,ts+1.2,[[L-1.5,C-.6]]);for(const a of D.LB)S.nudge(a,ts+.5,ts+1.5,-2.2,0);wpill(S,640,84,'FAKE! THE LINEBACKERS STEP UP',GOLD,ts+.6,ts+2.6);}
  const r=passPlay(S,O,D,L,ts,{target:'WR1',route:[[0,-1,C-13],[2.3,18,C-12]],catchDx:21,catchY:C-10,yac:[[1.3,31,C-8]],throwAt:X?2.3:1.9,air:1.3,peak:5,tackler:null});td(S,ts+(X?2.3:1.9)+1.3+1.4);});
 A('A <b>touchdown</b> is worth <b>6 points</b>. Then comes the <b>extra point</b>: a short kick for one more.',6.5,t0=>{bug.at(t0+.3,{a:6});bug.call(t0+.4,t0+6.35,[0],'Touchdown: +6');});
 const kv=kickView(S,TH);
 P('The extra point is <b>good</b>. Thunder lead, <b>7 to 3</b>!',6.5,t0=>{showKick(S,kv,t0);bug.at(t0+3.6,{a:7});bug.pulse(t0+3.6,t0+6.3,[0]);});
}});

/* =========================================================
   8 — Turnover! (+ zone coverage clue)
   ========================================================= */
W({title:'Turnover!',build(S,X){
 const L=72;const {O,D,los}=field(S,L,-1,18,-5);const {P,A}=booth(S);const bug=tvBug(S,{a:7,b:3,q:'2ND',c:'2:40',pos:'b',dd:'1ST & 10'});fdLine(S,62);const all=[...O.all,...D.all];
 A('The Titans get the ball back. They\'re behind with time running out in the half, so they\'ll <b>throw</b>.',6.5,t0=>{bug.call(t0+.3,t0+6.33,[1,2],'Titans ball · 2:40 left in the half');});
 if(X){const zones=[[L-12,C-17,9,10.6,BLUE],[L-12,C-6.2,9,12.4,TEAL],[L-12,C+6.4,9,10.6,GOLD],[L-22.5,C-17,10,17.2,'#ff8fd1'],[L-22.5,C+.4,10,16.6,'#b48cff']].map(([x,y,w,h,c])=>E('rect',{x,y,width:w,height:h,rx:1,fill:c,opacity:0,stroke:NAVY,'stroke-width':.15},S.wfx));
  A('Before the snap, a Titans receiver goes in motion, and this time <b>nobody follows him</b>. The defenders just stay in their areas. That\'s a clue the Thunder are playing <b>zone</b> coverage.',11.0,t0=>{
   S.highlight(t0+.3,all,[O.WR3]);S.move(O.WR3,t0+0.96,t0+4.02,[[L+4,C+4],[L+4,C-4],[L+1.5,C-8]],Ease.inOut);S.highlight(t0+4.3,all,[O.WR3,...D.LB,...D.S,...D.CB]);
   zones.forEach((z,i)=>{S.attr(z,t0+4.78+i*.25,t0+5.17+i*.25,'opacity',0,.28);S.attr(z,t0+10.52,t0+10.9,'opacity',.28,0);});wpill(S,640,84,'NOBODY FOLLOWED → ZONE COVERAGE',BLUE,t0+4.78,t0+10.81);});}
 P('He throws over the middle… <b>intercepted</b>! The Thunder take it away!',7,t0=>{S.clearHi(t0,all);const ts=t0+.5,tth=ts+1.8,tc=tth+.9,cp=[L-12.5,C-2.4];snapTo(S,O,L,ts,-1);
  simPlay(S,O,D,L,{dir:-1,type:'pass',ts,tEnd:tc+3.4,tth,tc,tt:tc+2.6,int:{a:'S1'},catchPt:cp,script:{WR3:[[ts,L+2,C-8.5],[ts+1.6,L-6,C-6],[tc,L-11.6,C-3]],S1:[[ts,L-12,C-6],[tc,cp[0],cp[1]],[tc+2.6,L-4,C-5]],QB:[[ts,L+4.6,C],[ts+1.3,L+7,C],[tth+.6,L+6.8,C]]},meet:[{a:'WR3',t:tc+2.6,x:L-3.4,y:C-5.2}]});
  S.thr(tth,tc,[L+6.45,C,1.2],[cp[0],cp[1],1.2],2.6);S.sfx(tth,'swoosh');S.give(tc,D.S1);S.burst(tc+.1,'INTERCEPTED!',{size:70,y:190,color:'#bfe3ff',sfx:'cheer'});S.fall(D.S1,tc+2.6,.35);S.fall(O.WR3,tc+2.6,.35);S.sfx(tc+2.6,'thud');});
 A('That\'s an <b>interception</b>, a <b>turnover</b>. The ball changed teams during the play, so the Thunder are on offense.',7.25,t0=>{bug.at(t0+.3,{pos:'a',c:'2:31'});bug.call(t0+.4,t0+7.08,[0],'Turnover! Thunder ball 🏈');});
 A('And that\'s <b>halftime</b>: Thunder 7, Titans 3. After the break, the second half starts with a kickoff.',8.0,t0=>{bug.at(t0+.3,{q:'HALFTIME',c:'',dd:'THUNDER 7–3'});bug.call(t0+.4,t0+7.81,[2],'Halftime');});
}});

/* =========================================================
   9 — The final two minutes (+ timeouts)
   ========================================================= */
W({title:'The Final Two Minutes',build(S,X){
 let L=55;const {O,D,los}=field(S,L,1,18,4);const {P,A}=booth(S);const bug=tvBug(S,{a:7,b:6,q:'4TH',c:'2:00',pos:'a',dd:'1ST & 10'});let fdl=fdLine(S,65);const all=[...O.all,...D.all];
 A('Let\'s jump to the <b>4th quarter</b>. The Titans kicked two more field goals: <b>7 to 6</b>, with <b>two minutes</b> left.',8.0,t0=>{bug.call(t0+.3,t0+3.91,[0,1],'Thunder lead 7 to 6');bug.call(t0+4,t0+7.82,[2],'4th quarter · 2:00 left');});
 A('The Thunder lead, so they want the <b>clock running</b>. They\'ll run the ball and stay in bounds.',5.75);
 P('Handoff… five yards… tackled <b>in bounds</b>. The clock keeps ticking.',6.5,t0=>{const tt=runPlay(S,O,D,L,t0+.5,5);bug.run(t0+.5,tt,120,115);});
 A('A play that ends <b>in bounds</b> keeps the clock running. An <b>incomplete pass</b> or going <b>out of bounds</b> stops it.',8.5,t0=>{bug.run(t0+.3,t0+8.2,115,75);bug.pulse(t0+.3,t0+8.2,[2]);resetTo(S,O,D,los,t0+.5,L+5,[O.RB,D.LB3]);bug.at(t0+1,{dd:'2ND & 5'});});
 L+=5;
 if(X)A('The Titans call a <b>timeout</b> to stop the clock. Each team gets <b>three</b> timeouts per half, and that was their last one.',7.5,t0=>{wpill(S,640,84,'⏱️ TIMEOUT: TITANS HAVE 0 LEFT',RED,t0+.4,t0+7.2);bug.at(t0+.4,{dd:'TIMEOUT'});bug.at(t0+6.8,{dd:'3RD & 1'});});
 P('Third and one… he dives forward… <b>first down</b>!',6,t0=>{bug.at(t0,{dd:'3RD & 1',c:X?'1:10':'1:02'});const tt=runPlay(S,O,D,L,t0+.5,3,{lane:.6});S.burst(tt+.3,'FIRST DOWN!',{size:64,y:200,sfx:'ding'});bug.at(tt+.5,{dd:'1ST & 10'});});
 L+=3;
 A('Now the Thunder just <b>kneel down</b>. The play ends right away, and the clock runs out.',9.5,t0=>{resetTo(S,O,D,los,t0+.3,L,[O.RB,D.LB3]);const ts=t0+3;snapTo(S,O,L,ts);S.tw(O.QB,ts+.5,ts+.9,{fall:.35},Ease.out);
  wpill(S,640,84,'🧎 VICTORY FORMATION',NAVY,ts+.6,t0+9.2);bug.run(ts+.6,t0+9.3,X?62:55,0);});
 P('That\'s the game! The <b>Thunder win</b>, 7 to 6!',4.5,t0=>{bug.at(t0+.2,{q:'FINAL',c:'',dd:'THUNDER WIN'});bug.pulse(t0+.3,t0+4.35,[0,1,2]);S.burst(t0+.3,'THUNDER WIN!',{size:90,y:260,sfx:'cheer'});S.once(t0+.4,()=>window.confetti&&confetti(200,true));S.once(t0+1.2,()=>window.confetti&&confetti(140,true));
  O.all.forEach((a,i)=>S.hopA(a,t0+.6+i*.05,t0+4.2,5,22));});
 A(X?'Great job! You followed a whole game: the scoreboard, the downs, the formations, the penalties and the strategy. You\'re ready to watch the NFL!':'Great job! At a real game, watch the <b>scoreboard</b>, the <b>down and distance</b>, and the <b>formation clues</b> before each snap.',9.5);
}});

/* ---------------- the "Watch a Game" chooser ---------------- */
const prog=k=>{try{return +localStorage.getItem('f101_prog_'+k)||0;}catch(e){return 0;}};
const watched=k=>{const C_=COURSES[k];if(!C_)return false;const n=C_.list.filter(d=>!d.quiz).length;return prog(k)>=n;};
window.openWatch=function(){const o=document.createElement('div');o.className='wchoose';const cc=watched('basics'),rr=watched('rules'),ss=watched('smarts');
 o.innerHTML=`<div class="wbox"><h2>📺 Watch a Game</h2><p class="wlead">Sit back and watch the <b style="color:#2f6fed">Thunder</b> play the <b style="color:#e2483f">Titans</b>. The announcers explain everything as it happens, using what you learned.</p>
 <div class="wdone"><span class="${cc?'y':''}">${cc?'✅':'⬜'} Crash Course</span><span class="${rr?'y':''}">${rr?'✅':'⬜'} Rules & Penalties</span><span class="${ss?'y':''}">${ss?'✅':'⬜'} Football Smarts</span></div>
 ${cc?'':'<p class="wtip">💡 Tip: watch the <b>Crash Course</b> first. This game uses what it teaches. <button class="lnk" id="wCC">Start the Crash Course</button></p>'}
 <div class="wopts"><button class="wopt ${rr&&ss?'':'on'}" data-x="0"><b>🏈 The basics</b><small>Score, clock, downs, formations · about 5 min</small></button>
 <button class="wopt ${rr&&ss?'on':''}" data-x="1"><b>🧠 Basics + Rules & Smarts</b><small>Adds penalties and coaching strategy · about 6½ min</small></button></div>
 <div class="wrow"><button class="btn" id="wCancel">Cancel</button><button class="btn primary" id="wGo">▶ Watch the game</button></div></div>`;
 document.body.appendChild(o);const close=()=>o.remove();
 o.querySelectorAll('.wopt').forEach(b=>b.onclick=()=>{o.querySelectorAll('.wopt').forEach(x=>x.classList.remove('on'));b.classList.add('on');SFX.play('pop');});
 o.querySelector('#wCancel').onclick=close;o.onclick=e=>{if(e.target===o)close();};
 const cb=o.querySelector('#wCC');if(cb)cb.onclick=()=>{close();begin();setCourse('basics');};
 o.querySelector('#wGo').onclick=()=>{const x=o.querySelector('.wopt.on').dataset.x==='1';close();begin();setCourse(x?'watchx':'watch');};};
const st=document.createElement('style');st.textContent=`
.wchoose{position:fixed;inset:0;z-index:90;background:rgba(8,14,32,.6);display:flex;align-items:center;justify-content:center;padding:14px}
.wbox{background:#fff;border:5px solid var(--navy);border-radius:24px;box-shadow:8px 8px 0 var(--gold);padding:22px 26px;width:min(620px,100%);max-height:96vh;overflow:auto;text-align:center;font-family:Nunito,sans-serif;color:var(--navy)}
.wbox h2{font-family:'Lilita One';font-weight:400;font-size:34px;margin:0 0 6px}.wlead{font-weight:800;font-size:17px;margin:0 0 12px;line-height:1.4}
.wdone{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:10px}.wdone span{font-weight:900;font-size:14px;border:3px solid #d5dbe8;border-radius:999px;padding:3px 10px;background:#f4f7fc}.wdone span.y{border-color:#1f9d55;background:#e8f8ee}
.wtip{background:#fff4d6;border-radius:12px;padding:8px 12px;font-weight:800;font-size:15px}.wtip .lnk{background:none;border:0;color:#2f6fed;font-weight:900;text-decoration:underline;cursor:pointer;font-size:15px}
.wopts{display:flex;gap:10px;margin:12px 0}.wopt{flex:1;font-family:Nunito;border:4px solid #d5dbe8;border-radius:16px;background:#f4f7fc;color:var(--navy);padding:12px 10px;cursor:pointer;display:flex;flex-direction:column;gap:4px}
.wopt b{font-family:'Lilita One';font-weight:400;font-size:20px}.wopt small{font-weight:800;font-size:13px;opacity:.75}.wopt.on{border-color:var(--navy);background:#fff4d6;box-shadow:4px 4px 0 var(--gold)}
.wrow{display:flex;gap:10px;justify-content:center}.wrow .btn.primary{font-size:20px}
@media (max-height:540px){.wbox{padding:10px 14px}.wbox h2{font-size:24px}.wlead{font-size:14px;margin-bottom:6px}.wopt{padding:6px}.wopt b{font-size:16px}.wopts{margin:6px 0}}
@media (max-width:560px){.wopts{flex-direction:column}}
`;document.head.appendChild(st);
})();
