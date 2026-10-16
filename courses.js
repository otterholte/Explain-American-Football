/* =========================================================
   Football 101 — extra courses: Rules & Penalties, Football Smarts
   Uses the engine, helpers and player defined in index.html.
   ========================================================= */
(function(){
const RULES=[],SMARTS=[];
COURSES.rules={key:'rules',short:'Rules',list:RULES,cap:'r',ask:'rq',fq:'rf',fin:'rfin_',
 finMsg:['PERFECT! You could wear the stripes! 🚩','Nice work! You know the rules.','Good start! Rewatch a few steps and try again.']};
COURSES.smarts={key:'smarts',short:'Smarts',list:SMARTS,cap:'m',ask:'mq',fq:'mf',fin:'mfin_',
 finMsg:['PERFECT! You think like a coach! 🧠','Nice work! You\'re talking football now.','Good start! Rewatch a few steps and try again.']};

/* ---------- shared drawing helpers ---------- */
// referee (screen space)
function drawRef(parent,x,y,s=1){const g=G(parent,x,y);const inner=E('g',{transform:`scale(${s})`},g);
 E('ellipse',{cx:0,cy:0,rx:22,ry:7,fill:'rgba(20,30,60,.28)'},inner);
 for(const dx of [-10,2])E('rect',{x:dx,y:-22,width:8,height:22,rx:3.5,fill:'#222b3d',stroke:NAVY,'stroke-width':2.5},inner);
 const body=E('g',{},inner);const clip='refclip'+Math.round(Math.random()*1e6);
 const cp=E('clipPath',{id:clip},E('defs',{},inner));E('rect',{x:-18,y:-58,width:36,height:38,rx:11},cp);
 E('rect',{x:-18,y:-58,width:36,height:38,rx:11,fill:'#fff'},body);const st=E('g',{'clip-path':`url(#${clip})`},body);for(let i=-18;i<18;i+=9)E('rect',{x:i,y:-58,width:4.5,height:38,fill:'#1d1f27'},st);
 E('rect',{x:-18,y:-58,width:36,height:38,rx:11,fill:'none',stroke:NAVY,'stroke-width':3},body);
 const armR=E('g',{transform:'rotate(0,14,-52)'},inner);E('rect',{x:10,y:-54,width:9,height:26,rx:4.5,fill:'#fff',stroke:NAVY,'stroke-width':2.5},armR);E('circle',{cx:14.5,cy:-26,r:5,fill:'#ffd9b0',stroke:NAVY,'stroke-width':2},armR);
 const armL=E('g',{transform:'rotate(0,-14,-52)'},inner);E('rect',{x:-19,y:-54,width:9,height:26,rx:4.5,fill:'#fff',stroke:NAVY,'stroke-width':2.5},armL);E('circle',{cx:-14.5,cy:-26,r:5,fill:'#ffd9b0',stroke:NAVY,'stroke-width':2},armL);
 E('circle',{cx:0,cy:-72,r:14,fill:'#ffd9b0',stroke:NAVY,'stroke-width':3},inner);
 E('path',{d:'M-15,-75 Q0,-96 15,-75 Z',fill:'#fff',stroke:NAVY,'stroke-width':3},inner);E('rect',{x:-17,y:-78,width:34,height:5,rx:2.5,fill:'#fff',stroke:NAVY,'stroke-width':2.5},inner);
 E('circle',{cx:-5,cy:-70,r:2,fill:NAVY},inner);E('circle',{cx:5,cy:-70,r:2,fill:NAVY},inner);E('path',{d:'M-4,-63 Q0,-60 4,-63',stroke:NAVY,'stroke-width':2,fill:'none','stroke-linecap':'round'},inner);
 g.setAttribute('opacity',0);return{g,armR,armL};}
// a yellow flag that flies through the air in world space (yards)
function flagThrow(S,t,from,to,peak=4){const g=E('g',{opacity:0},S.L.wtop);const f=E('g',{},g);
 E('path',{d:'M-.75,-.55 L.75,-.55 L.75,.55 L-.75,.55 Z',fill:'#ffd400',stroke:NAVY,'stroke-width':.16,'stroke-linejoin':'round'},f);E('circle',{cx:0,cy:-.55,r:.32,fill:'#ffd400',stroke:NAVY,'stroke-width':.14},f);
 E('path',{d:'M-.3,.55 L-.55,1.05 M.3,.55 L.55,1.05',stroke:'#ffd400','stroke-width':.22,'stroke-linecap':'round'},f);
 S.track(t,t+.9,(p,r)=>{const x=lerp(from[0],to[0],r),y=lerp(from[1],to[1],r)-peak*4*r*(1-r);g.setAttribute('opacity',r>0?1:0);g.setAttribute('transform',`translate(${x},${y})`);f.setAttribute('transform',`rotate(${r*540}) scale(${1+.25*Math.sin(r*Math.PI)})`);},Ease.lin);
 S.track(t+4.2,t+4.7,(p,r)=>g.setAttribute('opacity',1-r),Ease.lin);S.sfx(t,'whistle');return g;}
// big penalty card in screen space
function penCard(S,t0,t1,name,yards,sub,col='#ffd400',y=108){const g=G(S.L.top,640,y);const w=Math.max(520,name.length*26+yards.length*18+120);
 E('rect',{x:-w/2+7,y:-46,width:w,height:sub?118:92,rx:22,fill:NAVY},g);E('rect',{x:-w/2,y:-53,width:w,height:sub?118:92,rx:22,fill:'#fff',stroke:NAVY,'stroke-width':5},g);
 const fl=G(g,-w/2+52,-8);E('rect',{x:-24,y:-18,width:48,height:36,rx:6,fill:col,stroke:NAVY,'stroke-width':4},fl);E('circle',{cx:0,cy:-18,r:8,fill:col,stroke:NAVY,'stroke-width':3.5},fl);
 T(g,-w/2+92,-8,name,{size:38,fill:NAVY,anchor:'start'});const yp=pill(g,w/2-20-yards.length*9.5,-8,yards,{size:26,bg:RED,sw:4});
 if(sub)T(g,0,40,sub,{size:22,fill:NAVY,cls:'fb'});S.pop(g,t0,.45);S.unpop(g,t1);return g;}
// generic info card (screen) with title and lines
function infoCard(S,x,y,w,h,title,lines,col=BLUE){const g=G(S.L.ui,x,y);const inner=E('g',{transform:`translate(${-w/2},${-h/2})`},g);
 E('rect',{x:7,y:7,width:w,height:h,rx:22,fill:NAVY},inner);E('rect',{width:w,height:h,rx:22,fill:'#fff',stroke:NAVY,'stroke-width':5},inner);
 E('rect',{width:w,height:62,rx:22,fill:col,stroke:NAVY,'stroke-width':5},inner);T(inner,w/2,33,title,{size:30,fill:'#fff',stroke:NAVY,sw:5});
 const rows=lines.map((l,i)=>{const r=G(inner,24,98+i*46);const tx=T(r,0,0,l,{size:22,fill:NAVY,anchor:'start',cls:'fb'});r.setAttribute('opacity',0);return r;});
 g.setAttribute('opacity',0);return{g,rows};}
// moves a whole play setup back to a new line of scrimmage (both teams + ball + LOS + optional first-down line)
function spotTo(S,O,D,los,t0,Lx,dur=1.6,fdl=null,fdx=null){S.tw(los,t0,t0+dur,{x:Lx});if(fdl&&fdx!=null)S.tw(fdl,t0,t0+dur,{x:fdx});S.ballAt(t0,Lx-O.dir*.7,C,.15);S.formTo(O,t0,t0+dur,Lx);S.formTo(D,t0,t0+dur,Lx);S.give(t0+dur,O.C);}
// yard-change bracket
function yardBracket(S,t0,x1,x2,y,text,color=GOLD,hold=4){const br=S.bracketObj({y,text,color,parent:S.L.wtop});br.x1=x1;br.x2=x1;setPlan(br,'x2',x1);S.tw(br,t0,t0+.1,{op:1});S.tw(br,t0,t0+1,{x2});S.sfx(t0+1,'ding');S.tw(br,t0+hold,t0+hold+.4,{op:0});return br;}
// rect highlight in world space
function worldRect(S,x,y,w,h,fill,op=.3,parent){const r=E('rect',{x,y,width:w,height:h,rx:.6,fill,opacity:0},parent||S.wfx);return r;}
function scrim(S,t0,t1,op=.5){const r=E('rect',{x:0,y:0,width:W,height:H,fill:NAVY,opacity:0},S.L.ui);S.attr(r,t0,t0+.4,'opacity',0,op);S.attr(r,t1-.4,t1,'opacity',op,0);S.tw(S.ball,t0,t0+.3,{op:0});S.tw(S.ball,t1-.3,t1,{op:1});return r;}
function topTip(S,t0,t1,text,x=640,y=640,bg=TEAL){const p=pill(S.L.top,x,y,'💡 '+text,{size:24,bg,fg:'#fff',sw:4});S.pop(p,t0);S.hide(p,t1-.3,t1);return p;}
function chip(parent,x,y,text,bg,fg='#fff',size=24){return pill(parent,x,y,text,{size,bg,fg,sw:4});}

const R=d=>RULES.push(d),M=d=>SMARTS.push(d);

/* =========================================================
   RULES & PENALTIES
   ========================================================= */
R({title:'What\'s a Penalty?',build(S){
 const L=45,{O,D}=playSetup(S,L,19,4);const los=S.lineObj('#3d8bff',null);los.x=L;los.op=1;setPlan(los,'x',L);setPlan(los,'op',1);
 const ref=drawRef(S.L.ui,1120,560,2.2);
 S.beat('Football has rules. When a player breaks one, that\'s a <b>foul</b>, and the punishment is called a <b>penalty</b>.',6,t0=>{tipPill(S,t0+1,t0+5.8,'FOUL = breaking a rule',640,640,NAVY);});
 S.beat('Officials in black-and-white stripes watch every play. When they see a foul, they throw a bright <b>yellow flag</b> onto the field.',8,t0=>{S.show(ref.g,t0+.4,t0+1);
  S.track(t0+2.4,t0+3.2,(p,r)=>ref.armR.setAttribute('transform',`rotate(${r<.5?-160*r*2:-160+190*(r-.5)*2},14,-52)`),Ease.lin);
  flagThrow(S,t0+2.9,[L+9,C+14],[L+1.5,C+5],5);S.burst(t0+3.9,'FLAG!',{size:70,y:200,color:'#ffd400',sfx:'buzz'});});
 S.beat('A penalty usually costs <b>yards</b>. The team that broke the rule gets pushed backward, or the other team gets moved forward.',8,t0=>{S.hide(ref.g,t0,t0+.5);
  spotTo(S,O,D,los,t0+1.5,L-5,1.4);yardBracket(S,t0+3.2,L,L-5,C+10,'−5 YARDS',RED,4);});
 const sc1=scrim(S,S.T+.4,S.T+6.9,.45);const sz=G(S.L.ui,640,600);sz.setAttribute('opacity',0);[['5 YARDS','small','#7ee081'],['10 YARDS','medium',GOLD],['15 YARDS','serious',RED]].forEach(([a,b,c],i)=>{const g=G(sz,-300+i*300,0);E('rect',{x:-125,y:-52,width:250,height:104,rx:20,fill:'#fff',stroke:NAVY,'stroke-width':5},g);T(g,0,-14,a,{size:34,fill:NAVY});T(g,0,26,b,{size:20,fill:c==='#7ee081'?'#1a8f43':c===GOLD?'#a87600':'#c2342b',cls:'fb'});});
 S.beat('Most penalties are worth <b>5</b>, <b>10</b>, or <b>15 yards</b>. The more yards, the more serious the foul.',7,t0=>{S.pop(sz,t0+.6);S.unpop(sz,t0+6.8);});
 S.beat('Some penalties also give the other team an <b>automatic first down</b>: a brand-new set of 4 tries.',6.5,t0=>{tipPill(S,t0+.5,t0+6.3,'AUTOMATIC FIRST DOWN = 4 fresh tries',640,600,TEAL);const yl=E('rect',{x:L-5+9.83,y:0,width:.34,height:53.33,fill:YEL,opacity:0},S.wfx);S.attr(yl,t0+1.2,t0+1.7,'opacity',0,1);S.attr(yl,t0+6,t0+6.4,'opacity',1,0);
  const nl=pill(S.L.wtop,L+5,C-16,'NEW FIRST DOWN LINE',{size:1.3,bg:YEL,fg:NAVY,sw:.22});S.pop(nl,t0+1.5);S.hide(nl,t0+6);});
 const tAD=S.T;const ad=G(S.L.ui,640,330);ad.setAttribute('opacity',0);[['ACCEPT ✓','Take the yards','#1a8f43'],['DECLINE ✗','Keep the play\'s result',RED]].forEach(([a,b,c],i)=>{const g=G(ad,-190+i*380,0);E('rect',{x:-165,y:-70,width:330,height:140,rx:22,fill:'#fff',stroke:NAVY,'stroke-width':5},g);E('rect',{x:-165,y:-70,width:330,height:56,rx:22,fill:c,stroke:NAVY,'stroke-width':5},g);T(g,0,-42,a,{size:30,fill:'#fff'});T(g,0,24,b,{size:22,fill:NAVY,cls:'fb'});});
 S.beat('And the team that was fouled gets to choose: <b>accept</b> the penalty yards, or <b>decline</b> them if the play itself turned out better. If the offense just gained 20 yards, it would happily decline a 5-yard penalty.',12,t0=>{S.pop(ad,t0+.6);});S.unpop(ad,S.T-.4);{const r=scrim(S,tAD+.4,S.T-.1,.5);ad.parentNode.insertBefore(r,ad);}
 S.ask({q:'When an official sees a foul, what does he throw onto the field?',opts:['🚩 A yellow flag','🟥 A red card','🏈 The football'],ans:0,why:'Officials throw a <b>yellow flag</b> to show that a <b>foul</b> happened.'});
}});

R({title:'Before the Snap',build(S){
 const L=40,{O,D}=playSetup(S,L,21,4);const los=S.lineObj('#3d8bff','LINE OF SCRIMMAGE',C+8.3);los.x=L;los.op=1;setPlan(los,'x',L);setPlan(los,'op',1);
 S.beat('Some penalties happen before the play even starts. Until the ball is snapped, the linemen have to <b>stay still</b>, and nobody can cross the line of scrimmage.',7.5);
 S.beat('A <b>false start</b> is when an offensive player moves early. Watch this lineman flinch…',6,t0=>{S.highlight(t0+1,[...O.all,...D.all],[O.LT]);S.camTo(t0+.4,t0+1.6,{z:27});S.nudge(O.LT,t0+3,t0+3.25,1.6,0,Ease.out);S.nudge(O.LT,t0+3.4,t0+3.8,-1.6,0);
  flagThrow(S,t0+3.4,[L-6,C-16],[L-1.5,C-5],4);});
 S.beat('Whistle! That costs the offense <b>5 yards</b>, and the play never even happens.',6,t0=>{S.camTo(t0+.3,t0+1.3,{z:21});penCard(S,t0,t0+5.6,'FALSE START','5 YARDS','Offense moved before the snap');S.clearHi(t0+.5,[...O.all,...D.all]);
  spotTo(S,O,D,los,t0+2,L-5,1.3);yardBracket(S,t0+3.4,L,L-5,C+12,'−5 YARDS',RED,2.2);});
 const L2=L-5;
 S.beat('<b>Offside</b> is the defense\'s version: a defender is across the line of scrimmage when the ball is snapped.',6.5,t0=>{S.highlight(t0+.6,[...O.all,...D.all],[D.DL2]);S.nudge(D.DL2,t0+2.6,t0+3,-2.4,0,Ease.out);
  flagThrow(S,t0+3.2,[L2+8,C+16],[L2+.8,C+3],4);});
 S.beat('That moves the offense <b>5 yards forward</b> for free!',4.5,t0=>{penCard(S,t0,t0+4.3,'OFFSIDE','5 YARDS','Defense crossed the line early');S.clearHi(t0+.4,[...O.all,...D.all]);S.nudge(D.DL2,t0+.4,t0+1,2.4);
  spotTo(S,O,D,los,t0+1.4,L2+5,1.3);yardBracket(S,t0+2.8,L2,L2+5,C+12,'+5 YARDS','#7ee081',1.4);});
 const pc=G(S.L.ui,1120,120);E('circle',{r:58,fill:NAVY,stroke:'#fff','stroke-width':5},pc);T(pc,0,-26,'PLAY CLOCK',{size:13,fill:GOLD,cls:'fb'});const pct=T(pc,0,10,'5',{size:52,fill:'#fff'});pc.setAttribute('opacity',0);
 S.beat('And remember the <b>play clock</b>? If it hits zero before the snap, that\'s <b>delay of game</b>: another 5 yards.',8,t0=>{S.pop(pc,t0+.8);S.track(t0+1.6,t0+6.6,(p,r)=>{const v=Math.max(0,Math.ceil(5-r*5));pct.textContent=String(v);pct.setAttribute('fill',v<=2?'#ff8a80':'#fff');},Ease.lin);
  for(let i=0;i<5;i++)S.sfx(t0+1.6+i,'tick');flagThrow(S,t0+6.7,[L+8,C-16],[L+.5,C-6],4);S.unpop(pc,t0+7.6);});
 S.beat('Memory tip: before the snap, linemen freeze like statues. Move early, and your team pays for it.',6,t0=>{tipPill(S,t0+.3,t0+5.8,'BEFORE THE SNAP: LINEMEN FREEZE!',640,620,TEAL);});
 S.ask({q:'A defender jumps across the line of scrimmage before the snap. What is that called?',opts:['🏃 Offside','🧱 Holding','🦶 Roughing the kicker'],ans:0,why:'Crossing the line early is <b>offside</b>. It moves the offense 5 yards forward.'});
}});

R({title:'What\'s a Catch?',build(S){
 S.fieldInit();S.ringHolder=true;S.ballGlow=true;const SX=55;S.camSet(SX,9,26);
 const side=E('rect',{x:20,y:-.35,width:80,height:.7,fill:'#fff'},S.wfx);
 const ob=worldRect(S,20,-14,80,13.65,'#ff5a4e');const ib=worldRect(S,20,0,80,14,'#62ff7a');
 const wr=S.player({team:'blue',num:11,pos:'WR',x:SX-12,y:3});wr.autoFace=true;const cb=S.player({team:'red',num:24,pos:'CB',x:SX-9,y:6.5});cb.autoFace=true;
 const chk=G(S.L.ui,1060,330);E('rect',{x:-200+7,y:-120+7,width:400,height:240,rx:22,fill:NAVY},chk);E('rect',{x:-200,y:-120,width:400,height:240,rx:22,fill:'#fff',stroke:NAVY,'stroke-width':5},chk);
 T(chk,0,-82,'IT\'S A CATCH IF…',{size:28,fill:NAVY});const items=['Control the ball','2 feet in bounds','Make a football move'].map((t,i)=>{const r=G(chk,-170,-30+i*58);const b=E('rect',{x:0,y:-20,width:40,height:40,rx:10,fill:'#fff',stroke:NAVY,'stroke-width':4},r);const ck=T(r,20,1,'✓',{size:30,fill:'#1a8f43'});ck.setAttribute('opacity',0);T(r,58,0,t,{size:24,fill:NAVY,anchor:'start',cls:'fb'});r.setAttribute('opacity',.35);return{r,ck};});
 chk.setAttribute('opacity',0);
 const tick=(i,t)=>{S.track(t,t+.3,(p,r)=>{items[i].r.setAttribute('opacity',r>0?1:.35);items[i].ck.setAttribute('opacity',r);},Ease.lin);S.sfx(t,'ding');};
 const feet=[];const foot=(x,y,ok,t)=>{const g=G(S.wfx2,x,y);feet.push(g);E('ellipse',{rx:.75,ry:.42,fill:ok?'#62ff7a':'#ff5a4e',stroke:NAVY,'stroke-width':.12},g);T(g,0,.02,String(feet.length%2?1:2),{size:.6,fill:NAVY});g.setAttribute('opacity',0);S.pop(g,t,.3);return g;};
 S.beat('What counts as a <b>catch</b>? It sounds simple, but it has <b>three parts</b>.',5,t0=>{S.pop(chk,t0+1.5);S.attr(ib,t0+1,t0+1.6,'opacity',0,.22);S.attr(ob,t0+1,t0+1.6,'opacity',0,.22);
  const lb=pill(S.L.ui,210,0,'⬆ OUT OF BOUNDS',{size:30,bg:RED,sw:4}),lb2=pill(S.L.ui,210,0,'⬇ IN BOUNDS',{size:30,bg:'#1a8f43',sw:4});lb.setAttribute('opacity',0);lb2.setAttribute('opacity',0);
  S.renderers.push(()=>{const sy=S.toScreen(0,0)[1];setPos(lb,210,clamp(sy-48,80,680),1);setPos(lb2,210,clamp(sy+48,80,680),1);});S.attr(lb,t0+1.4,t0+1.8,'opacity',0,1);S.attr(lb2,t0+1.6,t0+2,'opacity',0,1);});
 const tc=S.T+2.2;
 S.beat('One: the receiver has to <b>control</b> the ball, holding it securely, not juggling it.',6,t0=>{const tc=t0+2.2;
  S.move(wr,t0,tc,[[SX-2,2.2]],Ease.lin);S.move(cb,t0,tc+.4,[[SX-3.2,4.4]],Ease.lin);S.thr(t0,tc,[SX-20,14,1.2],[SX-1.4,2.2,1.4],3.5);S.give(tc,wr);S.sfx(tc,'pop');tick(0,tc+.5);
  S.move(wr,tc,tc+.8,[[SX+.4,1.6]],Ease.out);});
 S.beat('Two: he needs <b>two feet</b> down in bounds. A knee or another body part counts too.',6.5,t0=>{S.camTo(t0,t0+1,{x:SX+.5,y:2.5,z:40});S.move(wr,t0,t0+1.2,[[SX+2.6,2]],Ease.out);foot(SX-.6,1.2,1,t0+1.3);foot(SX+.6,1.9,1,t0+2.1);S.sfx(t0+1.3,'pop');S.sfx(t0+2.1,'pop');tick(1,t0+2.6);});
 S.beat('Three: he keeps control long enough to make a <b>football move</b>, like taking another step or reaching the ball forward.',8,t0=>{S.camTo(t0,t0+1,{x:SX+4,y:6,z:26});S.move(wr,t0+.6,t0+2.4,[[SX+6,2.4]],Ease.out);tick(2,t0+2.6);});
 S.beat('All three boxes checked. That\'s a <b>catch</b>!',4,t0=>{S.burst(t0+.2,'CATCH ✓',{size:76,y:560,x:480,sfx:'cheer'});});
 // second try: foot out
 S.beat('Now watch this one. He catches it, but his second foot lands <b>out of bounds</b>…',6.5,t0=>{
  S.track(t0,t0+.3,(p,r)=>{items.forEach(it=>{it.ck.setAttribute('opacity',1-r);it.r.setAttribute('opacity',1-.65*r);});},Ease.lin);
  S.wipe(t0+.1);S.set(t0+.5,()=>feet.slice(0,2).forEach(f=>f.setAttribute('opacity',0)));S.track(t0+.5,t0+.6,()=>feet.slice(0,2).forEach(f=>f.setAttribute('opacity',0)),Ease.lin);S.place(wr,t0+.5,SX-12,3);S.place(cb,t0+.5,SX-9,6.5);S.ballAt(t0+.5,-50,-50,0);S.camTo(t0+.5,t0+.6,{x:SX,y:9,z:26},Ease.lin);
  const tc=t0+3.2;S.move(wr,t0+1,tc,[[SX-2,1.6]],Ease.lin);S.move(cb,t0+1,tc+.4,[[SX-3.2,4]],Ease.lin);S.thr(t0+1,tc,[SX-20,14,1.2],[SX-1.4,1.6,1.4],3.5);S.give(tc,wr);S.sfx(tc,'pop');
  S.move(wr,tc,tc+1.4,[[SX+.7,-.8],[SX+3.4,-2.4]],Ease.out);S.camTo(tc,tc+.8,{x:SX+1,y:1,z:40});foot(SX-.6,.9,1,tc+.4);foot(SX+.7,-.8,0,tc+.8);S.sfx(tc+.9,'buzz');});
 S.beat('Only one foot was in bounds, so the pass is <b>incomplete</b>. That\'s why you see receivers tiptoe along the sideline!',8,t0=>{S.burst(t0+.2,'INCOMPLETE',{size:66,y:560,x:480,color:'#dfe5f2'});tick(0,t0+1.4);
  S.track(t0+2,t0+2.4,(p,r)=>{items[1].r.setAttribute('opacity',1);items[1].ck.textContent=r>0?'✗':'✓';items[1].ck.setAttribute('fill','#e2392d');items[1].ck.setAttribute('opacity',r);},Ease.lin);S.sfx(t0+2,'wrong');});
 S.ask({q:'A receiver catches the ball with one foot in bounds and his other foot out of bounds. Is it a catch?',opts:['No, it\'s incomplete','Yes, it\'s a catch'],ans:0,why:'In the NFL, a receiver needs <b>two feet</b>, or another body part like a knee, down in bounds.'});
}});

R({title:'The Pocket & Holding',build(S){
 const L=40,{O,D}=playSetup(S,L,24,-2);const los=S.lineObj('#3d8bff',null);los.x=L;los.op=1;setPlan(los,'x',L);setPlan(los,'op',1);
 const cup=E('path',{d:`M${L-1.4},${C-6.4} Q${L-9.5},${C-6.8} ${L-9.8},${C} Q${L-9.5},${C+6.8} ${L-1.4},${C+6.4}`,fill:'rgba(98,255,122,.28)',stroke:'#62ff7a','stroke-width':.35,'stroke-dasharray':'.8 .5',opacity:0},S.wfx);
 const pk=pill(S.L.wtop,L-6.5,C-9.5,'THE POCKET',{size:1.4,bg:'#1a8f43',sw:.22});pk.setAttribute('opacity',0);
 let ts;
 S.beat('On a pass play, the offensive linemen form a protective wall around the quarterback. That safe space is called the <b>pocket</b>.',8,t0=>{ts=t0+.6;snapTo(S,O,L,ts);
  const pts=[[O.LT,L-2.4,C-5.4],[O.LG,L-2.6,C-2.4],[O.C,L-2.7,C],[O.RG,L-2.6,C+2.4],[O.RT,L-2.4,C+5.4],[O.QB,L-7,C]];for(const [a,x,y] of pts)S.move(a,ts,ts+1.4,[[x,y]]);
  for(const [d,dy] of [[D.DL1,-5.6],[D.DL2,-2.6],[D.DL3,2.6],[D.DL4,5.6]])S.move(d,ts,ts+1.4,[[L-1.4,C+dy]]);
  S.move(O.RB,ts,ts+1.4,[[L-6,C+2.6]]);S.move(O.TE,ts,ts+1.4,[[L-1.6,C+7.6]]);for(const w of O.WR)S.nudge(w,ts,ts+2.4,9);for(const c of D.CB)S.nudge(c,ts,ts+2.4,6);for(const l of D.LB)S.nudge(l,ts,ts+2,3);
  S.attr(cup,ts+1.6,ts+2.2,'opacity',0,1);S.pop(pk,ts+1.8);});
 S.beat('Think of it like a pocket on your jeans: the quarterback stays tucked safely inside while he looks for someone to throw to.',7.5);
 S.beat('Blockers can push with their hands, but they <b>can\'t grab and hold</b> a defender to stop him.',6.5,t0=>{S.attr(cup,t0,t0+.5,'opacity',1,.35);S.hide(pk,t0,t0+.5);S.highlight(t0+.5,[...O.all,...D.all],[O.RT,D.DL4]);});
 S.beat('Here, the defender spins past the blocker, so the blocker <b>grabs his jersey</b> and pulls him back…',7,t0=>{
  S.move(D.DL4,t0+1,t0+2.2,[[L-3.6,C+7.4],[L-5,C+6.4]]);S.move(O.RT,t0+1.6,t0+2.6,[[L-4.6,C+7.2]]);S.move(D.DL4,t0+2.4,t0+3.2,[[L-4.4,C+7.6]]);
  const grab=pill(S.L.wtop,L-4.4,C+11,'✋ GRAB!',{size:1.3,bg:RED,sw:.22});S.pop(grab,t0+2.6);S.hide(grab,t0+6.4);S.move(O.RT,t0+2.6,t0+3,[[L-5.6,C+6.6]]);
  const arm=E('line',{stroke:RED,'stroke-width':.45,'stroke-linecap':'round',opacity:0},S.wfx2);S.renderers.push(()=>{arm.setAttribute('x1',O.RT.x+.3);arm.setAttribute('y1',O.RT.y-1.4);arm.setAttribute('x2',D.DL4.x-.2);arm.setAttribute('y2',D.DL4.y-1.6);});S.attr(arm,t0+2.6,t0+2.8,'opacity',0,1);S.attr(arm,t0+6.2,t0+6.6,'opacity',1,0);flagThrow(S,t0+3.2,[L+8,C+17],[L+.5,C+13.5],4);});
 S.beat('That\'s a foul: <b>holding</b>. Offensive holding costs <b>10 yards</b>.',5,t0=>{penCard(S,t0,t0+4.8,'HOLDING','10 YARDS','Grabbing a defender to stop him');S.clearHi(t0+.4,[...O.all,...D.all]);S.attr(cup,t0+.4,t0+.8,'opacity',.35,0);
  spotTo(S,O,D,los,t0+1.5,L-10,1.6);yardBracket(S,t0+3.2,L,L-10,C+10,'−10 YARDS',RED,1.6);});
 S.beat('Defenders can hold too, by grabbing a receiver. <b>Defensive holding</b> is 5 yards plus an <b>automatic first down</b>.',8,t0=>{const L4=L-10;S.highlight(t0+.2,[...O.all,...D.all],[O.WR2,D.CB2]);S.move(O.WR2,t0+.6,t0+2.6,[[L4+4,C+13.2]]);S.move(D.CB2,t0+.6,t0+2.6,[[L4+4.8,C+12.6]]);
  const g2=pill(S.L.wtop,L4+4.4,C+8.6,'✋ GRAB!',{size:1.3,bg:RED,sw:.22});S.pop(g2,t0+2.4);S.hide(g2,t0+7.4);flagThrow(S,t0+2.8,[L4+14,C+6],[L4+6.5,C+9],3.5);penCard(S,t0+3.4,t0+7.8,'DEFENSIVE HOLDING','5 YARDS','…plus an automatic first down!',RED,108);});
 S.ask({q:'What is "the pocket"?',opts:['🛡️ The safe space around the QB','👖 A pocket on the uniform','🏁 The end zone'],ans:0,why:'The <b>pocket</b> is the safe area the offensive line builds around the quarterback on a pass play.'});
}});

R({title:'Pass Interference',build(S){
 const L=35,{O,D}=playSetup(S,L,16,12);const los=S.lineObj('#3d8bff',null);los.x=L;los.op=1;setPlan(los,'x',L);setPlan(los,'op',1);
 S.beat('Once a pass is in the air, the receiver and the defender both have an equal right to go get the ball.',6.5);
 S.beat('But neither one can <b>grab, push, or hold</b> the other to stop the catch. That\'s called <b>pass interference</b>.',7.5,t0=>{tipPill(S,t0+1,t0+7.2,'PASS INTERFERENCE = illegally stopping a catch',640,620,NAVY);});
 const fx=L+30,fy=C-12;let ts,tth,tc;
 S.beat('Watch: the pass goes deep, and the cornerback <b>grabs the receiver\'s arm</b> before the ball arrives…',8,t0=>{ts=t0+.6;tth=ts+2.2;tc=tth+1.5;snapTo(S,O,L,ts);
  simPlay(S,O,D,L,{type:'pass',clean:true,ts,tEnd:tc+1.6,tth,tc,catchPt:[fx+3,fy],script:{S1:[[ts,L+12,C-6],[tth,fx+6,fy+8],[tc+1.6,fx+5,fy+6]],WR1:[[ts,L-1,C-13],[ts+2.4,L+20,C-12.6],[tth+1,fx-1.5,fy],[tc,fx+.4,fy]],CB1:[[ts,L+6,C-13],[ts+2.4,L+21,C-13.4],[tth+.9,fx-1.4,fy-1.3],[tc,fx-.4,fy-1.1]],QB:[[ts,L-4.6,C],[ts+1.3,L-7,C],[tth+.6,L-6.8,C]]}});
  S.follow(tth,tth+30,null);S.camTo(tth,tc,{x:fx,y:fy+3,z:26});S.thr(tth,tc,[L-6.45,C,1.2],[fx+3,fy-.4,.3],5);S.thr(tc,tc+.6,[fx+3,fy-.4,.3],[fx+5,fy-1,0],.6,{tumble:true});S.sfx(tth,'swoosh');
  const grab=pill(S.L.wtop,fx-.8,fy-5.8,'✋ GRAB!',{size:1.3,bg:RED,sw:.22});S.pop(grab,tth+.9);S.hide(grab,tc+1.4);S.fall(O.WR1,tc-.1,.3);flagThrow(S,tc-.3,[fx+8,fy+18],[fx,fy+2.5],4);});
 S.beat('Flag! <b>Defensive pass interference</b>. The offense gets the ball <b>right where the foul happened</b>, plus a first down.',9,t0=>{penCard(S,t0,t0+8.6,'PASS INTERFERENCE','SPOT FOUL','Ball goes to where the foul happened + 1st down');S.fall(O.WR1,t0+.3,.3,0);
  S.camTo(t0+1,t0+2.4,{x:L+15,y:C,z:18});yardBracket(S,t0+2.6,L,fx,C+15,'+30 YARDS','#7ee081',5.6);});
 S.beat('That\'s why it\'s one of the biggest penalties in football. One grab can move the ball 30 or 40 yards!',7,t0=>{spotTo(S,O,D,los,t0+.5,fx,2.4);S.camTo(t0+.5,t0+2.6,{x:fx+4,y:C,z:20});});
 S.beat('Receivers can\'t push off defenders either. <b>Offensive pass interference</b> costs the offense <b>10 yards</b>.',7,t0=>{S.highlight(t0+.2,[...O.all,...D.all],[O.WR2,D.CB2]);S.move(O.WR2,t0+.5,t0+2.2,[[fx+5,C+12.8]]);S.move(D.CB2,t0+.5,t0+2,[[fx+5.6,C+12.4]]);S.move(D.CB2,t0+2.2,t0+2.6,[[fx+6.4,C+15]],Ease.out);S.thr(t0+1.2,t0+2.6,[fx-.8,C,.6],[fx+6,C+12.6,1.2],3);S.thr(t0+2.6,t0+3.2,[fx+6,C+12.6,1.2],[fx+8,C+12,0],.6,{tumble:true});S.sfx(t0+1.2,'swoosh');
  const ps=pill(S.L.wtop,fx+5.6,C+8.6,'🫸 PUSH!',{size:1.3,bg:BLUE,sw:.22});S.pop(ps,t0+2.2);S.hide(ps,t0+6.6);penCard(S,t0+2.8,t0+6.8,'OFFENSIVE PI','10 YARDS','Receiver pushed the defender');});
 S.beat('Tip: if both players are just going for the ball, that\'s fair. It\'s the grabbing and pushing that gets flagged.',7,t0=>{S.clearHi(t0,[...O.all,...D.all]);S.camTo(t0,t0+1,{x:fx+8});tipPill(S,t0+.3,t0+6.8,'BOTH PLAYING THE BALL = FAIR',640,620,TEAL);});
 S.ask({q:'A cornerback grabs a receiver\'s arm while the pass is in the air. What happens?',opts:['Pass interference','Nothing, that\'s legal','The defense gets the ball'],ans:0,why:'Grabbing the receiver before the ball arrives is <b>defensive pass interference</b>. The offense gets the ball where the foul happened, plus a first down.'});
}});

R({title:'Protecting the QB',build(S){
 const L=40,{O,D}=playSetup(S,L,22,-2);const los=S.lineObj('#3d8bff',null);los.x=L;los.op=1;setPlan(los,'x',L);setPlan(los,'op',1);
 S.beat('Quarterbacks get extra protection. While a quarterback is throwing, he\'s looking down the field and can\'t protect himself from a hit.',8);
 let ts,tth;
 S.beat('Watch. The pass is already gone, but a defender hits the quarterback anyway, hard and late…',7,t0=>{ts=t0+.5;tth=ts+2;snapTo(S,O,L,ts);
  simPlay(S,O,D,L,{type:'pass',clean:true,ts,tEnd:tth+3,tth,tc:tth+1.2,catchPt:[L+12,C-8],script:{WR3:[[ts,L-2,C-8.5],[tth+1.2,L+12,C-8]],QB:[[ts,L-4.6,C],[ts+1.3,L-7,C],[tth+3,L-7,C]],DL2:[[ts,L+1.1,C-1],[tth+.3,L-3.2,C-2.4],[tth+1.4,L-6.2,C-.6]]}});
  S.thr(tth,tth+1.2,[L-6.45,C,1.2],[L+12.5,C-8,1.2],3);S.give(tth+1.2,O.WR3);S.sfx(tth,'swoosh');
  const late=pill(S.L.wtop,L-7,C-6.5,'BALL\'S GONE!',{size:1.3,bg:NAVY,sw:.22});S.pop(late,tth+.4);S.hide(late,tth+1.6);
  S.fall(O.QB,tth+1.45,.35);S.sfx(tth+1.45,'thud');flagThrow(S,tth+1.6,[L-14,C-16],[L-7,C-3.5],4);});
 S.beat('That\'s <b>roughing the passer</b>: <b>15 yards</b> and an automatic first down.',6,t0=>{penCard(S,t0,t0+5.8,'ROUGHING THE PASSER','15 YARDS','…plus an automatic first down');});
 // timeline
 const tl=G(S.L.top,640,360);tl.setAttribute('opacity',0);E('rect',{x:-560,y:-290,width:1120,height:580,rx:28,fill:'#fff',stroke:NAVY,'stroke-width':6},tl);
 T(tl,0,-240,'HOW THE RULE GREW',{size:38,fill:NAVY});E('rect',{x:-470,y:-12,width:940,height:10,rx:5,fill:'#d4dae6'},tl);
 const evs=[['1938','Rule created','Stop rough hits after the throw',BLUE],['Over time','Head & neck','No hits to the head or neck',TEAL],['2009','Low hits','After Tom Brady\'s knee injury in 2008',GOLD],['2018','Body weight','No landing on the QB with full weight',RED]];
 const evG=evs.map(([yr,a,b,col],i)=>{const g=G(tl,-390+i*260,-7);E('circle',{r:22,fill:col,stroke:NAVY,'stroke-width':5},g);T(g,0,-62,yr,{size:32,fill:NAVY});
  const card=G(g,0,115);E('rect',{x:-122,y:-60,width:244,height:150,rx:18,fill:'#f6f8fc',stroke:NAVY,'stroke-width':4},card);T(card,0,-30,a,{size:27,fill:col===GOLD?'#a87600':col});fo(card,-112,-10,224,96,`<div style="font-size:20px;line-height:1.25;text-align:center">${b}</div>`);g.setAttribute('opacity',0);return g;});
 const tA=S.T;S.beat('This rule has grown a lot over the years.',3.5,t0=>{S.pop(tl,t0+.3);S.pop(evG[0],t0+.9);});
 S.beat('The NFL first made roughing the passer a penalty way back in <b>1938</b>, mainly to stop rough hits after the ball was thrown.',8,t0=>{S.track(t0+.2,t0+.9,(p,r)=>setS(evG[0],1+.15*Math.sin(Math.PI*r)),Ease.lin);});
 S.beat('Later, hits to the quarterback\'s <b>head and neck</b> were banned too.',4.5,t0=>{S.pop(evG[1],t0+.3);});
 S.beat('After star quarterback <b>Tom Brady</b> hurt his knee in 2008, the league cracked down on <b>low hits</b> at a quarterback\'s knees.',8,t0=>{S.pop(evG[2],t0+.3);});
 S.beat('And since <b>2018</b>, defenders can\'t land on the quarterback with their <b>full body weight</b> when they tackle him.',7,t0=>{S.pop(evG[3],t0+.3);});
 S.beat('Why so strict? Quarterbacks touch the ball on almost every play, and the league wants its stars healthy. Defenders can still <b>sack</b> the quarterback. They just have to do it the right way.',11);S.unpop(tl,S.T-.45);scrim(S,tA+.1,S.T-.1,.55);
 S.ask({q:'A defender hits the quarterback hard, well after the ball has been thrown. What is the penalty?',opts:['Roughing the passer','Holding','No penalty'],ans:0,why:'Late or dangerous hits on a quarterback are <b>roughing the passer</b>: 15 yards and an automatic first down.'});
}});

R({title:'Kickers & Face Masks',build(S){
 S.fieldInit();S.ringHolder=true;const Lp=40;S.camSet(Lp-8,C,22);
 const P=S.player({team:'blue',num:8,pos:'P',x:Lp-13,y:C});P.autoFace=true;const ln=[-6,-3,0,3,6].map((dy,i)=>S.player({team:'blue',num:60+i,pos:'',x:Lp-.8,y:C+dy}));
 const rs=[-7,-4,-1.5,1.5,4,7].map((dy,i)=>S.player({team:'red',num:90+i,pos:'',x:Lp+1.1,y:C+dy,face:-1}));const rusher=rs[3];rusher.autoFace=true;
 S.ballAt(0,Lp-.8,C,.15);
 S.beat('Kickers get extra protection too. While a kicker or punter has his leg up in the air, he can\'t defend himself.',7,t0=>{S.highlight(t0+.8,[P,...ln,...rs],[P]);});
 S.beat('If a defender crashes into the kicker, that\'s <b>roughing the kicker</b>: <b>15 yards</b> and an automatic first down.',8,t0=>{const ts=t0+.6;S.clearHi(t0+.2,[P,...ln,...rs]);
  S.thr(ts,ts+.5,[Lp-.8,C,.6],[Lp-12.6,C,1.2],.4);S.give(ts+.5,P);S.sfx(ts,'thud');S.move(rusher,ts,ts+1.9,[[Lp-4,C+1],[Lp-11.6,C+.3]],Ease.in);
  S.thr(ts+1.3,ts+3.6,[Lp-12.3,C,1.2],[Lp+38,C+4,0],16,{spins:9});S.sfx(ts+1.3,'kick');S.fall(P,ts+1.95,.35);S.fall(rusher,ts+1.95,.35);S.sfx(ts+1.95,'thud');
  flagThrow(S,ts+2.2,[Lp-24,C-16],[Lp-12,C-4],4);S.highlight(ts+2,[P,...ln,...rs],[P,rusher]);
  penCard(S,ts+3,t0+7.8,'ROUGHING THE KICKER','15 YARDS','…plus an automatic first down');});
 S.beat('If a defender only bumps him lightly, it\'s a smaller foul called <b>running into the kicker</b>: just 5 yards.',8,t0=>{S.wipe(t0);const tw=t0+.4;S.fall(P,tw,.2,0);S.fall(rusher,tw,.2,0);S.place(P,tw,Lp-13,C);S.place(rusher,tw,Lp+1.1,C+1.5);S.ballAt(tw,Lp-.8,C,.15);S.clearHi(tw,[P,...ln,...rs]);
  const ts=tw+.8;S.thr(ts,ts+.5,[Lp-.8,C,.6],[Lp-12.6,C,1.2],.4);S.give(ts+.5,P);S.move(rusher,ts,ts+1.9,[[Lp-4,C+1.5],[Lp-11.8,C+1.2]],Ease.in);S.thr(ts+1.3,ts+3.6,[Lp-12.3,C,1.2],[Lp+38,C+4,0],16,{spins:9});S.sfx(ts+1.3,'kick');
  S.move(P,ts+1.9,ts+2.3,[[Lp-13.4,C-.6]],Ease.out);S.move(rusher,ts+1.9,ts+2.6,[[Lp-13,C+2.4]],Ease.out);const bp=pill(S.L.wtop,Lp-13,C-5.5,'just a bump',{size:1.3,bg:NAVY,sw:.22});S.pop(bp,ts+2);S.hide(bp,ts+5);
  flagThrow(S,ts+2.4,[Lp-24,C-16],[Lp-9,C-4],4);penCard(S,ts+3,t0+7.8,'RUNNING INTO THE KICKER','5 YARDS','A lighter bump');});
 // face mask
 const hm=G(S.L.top,640,380);hm.setAttribute('opacity',0);E('rect',{x:-640,y:-380,width:1280,height:720,fill:'#bfe8ff'},hm);
 const hel=G(hm,-60,20);
 E('path',{d:'M-200,90 C-230,-90 -110,-215 40,-210 C175,-205 245,-110 240,0 L240,40 L150,40 L150,150 L-150,150 C-185,140 -200,120 -200,90 Z',fill:BLUE,stroke:NAVY,'stroke-width':10,'stroke-linejoin':'round'},hel);
 E('path',{d:'M-170,-60 C-120,-170 0,-200 120,-170',stroke:'#fff','stroke-width':26,fill:'none','stroke-linecap':'round'},hel);
 E('ellipse',{cx:-60,cy:40,rx:40,ry:46,fill:'#18306e'},hel);E('ellipse',{cx:-60,cy:40,rx:18,ry:22,fill:'#0c1a3f'},hel);
 E('path',{d:'M120,-40 L235,-40 L235,150 L120,150 Z',fill:'#ffd9b0',stroke:NAVY,'stroke-width':7},hel);E('circle',{cx:200,cy:5,r:9,fill:NAVY},hel);E('path',{d:'M180,80 Q205,95 228,80',stroke:NAVY,'stroke-width':6,fill:'none','stroke-linecap':'round'},hel);
 E('path',{d:'M110,-55 L160,-55',stroke:NAVY,'stroke-width':16,'stroke-linecap':'round'},hel);
 const mask=G(hel,0,0);const mp='M150,-10 C230,-10 290,-10 300,10 L300,140 C290,165 230,165 150,165 M150,55 C230,55 280,55 300,60 M150,110 C230,110 280,110 300,105 M300,10 L300,140';
 E('path',{d:mp,stroke:NAVY,'stroke-width':24,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'},mask);const mk=E('path',{d:mp,stroke:'#e3e7ee','stroke-width':14,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'},mask);
 const mlab=pill(hm,360,-150,'FACE MASK',{size:34,bg:RED,sw:5});const mar=E('path',{d:'M330,-122 L262,-30',stroke:NAVY,'stroke-width':8,'stroke-linecap':'round'},hm);mar.setAttribute('opacity',0);mlab.setAttribute('opacity',0);
 const hand=G(hm,420,100);E('circle',{r:44,fill:'#ffd9b0',stroke:NAVY,'stroke-width':7},hand);E('rect',{x:20,y:-20,width:160,height:46,rx:22,fill:RED,stroke:NAVY,'stroke-width':7},hand);hand.setAttribute('opacity',0);
 S.beat('One more big one: the <b>face mask</b>. That\'s the metal cage on the front of the helmet.',6.5,t0=>{S.show(hm,t0+.2,t0+.7);S.pop(mlab,t0+1.6);S.show(mar,t0+1.8,t0+2.2);S.track(t0+1.6,t0+6,(p,r,tt)=>mk.setAttribute('stroke',r>0&&r<1&&Math.sin(tt*8)>0?GOLD:'#e3e7ee'),Ease.lin);});
 S.beat('Grabbing it and <b>pulling or twisting</b> it can hurt a player\'s neck, so it\'s a <b>15-yard</b> penalty.',7,t0=>{S.show(hand,t0+.5,t0+.9);S.track(t0+1,t0+3.4,(p,r,tt)=>{const w=Math.sin(r*Math.PI*3)*14;hel.setAttribute('transform',`translate(-60,20) rotate(${w})`);hand.setAttribute('transform',`translate(${420-r*150},${100+w*2})`);},Ease.lin);
  S.sfx(t0+1,'wrong');penCard(S,t0+3.6,t0+6.8,'FACE MASK','15 YARDS','Never grab the cage!');});
 S.beat('Tip: tacklers can grab jerseys and shoulder pads, but <b>never the face mask</b>.',5.5,t0=>{S.hide(hand,t0,t0+.4);topTip(S,t0+.4,t0+5.3,'FACE MASK = HANDS OFF!',640,640,TEAL);S.hide(hm,t0+5,t0+5.5);});
 S.ask({q:'A defender grabs the ball carrier\'s face mask and twists it. What happens?',opts:['A 15-yard face mask penalty','Nothing, it\'s a legal tackle','The play starts over, no penalty'],ans:0,why:'Grabbing and twisting the <b>face mask</b> is dangerous for the neck, so it\'s a 15-yard penalty.'});
}});

R({title:'Rules Quiz',quiz:true,build(S){rays(S,'#ffe066','#ffd23f',360);S.beat('Rules quiz time! Five quick questions. No tricks.',3);}});
COURSES.rules.quiz=[
 ['Most penalties are worth how many yards?',['5, 10 or 15 yards','50 yards','1 yard'],0,'Penalties are usually <b>5, 10 or 15 yards</b>, depending on how serious they are.'],
 ['An offensive lineman moves before the snap. What is it called?',['A false start','Pass interference','A touchback'],0,'Moving early on offense is a <b>false start</b>: 5 yards.'],
 ['Which of these is a catch in the NFL?',['Control, two feet in bounds, and a football move','Touching the ball with one hand while running','Catching it with both feet out of bounds'],0,'A catch needs <b>control</b>, <b>two feet</b> (or another body part) in bounds, and a <b>football move</b>.'],
 ['A blocker grabs a defender\'s jersey to stop him. What is that?',['Holding','Offside','A safety'],0,'Grabbing to block is <b>holding</b>. On offense it costs 10 yards.'],
 ['Why are quarterbacks and kickers specially protected?',['They can\'t defend themselves while throwing or kicking','They are the smallest players on the field','They play on both offense and defense'],0,'While throwing or kicking, they\'re <b>defenseless</b>, so hits on them are penalized more strictly.']];

/* =========================================================
   FOOTBALL SMARTS
   ========================================================= */
// helper: formation positions for an offense (relative to L, dir 1)
function shape(S,O,L,t0,t1,map){for(const [k,dx,dy] of map){const a=O[k];if(a)S.move(a,t0,t1,[[L+dx,C+dy]]);}}
M({title:'Offensive Formations',build(S){
 const L=45;S.fieldInit();S.ringHolder=true;S.camSet(L-3,C,19);const O=offense(S,L,'blue',1,{showLabel:1});O.all.forEach(a=>a.autoFace=true);S.give(0,O.C);
 const FB=S.player({team:'blue',num:44,pos:'FB',x:L-4.6,y:C,showLabel:1,op:0});
 const title=pill(S.L.ui,640,640,'',{size:30,bg:NAVY,sw:5});title.setAttribute('opacity',0);
 const nameAt=(t,txt)=>{S.track(t,t+.4,(p,r)=>{title.setText(txt);title.setAttribute('opacity',r>0?1:0);setS(title,1+.15*Math.sin(Math.PI*r));},Ease.lin);S.sfx(t,'pop');};
 S.beat('A <b>formation</b> is how the offense lines up before the snap. Different formations help with different kinds of plays.',7);
 S.beat('<b>Under center</b>: the quarterback stands right behind the center and takes the ball straight from his hands. It\'s great for quick handoffs.',9,t0=>{nameAt(t0+.3,'UNDER CENTER');shape(S,O,L,t0+.5,t0+1.8,[['QB',-1.4,0],['RB',-6.5,0]]);S.highlight(t0+1.8,O.all,[O.QB,O.C]);});
 S.beat('<b>Shotgun</b>: the quarterback stands about <b>5 yards back</b>. He gets more time to see the field, so it\'s great for passing.',8.5,t0=>{nameAt(t0+.3,'SHOTGUN');S.clearHi(t0,O.all);shape(S,O,L,t0+.5,t0+1.8,[['QB',-5.2,0],['RB',-5.2,2.2]]);S.highlight(t0+1.8,O.all,[O.QB]);
  const yb=S.bracketObj({y:C+4.5,text:'5 YARDS',color:GOLD});yb.x1=L;yb.x2=L;setPlan(yb,'x2',L);S.tw(yb,t0+2,t0+2.1,{op:1});S.tw(yb,t0+2,t0+3,{x2:L-5.2});S.tw(yb,t0+7.6,t0+8,{op:0});});
 S.beat('The <b>I-formation</b> puts a fullback and a running back one behind the other, straight behind the quarterback. From behind the offense, they look like the letter I. It\'s built for <b>power running</b>.',11,t0=>{nameAt(t0+.3,'I-FORMATION');S.clearHi(t0,O.all);S.set(t0+.5,()=>{});S.tw(FB,t0+.5,t0+1,{op:1});
  shape(S,O,L,t0+.5,t0+1.8,[['QB',-1.4,0],['RB',-7.6,0],['WR3',.9,-17]]);S.move(FB,t0+.5,t0+1.8,[[L-4.6,C]]);S.highlight(t0+1.8,[...O.all,FB],[O.QB,FB,O.RB]);
  const il=E('rect',{x:L-8.6,y:C-.18,width:7.6,height:.36,fill:GOLD,opacity:0},S.wfx);S.attr(il,t0+2.2,t0+2.6,'opacity',0,.9);S.attr(il,t0+10.3,t0+10.7,'opacity',.9,0);const ig=pill(S.L.wtop,L-12,C,'I',{size:3,bg:GOLD,fg:NAVY,sw:.3});ig.setAttribute('opacity',0);S.set(t0,()=>{});S.pop(ig,t0+4.5);S.hide(ig,t0+10.3);});
 S.beat('And a <b>spread</b> formation sends lots of receivers out wide, to stretch the defense thin.',7,t0=>{nameAt(t0+.3,'SPREAD');S.clearHi(t0,[...O.all,FB]);S.tw(FB,t0+.3,t0+.8,{op:0});S.camTo(t0+.3,t0+1.6,{z:16,x:L-2,y:C+1});
  shape(S,O,L,t0+.5,t0+2,[['QB',-5.2,0],['RB',-5.2,2.2],['TE',-1,9],['WR1',-1,-17],['WR2',-1,17],['WR3',-1,-11.5]]);S.highlight(t0+2,O.all,[O.WR1,O.WR2,O.WR3,O.TE]);});
 S.beat('Tip: the formation can give away the plan. Bunched up close often means a run. Spread out wide often means a pass.',8,t0=>{S.clearHi(t0,O.all);S.hide(title,t0,t0+.4);tipPill(S,t0+.4,t0+7.8,'BUNCHED = RUN  ·  SPREAD = PASS',640,640,TEAL);});
 S.ask({q:'In the shotgun formation, where does the quarterback stand?',opts:['About 5 yards behind the center','Right behind the center','Out wide by the sideline'],ans:0,why:'In the <b>shotgun</b>, the quarterback stands about 5 yards back so he can see the field.'});
}});

M({title:'Defensive Fronts',build(S){
 const L=45;S.fieldInit();S.ringHolder=false;S.camSet(L+4,C,19);const O=offense(S,L,'blue',1);O.all.forEach(a=>{a.op=.25;});S.give(0,O.C);S.ballGlow=false;
 const D=defense(S,L,'red',1,{showLabel:1});
 const NB=S.player({team:'red',num:23,pos:'CB',x:L+5,y:C-9,showLabel:1,op:0});
 const title=pill(S.L.ui,640,640,'',{size:30,bg:RED,sw:5});title.setAttribute('opacity',0);
 const nameAt=(t,txt)=>{S.track(t,t+.4,(p,r)=>{title.setText(txt);title.setAttribute('opacity',r>0?1:0);setS(title,1+.15*Math.sin(Math.PI*r));},Ease.lin);S.sfx(t,'pop');};
 S.beat('The <b class=rd>defense</b> picks a formation too, based on what it expects the offense to do.',6);
 S.beat('A <b>4-3</b> defense has <b>4</b> defensive linemen and <b>3</b> linebackers. It\'s a solid, balanced setup.',7,t0=>{nameAt(t0+.3,'4-3 DEFENSE');S.highlight(t0+.6,D.all,[...D.DL,...D.LB]);});
 S.beat('A <b>3-4</b> has <b>3</b> linemen and <b>4</b> linebackers. That extra linebacker can rush the quarterback or drop back to cover, which keeps the offense guessing.',10,t0=>{nameAt(t0+.3,'3-4 DEFENSE');
  S.move(D.DL1,t0+.6,t0+1.8,[[L+5,C-7.5]]);S.move(D.DL2,t0+.6,t0+1.8,[[L+1.1,C-2.4]]);S.move(D.DL3,t0+.6,t0+1.8,[[L+1.1,C]]);S.move(D.DL4,t0+.6,t0+1.8,[[L+1.1,C+2.4]]);S.move(D.LB1,t0+.6,t0+1.8,[[L+5,C-2.6]]);S.move(D.LB2,t0+.6,t0+1.8,[[L+5,C+2.6]]);S.move(D.LB3,t0+.6,t0+1.8,[[L+5,C+7.5]]);
  S.set(t0+1.8,()=>{D.DL1.pos='LB';D.DL1.el.label.setText('LB');});});
 S.beat('Against lots of receivers, the defense switches to <b>nickel</b>: a linebacker leaves, and a fifth defensive back comes in to cover. A nickel is worth 5 cents, and nickel has <b>5</b> defensive backs!',12,t0=>{nameAt(t0+.3,'NICKEL');
  S.tw(D.LB3,t0+.6,t0+1.2,{op:0});S.tw(NB,t0+.8,t0+1.4,{op:1});S.move(NB,t0+.8,t0+2,[[L+5.5,C+8.5]]);S.highlight(t0+2,[...D.all,NB],[...D.CB,...D.S,NB]);});
 S.beat('And when the defense sends extra players charging at the quarterback, that\'s called a <b>blitz</b>. It\'s risky: fewer players are left to cover.',9,t0=>{nameAt(t0+.3,'BLITZ!');S.clearHi(t0,[...D.all,NB]);
  for(const a of [D.LB1,D.LB2])S.move(a,t0+1.2,t0+2.6,[[L-3,planOf(a,'y')+(planOf(a,'y')<C?1.5:-1.5)]],Ease.in);for(const a of D.DL)S.nudge(a,t0+1.2,t0+2.4,-2.2);S.sfx(t0+1.2,'swoosh');
  const b=pill(S.L.wtop,L+1,C-8,'EXTRA RUSHERS',{size:1.6,bg:RED,sw:.22});S.pop(b,t0+2.4);S.hide(b,t0+8.4);});
 S.ask({q:'Why would a defense switch to nickel?',opts:['To cover extra receivers','To kick a field goal','To protect the quarterback'],ans:0,why:'<b>Nickel</b> adds a fifth defensive back to help cover lots of receivers.'});
}});

M({title:'Motion',build(S){
 const L=45;S.fieldInit();S.ringHolder=true;S.camSet(L+5,C,17);const O=offense(S,L,'blue',1);const D=defense(S,L,'red',1);[...O.all,...D.all].forEach(a=>a.autoFace=true);S.give(0,O.C);
 const NB=D.LB1;const mv=O.WR3;
 S.beat('Before the snap, <b>one</b> offensive player is allowed to run sideways or backward. That\'s called <b>motion</b>.',7,t0=>{S.highlight(t0+1,[...O.all,...D.all],[mv]);S.move(mv,t0+1.6,t0+4,[[L-5,C-6],[L-5,C+4]],Ease.inOut);});
 S.beat('He can\'t be heading toward the line when the ball is snapped, and only one player can be moving at a time.',7,t0=>{tipPill(S,t0+.5,t0+6.8,'MOTION = one player, sideways or back',640,640,NAVY);S.move(mv,t0+.4,t0+2.6,[[L-5,C-6],[L-2,C-8.5]]);});
 S.beat('Motion is like a little spy trick. Watch how the defense reacts…',5,t0=>{S.highlight(t0+.4,[...O.all,...D.all],[mv,D.CB1]);S.move(D.CB1,t0+.4,t0+1.2,[[L+6.5,C-8.5]]);});
 S.beat('The receiver runs across the field, and one defender <b>follows him the whole way</b>…',6.5,t0=>{S.move(mv,t0+.4,t0+4,[[L-5,C-6],[L-5,C+7],[L-2,C+10]],Ease.inOut);S.move(D.CB1,t0+.6,t0+4.2,[[L+6.5,C+10]],Ease.inOut);
  const tr=E('path',{d:`M${L+6.5},${C-8.5} L${L+6.5},${C+10}`,stroke:RED,'stroke-width':.35,'stroke-dasharray':'.9 .6',fill:'none',opacity:0},S.wfx);S.attr(tr,t0+1,t0+1.5,'opacity',0,.9);S.attr(tr,t0+12,t0+12.5,'opacity',.9,0);});
 S.beat('That\'s a big clue the defense is playing <b>man coverage</b>: each defender sticks to one player, like a shadow.',8,t0=>{const m=pill(S.L.ui,640,120,'FOLLOWED HIM → MAN COVERAGE',{size:30,bg:RED,sw:5});S.pop(m,t0+.3);S.hide(m,t0+7.6);});
 S.beat('Now the same motion against a different defense. This time, nobody follows him. The defenders just shift a little and <b>stay in their areas</b>.',9,t0=>{S.wipe(t0);const tw=t0+.4;
  S.place(mv,tw,L-2,C-8.5);S.place(D.CB1,tw,L+6,C-13);S.clearHi(tw,[...O.all,...D.all]);S.highlight(tw+.3,[...O.all,...D.all],[mv]);
  S.move(mv,tw+1,tw+4.4,[[L-5,C-6],[L-5,C+7],[L-2,C+10]],Ease.inOut);S.highlight(tw+1.4,[...O.all,...D.all],[mv,...D.LB,...D.S,...D.CB]);for(const a of [D.LB1,D.LB2,D.LB3,D.S1,D.S2])S.nudge(a,tw+1.6,tw+3.4,0,2);});
 const zones=[[L+3,C-17,9,10.6,BLUE],[L+3,C-6.2,9,12.4,TEAL],[L+3,C+6.4,9,10.6,GOLD],[L+12.5,C-17,10,17.2,'#ff8fd1'],[L+12.5,C+.4,10,16.6,'#b48cff']].map(([x,y,w,h,c])=>{const r=E('rect',{x,y,width:w,height:h,rx:1,fill:c,opacity:0,stroke:NAVY,'stroke-width':.15},S.wfx);return r;});
 S.beat('That\'s probably <b>zone coverage</b>: each defender guards an <b>area</b> of the field instead of one player.',8,t0=>{zones.forEach((z,i)=>{S.attr(z,t0+.4+i*.25,t0+.8+i*.25,'opacity',0,.28);S.attr(z,t0+7.4,t0+7.9,'opacity',.28,0);});
  const m=pill(S.L.ui,640,640,'STAYED PUT → ZONE COVERAGE',{size:30,bg:BLUE,sw:5});S.pop(m,t0+.3);S.hide(m,t0+7.6);});
 S.beat('Knowing man or zone helps the quarterback decide where to throw. Motion can also give a receiver a <b>running start</b> when the ball is snapped.',9);
 S.ask({q:'During motion, a defender follows the receiver all the way across the field. What does that suggest?',opts:['👥 Man coverage','🗺️ Zone coverage','🏃 A blitz is impossible'],ans:0,why:'A defender sticking to one player is a clue for <b>man coverage</b>.'});
}});

M({title:'Reading the Defense',build(S){
 const L=45,{O,D}=playSetup(S,L,17,1);const los=S.lineObj('#3d8bff',null);los.x=L;los.op=1;setPlan(los,'x',L);setPlan(los,'op',1);
 const eye=E('g',{opacity:0},S.wfx2);
 S.beat('Before every snap, the quarterback <b>reads the defense</b>, checking where every defender is standing.',7,t0=>{S.place(O.QB,t0,L-5.2,C);S.place(O.RB,t0,L-5.2,C+2.2);
  const sc=E('path',{d:'',fill:'rgba(255,240,90,.25)',stroke:GOLD,'stroke-width':.2,opacity:0},S.wfx);S.track(t0+1,t0+6.8,(p,r,tt)=>{const a=Math.sin((tt-t0)*1.4)*.7;const x0=L-5.2,y0=C;const r2=26;sc.setAttribute('d',`M${x0},${y0} L${x0+r2*Math.cos(a-.22)},${y0+r2*Math.sin(a-.22)} L${x0+r2*Math.cos(a+.22)},${y0+r2*Math.sin(a+.22)} Z`);sc.setAttribute('opacity',r>0&&r<1?1:0);},Ease.lin);});
 S.beat('If he sees a problem, he can change the play right at the line. That\'s called an <b>audible</b>.',6.5,t0=>{const b=pill(S.L.ui,0,0,'🗣️ "OMAHA! OMAHA!"',{size:26,bg:'#fff',fg:NAVY,sw:4});b.setAttribute('opacity',0);S.track(t0+.5,t0+6.3,(p,r)=>{const [x,y]=S.toScreen(O.QB.x,O.QB.y);setPos(b,x,y-110,1);b.setAttribute('opacity',r>0&&r<1?1:0);},Ease.lin);
  S.track(t0+1,t0+4,(p,r,tt)=>{O.QB.hop=Math.abs(Math.sin((tt-t0)*7))*6;},Ease.lin);});
 S.beat('<b>Peyton Manning</b> was famous for this. He\'d point, wave his arms and shout code words like "Omaha!" to change plays at the line.',9);
 let ts;
 S.beat('For example, if he spots a <b>blitz</b> coming, he can switch to a quick pass and throw it before the rushers arrive.',8,t0=>{
  S.move(D.LB2,t0+.4,t0+1.4,[[L+2.2,C+.8]]);S.move(D.LB1,t0+.4,t0+1.4,[[L+2.2,C-3.5]]);const bz=pill(S.L.wtop,L+3,C-8,'BLITZ COMING!',{size:1.3,bg:RED,sw:.22});S.pop(bz,t0+1.5);S.hide(bz,t0+3.6);
  ts=t0+5;const tth=ts+1.0,tc=tth+.6;S.thr(ts,ts+.4,[L-.8,C,.6],[L-4.9,C,1.2],.6);S.give(ts+.4,O.QB);S.sfx(ts,'thud');
  simPlay(S,O,D,L,{type:'pass',clean:true,ts,tEnd:tc+2.2,tth,tc,tt:tc+1.8,carrier:'WR3',catchPt:[L+5,C-7.5],script:{WR3:[[ts,L-2,C-8.5],[tc,L+5,C-7.5],[tc+1.8,L+12,C-6]],QB:[[ts,L-5.2,C],[tth+.5,L-5.6,C]],LB2:[[ts,L+2.2,C+.8],[tc,L-4,C+.4],[tc+2,L-4.4,C+.4]],LB1:[[ts,L+2.2,C-3.5],[tc,L-4,C-2],[tc+2,L-4.4,C-2]],DL1:[[ts,L+1.1,C-3],[tc,L-1.6,C-3.4],[tc+2,L-1.8,C-3.4]],DL2:[[ts,L+1.1,C-1],[tc,L-1.4,C-1.2],[tc+2,L-1.6,C-1.2]],DL3:[[ts,L+1.1,C+1],[tc,L-1.4,C+1.2],[tc+2,L-1.6,C+1.2]],DL4:[[ts,L+1.1,C+3],[tc,L-1.6,C+3.4],[tc+2,L-1.8,C+3.4]]},meet:[{a:'S1',t:tc+1.8,x:L+12.6,y:C-5.8}]});
  S.thr(tth,tc,[L-5,C,1.2],[L+5.5,C-7.5,1.2],1.4);S.give(tc,O.WR3);S.sfx(tth,'swoosh');S.fall(O.WR3,tc+1.8,.35);S.fall(D.S1,tc+1.8,.35);S.sfx(tc+1.8,'thud');});
 S.beat('The rushers arrive a moment too late, and the receiver picks up <b>12 easy yards</b>!',5.5,t0=>{yardBracket(S,t0+1.6,L,L+12,C+14,'+12 YARDS','#7ee081',3.6);});
 S.ask({q:'What is an "audible"?',opts:['🗣️ Changing the play at the line of scrimmage','📣 A really loud crowd','⏱️ A kind of timeout'],ans:0,why:'An <b>audible</b> is when the quarterback changes the play right at the line, after reading the defense.'});
}});

M({title:'Game Strategy',build(S){
 const L=40,{O,D}=playSetup(S,L,17,4);const los=S.lineObj('#3d8bff',null);los.x=L;los.op=1;setPlan(los,'x',L);setPlan(los,'op',1);
 S.beat('Coaches mix runs and passes so the defense can never be sure what\'s coming.',6);
 S.beat('When a team runs the ball well, defenders start creeping closer to the line to stop the run.',7,t0=>{for(const a of [...D.LB,...D.S])S.nudge(a,t0+1,t0+3,-2.4);S.highlight(t0+1,[...O.all,...D.all],[...D.LB,...D.S]);
  const p=pill(S.L.wtop,L+6,C-11,'CREEPING CLOSER',{size:1.3,bg:RED,sw:.22});S.pop(p,t0+2);S.hide(p,t0+6.6);});
 const KR=S.player({team:'red',num:84,pos:'',x:104,y:C+2,op:0}),cov=[0,1,2,3].map(i=>S.player({team:'blue',num:40+i,pos:'',x:80,y:C-6+i*4,op:0}));
 let ts,th;
 S.beat('That sets up <b>play-action</b>. The quarterback <b>fakes</b> a handoff, and the linebackers jump toward the runner…',7,t0=>{S.clearHi(t0,[...O.all,...D.all]);ts=t0+.8;th=ts+1.1;snapTo(S,O,L,ts);
  const fk=pill(S.L.wtop,L-3,C-5.4,'FAKE!',{size:1.3,bg:GOLD,fg:NAVY,sw:.22});S.pop(fk,th+.1);S.hide(fk,th+2.4);S.highlight(th+.4,[...O.all,...D.all],[O.RB,O.QB,...D.LB]);});
 S.beat('…and the quarterback throws right over their heads to a wide-open receiver!',6,t0=>{const tth=t0+.5,tc=tth+1.1;
  simPlay(S,O,D,L,{type:'pass',clean:true,ts,tEnd:tc+2.6,tth,tc,tt:tc+2.2,carrier:'TE',catchPt:[L+13,C+3],
   script:{RB:[[ts,L-4.6,C-2.4],[th,L-4.3,C-.5],[th+1.2,L-.4,C+1.5],[tc+1,L+.5,C+2.5]],QB:[[ts,L-4.6,C],[th+.1,L-4.6,C-.4],[th+.9,L-7.4,C-.6],[tc,L-7.2,C]],
   LB1:[[ts,L+5,C-4.5],[th+.9,L+1.6,C-1.2]],LB2:[[ts,L+5,C],[th+.9,L+1.4,C+1]],LB3:[[ts,L+5,C+4.5],[th+.9,L+2,C+3]],TE:[[ts,L-1,C+5.9],[th+.9,L+3,C+6.4],[tc,L+13,C+3],[tc+2.2,L+21,C+1]]},meet:[{a:'S2',t:tc+2.2,x:L+21.6,y:C+1.4}]});
  S.clearHi(tth,[...O.all,...D.all]);S.highlight(tth,[...O.all,...D.all],[O.TE,O.QB]);S.thr(tth,tc,[L-6.9,C,1.2],[L+13.5,C+3,1.2],3.6);S.give(tc,O.TE);S.sfx(tth,'swoosh');S.fall(O.TE,tc+2.2,.35);S.fall(D.S2,tc+2.2,.35);S.sfx(tc+2.2,'thud');S.clearHi(tc+2.4,[...O.all,...D.all]);});
 S.beat('Teams also play for <b>field position</b>. Even when they can\'t score, they can punt and pin the other team deep, near its own end zone. That makes the next drive much harder.',11,t0=>{
  S.wipe(t0);const tw=t0+.4;S.fall(O.TE,tw,.2,0);S.fall(D.S2,tw,.2,0);for(const a of [...O.all,...D.all])S.place(a,tw,-40,C);S.ballAt(tw,L+21,C,.2);
  S.follow(tw,tw+60,null);S.camTo(tw,tw+.01,{x:L+24,y:C},Ease.lin);S.camTo(tw+1.2,tw+4.4,{x:96});S.thr(tw+1,tw+4.2,[L+21,C,.4],[104,C+2,1.2],22,{spins:10});S.sfx(tw+1,'kick');S.give(tw+4.2,KR);S.sfx(tw+4.2,'pop');
  for(const a of [KR,...cov])S.tw(a,tw,tw+.4,{op:1});S.move(KR,tw+4.2,tw+5,[[101.5,C+2.4]]);
  cov.forEach((a,i)=>S.move(a,tw+1,tw+5,[[100.6-(i%2)*1.6,C-1.5+i*1.6]],Ease.in));S.fall(KR,tw+5,.35);S.sfx(tw+5,'thud');S.sfx(tw+5.3,'whistle');
  const pp=pill(S.L.wtop,101,C-9,'PINNED DEEP!',{size:1.6,bg:RED,sw:.25});S.pop(pp,tw+4.6);
  const p=pill(S.L.ui,640,630,'FIELD POSITION = where your drive starts',{size:26,bg:TEAL,sw:4});S.pop(p,t0+.8);S.hide(p,t0+10.6);});
 S.beat('Football is a bit like chess. Every play is a move, and good teams use each one to set up the next.',7,t0=>{tipPill(S,t0+.5,t0+6.8,'FOOTBALL = CHESS ON GRASS',640,630,NAVY);});
 S.ask({q:'What is play-action?',opts:['🎭 Faking a handoff, then passing','🏃 Running out of bounds on purpose','🦶 Kicking the ball short and high'],ans:0,why:'In <b>play-action</b>, the quarterback fakes a handoff to fool the defense, then throws.'});
}});

M({title:'Legends of the Game',build(S){
 rays(S,'#1d2b53','#24346a',360);
 const card=(i,name,era,pos,stat,col,num)=>{const g=G(S.L.ui,640,360);g.setAttribute('opacity',0);
  E('rect',{x:-470+8,y:-250+8,width:940,height:500,rx:30,fill:'#0f1838'},g);E('rect',{x:-470,y:-250,width:940,height:500,rx:30,fill:'#fff',stroke:NAVY,'stroke-width':6},g);
  const badge=G(g,-290,-10);E('circle',{r:150,fill:col,stroke:NAVY,'stroke-width':7},badge);const pl=drawPlayer(badge,col===RED?'red':'blue',num,1);pl.g.setAttribute('transform','translate(0,95) scale(3.1)');
  T(badge,0,-190,'⭐ ⭐ ⭐',{size:30,fill:GOLD});
  T(g,170,-160,name,{size:56,fill:NAVY});T(g,170,-104,`${pos}  ·  ${era}`,{size:24,fill:'#5b6684',cls:'fb'});
  fo(g,-60,-60,470,280,`<div style="font-size:27px;line-height:1.35;text-align:left">${stat}</div>`);return g;};
 let lt;S.beat('Some players were so good that they <b>changed how football is played</b>. Here are a few legends.',6.5,t0=>{lt=pill(S.L.ui,640,360,'⭐ LEGENDS OF THE GAME ⭐',{size:54,bg:GOLD,fg:NAVY,sw:6});S.pop(lt,t0+.4);});S.unpop(lt,S.T-.35);
 const L1=card(0,'Jim Brown','1957–1965','Running back','Led the league in rushing in <b>8 of his 9</b> seasons. He showed how one unstoppable runner could carry an entire offense.',BLUE,32);
 S.beat('<b>Jim Brown</b> was a running back in the 1950s and 60s. He led the league in rushing in <b>8 of his 9 seasons</b>, and showed how one great runner could carry an entire offense.',11,t0=>{S.pop(L1,t0+.2);S.sfx(t0+.2,'ding');});S.unpop(L1,S.T-.35);
 const L2=card(1,'Lawrence Taylor','1981–1993','Linebacker','Rushed the quarterback with amazing speed. Teams needed a great <b>left tackle</b> to slow him down, making it one of football\'s most valued positions.',RED,56);
 S.beat('<b>Lawrence Taylor</b> was a linebacker who chased quarterbacks with amazing speed. Teams needed a great <b>left tackle</b> just to slow him down, and it became one of the most valued positions in football.',11,t0=>{S.pop(L2,t0+.2);S.sfx(t0+.2,'ding');});S.unpop(L2,S.T-.35);
 const L3=card(2,'Jerry Rice','1985–2004','Wide receiver','Holds the NFL records for the most <b>receiving yards</b> and the most <b>receiving touchdowns</b> ever.',RED,80);
 S.beat('<b>Jerry Rice</b> holds the NFL records for the most receiving yards and the most receiving touchdowns ever. He showed how dangerous a great receiver could be.',10,t0=>{S.pop(L3,t0+.2);S.sfx(t0+.2,'ding');});S.unpop(L3,S.T-.35);
 const L4=card(3,'Peyton Manning','1998–2015','Quarterback','Turned the seconds before the snap into a weapon: reading the defense and changing plays at the line.',BLUE,18);
 S.beat('<b>Peyton Manning</b> turned the seconds before the snap into a weapon, reading the defense and changing plays right at the line.',8.5,t0=>{S.pop(L4,t0+.2);S.sfx(t0+.2,'ding');});S.unpop(L4,S.T-.35);
 const L5=card(4,'Tom Brady','2000–2022','Quarterback','Won <b>7 Super Bowls</b>, more than any other player in NFL history.',BLUE,12);
 S.beat('And <b>Tom Brady</b> won <b>7 Super Bowls</b>, more than any other player in NFL history.',7,t0=>{S.pop(L5,t0+.2);S.sfx(t0+.2,'cheer');S.confetti(t0+.6,{y:200});});S.unpop(L5,S.T-.35);
 S.ask({q:'Which legend\'s pass rushing made the left tackle one of the most important positions?',opts:['Lawrence Taylor','Jerry Rice','Jim Brown'],ans:0,why:'<b>Lawrence Taylor</b> was so fast off the edge that teams started valuing the left tackle, who protects the quarterback\'s blind side.'});
}});

M({title:'Smarts Quiz',quiz:true,build(S){rays(S,'#bfe3ff','#a6d6ff',360);S.beat('Smarts quiz time! Five quick questions. No tricks.',3);}});
COURSES.smarts.quiz=[
 ['Which formation puts the quarterback about 5 yards behind the center?',['Shotgun','Under center','I-formation'],0,'In the <b>shotgun</b>, the quarterback stands about 5 yards back.'],
 ['What does a 4-3 defense have?',['4 linemen and 3 linebackers','4 quarterbacks and 3 kickers','4 safeties and 3 cornerbacks'],0,'A <b>4-3</b> has 4 defensive linemen and 3 linebackers.'],
 ['What is motion?',['One player moving sideways or back before the snap','The whole team running onto the field together','A trick play where the kicker runs with the ball'],0,'<b>Motion</b> is one offensive player moving sideways or backward before the snap.'],
 ['In zone coverage, what does each defender guard?',['An area of the field','One specific player','The quarterback only'],0,'In <b>zone</b>, each defender guards an <b>area</b>. In man coverage, each guards one player.'],
 ['Who won 7 Super Bowls, the most of any player?',['Tom Brady','Jerry Rice','Jim Brown'],0,'<b>Tom Brady</b> won 7 Super Bowls, the most in NFL history.']];
})();
