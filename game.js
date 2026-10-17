/* =========================================================
   Football 101 — "Game Day" (v2)
   Overhead TV-style arcade football. 4 quarters x 1 minute. Uses drawing helpers from index.html.
   ========================================================= */
(function(){
TEAM.purple={jersey:'#8e5cf7',helmet:'#6a3fd6',stripe:'#ffc93c'};
TEAM.green={jersey:'#22a55a',helmet:'#16803f',stripe:'#ffffff'};
TEAM.orange={jersey:'#ff8a1f',helmet:'#e56a00',stripe:'#1d2b53'};
TEAM.black={jersey:'#3a3f4f',helmet:'#22252f',stripe:'#ffc93c'};
const COLORS=[['blue','#2f6fed','Blue'],['red','#ff5a4e','Red'],['purple','#8e5cf7','Purple'],['green','#22a55a','Green'],['orange','#ff8a1f','Orange'],['black','#3a3f4f','Black']];
const CPU_NAMES=['Rivals','Raptors','Storm','Titans','Comets','Grizzlies'];
const GS=.86,QLEN=60;
const SPD={OL:4.6,DL:5.2,QB:6.3,RB:8.0,FB:6.9,WR:8.4,TE:7.2,LB:7.0,CB:8.0,S:7.6,K:6,P:6};
let TS=1,root,svg,L={},F,cam={x:60,y:C,z:14},GM=null,P=null,raf=0,lastT=0,keys={},joy=null,bound=false,camClose=false,toWorld=null;
const $g=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// every timer belongs to one game: leaving or restarting cancels old ones
const _st=window.setTimeout.bind(window);
function later(fn,ms){const id=GM&&GM.id;return _st(()=>{if(GM&&GM.id===id)fn();},ms/TS);}
const store={get(k,d){try{const v=localStorage.getItem('f101g_'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem('f101g_'+k,JSON.stringify(v));}catch(e){}}};

/* =========================================================
   THE BOOTH: play-by-play + analyst. Lines queue up and never cut each other off.
   ========================================================= */
const PBP={
 start:['Welcome to Game Day! Four quarters, one minute each. Let\'s play some football!','It\'s a beautiful day for football, folks. Two teams, four quarters, one winner!'],
 kickoff:['Here\'s the kickoff... it sails deep into the end zone. Touchback.','The kick is high and deep. No return. Touchback.','Booming kickoff into the end zone. They\'ll start at the thirty-five.'],
 third_long:['Third and long. This is a big one.','Third down, and they need a lot of yards here.'],
 third_short:['Third and short. Just a couple of yards needed.','Third down, and it\'s a short one.'],
third_med:['Third down, a few yards to go.','Third and medium. A big play coming up.'],
 fourth:['Fourth down. Decision time.','It\'s fourth down. What will they do?'],
 goal:['They\'re knocking on the door! Goal to go.','Close to the end zone now. Can they punch it in?'],
 run_big:['He breaks into the open! What a run!','Look at him go! Big gain on the ground!','He bursts through the hole and he is gone!','A huge run! The crowd is on its feet!'],
 run_good:['Nice run! Solid gain.','He picks up good yardage on the carry.','Good push up front, and a nice gain.','He finds a crease and keeps his legs moving.'],
 run_short:['Short gain on the play.','He\'s brought down after a few yards.','Not much there, but he falls forward.'],
 run_none:['Stuffed at the line! No gain.','Nowhere to go! He\'s stopped right there.','The defense swarms. No gain on the play.'],
 run_loss:['Oh, he\'s dropped for a loss!','Tackle in the backfield! They lose yards.','The defense gets there first. Loss on the play.'],
 juke:['What a juke!','Oh, he made him miss!','A nasty move! The defender grabs nothing but air!'],
 broken:['He breaks the tackle!','Bounces right off the defender!'],
 first:['First down!','That\'s enough for the first down!','Move the chains! First down!','Fresh set of downs!'],
 td:['Touchdown! What a play!','He\'s in! Touchdown!','Into the end zone! Six points!','Touchdown! The crowd goes wild!'],
 td_cpu:['They score! Touchdown.','Into the end zone they go. Touchdown.','Touchdown. That one stings.'],
 throw:['He fires!','Here\'s the throw!','The pass is in the air!'],
 throw_deep:['He lets it fly deep!','He\'s going long!','He launches it down the field!'],
 catch:['Caught! Great hands!','Complete! Nice throw and catch.','He hauls it in!','Right on the money. Complete!'],
 catch_deep:['Caught deep down the field! Huge play!','What a strike! A big gain through the air!'],
 incomplete:['Incomplete. The pass falls to the turf.','The pass is off target. Incomplete.','Broken up! Incomplete.','No good. It hits the ground.'],
 int:['Intercepted! What a turnover!','Picked off! The defense takes it away!','Interception! He jumped the route!'],
 sack:['Sacked! The quarterback goes down!','He got to the quarterback! Sack!','Brought down in the backfield! A sack!'],
 pressure:['He\'s under pressure!','The pocket is collapsing!'],
 pa_fake:['Fake handoff... and he keeps it!','Play action! The fake is on!','He fakes it to the back... and looks downfield!'],
 screen:['Screen pass! He\'s got blockers in front!','Dump off to the back, with a wall of blockers!','The screen is set up! Linemen leading the way!'],
 oob:['He\'s pushed out of bounds.','He steps out of bounds. Clock stops.'],
 fumble:['Fumble! The ball is loose!','He coughs it up! Fumble!'],
 recover_def:['And the defense recovers! Turnover!','The defense falls on it! Huge turnover!'],
 recover_off:['But the offense gets it back. Phew!','Lucky bounce. The offense keeps it.'],
 tfl_def:['What a stop by the defense!','Great tackle! Nowhere to go!','The defense shuts that down!'],
 fg_good:['The kick is up... and it\'s good!','Right down the middle! It\'s good!','Through the uprights! Three points!'],
 fg_wide:['The kick is up... and it\'s wide! No good.','He hooked it! No good.'],
 fg_short:['The kick is up... and it\'s short!','Not enough leg. It falls short.'],
 xp_good:['The extra point is good.','Extra point, good.','Easy kick. The extra point is good.'],
 xp_miss:['The extra point is no good! A rare miss!'],
 two_go:['They\'re going for two!','No kick. They\'re going for two points!'],
 two_good:['They get in! Two points!','Conversion is good! Two more points!'],
 two_fail:['Stopped! No two points.','The try is no good.'],
 punt:['Here\'s the punt. High and deep.','Punt is away. Long hang time.','He booms the punt!'],
 punt_oob:['The punt rolls out of bounds.'],
 fair:['He calls for a fair catch.','Fair catch signaled. No return.'],
 punt_ret:['He fields the punt and looks for room!','Here comes the return!'],
 punt_tb:['The punt bounces into the end zone. Touchback.'],
 pinned:['Pinned deep! What a punt!','Downed deep in their own territory!'],
 tod:['Stopped short on fourth down! Turnover on downs!','They don\'t make it! The defense takes over!'],
 safety:['Tackled in the end zone! That\'s a safety!'],
 q_end:['That\'s the end of the quarter.','The quarter comes to a close.'],
 half:['That\'s halftime, folks!'],
 q4:['Fourth quarter. This is where games are won.'],
 tick:['Clock is running down!','Time is almost out!'],
 ot:['We\'re going to overtime! Next score wins!'],
 win:['And that\'s the game! What a performance!','Final whistle! What a win!'],
 lose:['That\'s the game. Tough one today.','Final whistle. Better luck next time.'],
 tie:['It ends in a tie! What a battle!']};
const ANA={
 hole:['See that? The blockers pushed the defenders apart and opened a hole. Hit it fast, and you get big yards.','That\'s great blocking. When the hole opens, the runner just has to see it and go.'],
 stuffed:['The defense filled the hole before he got there. When that happens, look to cut outside.','Nowhere to run there. Sometimes a short gain is just part of the game.'],
 pa:['That\'s play action. The linebackers stepped up to stop the run fake, and that left room behind them.','The fake handoff froze the defense. That\'s why play action works so well after you run the ball.'],
 read_open:['Great read. He waited for the open receiver instead of forcing it.','He found the open man. That\'s smart quarterback play.'],
 int_cov:['He threw it into coverage. If your read says covered, wait for the next one.','That receiver was covered. A better choice was to hold it a moment and find the open man.'],
 sack:['He held the ball too long. The longer you wait, the more time the pass rush has to get home.','When the reads are covered, a quick throw or a scramble beats taking the sack.'],
 first:['Ten yards gained, so the downs reset. Four more tries!'],
 third:['Third and long is a passing down. The defense knows it too.'],
 punt_smart:['Punting here is smart. It pushes them far away from scoring.'],
 fg_range:['They\'re close enough to try a field goal for three points.'],
 guess_right:['Good call! You read their formation and picked the right defense.','You saw that coming. The scouting report paid off.'],
 guess_wrong:['They ran right at that defense. The formation gives clues, so check the scouting report.','That defense was built for something else. Watch the formation for hints.'],
 blitz_screen:['The blitz sent extra rushers, and the screen pass slipped right behind them.'],
 zone_deep:['The defense dropped deep into zones, so the long pass had nowhere to go.'],
 oob:['Out of bounds stops the clock. That saves time.'],
 touchback:['A touchback means no return. The ball is just placed out at the thirty-five.'],
 safety:['Tackled in his own end zone: that\'s two points for the defense, and they get the ball back too.'],
 pinned:['Pinned deep. Now the other team has a long way to go.'],
 two:['Going for two: one play from the two-yard line. Score and it\'s worth two points instead of one.'],
 tod:['They came up short on fourth down, so the other team takes over right there.'],
 juke:['Nice juke! Making a defender miss turns a short gain into a big one.'],
 fair:['A fair catch means no return, but nobody can hit him either.'],
 half:['Good first half. Remember: watch the scouting report on defense, and read your receivers on offense.'],
 runstop:['The defense is crowding the line to stop the run. That\'s a perfect time for play action.']};
const ANN={};for(const [pf,O] of [['p',PBP],['a',ANA]])for(const k in O)O[k].forEach((t,i)=>ANN[`${pf}_${k}_${i}`]=t);
window.GAME_ANN=ANN;
const bags={},aOnce=new Set();
function line(pf,k){const arr=(pf==='p'?PBP:ANA)[k];if(!arr)return null;let b=bags[pf+k];
 if(!b||!b.length){b=bags[pf+k]=[...arr.keys()].sort(()=>Math.random()-.5);if(b.length>1&&b.at(-1)===bags[pf+k+'_last'])b.unshift(b.pop());}
 const i=b.pop();bags[pf+k+'_last']=i;return{id:`g_${pf}_${k}_${i}`,text:arr[i],who:pf};}
const booth={q:[],cur:null,au:null,timer:0,
 say(k,pri=2){this.push(line('p',k),pri);},
 explain(k,once=true,pri=1){if(once&&aOnce.has(k))return;const l=line('a',k);if(!l)return;aOnce.add(k);this.push(l,pri);},
 push(l,pri){if(!l)return;if(pri===0&&this.busy())return;l.pri=pri;l.pid=GM?GM.pid:0;l.t=performance.now();this.q=this.q.filter(x=>x.pri>=pri||x.who==='a'&&pri<3);if(this.q.length>=3){const i=this.q.findIndex(x=>x.pri<=pri);this.q.splice(i<0?0:i,1);}this.q.push(l);this.next();},
 next(){if(this.cur)return;const now=performance.now();this.q=this.q.filter(x=>x.pri>=3||(now-x.t<(x.who==='a'?6000:4000)&&(!GM||x.pid===GM.pid)));const l=this.q.shift();if(!l){this.hide();return;}this.cur=l;
  const b=$g('gAnn');if(b){b.className='gann show '+(l.who==='a'?'ana':'pbp');b.innerHTML=`<span class="who">${l.who==='a'?'🎓 ANALYST':'🎙️ PLAY-BY-PLAY'}</span><span class="txt">${l.text}</span>`;}
  const n=typeof NARR!=='undefined'&&NARR[l.id];const est=(n&&n.d?n.d:l.text.split(/\s+/).length*.34+.6)*1000;
  const done=(fromTimer)=>{if(this.cur!==l)return;if(fromTimer===true&&this.au&&!this.au.ended&&!this.au.paused&&!this.au.error){this.timer=_st(()=>done(true),400);return;}clearTimeout(this.timer);this.cur=null;this.au=null;_st(()=>this.next(),260);};
  if(n&&n.f&&!muted){try{const a=new Audio('audio/'+n.f);this.au=a;a.onended=done;a.onerror=done;a.play().catch(()=>{});}catch(e){}}
  this.timer=_st(()=>done(true),est+700);},
 hide(){const b=$g('gAnn');if(b)b.classList.remove('show');},
 stop(){this.q=[];if(this.au){try{this.au.pause();}catch(e){}}this.au=null;this.cur=null;clearTimeout(this.timer);this.hide();},
 busy(){return !!this.cur||this.q.length>0;}};

/* =========================================================
   FORMATIONS & PLAYBOOK
   ========================================================= */
const OL5=[['C',55,'OL',.8,0],['LG',66,'OL',.8,-1.9],['RG',67,'OL',.8,1.9],['LT',71,'OL',.8,-3.8],['RT',74,'OL',.8,3.8]];
const FORMS={
 single:{name:'Singleback',short:'1 back, 1 tight end, 3 receivers',P:[...OL5,['QB',12,'QB',1.3,0],['RB',28,'RB',6,0],['TE',88,'TE',1,5.9],['WR1',11,'WR',1,-14],['WR2',81,'WR',1,14.5],['WR3',17,'WR',1.5,-8.5]]},
 iform:{name:'I-Formation',short:'fullback + running back stacked behind the QB',P:[...OL5,['QB',12,'QB',1.3,0],['FB',44,'FB',4,0],['RB',28,'RB',6.6,0],['TE',88,'TE',1,5.9],['WR1',11,'WR',1,-14],['WR2',81,'WR',1,14.5]]},
 gun:{name:'Shotgun',short:'QB 5 yards back, 4 receivers spread wide',P:[...OL5,['QB',12,'QB',5,0],['RB',28,'RB',5,1.8],['WR1',11,'WR',1,-15],['WR2',81,'WR',1,15],['WR3',17,'WR',1.5,-9],['WR4',15,'WR',1.5,9]]}};
const PLAYS={
 inside:{name:'Inside Run',icon:'🏃',form:'single',kind:'run',gap:1,tip:'Short yardage. Hit the hole fast.',
  what:'The QB hands off to the running back. Your blockers push the defenders apart to open a hole in the middle.',job:'Run to the glowing hole, then cut toward open grass.'},
 outside:{name:'Outside Run',icon:'↗️',form:'single',kind:'run',gap:8.5,toss:true,tip:'Race to the edge.',
  what:'The QB tosses to the running back, who races to the outside while blockers seal the edge.',job:'Get around the corner at the glowing spot, then turn up the sideline.'},
 power:{name:'Power Run',icon:'💪',form:'iform',kind:'run',gap:2.9,lead:'FB',tip:'Fullback leads the way.',
  what:'The fullback runs through the hole first and knocks the linebacker out of the way.',job:'Stay right behind your fullback through the glowing hole.'},
 quick:{name:'Quick Pass',icon:'⚡',form:'gun',kind:'pass',drop:.55,deep:false,routes:{WR3:'slant',WR1:'slant',WR4:'out',WR2:'hitch',RB:'flat'},reads:['WR3','WR1','WR4','RB'],tip:'Short and safe. Beats the blitz.',
  what:'Receivers run short routes and the ball comes out fast, before the pass rush arrives.',job:'Your QB checks receivers in order 1, 2, 3, 4. Press THROW when the read says OPEN.'},
 deep:{name:'Deep Pass',icon:'🚀',form:'single',kind:'pass',drop:1,deep:true,routes:{WR2:'post',WR1:'go',WR3:'seam',TE:'dig',RB:'check'},reads:['WR2','WR1','TE','RB'],tip:'Big gain, bigger risk.',
  what:'Receivers run long routes. They need a second or two to get open, so your line has to hold.',job:'Wait for an OPEN read, then press THROW. If everyone is covered, the last read is a safe short pass.'},
 pa:{name:'Play Action',icon:'🎭',form:'iform',kind:'pa',drop:1.25,deep:true,routes:{TE:'cross',WR1:'post',WR2:'go',FB:'flat'},reads:['TE','WR1','WR2','FB'],tip:'Fake the run, throw behind them.',
  what:'The QB fakes a handoff. Linebackers step up to stop the "run", and that leaves space behind them.',job:'After the fake, watch read 1 (your tight end crossing behind the linebackers). Press THROW when OPEN.'},
 screen:{name:'Screen Pass',icon:'🧱',form:'gun',kind:'screen',drop:.9,deep:false,routes:{RB:'screen',WR1:'go',WR2:'go',WR3:'go',WR4:'go'},reads:['RB'],tip:'Burns a blitz.',
  what:'The QB lets the rushers come, then flips a short pass to the running back with blockers in front of him.',job:'Press THROW when the running back says OPEN, then follow your blockers.'}};
const OFF_ORDER=['inside','outside','power','quick','deep','pa','screen'];
const DEFS={
 run:{name:'Run Stop',icon:'🧱',tip:'Crowd the line. Weak vs. deep passes.'},
 base:{name:'Balanced',icon:'⚖️',tip:'A bit of everything.'},
 pass:{name:'Pass Cover',icon:'🛡️',tip:'Drop back deep. Weak vs. runs.'},
 blitz:{name:'Blitz',icon:'⚡',tip:'Send extra rushers. Risky vs. quick passes.'}};
const TEND={iform:{power:.4,inside:.3,pa:.25,quick:.05},single:{inside:.25,outside:.2,quick:.2,deep:.15,pa:.2},gun:{quick:.35,deep:.25,screen:.2,inside:.2}};
const RUNK=k=>PLAYS[k].kind==='run';
function wpick(w){let s=0;for(const k in w)s+=w[k];let r=Math.random()*s;for(const k in w){r-=w[k];if(r<=0)return k;}return Object.keys(w)[0];}

/* =========================================================
   SETUP + HOW TO PLAY
   ========================================================= */
function setupScreen(){stopAll();
 root.innerHTML=`<div class="gwrap"><div class="gtop"><button class="btn" id="gMenu">◀ Menu</button><h2>🏈 Game Day</h2><span style="width:80px"></span></div>
 <div class="gsetup"><div class="gcard2"><h3>Name your team</h3><input id="gName" maxlength="14" value="${esc(store.get('name','Thunder'))}" autocomplete="off">
 <h3>Pick your color</h3><div class="gcolors">${COLORS.map(([k,c,n])=>`<button class="gcol ${k===store.get('col','blue')?'on':''}" data-k="${k}" title="${n}"><svg viewBox="-30 -80 60 90" width="58" height="80"></svg></button>`).join('')}</div>
 <h3>Difficulty</h3><div class="gdiff"><button class="gd ${store.get('diff','rookie')==='rookie'?'on':''}" data-d="rookie">Rookie</button><button class="gd ${store.get('diff','rookie')==='pro'?'on':''}" data-d="pro">Pro</button></div>
 <button class="btn primary gstart" id="gStart">▶ Kick off!</button>
 <p class="gwin">4 quarters · 1 minute each · most points wins</p></div></div></div>`;
 root.querySelectorAll('.gcol').forEach(b=>{drawPlayer(b.querySelector('svg'),b.dataset.k,'',1);
  b.onclick=()=>{root.querySelectorAll('.gcol').forEach(x=>x.classList.remove('on'));b.classList.add('on');SFX.play('pop');};});
 if(!root.querySelector('.gcol.on'))root.querySelector('.gcol').classList.add('on');
 root.querySelectorAll('.gd').forEach(b=>b.onclick=()=>{root.querySelectorAll('.gd').forEach(x=>x.classList.remove('on'));b.classList.add('on');SFX.play('pop');});
 $g('gMenu').onclick=()=>{window.gameStop();showMenu();};
 $g('gStart').onclick=()=>{const name=($g('gName').value||'Thunder').trim().slice(0,14)||'Thunder';const col=root.querySelector('.gcol.on').dataset.k;const diff=root.querySelector('.gd.on').dataset.d;
  store.set('name',name);store.set('col',col);store.set('diff',diff);const cc=col==='red'?'blue':'red';startGame(name,col,pick(CPU_NAMES),cc,diff);};}
const HOWTO=[['🏈','On offense','Pick a play. The <b>coach card</b> explains it and draws the plan on the field. Press <b>SNAP</b> to start.'],
 ['🏃','Running','Steer with the <b>arrow keys</b> or the <b>joystick</b>. Run to the <b>glowing hole</b>. <b>JUKE</b> dodges a tackler.'],
 ['🎯','Passing','Your QB checks receivers one at a time. Press <b>THROW</b> when the read says <b style="color:#1f9d55">OPEN</b>.'],
 ['🛡️','On defense','Read the <b>scouting report</b>, pick a defense, then steer your <b>glowing</b> player into the ball carrier.'],
 ['🦵','Kicking','Tap to set <b>POWER</b>, then <b>ACCURACY</b>. For punts, pick where the ball lands first.'],
 ['⏱️','The clock','4 quarters of 1 minute. The clock runs during plays and a few seconds after tackles. Most points wins!']];
function howTo(cb){const o=$g('gOver');o.hidden=false;o.innerHTML=`<div class="ghow"><h2>How to play</h2><div class="ghgrid">${HOWTO.map(([i,t,d])=>`<div><span>${i}</span><b>${t}</b><p>${d}</p></div>`).join('')}</div>
 <p class="gkeys">Keyboard: arrows to move · Space = the big action button · C = camera zoom</p><button class="btn primary" id="gHowGo">Let's go!</button></div>`;
 $g('gHowGo').onclick=()=>{o.hidden=true;o.innerHTML='';store.set('how',1);SFX.play('pop');cb&&cb();};}

/* =========================================================
   GAME START / STAGE
   ========================================================= */
function startGame(un,uc,cn,ccol,diff){stopAll();aOnce.clear();
 GM={id:Date.now()+Math.random(),u:{name:un,color:uc},c:{name:cn,color:ccol},score:{u:0,c:0},diff,pro:diff==='pro',q:1,clock:QLEN,poss:'u',los:45,down:1,togo:10,fd:55,
  goal:false,phase:'start',pid:0,recent:[],goodRuns:0,paTip:false,two:false,stats:{u:{rush:0,pass:0},c:{rush:0,pass:0}},seen:store.get('seen',{})};
 root.innerHTML=`<div class="gwrap"><div class="gtop"><button class="btn" id="gMenu">◀ Menu</button><div class="gbug" id="gBug"></div>
  <div class="gtb"><button class="btn round" id="gCam" title="Camera zoom (C)">🎥</button><button class="btn round" id="gHelp" title="How to play">?</button><button class="btn round" id="gFs" title="Full screen"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button></div></div>
 <div class="gstage" id="gStage"><svg id="gSvg" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice"></svg>
 <div class="gann" id="gAnn"></div><div class="gcoach" id="gCoach" hidden></div><div class="ghint" id="gHint"></div><div class="gtoast" id="gToast"></div>
 <div class="gpanel" id="gPanel"></div><div class="gjoy" id="gJoy" hidden><i></i></div><button class="gact" id="gAct" hidden></button>
 <div class="gkv" id="gKV" hidden><svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice"></svg></div><div class="gover" id="gOver" hidden></div></div></div>`;
 $g('gMenu').onclick=()=>{window.gameStop();showMenu();};$g('gFs').onclick=()=>window.toggleFS&&toggleFS();
 $g('gCam').onclick=()=>{camClose=!camClose;toast(camClose?'Close-up camera':'Wide TV camera');};$g('gHelp').onclick=()=>howTo();
 $g('gAct').onclick=e=>{e.stopPropagation();action();};
 svg=$g('gSvg');L={};for(const k of ['world','paint','actors','top','ball','ui'])L[k]=E('g',{},svg);
 F=drawField({field:L.world});
 F.ez1.setAttribute('fill',TEAM[uc].helmet);F.ez2.setAttribute('fill',TEAM[ccol].helmet);
 for(const t of L.world.querySelectorAll('text'))if(t.textContent==='BLUE')t.textContent=un.toUpperCase();else if(t.textContent==='RED')t.textContent=cn.toUpperCase();
 const lg=E('g',{transform:`translate(60,${C})`},L.world);lg.setAttribute('opacity',.45);E('circle',{r:4.2,fill:TEAM[uc].helmet,stroke:'#fff','stroke-width':.4},lg);T(lg,0,.2,un[0].toUpperCase(),{size:4.6,fill:'#fff'});
 L.los=E('rect',{y:0,width:.34,height:53.33,fill:'#3d8bff'},L.paint);L.fdl=E('rect',{y:0,width:.34,height:53.33,fill:YEL},L.paint);L.plan=E('g',{},L.paint);
 L.ballG=E('g',{},L.ball);L.shadow=E('ellipse',{rx:9,ry:3.5,fill:'rgba(20,30,60,.3)'},L.ballG);L.ballEl=drawBall(L.ballG);
 bindInput();updBug();lastT=performance.now();if(!raf)raf=requestAnimationFrame(loop);
 const go=()=>{booth.say('start',3);kickoff('c',()=>{newSeries('u',45);});};
 if(!store.get('how',0))howTo(go);else go();}
function stopAll(){booth.stop();P=null;keys={};joy=null;}

/* ---------------- scoreboard ---------------- */
function yardTxt(x){const y=Math.round(x<=60?x-10:110-x);if(y===50)return'MIDFIELD';const t=x<60?GM.u:GM.c;return t.name.slice(0,3).toUpperCase()+' '+y;}
function clockTxt(){const s=Math.max(0,Math.ceil(GM.clock));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
function updBug(){const b=$g('gBug');if(!b||!GM)return;const col=k=>COLORS.find(x=>x[0]===GM[k].color)[1];const q=GM.q>4?'OT':'Q'+GM.q;
 const dd=GM.phase==='over'?'FINAL':GM.phase==='kickoff'?'KICKOFF':GM.two?'2-PT TRY':`${['1ST','2ND','3RD','4TH'][GM.down-1]} & ${GM.goal?'GOAL':GM.togo} · ${yardTxt(GM.los)}`;
 b.innerHTML=`<span class="tm" style="--c:${col('u')}">${GM.poss==='u'?'<i>🏈</i>':''}${esc(GM.u.name)} <b>${GM.score.u}</b></span><span class="tm" style="--c:${col('c')}">${GM.poss==='c'?'<i>🏈</i>':''}${esc(GM.c.name)} <b>${GM.score.c}</b></span><span class="clk">${q} ${clockTxt()}</span><span class="dd">${dd}</span>`;}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* =========================================================
   SERIES / PLAY FLOW
   ========================================================= */
function newSeries(team,los){GM.poss=team;GM.los=los;GM.down=1;GM.togo=10;GM.two=false;nextPlay();}
function setLines(){const d=GM.poss==='u'?1:-1;const toGoal=d===1?110-GM.los:GM.los-10;GM.goal=!GM.two&&toGoal<=GM.togo;if(GM.goal)GM.togo=Math.round(toGoal);
 GM.fd=GM.two||GM.goal?(d===1?110:10):GM.los+d*GM.togo;L.los.setAttribute('x',GM.los-.17);L.fdl.setAttribute('x',GM.fd-.17);L.fdl.setAttribute('opacity',GM.goal||GM.two?0:1);L.los.setAttribute('opacity',1);}
function nextPlay(){if(!GM||GM.phase==='over')return;GM.phase='call';setLines();updBug();clearPlan();hideCoach();setAct(null);hint('');$g('gKV').hidden=true;
 const off=GM.poss;GM.phase='call';
 if(!GM.two){if(GM.down===3)booth.say(GM.togo>=7?'third_long':GM.togo<=3?'third_short':'third_med',1);else if(GM.down===4)booth.say('fourth',1);else if(GM.goal&&Math.random()<.6)booth.say('goal',1);
  if(GM.down===3&&GM.togo>=7)booth.explain('third');}
 if(off==='u'){spawn('single',null,'base',true);showOffCall();}
 else{const pl=cpuOffCall();if(pl==='punt'){spawnPunt();return cpuPunt();}if(pl==='fg'){return fieldGoal('c');}
  GM.cpuPlay=pl;spawn(GM.cpuForm||PLAYS[pl].form,pl,'base',false);showDefCall();}}

/* ---------------- spawning players ---------------- */
function clearPlan(){if(L.plan){L.plan.innerHTML='';L.plan.setAttribute('opacity',1);}if(L.top)L.top.innerHTML='';for(const n of [...L.ui.childNodes])n.remove();}
function mk(team,k,num,pos,x,y,face){const a={team,k,num,pos,x,y,vx:0,vy:0,face,fall:0,ph:Math.random()*6,amp:0,tried:new Set(),eng:0,engBy:null,hx:x,hy:y};a.el=drawPlayer(L.actors,GM[team].color,num,face);return a;}
function spawn(form,playKey,dcall,preview){L.actors.innerHTML='';const off=GM.poss,def=off==='u'?'c':'u',d=off==='u'?1:-1,los=GM.los;
 P={t:0,d,off,def,O:{},D:{},all:[],ball:{x:los,y:C,h:0,holder:null,fly:null},live:false,result:null,carrier:null,form,play:playKey,dcall,preview,ctrl:null,reads:null};
 for(const [k,n,pos,dx,dy] of FORMS[form].P){const a=mk(off,k,n,pos,los-d*dx,C+dy,d);P.O[k]=a;P.all.push(a);}
 for(const [k,n,pos] of [['DE1',91,'DL'],['DT1',93,'DL'],['DT2',97,'DL'],['DE2',99,'DL'],['LB1',52,'LB'],['LB2',54,'LB'],['LB3',56,'LB'],['CB1',24,'CB'],['CB2',21,'CB'],['S1',31,'S'],['S2',32,'S']]){const a=mk(def,k,n,pos,los+d*6,C,-d);P.D[k]=a;P.all.push(a);}
 alignDefense(dcall,true);P.ball.holder=P.O.C;}
function alignDefense(call,instant){const d=P.d,los=GM.los,O=P.O,D=P.D;P.dcall=call;
 const wy=k=>O[k]?O[k].y:null;const slot=O.WR3?'WR3':O.TE?'TE':'WR2';const slot2=O.WR4?'WR4':O.TE?'TE':null;
 const spot={DE1:[1.1,-4.3],DT1:[1.1,-1.15],DT2:[1.1,1.15],DE2:[1.1,4.3],LB1:[5,-4.6],LB2:[5,0],LB3:[5,4.6],CB1:[6,wy('WR1')-C],CB2:[6,wy('WR2')-C],S1:[12,-7],S2:[12,7]};
 if(call==='run'){spot.LB1=[3.6,-3.6];spot.LB2=[3.6,0];spot.LB3=[3.6,3.6];spot.S1=[6.5,-2.2];spot.CB1[0]=4;spot.CB2[0]=4;spot.S2=[12,0];}
 if(call==='pass'){spot.LB3=[5.5,wy(slot)-C];spot.LB1=[6,-4];spot.LB2=[7,1.5];spot.CB1[0]=8;spot.CB2[0]=8;spot.S1=[15,-9];spot.S2=[15,9];}
 if(call==='blitz'){spot.LB1=[2.4,-2.6];spot.LB2=[2.4,2.6];spot.LB3=[5,(wy(O.TE?'TE':'RB')||C)-C];spot.S2=[8,slot2&&wy(slot2)!=null?wy(slot2)-C:(wy(slot)-C)];spot.S1=[13,0];spot.CB1[0]=4.5;spot.CB2[0]=4.5;}
 for(const k in spot){const a=D[k];const [dx,dy]=spot[k];a.hx=los+d*dx;a.hy=clamp(C+dy,2,51.3);if(instant){a.x=a.hx;a.y=a.hy;}}
 const man=k=>({type:'man',tgt:O[k]?k:'RB'}),zone=(dx,dy,r=7)=>({type:'zone',zx:los+d*dx,zy:C+dy,r});
 const A={DE1:{type:'rush'},DT1:{type:'rush'},DT2:{type:'rush'},DE2:{type:'rush'}};
 if(call==='pass'){Object.assign(A,{CB1:zone(17,-16,9),CB2:zone(17,16,9),S2:zone(19,0,10),S1:zone(9,-7,7),LB1:zone(6,-7,6),LB2:zone(7,2,6),LB3:zone(6,9,6)});}
 else if(call==='blitz'){Object.assign(A,{CB1:man('WR1'),CB2:man('WR2'),S2:man(slot2||slot),LB3:man(O.TE?'TE':'RB'),S1:zone(16,0,14),LB1:{type:'rush'},LB2:{type:'rush'}});if(O.WR3&&slot2)A.LB3=man('WR3');}
 else{Object.assign(A,{CB1:man('WR1'),CB2:man('WR2'),LB1:zone(6,-6,6),LB2:zone(6,0,6),LB3:O.TE&&call!=='run'?man('TE'):zone(6,6,6),S1:zone(16,-9,11),S2:zone(16,9,11)});
  if(call==='run')A.S1={type:'box'};if(O.WR3&&call!=='run')A.LB1=man('WR3');if(O.WR4)A.LB3=man('WR4');}
 for(const k in A)D[k].as=A[k];
 const rt={run:.12,base:.32,pass:.6,blitz:.3}[call];for(const k in D){const a=D[k];a.read=(a.pos==='LB'?rt:a.pos==='S'?rt+.35:rt+.25)+rnd(-.08,.18);}}

/* ---------------- offense play call (user) ---------------- */
function coachPick(){const g=GM;if(g.two)return'pa';if(g.down===4){const fd=fgDist();if(g.togo<=1&&g.los>=55)return'power';if(fd<=(g.pro?50:53))return'fg';return'punt';}
 if(g.togo<=2)return'power';if(g.paTip)return'pa';if(g.down===3&&g.togo>=7)return Math.random()<.5?'deep':'quick';if(g.down===1&&Math.random()<.5)return'inside';return Math.random()<.5?'quick':'outside';}
const ROUTES={go:{pts:[[18,0],[45,0]]},slant:{pts:[[2.5,0],[9,-6],[22,-12]]},out:{pts:[[6,0],[6.5,7],[6.5,14]]},hitch:{pts:[[6,0],[5,0]]},flat:{pts:[[1,4],[3,10],[6,16]]},
 post:{pts:[[11,0],[28,-9],[45,-12]]},seam:{pts:[[24,0],[45,0]]},dig:{pts:[[11,0],[11,-14],[12,-24]]},check:{pts:[[2,4],[4,8],[6,12]],delay:1},cross:{pts:[[5,-1],[11,-12],[13,-28]]},screen:{pts:[[-2.5,5],[-1.5,8]],delay:.9}};
function diagram(key){const pl=PLAYS[key];const S=FORMS[pl.form].P;const sx=dx=>58-dx*4.4,sy=dy=>32+dy*1.5;let s=`<svg viewBox="0 0 120 64" class="gdia"><rect width="120" height="64" rx="8" fill="#3d9a47"/><path d="M61,3V61" stroke="#8fd0ff" stroke-width="1.6"/>`;
 for(const [k,,pos,dx,dy] of S){s+=`<circle cx="${sx(dx)}" cy="${sy(dy)}" r="${pos==='OL'?2.5:3}" fill="${pos==='OL'?'#dfe6f5':'#fff'}" stroke="#1d2b53" stroke-width="1"/>`;}
 const arr=(pts,col,dash='')=>{pts=pts.map(p=>[clamp(p[0],4,116),clamp(p[1],4,60)]);const d='M'+pts.map(p=>p.join(',')).join('L');const a=pts.at(-1),b=pts.at(-2);const ang=Math.atan2(a[1]-b[1],a[0]-b[0]);
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" ${dash?`stroke-dasharray="${dash}"`:''}/><path d="M${a[0]+Math.cos(ang)*3},${a[1]+Math.sin(ang)*3}L${a[0]+Math.cos(ang+2.4)*3.4},${a[1]+Math.sin(ang+2.4)*3.4}L${a[0]+Math.cos(ang-2.4)*3.4},${a[1]+Math.sin(ang-2.4)*3.4}Z" fill="${col}"/>`;};
 const pos=k=>{const r=S.find(x=>x[0]===k);return[sx(r[3]),sy(r[4])];};
 if(pl.kind==='run'){const rb=pos('RB');const gy=sy(pl.gap);s+=`<ellipse cx="65" cy="${gy}" rx="5" ry="4" fill="#ffe23a" opacity=".6"/>`;if(pl.lead){const fb=pos('FB');s+=arr([fb,[64,gy],[80,gy]],'#ffffff','3 2');}s+=arr([rb,[pl.toss?rb[0]+6:56,gy],[92,gy+(pl.toss?4:0)]],'#ffe23a');}
 else{for(const [k,r] of Object.entries(pl.routes)){const p0=pos(k);const side=Math.sign(S.find(x=>x[0]===k)[4])||1;const pts=[p0];for(const [f,l] of ROUTES[r].pts.slice(0,3))pts.push([p0[0]+f*1.6,p0[1]+side*l*1.3]);
   const ri=pl.reads.indexOf(k);s+=arr(pts,ri===0?'#ffe23a':'#ffffff',ri<0?'2 2':'');}
  if(pl.kind==='pa'){const rb=pos('RB');s+=arr([rb,[58,rb[1]+3]],'#ffb3ad','2 2');}}
 return s+'</svg>';}
function kickDia(k){return `<svg viewBox="0 0 120 64" class="gdia"><rect width="120" height="64" rx="8" fill="#3d9a47"/>${k==='punt'?'<path d="M20,46 Q60,-14 100,40" fill="none" stroke="#ffe23a" stroke-width="2.4" stroke-dasharray="4 3"/><circle cx="100" cy="42" r="5" fill="none" stroke="#fff" stroke-width="2"/>':'<path d="M60,58V36M42,36H78M42,36V8M78,36V8" stroke="#ffd84a" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M60,62 Q58,30 60,20" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/>'}</svg>`;}
function showOffCall(){const p=$g('gPanel');const fourth=GM.down===4&&!GM.two;const cp=coachPick();const fd=fgDist();const maxFG=GM.pro?60:63;
 const card=(k,name,icon,tip,dia,dis)=>`<button class="pc ${k===cp?'pick':''}" data-k="${k}" ${dis?'disabled':''}>${k===cp?'<em>COACH\'S PICK</em>':''}${dia}<b>${icon} ${name}</b><small>${tip}</small></button>`;
 let cards=OFF_ORDER.filter(k=>!GM.two||k!=='screen').map(k=>card(k,PLAYS[k].name,PLAYS[k].icon,k==='pa'&&!GM.seen.pa?'⭐ Fake the run, throw behind them.':PLAYS[k].tip,diagram(k)));
 if(fourth){cards.unshift(card('fg','Field Goal','🥅',fd>maxFG?`${fd} yds: too far`:`${fd} yards for 3 points`,kickDia('fg'),fd>maxFG));cards.unshift(card('punt','Punt','🦵','Kick it far away.',kickDia('punt')));}
 p.style.setProperty('--n',cards.length);
 p.innerHTML=`<div class="callbar"><div class="gq">${GM.two?'2-point try! One play from the 2-yard line.':fourth?'4th down! Go for it, punt, or kick?':'Your ball! Pick a play'}</div><div class="cards">${cards.join('')}</div></div>`;
 p.querySelectorAll('.pc').forEach(b=>b.onclick=()=>{if(b.disabled)return;SFX.play('pop');p.innerHTML='';hideCoach();const k=b.dataset.k;
  if(k==='punt'){spawnPunt();return userPunt();}if(k==='fg')return fieldGoal('u');chooseOff(k);});
 if(GM.paTip&&!GM.paTipShown){GM.paTipShown=true;booth.explain('runstop',true,2);coach({title:'🎓 Coach\'s tip: try Play Action',what:'The defense is crowding the line to stop your runs.',job:'Pick <b>Play Action</b>: fake the handoff so the linebackers step up, then throw to your tight end crossing behind them.',btn:'Got it'});}}
function chooseOff(k){GM.uPlay=k;const call=cpuDefCall(k);spawn(PLAYS[k].form,k,call,false);drawPlan(k);GM.phase='presnap';
 const pl=PLAYS[k];const first=!GM.seen[k];GM.seen[k]=1;store.set('seen',GM.seen);
 const dtxt={run:'They\'re crowding the line (Run Stop).',base:'They\'re in a balanced defense.',pass:'They\'re dropping back deep (Pass Cover).',blitz:'Watch out: they\'re showing BLITZ!'}[call];
 coach({title:`${pl.icon} ${pl.name}`,what:pl.what,job:pl.job,extra:`<span class="dread">🔎 Defense: ${dtxt}</span>`,short:!first,btn:'▶ SNAP'},()=>snapPlay());setAct('▶ SNAP',()=>snapPlay());}
function cpuDefCall(k){const g=GM;if(g.paTip&&k==='pa')return'run';let w={base:4,run:2,pass:2,blitz:1.5};
 if(g.down>=3&&g.togo>=7)w={pass:5,blitz:3,base:2,run:.5};else if(g.togo<=2)w={run:5,base:2,blitz:2,pass:.5};
 const runs=g.recent.slice(-4).filter(x=>x==='run').length;if(runs>=3)w.run+=4;if(g.two||g.goal){w.run+=2;w.pass=.5;}
 return wpick(w);}

/* ---------------- defense play call (user) ---------------- */
function cpuW(form){const g=GM;const w={...TEND[form]};if(g.down>=3&&g.togo>=7){for(const k in w)if(RUNK(k))w[k]*=.4;}return w;}
function cpuOffCall(){const g=GM;const fd=fgDist();g.cpuForm=null;const fix=k=>{g.cpuForm=PLAYS[k].form;return k;};
 if(g.two)return fix(Math.random()<.5?'inside':'quick');
 const late=g.q>=4&&g.clock<25&&g.score.c<g.score.u;
 if(g.down===4){if(fd<=48&&!(late&&g.score.u-g.score.c>3))return'fg';if(g.togo<=2&&(g.los<=65||late))return fix(Math.random()<.5?'power':'quick');if(late)return fix('deep');return'punt';}
 let form;if(g.down>=3&&g.togo>=7)form=Math.random()<.75?'gun':'single';else if(g.togo<=2)form=Math.random()<.7?'iform':'single';else form=wpick({iform:3,single:4,gun:3});
 g.cpuForm=form;return wpick(cpuW(form));}
function showDefCall(){const p=$g('gPanel');p.style.setProperty('--n',4);const form=P.form;const T_=cpuW(form);let run=0,tot=0;for(const k in T_){tot+=T_[k];if(RUNK(k))run+=T_[k];}
 const runPct=Math.round(run/tot*100/5)*5;const lean=runPct>=60?'run':runPct<=35?'pass':'mix';const cp=GM.down>=3&&GM.togo>=7?'pass':lean==='run'?'run':lean==='pass'?'pass':'base';
 const clue={iform:'Fullback + running back stacked: a POWER look.',single:'One back, one tight end: they can do anything.',gun:'QB back in the shotgun with 4 receivers: a PASSING look.'}[form];
 p.innerHTML=`<div class="callbar"><div class="scout"><b>🔎 SCOUTING REPORT</b> · ${FORMS[form].name}: ${clue} <span class="tend"><i style="width:${runPct}%"></i></span> <small>Run ${runPct}% · Pass ${100-runPct}%${GM.down>=3&&GM.togo>=7?' · 3rd & long: expect a pass!':''}</small></div>
  <div class="cards">${Object.entries(DEFS).map(([k,v])=>`<button class="pc d ${k===cp?'pick':''}" data-k="${k}">${k===cp?'<em>COACH\'S PICK</em>':''}${defDia(k)}<b>${v.icon} ${v.name}</b><small>${v.tip}</small></button>`).join('')}</div></div>`;
 p.querySelectorAll('.pc').forEach(b=>b.onclick=()=>{SFX.play('pop');p.innerHTML='';chooseDef(b.dataset.k);});}
function defDia(k){let s=`<svg viewBox="0 0 120 64" class="gdia"><rect width="120" height="64" rx="8" fill="#3d9a47"/><path d="M34,4V60" stroke="#8fd0ff" stroke-width="1.6"/>`;
 const X=(x,y)=>`<path d="M${x-3},${y-3}L${x+3},${y+3}M${x+3},${y-3}L${x-3},${y+3}" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`;
 const lay={run:[[40,24],[40,30],[40,36],[40,42],[48,20],[48,32],[48,44],[46,8],[46,56],[56,30],[74,32]],base:[[40,24],[40,30],[40,36],[40,42],[54,22],[54,32],[54,42],[50,8],[50,56],[78,20],[78,44]],
  pass:[[40,24],[40,30],[40,36],[40,42],[58,26],[60,36],[56,48],[74,8],[74,56],[94,22],[94,44]],blitz:[[40,24],[40,30],[40,36],[40,42],[44,18],[44,46],[54,32],[46,8],[46,56],[70,32],[84,32]]}[k];
 for(const [x,y] of lay)s+=X(x,y);
 if(k==='blitz')s+=`<path d="M44,18L30,26M44,46L30,38" stroke="#ff8a80" stroke-width="2" stroke-dasharray="3 2"/>`;if(k==='pass')s+=`<path d="M74,8L98,10M74,56L98,54" stroke="#ffe23a" stroke-width="2" stroke-dasharray="3 2"/>`;if(k==='run')s+=`<path d="M48,20L38,22M48,32L38,32M48,44L38,42" stroke="#ffe23a" stroke-width="2"/>`;
 return s+'</svg>';}
function chooseDef(k){P.uCall=k;alignDefense(k,false);P.realign=true;GM.phase='presnap';P.ctrl=P.D.LB2;
 const first=!GM.seen.def;GM.seen.def=1;store.set('seen',GM.seen);
 coach({title:`${DEFS[k].icon} ${DEFS[k].name}`,what:{run:'Linebackers creep up and a safety joins the crowd near the line.',base:'Four rushers, linebackers in the middle, two safeties deep.',pass:'Defenders drop back into zones to guard the deep passes.',blitz:'Two linebackers rush the quarterback. Everyone else covers one receiver.'}[k],
  job:'You control the <b>glowing</b> linebacker. Steer into the ball carrier to tackle him. <b>SWITCH</b> jumps to the defender closest to the ball.',short:!first,btn:'▶ READY'},()=>defSnap());
 setAct('▶ READY',()=>defSnap());}
function defSnap(){if(GM.phase!=='presnap')return;hideCoach();setAct(null);GM.phase='snapcount';hint('');toast('HUT… HUT…');later(()=>snapPlay(),900);}

/* ---------------- coach card ---------------- */
function coach(o,cb){const c=$g('gCoach');c.hidden=false;$g('gStage').classList.add('coachon');c.className='gcoach'+(o.short?' short':'');
 c.innerHTML=`<h4>${o.title}</h4>${o.short?`<p>${o.job}</p>`:`<p><b>What happens:</b> ${o.what}</p><p><b>Your job:</b> ${o.job}</p>`}${o.extra?`<p>${o.extra}</p>`:''}<div class="crow">${o.short?'<button class="lnk" id="gMore">more info</button>':''}<button class="btn primary" id="gCoachGo">${o.btn||'OK'}</button></div>`;
 $g('gCoachGo').onclick=e=>{e.stopPropagation();SFX.play('pop');if(o.btn==='Got it')hideCoach();cb&&cb();};
 const m=$g('gMore');if(m)m.onclick=e=>{e.stopPropagation();coach({...o,short:false},cb);};}
function hideCoach(){const c=$g('gCoach');if(c){c.hidden=true;c.innerHTML='';}$g('gStage')?.classList.remove('coachon');}

/* ---------------- routes + field paint ---------------- */
function setRoutes(pl){const d=P.d,O=P.O;for(const [k,r] of Object.entries(pl.routes||{})){const a=O[k];if(!a)continue;const side=Math.sign(a.y-C)||1;const R=ROUTES[r];
  a.route=R.pts.map(([f,l])=>({x:clamp(a.x+d*f,1,119),y:clamp(a.y+side*l,1.2,52.1)}));a.wp=0;a.delay=R.delay||0;a.rname=r;}}
function drawPlan(k){clearPlan();const pl=PLAYS[k],d=P.d,O=P.O;const g=L.plan;
 if(pl.kind==='run'){const rb=O.RB;const hx=GM.los+d*(pl.toss?2.5:1.2),hy=C+pl.gap;P.hole={x:hx,y:hy};
  E('ellipse',{cx:hx,cy:hy,rx:1.9,ry:1.3,fill:'#ffe23a',opacity:.55,class:'holeglow'},g);
  const ey=hy+(pl.toss?2:0);const path=`M${rb.x},${rb.y} Q${pl.toss?rb.x+d*.5:hx-d*2},${hy} ${hx},${hy} L${hx+d*7},${ey}`;
  E('path',{d:path,fill:'none',stroke:NAVY,'stroke-width':.75,'stroke-linecap':'round',opacity:.5},g);E('path',{d:path,fill:'none',stroke:YEL,'stroke-width':.42,'stroke-linecap':'round','stroke-dasharray':'1 .6',class:'march'},g);
  arrowHead(g,hx+d*7,ey,d,(ey-hy)/7,YEL);
  const lab=E('g',{transform:`translate(${hx+d*1.6},${hy-3})`},L.top);E('rect',{x:-2.6,y:-.9,width:5.2,height:1.8,rx:.9,fill:NAVY,stroke:YEL,'stroke-width':.15},lab);T(lab,0,0,'HOLE',{size:1.1,fill:YEL});E('ellipse',{cx:-d*1.6,cy:3,rx:1.9,ry:1.3,fill:'none',stroke:YEL,'stroke-width':.2,'stroke-dasharray':'.5 .35',class:'march'},lab);
  if(pl.lead){const fb=O.FB;E('path',{d:`M${fb.x},${fb.y} L${hx},${hy} L${hx+d*4},${hy-1}`,fill:'none',stroke:'#fff','stroke-width':.3,'stroke-dasharray':'.7 .5',opacity:.9},g);}}
 else{setRoutes(pl);
  for(const [k2] of Object.entries(pl.routes)){const a=O[k2];if(!a||!a.route)continue;const ri=pl.reads.indexOf(k2);const col=ri===0?YEL:ri>0?'#fff':'#c9d3e6';
   const pts=[{x:a.x,y:a.y},...a.route.slice(0,3)];const dd='M'+pts.map(p=>`${p.x},${p.y}`).join('L');E('path',{d:dd,fill:'none',stroke:NAVY,'stroke-width':.7,opacity:.45,'stroke-linejoin':'round'},g);
   E('path',{d:dd,fill:'none',stroke:col,'stroke-width':.36,'stroke-linejoin':'round','stroke-linecap':'round','stroke-dasharray':ri<0?'.6 .5':'none'},g);
   const a1=pts.at(-1),a0=pts.at(-2);arrowHead(g,a1.x,a1.y,a1.x-a0.x,a1.y-a0.y,col);
   if(ri>=0){const pp=a.route[Math.min(1,a.route.length-1)];const b=E('g',{transform:`translate(${pp.x},${pp.y-1.6})`},g);E('circle',{r:1.05,fill:ri===0?YEL:'#fff',stroke:NAVY,'stroke-width':.25},b);T(b,0,.05,String(ri+1),{size:1.3,fill:NAVY});}}
  if(pl.kind==='pa'){const rb=O.RB;E('path',{d:`M${rb.x},${rb.y} L${GM.los-d*.5},${C+1.5}`,fill:'none',stroke:'#ffb3ad','stroke-width':.35,'stroke-dasharray':'.6 .5'},g);const t=E('g',{transform:`translate(${rb.x},${rb.y+2.2})`},g);E('rect',{x:-2.4,y:-.8,width:4.8,height:1.6,rx:.8,fill:'#ffb3ad'},t);T(t,0,0,'FAKE',{size:1,fill:NAVY});}}}
function arrowHead(g,x,y,dx,dy,col){const a=Math.atan2(dy,dx);const p=(r,o)=>`${x+Math.cos(a+o)*r},${y+Math.sin(a+o)*r}`;E('path',{d:`M${p(.9,0)}L${p(.9,2.5)}L${p(.9,-2.5)}Z`,fill:col,stroke:NAVY,'stroke-width':.15},g);}

/* =========================================================
   LIVE PLAY
   ========================================================= */
function snapPlay(){if(!P||P.live||!GM)return;GM.pid++;hideCoach();setAct(null);GM.phase='live';const d=P.d,O=P.O;SFX.play('hut');
 if(P.realign){for(const a of Object.values(P.D)){a.x=a.hx;a.y=a.hy;}}
 const pk=P.off==='u'?GM.uPlay:GM.cpuPlay;const pl=PLAYS[pk];P.pl=pl;P.pk=pk;P.live=true;P.t=0;
 P.ball.holder=null;P.ball.fly={x0:O.C.x,y0:C,h0:.6,x1:O.QB.x+d*.3,y1:O.QB.y,h1:1.2,t0:0,dur:pl.form==='gun'?.4:.22,peak:pl.form==='gun'?.3:.05,to:O.QB};
 if(pl.kind==='run'){P.hole=P.hole||{x:GM.los+d*1.2,y:C+pl.gap};P.handT=pl.toss?.45:.6;}
 else{setRoutes(pl);P.reads=pl.reads.filter(k=>O[k]);P.ri=0;P.riT=pl.drop+(pl.kind==='pa'?.15:0);P.readOn=false;if(pl.kind==='pa'){P.fakeT=.35;P.fakeEnd=1.05;}}
 assignBlocks(pl);
 if(P.off==='u'){if(pl.kind==='run')hint('Follow the arrow to the glowing hole!');else hint(pl.kind==='pa'?'Faking the handoff…':'Dropping back… watch your reads');}
 else hint('Steer your glowing player to the ball!');
 if(P.off==='c'&&P.uCall==='blitz'&&Math.random()<.5)_st(()=>P&&P.live&&booth.say('pressure',0),900);
 if(P.off==='c')setAct('🔁 SWITCH',()=>switchDef());}
function assignBlocks(pl){const O=P.O,D=P.D;const run=pl.kind==='run';const gy=run?C+pl.gap:C;
 const OL=['LT','LG','C','RG','RT'].map(k=>O[k]);const rushers=Object.values(D).filter(a=>a.as&&a.as.type==='rush');
 const used=new Set();for(const df of [...rushers].sort((a,b)=>a.y-b.y)){let best=null,bd=99;for(const o of OL){if(used.has(o))continue;const e=Math.abs(o.y-df.y);if(e<bd){bd=e;best=o;}}if(best&&bd<6){best.block=df;used.add(best);}}
 for(const o of OL){if(!used.has(o)){if(run){let lb=null,bd=99;for(const k of ['LB1','LB2','LB3']){const e=Math.abs(D[k].y-o.y);if(e<bd){bd=e;lb=D[k];}}o.block=lb;o.climb=true;}else{let n=null,bd=99;for(const df of rushers){const e=dist(o,df);if(e<bd){bd=e;n=df;}}o.block=n;}}}
 for(const o of OL)o.push=run?(Math.sign(o.block?o.block.y-gy:o.y-gy)||1):0;
 const shed=run?[3,4.2]:[2.5,4.1];const mult=(P.dcall==='run'&&run?.8:1)*(P.off==='u'&&!GM.pro?1.15:1)*(P.off==='c'&&!GM.pro?.9:1);
 for(const df of Object.values(D))df.shed=rnd(...shed)*mult;
 if(run){if(O.TE){const lb=pl.gap>0?D.LB3:D.LB1;O.TE.block=pl.toss?D.DE2:lb;O.TE.push=pl.toss?-1:Math.sign(lb.y-gy)||1;}
  if(O.FB){O.FB.block=D.LB2;O.FB.lead=true;O.FB.push=Math.sign(D.LB2.y-gy)||-1;}
  O.WR1.block=D.CB1;if(O.WR2)O.WR2.block=D.CB2;if(O.WR3)O.WR3.block=D.S1;for(const k of ['WR1','WR2','WR3'])if(O[k])O[k].stalk=true;}
 else{for(const k of ['RB','FB','TE'])if(O[k]&&!(pl.routes&&pl.routes[k])){const free=rushers.filter(a=>!OL.some(o=>o.block===a));O[k].block=free[0]||D.DE2;O[k].pp=true;}
  if(pl.kind==='screen')P.screenT=.95;}}
function loop(ts){raf=requestAnimationFrame(loop);if(!GM||$g('gamePage').hidden)return;const dt=Math.min(.05,(ts-lastT)/1000||0);lastT=ts;
 if(P&&!P.live&&P.realign&&P.D){for(const a of Object.values(P.D)){const k=Math.min(1,dt*3);a.x+=(a.hx-a.x)*k;a.y+=(a.hy-a.y)*k;a.vx=(a.hx-a.x)*2;a.vy=(a.hy-a.y)*2;}}
 if(P&&P.live){for(let i=0;i<TS;i++)step(dt*GS);if(!P.result&&P.pl&&P.pl.kind!=='ko'){GM.clock=Math.max(0,GM.clock-dt*TS);updClock();}}
 render(dt);}
function updClock(){const e=$g('gBug')?.querySelector('.clk');if(e)e.textContent=`${GM.q>4?'OT':'Q'+GM.q} ${clockTxt()}`;if(GM.clock<10&&GM.clock>0&&!GM.tickSaid&&(GM.q===2||GM.q>=4)){GM.tickSaid=true;booth.say('tick',0);}}
function steer(a,tx,ty,sp,dt,k=8){const dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy);const want=d>.05?Math.min(sp,d*4):0;const vx=d>1e-6?dx/d*want:0,vy=d>1e-6?dy/d*want:0;a.vx+=(vx-a.vx)*Math.min(1,dt*k);a.vy+=(vy-a.vy)*Math.min(1,dt*k);}
function spd(a){let s=SPD[a.pos]||7;if(a.team==='c'&&!GM.pro)s*=a.team===P.def?.92:.95;if(a===P.ctrl||(a.team==='u'&&a===P.carrier))s*=GM.pro?1:1.04;if(P.juke!=null&&a===P.carrier&&P.t<P.juke+.35)s*=1.25;if(P.pl&&P.pl.kind==='run'&&a===P.carrier&&a.team===P.off&&(a.x-GM.los)*P.d<1.5)s*=1.08;return s;}
function stick(){let ix=0,iy=0;if(keys.ArrowRight||keys.d)ix+=1;if(keys.ArrowLeft||keys.a)ix-=1;if(keys.ArrowUp||keys.w)iy-=1;if(keys.ArrowDown||keys.s)iy+=1;if(joy&&joy.on){ix=joy.vx;iy=joy.vy;}const m=Math.hypot(ix,iy);return m>.15?[ix/Math.max(1,m),iy/Math.max(1,m)]:null;}
function step(dt){const t=(P.t+=dt);const d=P.d,O=P.O,b=P.ball;const pl=P.pl;
 if(b.fly){const f=b.fly;const r=clamp((t-f.t0)/f.dur);b.x=lerp(f.x0,f.x1,r);b.y=lerp(f.y0,f.y1,r);b.h=lerp(f.h0,f.h1,r)+f.peak*4*r*(1-r);b.spin=(b.spin||0)+dt*18;
  if(r>=1){b.fly=null;if(f.pass)arrivePass(f);else if(f.kick)kickLand(f);else if(f.to)b.holder=f.to;}}
 if(P.result&&!P.live)return;
 if(pl.kind==='run'&&!P.handed&&t>=P.handT&&b.holder===O.QB){if(pl.toss){b.holder=null;b.fly={x0:O.QB.x,y0:O.QB.y,h0:1,x1:O.RB.x+O.RB.vx*.35,y1:O.RB.y+O.RB.vy*.35,h1:1,t0:t,dur:.35,peak:.4,to:O.RB};}else b.holder=O.RB;P.handed=true;}
 if(pl.kind==='pa'&&!P.faked&&t>=P.fakeT){P.faked=true;booth.say('pa_fake',0);toast('FAKE!');}
 const car=b.holder&&b.holder!==O.C?b.holder:null;P.carrier=car;
 // QB reads: one receiver at a time
 if(P.reads&&!P.thrown&&b.holder===O.QB&&!P.scramble&&t>=P.riT-.01&&!P.result){if(!P.readOn){P.readOn=true;P.ri=0;P.riStart=t;if(P.off==='u'){hint('');setAct('🎯 THROW',()=>throwRead());}}
  const r=O[P.reads[P.ri]];const open=openNow(r);P.curOpen=open;const dwell=open?1.5:.8;
  if(t-P.riStart>dwell&&P.reads.length>1){P.ri=(P.ri+1)%P.reads.length;P.riStart=t;}
  if(P.off==='c'&&!P.cpuThrow){const wait=t-(pl.drop||1);if((open&&wait>(GM.pro?.25:.45))||wait>2.4){P.cpuThrow=true;const tgt=open?r:bestRead();_st(()=>P&&!P.thrown&&throwTo(tgt),GM.pro?60:220);}}}
 if(P.off==='u'&&P.reads&&!P.thrown&&b.holder===O.QB&&t>pl.drop+2.2&&!P.pressSaid){P.pressSaid=true;booth.say('pressure',0);}
 for(const a of P.all){if(a.fall>0){a.vx*=.8;a.vy*=.8;continue;}
  if(a===car){moveCarrier(a,dt);continue;}
  if(a.team===P.off)offAI(a,dt,car);else if(a===P.ctrl&&!a.eng&&stick())userDef(a,dt);else defAI(a,dt,car);}
 for(const a of P.all){if(a.team!==P.off||!a.block||a.fall)continue;const df=a.block;if(df.fall||df===car)continue;
  if(dist(a,df)<1.4&&t<df.shed&&(!df.engBy||df.engBy===a)&&!(df===P.ctrl&&stick()&&t>df.shed*.6)){df.engBy=a;df.eng=1;}
  else if(df.engBy===a&&(t>=df.shed||dist(a,df)>2.2)){df.eng=0;df.engBy=null;df.shed=-1;a.block=null;}}
 for(const a of P.all){if(a.eng&&a.engBy){const o=a.engBy;const run=pl.kind==='run';const fx=run?d*.6:-d*.55,fy=run?(o.push||0)*1.5:0;a.vx=a.vx*.25+fx;a.vy=a.vy*.25+fy;o.vx=o.vx*.4+fx;o.vy=o.vy*.4+fy;}
  a.x+=a.vx*dt;a.y+=a.vy*dt;}
 for(let i=0;i<P.all.length;i++)for(let j=i+1;j<P.all.length;j++){const a=P.all[i],c=P.all[j];if(a===car||c===car)continue;const dx=a.x-c.x,dy=a.y-c.y,e=Math.hypot(dx,dy);if(e<.9&&e>1e-4){const f=(.9-e)/2;a.x+=dx/e*f;a.y+=dy/e*f;c.x-=dx/e*f;c.y-=dy/e*f;}}
 if(P.result)return;
 if(pl.kind==='punt'){if(b.holder===O.QB&&!P.kicked&&t>.95)puntKick();if(!P.ballCaught)return;}
 if(car===O.QB&&!P.thrown&&!P.scramble&&pl.kind!=='run'&&pl.kind!=='punt'){for(const df of P.all)if(df.team===P.def&&!df.eng&&!df.fall&&dist(df,O.QB)<1.05){return tackle(O.QB,df,'sack');}}
 if(car&&(car!==O.QB||P.scramble||pl.kind==='run')){const own=car.team===P.off?d:-d;
  if(own===1&&car.x>=110||own===-1&&car.x<=10)return endPlay({kind:'td',team:car.team});
  if(car.y<.35||car.y>52.98||car.x<-.2||car.x>120.2)return endPlay({kind:'oob',x:clamp(car.x,0,120),team:car.team});
  for(const df of P.all){if(df.team===car.team||df.fall||df.eng)continue;if(dist(df,car)<.95&&!df.tried.has(car)){df.tried.add(car);
   const sp=Math.hypot(car.vx,car.vy)||1,ex=df.x-car.x,ey=df.y-car.y,el=Math.hypot(ex,ey)||1;const cosA=(car.vx*ex+car.vy*ey)/(sp*el);
   const userCar=car.team==='u';const juking=P.juke!=null&&t<P.juke+.45;let brk;
   if(df===P.ctrl)brk=GM.pro?.14:.08;else if(userCar)brk=(.05+.3*clamp(1-cosA,0,1.6)/1.6+(juking?.55:0))*(GM.pro?.8:1)*(sp<4?.5:1);else brk=GM.pro?.12:.16;
   if(Math.random()<brk){df.fall=1;df.recover=t+1.1;SFX.play('thud');if(juking){toast('JUKE!');booth.say('juke',1);if(userCar)booth.explain('juke');}else{toast('Broken tackle!');if(Math.random()<.5)booth.say('broken',1);}}
   else return tackle(car,df);}}}
 for(const a of P.all)if(a.fall&&a.recover&&t>a.recover&&!P.result){a.fall=0;a.recover=0;}}
function openNow(r){if(!r||r.fall)return false;if(r.delay&&P.t<r.delay+.5)return false;if(r.rname==='screen')return P.t>(P.screenT||1)+.3;
 let e=9;for(const df of P.all){if(df.team!==P.def||df.fall||df.eng)continue;let s=dist(df,r);if((df.x-r.x)*P.d<-1)s+=1.3;if(s<e)e=s;}
 return e>=(P.off==='u'&&!GM.pro?2.1:2.5)+(P.pl.deep&&P.t<2&&r.rname!=='check'?.5:0);}
function bestRead(){let best=P.O[P.reads[0]],bv=-1;for(const k of P.reads){const r=P.O[k];let e=9;for(const df of P.all)if(df.team===P.def&&!df.fall)e=Math.min(e,dist(df,r));if(e>bv){bv=e;best=r;}}return best;}
function throwRead(){if(!P||P.thrown||P.ball.holder!==P.O.QB||P.scramble||P.result)return;throwTo(P.O[P.reads[P.ri]]);}
function throwTo(a){if(!P||P.thrown||P.ball.holder!==P.O.QB||P.result)return;P.thrown=true;P.throwOpen=openNow(a);hint('');setAct(null);
 const q=P.O.QB;let Tt=dist(q,a)/21;for(let i=0;i<3;i++){const tx=a.x+a.vx*Tt,ty=a.y+a.vy*Tt;Tt=Math.hypot(tx-q.x,ty-q.y)/21;}
 const tx=clamp(a.x+a.vx*Tt*.95,1,119),ty=clamp(a.y+a.vy*Tt*.95,.8,52.5);const far=Math.hypot(tx-q.x,ty-q.y);
 P.ball.holder=null;P.ball.fly={x0:q.x,y0:q.y,h0:1.4,x1:tx,y1:ty,h1:1.3,t0:P.t,dur:Math.max(.42,Tt),peak:Math.min(6,Tt*3.4),to:a,pass:true};P.target=a;P.passFar=far;SFX.play('swoosh');
 booth.say(far>22?'throw_deep':'throw',0);if(P.pl.kind==='screen')booth.say('screen',1);}
function arrivePass(f){const r=f.to;const b=P.ball;let sep=9,nd=null;for(const df of P.all)if(df.team===P.def&&!df.fall){const e=Math.hypot(df.x-f.x1,df.y-f.y1);if(e<sep){sep=e;nd=df;}}
 const rd=Math.hypot(r.x-f.x1,r.y-f.y1);let pc=sep>=2.2?.93:sep>=1.3?.7:.42;if(rd>1.7)pc=0;let pi=sep>=2.2?.01:sep>=1.3?.07:.22;if(P.off==='u'&&!GM.pro)pi*=.5;if(P.off==='c'&&!GM.pro)pc*=.92;
 if(P.off==='u'){if(P.throwOpen){pc=Math.max(pc,.88);pi=.02;}else{pi=Math.max(pi,GM.pro?.25:.18);pc=Math.min(pc,.45);}}
 const roll=Math.random();
 if(roll<pi&&nd&&rd<4){b.holder=nd;P.caught=true;P.turnover=true;SFX.play('pop');roar();booth.say('int',3);if(P.off==='u'&&!P.throwOpen)booth.explain('int_cov');flash('INTERCEPTED!','#ffb3ad');if(nd.team==='u'){P.ctrl=nd;setAct('💨 JUKE',doJuke);hint('Run it back! Steer toward their end zone');}return;}
 if(roll<pi+pc&&rd<=1.7){b.holder=r;P.caught=true;SFX.play('pop');booth.say(P.passFar>22?'catch_deep':'catch',1);if(P.passFar>22)roar(.8);if(P.off==='u'&&P.throwOpen&&P.ri>0)booth.explain('read_open');if(P.pl.kind==='pa'&&P.off==='u')booth.explain('pa');if(r.team==='u'){hint('Run with it! Steer toward open grass');setAct('💨 JUKE',doJuke);}return;}
 b.h=0;b.x=f.x1;b.y=f.y1;SFX.play('buzz');endPlay({kind:'inc'});}
function moveCarrier(a,dt){const d=a.team===P.off?P.d:-P.d;const s=spd(a);const O=P.O,pl=P.pl;
 if(a===O.QB&&a.team===P.off&&!P.thrown&&pl.kind!=='run'&&!P.scramble&&!P.turnover){
  if(a.team==='u'&&stick()&&P.t>.5){P.scramble=true;}else{steer(a,GM.los-P.d*(pl.form==='gun'?5.5:(pl.drop>.9?7:5)),C+(pl.kind==='pa'?-.6:0),4.5,dt);return;}}
 if(a===O.QB&&pl.kind==='run'&&!P.handed){steer(a,GM.los-P.d*(pl.toss?2:3.2),C+(pl.gap>0?-.5:.5),4.5,dt);return;}
 if(P.scramble&&a===O.QB&&!P.scrSaid){P.scrSaid=true;setAct('💨 JUKE',doJuke);hint('Scramble! Run for it');}
 if(a.team==='u'){const st=stick();
  if(st){steer(a,a.x+st[0]*5,a.y+st[1]*5,s,dt,9);return;}
  if(pl.kind==='run'&&P.hole&&(a.x-P.hole.x)*d<.5&&a.team===P.off){steer(a,P.hole.x+d*1,P.hole.y,s,dt,7);return;}}
 let vx=d*1.3,vy=0;if(pl.kind==='run'&&P.hole&&a.team===P.off&&(a.x-P.hole.x)*d<.5){vx=(P.hole.x+d-a.x);vy=(P.hole.y-a.y);const m=Math.hypot(vx,vy)||1;vx=vx/m*1.6;vy=vy/m*1.6;}
 for(const df of P.all){if(df.team===a.team||df.fall||df.eng)continue;const dx=a.x-df.x,dy=a.y-df.y,e=Math.hypot(dx,dy);if(e<6&&e>.01&&(df.x-a.x)*d>-1.5){const w=(6-e)/6;vy+=dy/e*w*1.4;vx+=dx/e*w*.3;}}
 if(a.y<5)vy+=(5-a.y)*.3;if(a.y>48.3)vy-=(a.y-48.3)*.3;const m=Math.hypot(vx,vy)||1;steer(a,a.x+vx/m*5,a.y+vy/m*5,s,dt,6);}
function offAI(a,dt,car){const d=P.d,t=P.t,O=P.O,pl=P.pl;
 if(pl.kind==='punt'){if(a===O.QB){steer(a,a.x,a.y,0,dt);return;}if(P.kicked){const r=P.ret;if(a.pos==='OL'&&t<1.5){steer(a,a.x,a.y,0,dt);return;}steer(a,r.x+d*(P.ballCaught?0:1.5),r.y,spd(a)*(a.pos==='OL'?.8:.95),dt);return;}steer(a,a.x,a.y,0,dt);return;}
 if(car&&car.team!==P.off){steer(a,car.x,car.y,spd(a)*.92,dt);return;}
 if(pl.kind==='pa'&&a===O.RB&&!P.thrown){if(t<1.4){steer(a,GM.los-d*.3,C+1.6,5.5,dt);return;}if(!a.pp){a.block=nearestRusher(a);a.pp=true;}}
 if(pl.kind==='screen'&&a.pos==='OL'&&t>P.screenT&&['RG','RT','C'].includes(a.k)&&!a.released){a.released=true;a.block=null;a.screenSpot={x:GM.los-d*.5+d*({C:1,RG:2.5,RT:4}[a.k]),y:C+8+({C:-1,RG:1,RT:3}[a.k])};}
 if(a.screenSpot&&!P.caught){steer(a,a.screenSpot.x,a.screenSpot.y,spd(a),dt);return;}
 if(a.block&&!a.block.fall&&!(a.route&&t>(a.delay||0))){const df=a.block;
  if(a.lead&&t<.9&&P.hole){steer(a,P.hole.x-d*.5,P.hole.y,spd(a),dt);return;}
  const ox=a.climb&&t<.5?a.x+d*.5:df.x-d*1.05;steer(a,ox,df.y-(a.push||0)*.4,spd(a)*(a.stalk?.9:1),dt);return;}
 if(a.route&&!P.caught&&pl.kind!=='run'){if(t<(a.delay||0)){steer(a,a.x-d*.3,a.y,2,dt);return;}
  const w=a.route[Math.min(a.wp,a.route.length-1)];steer(a,w.x,w.y,spd(a)*(a.rname==='screen'?.7:1),dt,a.rname==='hitch'&&a.wp>0?12:8);if(Math.hypot(w.x-a.x,w.y-a.y)<.8&&a.wp<a.route.length-1)a.wp++;
  if(P.thrown&&P.target===a&&P.ball.fly){const f=P.ball.fly;steer(a,f.x1,f.y1,spd(a),dt);}return;}
 if(a===O.QB){steer(a,a.x,a.y,0,dt);return;}
 if(car&&car!==a){let near=null,nd=8;for(const df of P.all)if(df.team===P.def&&!df.fall&&!df.eng){const e=Math.hypot(df.x-(car.x+d*3),df.y-car.y);if(e<nd){nd=e;near=df;}}
  if(near){steer(a,near.x-d*.9,near.y,spd(a)*.95,dt);if(dist(a,near)<1.3&&!near.engBy){near.engBy=a;near.eng=1;near.shed=P.t+rnd(.5,1.1);a.block=near;}return;}}
 steer(a,a.x+d*2,a.y,spd(a)*.4,dt);}
function nearestRusher(a){let n=null,bd=9;for(const df of P.all)if(df.team===P.def&&!df.eng&&!df.fall){const e=dist(a,df);if(e<bd){bd=e;n=df;}}return n;}
function defAI(a,dt,car){const d=P.d,t=P.t,O=P.O,pl=P.pl;const s=spd(a);
 if(pl.kind==='punt'){if(a===P.ret){if(P.ball.fly)steer(a,P.ball.fly.x1,P.ball.fly.y1,s,dt);else if(!P.ballCaught)steer(a,a.x,a.y,0,dt);return;}
  if(P.ballCaught){let near=null,nd=99;for(const o of P.all)if(o.team===P.off&&!o.fall&&!o.eng){const e=dist(o,P.ret);if(e<nd){nd=e;near=o;}}if(near&&dist(a,P.ret)<16){steer(a,near.x-d*.6,near.y,s*.9,dt);if(dist(a,near)<1.3&&!near.engBy){near.engBy=a;near.eng=1;near.shed=t+rnd(.6,1.2);}}else steer(a,a.x-d*1.5,a.y,3,dt);return;}
  if(a.pos==='DL'&&t<1.4){steer(a,GM.los-d*3,a.y,4.5,dt);return;}steer(a,a.x-d*1.2,a.y,2.5,dt);return;}
 if(a.eng)return;
 if(car&&car.team===a.team){let near=null,nd=99;for(const o of P.all)if(o.team!==a.team&&!o.fall){const e=dist(o,a);if(e<nd){nd=e;near=o;}}if(near)steer(a,near.x,near.y,s*.8,dt);return;}
 const pursue=(sp=s)=>{const tgt=car||O.QB;const e=dist(a,tgt);const lead=clamp(e/(sp+1),0,1.6);steer(a,tgt.x+tgt.vx*lead,tgt.y+tgt.vy*lead,sp,dt);};
 const as=a.as||{type:'zone',zx:a.hx,zy:a.hy,r:6};
 if(pl.kind==='pa'&&t<(P.fakeEnd||1)+1.1&&(a.pos==='LB'||a.pos==='S')&&as.type!=='rush'){if(a.bit==null){const bite={run:1,base:.85,blitz:.7,pass:.35}[P.dcall]??.7;a.bit=Math.random()<bite;}if(a.bit){steer(a,GM.los+d*.8,lerp(a.y,C,.3),s*.85,dt);return;}}
 if(as.type==='rush'||(pl.kind==='run'&&a.pos==='DL')){pursue(s);return;}
 if(car&&car!==O.QB&&(pl.kind==='run'?t>a.read:true)){pursue();return;}
 if(pl.kind==='run'&&t<a.read){steer(a,a.hx+(a.pos==='S'||a.pos==='CB'?d*.4:0),a.hy,2,dt);return;}
 if(pl.kind==='run'){pursue();return;}
 if(P.thrown&&P.ball.fly){const f=P.ball.fly;const e=Math.hypot(f.x1-a.x,f.y1-a.y);if(e<11){steer(a,f.x1,f.y1,s,dt);return;}}
 if(as.type==='box'){pursue(s*.9);return;}
 if(as.type==='man'){const r=O[as.tgt];if(r&&!r.fall){const lag=['go','post','seam'].includes(r.rname)?.98:GM.pro?.97:.93;steer(a,r.x+d*1.1,r.y+(r.y<C?.4:-.4),s*(r.pos==='RB'&&a.pos==='LB'?.95:lag),dt,a.pos==='CB'?5.5:5);return;}}
 if(as.type==='zone'){let tgt=null,td=-99;for(const k of P.reads||[]){const r=O[k];if(!r)continue;const e=Math.hypot(r.x-as.zx,r.y-as.zy);if(e<as.r){const depth=(r.x-GM.los)*d;if(depth>td){td=depth;tgt=r;}}}
  if(tgt){const deepZ=(as.zx-GM.los)*d>12;steer(a,tgt.x+d*(deepZ?1.8:.9),tgt.y,s*.95,dt);return;}steer(a,as.zx,as.zy,s*.8,dt);return;}
 pursue();}
function userDef(a,dt){const st=stick();steer(a,a.x+st[0]*5,a.y+st[1]*5,spd(a)*1.05,dt,10);}
function switchDef(){if(!P||!P.live||P.off!=='c')return;const tgt=P.ball.holder||P.ball;let best=null,bd=99;for(const a of Object.values(P.D)){if(a.fall||a===P.ctrl)continue;const e=Math.hypot(a.x-tgt.x,a.y-tgt.y);if(e<bd){bd=e;best=a;}}if(best){P.ctrl=best;SFX.play('pop');}}
function doJuke(){if(!P||!P.live||P.result)return;const c=P.carrier;if(!c||c.team!=='u')return;if(P.juke!=null&&P.t<P.juke+2.5){toast('Juke recharging…');return;}
 P.juke=P.t;let near=null,nd=9;for(const df of P.all)if(df.team!==c.team&&!df.fall){const e=dist(df,c);if(e<nd){nd=e;near=df;}}const jy=near?(near.y>c.y?-1:1):1;c.vy+=jy*6;SFX.play('swoosh');}
function action(){const a=$g('gAct');if(a&&!a.hidden&&a._fn)a._fn();}
function setAct(label,fn){const a=$g('gAct');if(!a)return;a.hidden=!label;a.textContent=label||'';a._fn=fn;a.classList.toggle('pulse',/SNAP|THROW|READY|STOP|SET|GO/.test(label||''));}

/* ---------------- end of play ---------------- */
function tackle(car,df,kind){SFX.play('thud');car.fall=1;df.fall=1;
 if(!kind&&P.pl.kind!=='punt'&&Math.random()<.018&&Math.hypot(df.vx,df.vy)>5)return fumble(car);
 endPlay({kind:kind||'tackle',x:car.x,team:car.team});}
function fumble(car){P.result={kind:'fumbling'};booth.say('fumble',3);flash('FUMBLE!','#ffd27a');P.ball.holder=null;P.ball.x=car.x;P.ball.y=car.y;P.ball.h=.3;
 let near=null,nd=99;for(const a of P.all)if(!a.fall&&a!==car){const e=dist(a,car);if(e<nd){nd=e;near=a;}}const team=near?near.team:P.def;
 later(()=>{if(!P)return;booth.say(team===car.team?'recover_off':'recover_def',2);P.result=null;endPlay({kind:team===car.team?'tackle':'fumlost',x:car.x,team:car.team});},800);}
function endPlay(res){if(!P||P.result)return;P.result=res;hint('');setAct(null);SFX.play('whistle');later(()=>{if(P)P.live=false;resolve(res);},res.kind==='td'?1500:1100);}
function gainOf(x){return Math.round((x-GM.los)*P.d);}
function resolve(res){const d=P.d,off=P.off,pl=P.pl;
 if(pl.kind==='punt')return afterPunt(res);
 if(res.kind==='td'){const tm=res.team;if(GM.two)return twoResult(tm===off);
  addPts(tm,6);flash('TOUCHDOWN!','#ffe08a');booth.say(tm==='u'?'td':'td_cpu',3);roar(tm==='u'?1.3:.7);if(tm==='u'){window.confetti&&confetti(160,true);SFX.play('cheer');}
  if(tm===off)stat(off,pl,gainOf(d===1?110:10));
  if(pl.kind==='run'&&off==='u'&&tm==='u')booth.explain('hole');
  return later(()=>afterTD(tm),2300);}
 if(GM.two)return twoResult(false);
 if(P.turnover||res.kind==='fumlost'||(res.team&&res.team!==off)){const x=res.x??P.ball.x;return later(()=>changePoss(x),600);}
 const x=res.kind==='inc'?GM.los:res.x;
 if(res.kind==='sack'){booth.say('sack',2);if(off==='u')booth.explain('sack');flash('SACK!','#ffb3ad');}
 if(res.kind!=='inc'&&(d===1&&x<10||d===-1&&x>110)){const de=off==='u'?'c':'u';addPts(de,2);flash('SAFETY!','#ffb3ad');booth.say('safety',3);booth.explain('safety');
  return later(()=>{if(scoredInOT())return;const go=()=>kickoff(off,()=>newSeries(de,de==='u'?45:75));if(checkClock(go))go();},2300);}
 const gain=gainOf(x);GM.los=clamp(Math.round(x),11,109);stat(off,pl,gain);
 if(res.kind==='inc')booth.say('incomplete',1);else if(res.kind==='oob'){booth.say('oob',1);if(off==='u')booth.explain('oob');}
 else if(res.kind!=='sack'){if(pl.kind==='run'||P.scramble){if(gain>=15)roar();booth.say(gain>=15?'run_big':gain>=5?'run_good':gain>0?'run_short':gain===0?'run_none':'run_loss',2);
   if(off==='u'&&pl.kind==='run'){if(gain>=6)booth.explain('hole');else if(gain<=0)booth.explain('stuffed');}
   if(off==='c'&&gain<=0)booth.say('tfl_def',1);}
  if(pl.kind==='screen'&&P.dcall==='blitz'&&gain>=5)booth.explain('blitz_screen');}
 if(off==='c'&&P.uCall){const isRun=pl.kind==='run';const right=(isRun&&P.uCall==='run')||(!isRun&&(P.uCall==='pass'||(P.uCall==='blitz'&&pl.kind!=='screen')));if(Math.random()<.45){if(right&&gain<=3)booth.explain('guess_right',false,0);else if(!right&&gain>=8)booth.explain('guess_wrong',false,0);}if(P.uCall==='pass'&&pl.deep&&res.kind==='inc')booth.explain('zone_deep');}
 if(off==='u')GM.recent.push(pl.kind==='run'?'run':'pass');if(off==='u'&&pl.kind==='run'&&gain>=4){GM.goodRuns++;if(GM.goodRuns>=2&&!GM.seen.pa&&!GM.paTipShown)GM.paTip=true;}
 if(off==='u'&&GM.uPlay==='pa')GM.paTip=false;
 const clockRuns=res.kind==='tackle'||res.kind==='sack';
 const reached=(GM.los-GM.fd)*d>=0;
 if(reached){GM.down=1;GM.togo=10;toast(`${gain>=0?'+':''}${gain} yards · FIRST DOWN!`);later(()=>booth.say('first',1),400);if(off==='u')booth.explain('first');}
 else{GM.togo=Math.round((GM.fd-GM.los)*d);GM.down++;toast(res.kind==='inc'?'Incomplete':`${gain>=0?'+':''}${gain} yards`);
  if(GM.down>4){flash('TURNOVER ON DOWNS','#ffb3ad');booth.say('tod',3);booth.explain('tod');return later(()=>changePoss(GM.los),1400);}}
 updBug();runoff(clockRuns,()=>nextPlay());}
function stat(team,pl,g){if(!pl)return;if(pl.kind==='run'||P.scramble)GM.stats[team].rush+=g;else if(P.caught)GM.stats[team].pass+=g;}
function addPts(t,n){GM.score[t]+=n;updBug();}
function runoff(runs,next){const waitIdle=(t0)=>{if(!GM)return;if(booth.busy()&&performance.now()-t0<2500){_st(()=>waitIdle(t0),150);return;}if(checkClock(next))next();};if(runs&&GM.clock>0){const sec=GM.pro?6:5;const from=GM.clock,to=Math.max(0,GM.clock-sec);const t0=performance.now();
  const tick=()=>{if(!GM)return;const r=clamp((performance.now()-t0)/900);GM.clock=lerp(from,to,r);updClock();if(r<1)requestAnimationFrame(tick);};tick();}
 later(()=>waitIdle(performance.now()),1300);}
function checkClock(cont){if(GM.clock>.05)return true;endQuarter(cont);return false;}
function endQuarter(cont){const q=GM.q;GM.tickSaid=false;const sc=`${esc(GM.u.name)} ${GM.score.u} – ${GM.score.c} ${esc(GM.c.name)}`;
 if(q===1||q===3){booth.say('q_end',2);banner(`END OF Q${q}`,sc,()=>{GM.q++;GM.clock=QLEN;updBug();if(GM.q===4)booth.say('q4',1);cont();});return;}
 if(q===2){booth.say('half',3);booth.explain('half',true,2);banner('HALFTIME',sc,()=>{GM.q=3;GM.clock=QLEN;updBug();kickoff('u',()=>newSeries('c',75));});return;}
 if(GM.score.u===GM.score.c&&q===4){booth.say('ot',3);banner('OVERTIME','Next score wins!',()=>{GM.q=5;GM.clock=QLEN;updBug();kickoff('c',()=>newSeries('u',45));});return;}
 gameOver();}
function scoredInOT(){if(GM.q>=5&&GM.score.u!==GM.score.c){later(gameOver,1600);return true;}return false;}
function changePoss(x){const nt=GM.poss==='u'?'c':'u';if(nt==='u'&&x<=10)x=30;if(nt==='c'&&x>=110)x=90;
 const go=()=>newSeries(nt,clamp(Math.round(x),11,109));if(checkClock(go))go();}

/* ---------------- touchdowns & tries ---------------- */
function afterTD(team){if(scoredInOT())return;
 if(team==='u'){const p=$g('gPanel');p.innerHTML=`<div class="callbar"><div class="gq">Touchdown! Now pick your bonus try:</div><div class="cards"><button class="pc" data-k="xp">${kickDia('fg')}<b>🦵 Extra Point</b><small>A short kick. 1 point. Easy!</small></button><button class="pc" data-k="two">${diagram('power')}<b>✌️ Go for Two</b><small>One play from the 2. Score for 2 points.</small></button></div></div>`;
  p.querySelectorAll('.pc').forEach(b=>b.onclick=()=>{SFX.play('pop');p.innerHTML='';if(b.dataset.k==='xp')fieldGoal('u',true);else{booth.say('two_go',2);booth.explain('two');GM.two=true;GM.poss='u';GM.los=108;GM.down=1;GM.togo=2;nextPlay();}});}
 else{GM.poss='c';fieldGoal('c',true);}}
function twoResult(ok){const tm=GM.poss;GM.two=false;if(ok){addPts(tm,2);booth.say('two_good',3);flash('2 POINTS!','#ffe08a');}else{booth.say('two_fail',2);flash('NO GOOD','#dfe5f2');}
 later(()=>{if(scoredInOT())return;afterScoreKick(tm);},1900);}
function afterScoreKick(scorer){const go=()=>kickoff(scorer,()=>newSeries(scorer==='u'?'c':'u',scorer==='u'?75:45));if(checkClock(go))go();}

/* ---------------- kickoffs ---------------- */
function kickoff(kicker,cb){GM.pid++;GM.phase='kickoff';clearPlan();hideCoach();setAct(null);$g('gPanel').innerHTML='';hint('');L.actors.innerHTML='';$g('gKV').hidden=true;updBug();
 const d=kicker==='u'?1:-1;const kx=kicker==='u'?45:75;P={t:0,d,off:kicker,def:kicker==='u'?'c':'u',O:{},D:{},all:[],ball:{x:kx,y:C,h:0,holder:null,fly:null},live:false,pl:{kind:'ko'}};
 for(let i=0;i<11;i++){const a=mk(kicker,'K'+i,[3,40,41,42,43,44,45,46,47,48,49][i],'K',kx-d*(i===0?6:1),i===0?C:4+i*4.6,d);P.all.push(a);}
 const rx=kicker==='u'?113:7;const ret=mk(P.def,'R',22,'RB',rx,C,-d);P.all.push(ret);
 L.los.setAttribute('opacity',0);L.fdl.setAttribute('opacity',0);cam.x=kx+d*20;booth.say('kickoff',1);
 const t0=performance.now();let kicked=false,last=t0;const fr=()=>{if(!GM||!P||P.pl.kind!=='ko')return;const now=performance.now(),u=(now-t0)/1000,dt=Math.min(.05,(now-last)/1000);last=now;
  const k=P.all[0];if(u<.8){k.x=kx-d*6+d*6*(u/.8);k.vx=d*7;}else if(!kicked){kicked=true;k.vx=0;SFX.play('kick');P.ball.fly={x0:kx,y0:C,h0:.3,x1:rx+d*1,y1:C+rnd(-3,3),h1:.5,t0:0,dur:2.4,peak:18};P.t=0;}
  if(kicked){P.t+=dt;const f=P.ball.fly;const r=clamp(P.t/f.dur);P.ball.x=lerp(f.x0,f.x1,r);P.ball.y=lerp(f.y0,f.y1,r);P.ball.h=lerp(f.h0,f.h1,r)+f.peak*4*r*(1-r);P.ball.spin=(P.ball.spin||0)+dt*18;
   for(const a of P.all.slice(1,11)){a.vx=d*7;a.x+=a.vx*dt;}
   if(r>=1){P.ball.holder=ret;P.pl.kind='done';for(const a of P.all)a.vx=0;toast('TOUCHBACK');booth.explain('touchback');later(cb,1300);return;}}
  requestAnimationFrame(fr);};fr();}

/* ---------------- field goals (behind-the-kicker view) ---------------- */
function fgDist(){return Math.round((GM.poss==='u'?110-GM.los:GM.los-10)+17);}
function fieldGoal(team,xp){GM.pid++;GM.phase='kick';$g('gPanel').innerHTML='';hideCoach();hint('');setAct(null);const D=xp?33:fgDist();
 if(!xp&&team==='c')booth.explain('fg_range');const kv=kickScene(team,D);
 if(team==='u'){const maxR=GM.pro?60:63;const need=clamp(D/maxR,.2,1);const zone=clamp(.42*Math.pow(30/D,.9),.1,.42)*(GM.pro?1:1.3);
  const go=()=>meterPower(need,`Needs ${Math.round(need*100)}%+`,pw=>meterAcc(zone,ac=>animKick(kv,team,D,pw*maxR>=D,ac/zone,pw-need,xp)));
  if(!GM.seen.fg){GM.seen.fg=1;store.set('seen',GM.seen);coach({title:'🥅 Kicking',what:'The ball has to go between the yellow posts and over the crossbar.',job:'Tap STOP to set <b>POWER</b> (past the black line, or it falls short), then STOP again for <b>ACCURACY</b> (needle in the green).',btn:'Got it'},go);}else go();}
 else{const p=xp?.97:D<30?.96:D<40?.9:D<50?.78:D<56?.6:.42;const good=Math.random()<p;const shortMiss=!good&&D>45&&Math.random()<.5;const ac=good?rnd(-.6,.6):(Math.random()<.5?-1:1)*rnd(1.15,1.6);
  later(()=>animKick(kv,team,D,!shortMiss,shortMiss?rnd(-.4,.4):ac,good?.15:-.05,xp),1000);}}
function kickScene(team,D){const host=$g('gKV');host.hidden=false;const s=host.querySelector('svg');s.innerHTML='';const kt=GM[team].color,dt=GM[team==='u'?'c':'u'].color;
 const g=E('g',{},s);const hz=250;
 E('rect',{width:1280,height:hz,fill:'#7fc6f2'},g);E('rect',{y:hz-90,width:1280,height:90,fill:'#4b5a7d'},g);
 for(let i=0;i<160;i++)E('circle',{cx:(i*53)%1290,cy:hz-80+(i%5)*14+((i*7)%9),r:4.2,fill:['#ff5a4e','#ffc93c','#fff','#2f6fed','#2ec4b6'][i%5],opacity:.85},g);
 E('rect',{y:hz,width:1280,height:720-hz,fill:'#3e9e48'},g);
 for(let i=-14;i<=14;i++)if(i%2)E('path',{d:`M${640+i*30},${hz} L${640+i*260},720 L${640+(i+1)*260},720 L${640+(i+1)*30},${hz}Z`,fill:'#47ab51'},g);
 const py=dd=>hz+3600/(dd+10);
 const ezY0=py(D-7),ezY1=py(D+3);E('rect',{x:0,y:ezY1,width:1280,height:ezY0-ezY1,fill:TEAM[dt].helmet,opacity:.9},g);
 for(let yd=5;yd<=D+3;yd+=5){const y=py(yd);if(y>720)continue;E('rect',{x:0,y,width:1280,height:Math.max(1.5,9000/Math.pow(yd+10,2)),fill:'#fff',opacity:.85},g);}
 const w=6000/(D+4),by=py(D);const up=E('g',{},g);
 E('path',{d:`M640,${by} V${by-w*.45} M${640-w/2},${by-w*.45} H${640+w/2} M${640-w/2},${by-w*.45} V${by-w*.45-w*1.15} M${640+w/2},${by-w*.45} V${by-w*.45-w*1.15}`,stroke:'#ffd84a','stroke-width':Math.max(3,w*.05),'stroke-linecap':'round',fill:'none'},up);
 const line=E('g',{},g);const defs=[],mates=[];for(let i=0;i<6;i++){const p=drawPlayer(line,dt,90+i,-1);p.g.setAttribute('transform',`translate(${495+i*58},445) scale(.8)`);defs.push(p);}
 for(let i=0;i<7;i++){const p=drawPlayer(line,kt,60+i,1);p.g.setAttribute('transform',`translate(${470+i*57},495) scale(1)`);mates.push(p);}
 const holder=drawPlayer(g,kt,4,1);holder.g.setAttribute('transform','translate(655,580) scale(1.45)');holder.rot.setAttribute('transform','rotate(35)');
 const kicker=drawPlayer(g,kt,3,1);kicker.g.setAttribute('transform','translate(530,625) scale(1.7)');const ball=drawBall(g,2);ball.setAttribute('transform','translate(660,570)');
 const lab=E('g',{transform:'translate(1060,40)'},g);E('rect',{x:-160,y:-26,width:320,height:52,rx:26,fill:NAVY,stroke:'#fff','stroke-width':4},lab);T(lab,0,2,D===33?'EXTRA POINT':`${D}-YARD FIELD GOAL`,{size:28,fill:YEL});
 return{s,g,w,by,ball,kicker,holder,defs,mates,D};}
function meterPower(need,label,cb){const p=$g('gPanel');const per=GM.pro?1.5:1.9;
 p.innerHTML=`<div class="kmeter"><div class="kq">1 of 2 · Tap STOP to set <b>POWER</b> <small>${label}</small></div><div class="pbar"><i class="need" style="left:${need*100}%"></i><b id="gPw"></b></div></div>`;
 const bar=$g('gPw');const t0=performance.now();let on=true;const an=()=>{if(!on||!bar.isConnected)return;const ph=((performance.now()-t0)/1000/per)%1;const v=ph<.5?ph*2:2-ph*2;bar.style.width=(v*100)+'%';bar._v=v;bar.classList.toggle('ok',v>=need);requestAnimationFrame(an);};an();
 setAct('⏺ STOP',()=>{if(!on)return;on=false;SFX.play('pop');setAct(null);const v=bar._v??.5;later(()=>cb(v),350);});}
function meterAcc(zone,cb){const p=$g('gPanel');const per=GM.pro?1.1:1.45;
 p.innerHTML=`<div class="kmeter"><div class="kq">2 of 2 · Tap STOP to set <b>ACCURACY</b> <small>stop the needle in the green</small></div><div class="abar"><i class="zone" style="left:${50-zone*50}%;width:${zone*100}%"></i><b id="gAc"></b></div></div>`;
 const nd=$g('gAc');const t0=performance.now();let on=true;const an=()=>{if(!on||!nd.isConnected)return;const ph=((performance.now()-t0)/1000/per)%1;const v=ph<.5?ph*4-1:3-ph*4;nd.style.left=((v+1)*50)+'%';nd._v=v;requestAnimationFrame(an);};an();
 setAct('⏺ STOP',()=>{if(!on)return;on=false;SFX.play('pop');setAct(null);const v=nd._v??0;later(()=>{p.innerHTML='';cb(v);},300);});}
function animKick(kv,team,D,longEnough,accN,surplus,xp){setAct(null);hint('');hideCoach();const t0=performance.now();let kicked=false;const good=longEnough&&Math.abs(accN)<1;
 const tx=640+accN*kv.w/2,cross=kv.by-kv.w*.45;const endY=longEnough?cross-Math.max(20,surplus*kv.w*1.5+kv.w*.25):cross+kv.w*.35;
 const fr=()=>{if(!GM)return;const u=(performance.now()-t0)/1000;const run=clamp((u-.6)/.6);kv.kicker.g.setAttribute('transform',`translate(${lerp(530,614,Ease.in(run))},${lerp(625,598,run)}) scale(1.7)`);
  if(u>1.2&&!kicked){kicked=true;SFX.play('kick');}
  const s=clamp((u-1.2)/1.5);if(u>1.2){const bx=lerp(660,tx,s),byy=lerp(570,endY,Ease.out(s))-Math.sin(s*Math.PI)*kv.w*.5,sc=lerp(1,.18,s);kv.ball.setAttribute('transform',`translate(${bx},${byy}) rotate(${s*700}) scale(${sc})`);}
  kv.defs.forEach((d0,i)=>d0.g.setAttribute('transform',`translate(${495+i*58},${445-(u>1&&u<2?Math.abs(Math.sin(u*6+i))*26:0)}) scale(.8)`));
  if(u<3)requestAnimationFrame(fr);else done();};fr();
 const done=()=>{if(!GM)return;const pts=xp?1:3;if(good){addPts(team,pts);SFX.play('cheer');roar(.8);booth.say(xp?'xp_good':'fg_good',3);kvFlash(kv,"IT'S GOOD!",'#bfffcf');if(team==='u'&&!xp)window.confetti&&confetti(120,true);}
  else{SFX.play('buzz');booth.say(xp?'xp_miss':longEnough?'fg_wide':'fg_short',3);kvFlash(kv,longEnough?'NO GOOD: WIDE':'NO GOOD: SHORT','#dfe5f2');}
  later(()=>{$g('gKV').hidden=true;if(xp||good){if(scoredInOT())return;afterScoreKick(team);}else{const x=GM.los;changePoss(GM.poss==='u'?x-7:x+7);}},2300);};}
function kvFlash(kv,text,col){const g=E('g',{transform:'translate(640,330)'},kv.s);E('path',{d:starPath(1,.82,16),fill:'#fff',stroke:NAVY,'stroke-width':6,'vector-effect':'non-scaling-stroke',transform:`scale(${26*text.length+70},84)`},g);T(g,0,4,text,{size:64,fill:col,stroke:NAVY,sw:10});}

/* ---------------- punts ---------------- */
function spawnPunt(){L.actors.innerHTML='';clearPlan();const off=GM.poss,def=off==='u'?'c':'u',d=off==='u'?1:-1,los=GM.los;
 P={t:0,d,off,def,O:{},D:{},all:[],ball:{x:los,y:C,h:0,holder:null,fly:null},live:false,result:null,pl:{kind:'punt'},dcall:'base'};
 const op=[['C',58,'OL',.8,0],['LG',66,'OL',.8,-1.9],['RG',67,'OL',.8,1.9],['LT',71,'OL',.8,-3.8],['RT',74,'OL',.8,3.8],['W1',85,'WR',1,-20],['W2',86,'WR',1,20],['P1',41,'TE',1,5.8],['P2',42,'TE',1,-5.8],['B',45,'FB',5,1.2],['QB',8,'P',13,0]];
 for(const [k,n,pos,dx,dy] of op){const a=mk(off,k,n,pos,los-d*dx,C+dy,d);P.O[k]=a;P.all.push(a);}
 const dp=[['DE1',91,'DL',1.1,-3],['DT1',93,'DL',1.1,-1],['DT2',97,'DL',1.1,1],['DE2',99,'DL',1.1,3],['LB1',52,'LB',4,-5],['LB2',54,'LB',4,0],['LB3',56,'LB',4,5],['CB1',24,'CB',2,-20],['CB2',21,'CB',2,20],['S2',32,'S',25,0],['S1',31,'S',40,0]];
 for(const [k,n,pos,dx,dy] of dp){const a=mk(def,k,n,pos,clamp(los+d*dx,1,119),C+dy,-d);P.D[k]=a;P.all.push(a);}
 P.ret=P.D.S1;P.ball.holder=P.O.C;for(const k of ['LT','LG','C','RG','RT'])P.O[k].block=P.D[{LT:'DE1',LG:'DT1',C:'DT1',RG:'DT2',RT:'DE2'}[k]];for(const a of Object.values(P.D))a.shed=rnd(1.4,2.2);
 updBug();}
function userPunt(){GM.phase='aim';booth.explain('punt_smart');const d=P.d;const px=GM.los-d*13;const maxP=GM.pro?58:62;
 P.aim={x:clamp(px+d*45,1,119),y:C};const g=E('g',{},L.plan);const arc=E('path',{fill:'none',stroke:'#fff','stroke-width':.3,'stroke-dasharray':'.8 .6'},g);const ring=E('circle',{r:2.4,fill:'rgba(255,226,58,.35)',stroke:YEL,'stroke-width':.4},g);const dot=E('circle',{r:.45,fill:YEL},g);
 const lab=E('g',{},g);const lr=E('rect',{x:-5,y:-1,width:10,height:2,rx:1,fill:NAVY},lab);const lt=T(lab,0,0,'',{size:1.15,fill:YEL});
 P.aimDraw=()=>{const a=P.aim;const dd=Math.abs(a.x-px);ring.setAttribute('cx',a.x);ring.setAttribute('cy',a.y);dot.setAttribute('cx',a.x);dot.setAttribute('cy',a.y);arc.setAttribute('d',`M${px},${C} Q${(px+a.x)/2},${(C+a.y)/2-8} ${a.x},${a.y}`);
  lab.setAttribute('transform',`translate(${a.x},${a.y-3.6})`);const ez=d===1?a.x>110:a.x<10;lt.textContent=ez?'END ZONE = touchback':`${Math.round(dd)}-yard punt`;lr.setAttribute('fill',ez?'#c0392b':NAVY);};
 P.aimDraw();P.aimMode=true;
 coach({title:'🦵 Punt',what:'You kick the ball away so the other team starts far from scoring.',job:'Drag the yellow target (or use the arrow keys) to pick where the ball lands. Close to their end zone is great, but <b>inside</b> it is just a touchback. Then set POWER and ACCURACY.',short:!!GM.seen.punt,btn:'✔ Set target'},()=>goPunt());GM.seen.punt=1;store.set('seen',GM.seen);
 setAct('✔ SET TARGET',()=>goPunt());
 function goPunt(){if(!P||!P.aimMode)return;P.aimMode=false;hideCoach();setAct(null);const dd=Math.abs(P.aim.x-px);const need=clamp(dd/maxP,.3,1);
  meterPower(need,`stop on the black line to hit your target`,pw=>meterAcc(.34*(GM.pro?1:1.3),ac=>{P.puntRes={dist:dd*(1-Math.min(.6,Math.abs(pw-need)*.9)),lat:ac*7};snapPunt();}));}}
function snapPunt(){if(!P||P.live)return;GM.pid++;setAct(null);hideCoach();GM.phase='live';P.live=true;P.t=0;const O=P.O,d=P.d;SFX.play('hut');P.ball.holder=null;P.ball.fly={x0:O.C.x,y0:C,h0:.6,x1:O.QB.x+d*.3,y1:C,h1:1.2,t0:0,dur:.55,peak:.3,to:O.QB};}
function cpuPunt(){GM.phase='presnap';booth.say('punt',1);const d=P.d;const px=GM.los-d*13;let land=px+d*rnd(40,52);
 if(d===-1&&land<12)land=rnd(12,18);if(d===1&&land>108)land=rnd(102,108);P.puntRes={dist:Math.abs(land-px),lat:rnd(-5,5)};
 coach({title:'🙌 Punt return',what:`${esc(GM.c.name)} are punting the ball to you.`,job:'Your returner catches it. Steer him up the field after the catch. Or press <b>FAIR CATCH</b> while the ball is in the air to catch it safely with no return.',short:!!GM.seen.ret,btn:'▶ GO'},()=>{hideCoach();snapPunt();});GM.seen.ret=1;store.set('seen',GM.seen);
 setAct('▶ GO',()=>{hideCoach();snapPunt();});}
function puntKick(){const O=P.O,d=P.d,q=O.QB;P.kicked=true;SFX.play('kick');if(P.off==='u')booth.say('punt',1);const R=P.puntRes;
 let x1=q.x+d*R.dist,y1=(P.aim?P.aim.y:C)+R.lat;let oob=false;
 if(y1<0||y1>53.33){const yb=y1<0?0:53.33;const y0=q.y;const f=(yb-y0)/(y1-y0);x1=q.x+(x1-q.x)*f;y1=yb;oob=true;}
 P.ball.holder=null;const hang=clamp(2.6+R.dist/22,3,4.6);P.ball.fly={x0:q.x,y0:q.y,h0:1.2,x1:clamp(x1,-1,121),y1,h1:1.1,t0:P.t,dur:hang,peak:16,kick:'punt',oob};
 if(P.off==='c'){setAct('✋ FAIR CATCH',()=>{P.fairCall=true;setAct(null);toast('Fair catch called');hint('Fair catch: your returner will catch it and stop');});hint('Ball in the air! FAIR CATCH or get ready to run');}
 else hint('Your coverage team is racing downfield!');}
function kickLand(f){const d=P.d,x=f.x1;hint('');
 if(f.oob){P.ball.h=0;booth.say('punt_oob',1);return endPunt(x);}
 if(d===1&&x>=110||d===-1&&x<=10){P.ball.h=0;booth.say('punt_tb',1);return endPunt(d===1?90:30);}
 const r=P.ret;if(dist(r,{x,y:f.y1})>3){P.ball.x=x+d*rnd(2,6);P.ball.h=0;toast('Ball downed');return endPunt(P.ball.x);}
 r.x=lerp(r.x,x,.8);r.y=lerp(r.y,f.y1,.8);P.ball.holder=r;P.ballCaught=true;
 let cover=99;for(const a of P.all)if(a.team===P.off&&!a.fall)cover=Math.min(cover,dist(a,r));
 const fair=r.team==='u'?!!P.fairCall:(cover<6||(d===1?x>98:x<22));
 if(fair){booth.say('fair',1);if(r.team==='u')booth.explain('fair');toast('FAIR CATCH');return endPunt(r.x);}
 setAct(null);booth.say('punt_ret',1);if(r.team==='u'){hint('Return it! Steer up the field');setAct('💨 JUKE',doJuke);}}
function endPunt(x){if(P.result)return;P.result={kind:'punt'};setAct(null);later(()=>{if(P)P.live=false;afterPunt({kind:'punt',x});},1100);}
function afterPunt(res){const recv=P.def;
 if(res.kind==='td'){const tm=res.team;addPts(tm,6);flash('TOUCHDOWN!','#ffe08a');booth.say(tm==='u'?'td':'td_cpu',3);if(tm==='u')window.confetti&&confetti(160,true);GM.poss=tm;return later(()=>afterTD(tm),2300);}
 let x=res.x??P.ball.x;if(res.kind==='tackle'||res.kind==='oob')x=res.x;
 if(recv==='u'&&x<=10)x=30;if(recv==='c'&&x>=110)x=90;
 const yl=recv==='u'?x-10:110-x;if(yl<=10){booth.say('pinned',1);booth.explain('pinned');}
 const go=()=>newSeries(recv,clamp(Math.round(x),11,109));if(checkClock(go))go();}

/* ---------------- game over ---------------- */
function gameOver(){GM.phase='over';updBug();const u=GM.score.u,c=GM.score.c;const res=u>c?'win':u<c?'lose':'tie';booth.say(res,3);setAct(null);hint('');$g('gPanel').innerHTML='';
 if(res==='win'){SFX.play('cheer');window.confetti&&(confetti(260,true),_st(()=>window.confetti&&confetti(200,true),900));}
 const o=$g('gOver');o.hidden=false;o.innerHTML=`<div class="gfinal"><div class="big">${res==='win'?'🏆':res==='tie'?'🤝':'🏈'}</div><h2>${res==='win'?`${esc(GM.u.name)} win!`:res==='tie'?'It\'s a tie!':`${esc(GM.c.name)} win this time`}</h2>
 <div class="fs"><span style="--c:${COLORS.find(x=>x[0]===GM.u.color)[1]}">${esc(GM.u.name)} <b>${u}</b></span><span style="--c:${COLORS.find(x=>x[0]===GM.c.color)[1]}">${esc(GM.c.name)} <b>${c}</b></span></div>
 <p>Your offense: <b>${GM.stats.u.rush}</b> rushing yards · <b>${GM.stats.u.pass}</b> passing yards</p>
 <div class="row"><button class="btn primary" id="gAgain">↺ Play again</button><button class="btn" id="gNew">🎨 New team</button><button class="btn" id="gMenu2">◀ Menu</button></div></div>`;
 $g('gAgain').onclick=()=>{o.hidden=true;startGame(GM.u.name,GM.u.color,GM.c.name,GM.c.color,GM.diff);};$g('gNew').onclick=()=>{o.hidden=true;setupScreen();};$g('gMenu2').onclick=()=>{window.gameStop();showMenu();};}
function banner(title,sub,cb){const o=$g('gOver');o.hidden=false;o.innerHTML=`<div class="gban"><h2>${title}</h2><p>${sub}</p></div>`;later(()=>{o.hidden=true;o.innerHTML='';cb&&cb();},2600);}

/* ---------------- UI bits ---------------- */
function roar(big=1){try{SFX.on&&SFX.noise(1.9*big,.06*big,800,.5);SFX.on&&SFX.noise(1.5*big,.045*big,1500,.6,.12);}catch(e){}}
function hint(t){const h=$g('gHint');if(h){h.textContent=t;h.classList.toggle('show',!!t);}}
function toast(t){const e=$g('gToast');if(!e)return;e.textContent=t;e.classList.remove('show');void e.offsetWidth;e.classList.add('show');}
function flash(text,color){const g=E('g',{},L.ui);E('path',{d:starPath(1,.8,16),fill:'#fff',stroke:NAVY,'stroke-width':6,'vector-effect':'non-scaling-stroke',transform:`scale(${30*text.length+60},80)`},g);T(g,0,4,text,{size:78,fill:color,stroke:NAVY,sw:10});
 const t0=performance.now();const an=()=>{const u=(performance.now()-t0)/1000;if(u>1.9||!g.isConnected){g.remove();return;}const s=u<.3?Ease.back(u/.3):1;g.setAttribute('transform',`translate(640,300) scale(${s}) rotate(-5)`);g.setAttribute('opacity',u>1.6?(1.9-u)/.3:1);requestAnimationFrame(an);};an();}

/* ---------------- rendering ---------------- */
const toScr=(x,y)=>[640+(x-cam.x)*cam.z,360+(y-cam.y)*cam.z];
let isTouch=matchMedia('(pointer:coarse)').matches;
function render(dt){if(!P)return;const b=P.ball;const kind=P.pl&&P.pl.kind;
 const narrow=matchMedia('(max-height:540px)').matches;let z=narrow?12:14;if(camClose)z*=1.35;
 if(kind==='punt'||kind==='ko'||kind==='done')z*=.8;else if(b.fly&&b.fly.pass)z*=.9;
 cam.z+=(z-cam.z)*Math.min(1,dt*3);
 let fx,fy;if(GM.phase==='aim'&&P.aim){fx=(P.aim.x+GM.los)/2;fy=C;}
 else if(kind==='ko'||kind==='done'){const f=b.holder||b;fx=f.x;fy=C;}
 else if(!P.live){fx=GM.los+P.d*(kind==='punt'?18:7);fy=C;if(narrow&&!$g('gCoach').hidden&&kind!=='punt')fx=GM.los+11;}
 else{const focus=b.holder||b;fx=focus.x+(!P.result&&b.holder?P.d*(b.holder.team===P.off?6:-2):0);fy=C+(focus.y-C)*.6;}
 const hw=640/cam.z,hh=360/cam.z;cam.x+=(clamp(fx,hw-4,124-hw)-cam.x)*Math.min(1,dt*2.6);cam.y+=(clamp(fy,hh-3,56.3-hh)-cam.y)*Math.min(1,dt*2.4);
 const tr=`translate(${640-cam.x*cam.z},${360-cam.y*cam.z}) scale(${cam.z})`;L.world.setAttribute('transform',tr);L.paint.setAttribute('transform',tr);L.top.setAttribute('transform',tr);
 const sc=clamp(cam.z/19,.55,1.1);const order=[];
 for(const a of P.all){const [sx,sy]=toScr(a.x,a.y);const sp=Math.hypot(a.vx,a.vy);a.amp+=((sp>.8?1:0)-a.amp)*Math.min(1,dt*10);a.ph+=dt*(10+Math.min(8,sp*.6));
  if(Math.abs(a.vx)>1.2)a.face=Math.sign(a.vx);const bob=-Math.abs(Math.sin(a.ph))*6*a.amp,leg=Math.sin(a.ph)*32*a.amp;
  const hasBall=b.holder===a&&a!==P.O.C,me=a===P.ctrl&&P.live&&!P.result;
  a.el.g.setAttribute('transform',`translate(${sx},${sy}) scale(${sc*(hasBall||me?1.12:1)})`);a.el.rot.setAttribute('transform',`rotate(${a.face*82*a.fall})`);a.el.bob.setAttribute('transform',`translate(0,${bob})`);a.el.flip.setAttribute('transform',`scale(${a.face},1)`);
  a.el.legL.setAttribute('transform',`rotate(${leg},-6,-15)`);a.el.legR.setAttribute('transform',`rotate(${-leg},6,-15)`);
  a.el.ring.setAttribute('opacity',hasBall||me?1:0);a.el.ring.setAttribute('stroke',me&&!hasBall?'#2ec4b6':GOLD);a.el.ring.setAttribute('fill',me&&!hasBall?'rgba(46,196,182,.35)':'rgba(255,201,60,.35)');order.push([sy,a]);}
 order.sort((p,q)=>p[0]-q[0]);for(const [,a] of order)L.actors.appendChild(a.el.g);
 let sx,sy,lift;if(b.holder){const a=b.holder;[sx,sy]=toScr(a.x,a.y);sx+=a.face*14*sc;lift=27*sc;L.shadow.setAttribute('opacity',0);L.ballEl.setAttribute('transform',`translate(${sx},${sy-lift}) rotate(${-25*a.face}) scale(${sc})`);}
 else{[sx,sy]=toScr(b.x,b.y);lift=b.h*cam.z*1.05;const sq=.62+.38*Math.abs(Math.cos(b.spin||0));L.shadow.setAttribute('opacity',.8);L.shadow.setAttribute('cx',sx);L.shadow.setAttribute('cy',sy);L.shadow.setAttribute('rx',9*sc);L.shadow.setAttribute('ry',3.5*sc);
  const ang=b.fly?Math.atan2(b.fly.y1-b.fly.y0,b.fly.x1-b.fly.x0)*180/Math.PI:0;const bs=sc*(1+b.h*.04);L.ballEl.setAttribute('transform',`translate(${sx},${sy-lift}) rotate(${ang}) scale(${bs},${bs*sq})`);}
 L.ui.querySelectorAll('.tag').forEach(n=>n.remove());
 if(P.readOn&&P.off==='u'&&!P.thrown&&!P.scramble&&P.reads&&!P.result){P.reads.forEach((k,i)=>{const r=P.O[k];if(!r)return;const [x,y]=toScr(r.x,r.y);const cur=i===P.ri;const g=E('g',{class:'tag',transform:`translate(${x},${y-86*sc})`},L.ui);
  if(cur){const open=P.curOpen;const lab=`${i+1} · ${open?'OPEN!':'COVERED'}`;const w=lab.length*15+30;E('ellipse',{cx:0,cy:86*sc,rx:34*sc,ry:12*sc,fill:open?'rgba(31,191,99,.3)':'rgba(226,72,63,.25)',stroke:open?'#1fbf63':'#e2483f','stroke-width':5},g);
   E('rect',{x:-w/2,y:-20,width:w,height:40,rx:20,fill:open?'#1fbf63':'#e2483f',stroke:'#fff','stroke-width':4},g);T(g,0,1,lab,{size:24,fill:'#fff'});}
  else{E('circle',{r:13,fill:'rgba(255,255,255,.85)',stroke:NAVY,'stroke-width':3},g);T(g,0,1,String(i+1),{size:16,fill:NAVY});}});}
 if(P.live&&!P.result&&P.ctrl&&P.off==='c'){const [x,y]=toScr(P.ctrl.x,P.ctrl.y);const g=E('g',{class:'tag',transform:`translate(${x},${y-84*sc})`},L.ui);E('rect',{x:-26,y:-15,width:52,height:30,rx:15,fill:TEAL,stroke:'#fff','stroke-width':3},g);T(g,0,1,'YOU',{size:18,fill:'#fff'});}
 const hg=L.plan.querySelector('.holeglow');if(hg){const past=P.carrier&&P.hole&&(P.carrier.x-P.hole.x)*P.d>1;hg.setAttribute('opacity',past?0:.35+.25*Math.sin(performance.now()/160));if(past&&!P.planFaded){P.planFaded=true;L.plan.setAttribute('opacity',.25);L.top.innerHTML='';}}
 if(P.live&&kind&&kind!=='run'&&kind!=='punt'&&P.t>1.4&&!P.planFaded){P.planFaded=true;L.plan.setAttribute('opacity',.18);}
 if(GM.phase==='aim'&&P.aimMode){const st=stick();if(st){const d=P.d,px=GM.los-d*13,maxP=GM.pro?58:62;P.aim.x=clamp(P.aim.x+st[0]*dt*22,Math.min(px+d*20,px+d*maxP),Math.max(px+d*20,px+d*maxP));P.aim.y=clamp(P.aim.y+st[1]*dt*18,2,51.3);P.aimDraw();}}
 const jb=$g('gJoy');if(jb){const show=P.live&&!P.result&&isTouch&&((P.carrier&&P.carrier.team==='u')||(P.off==='c'&&P.ctrl));jb.hidden=!show;}}

/* ---------------- input ---------------- */
function bindInput(){if(bound)return;bound=true;
 document.addEventListener('keydown',e=>{if($g('gamePage').hidden||!GM||['INPUT','TEXTAREA'].includes(e.target.tagName))return;const k=e.key.length===1?e.key.toLowerCase():e.key;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.repeat&&(k===' '||k==='Enter'))return;keys[k]=true;
  if(k===' '||k==='Enter'){const ov=$g('gOver');if(ov&&!ov.hidden){const b=$g('gHowGo');if(b)b.click();return;}const a=$g('gAct');if(a&&!a.hidden)action();else{const cg=$g('gCoachGo');if(cg)cg.click();}}
  if(k==='c')$g('gCam')?.click();
  if(P&&P.readOn&&!P.thrown&&P.off==='u'&&['1','2','3','4'].includes(k)){const r=P.O[P.reads[+k-1]];if(r)throwTo(r);}});
 document.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=false;});
 window.addEventListener('blur',()=>{keys={};joy=null;});
 toWorld=(cx,cy)=>{const r=svg.getBoundingClientRect();const s=Math.max(r.width/1280,r.height/720);const ox=r.left+(r.width-1280*s)/2,oy=r.top+(r.height-720*s)/2;const vx=(cx-ox)/s,vy=(cy-oy)/s;return{x:cam.x+(vx-640)/cam.z,y:cam.y+(vy-360)/cam.z};};
 const aimTo=e=>{const w=toWorld(e.clientX,e.clientY);const d=P.d,px=GM.los-d*13,maxP=GM.pro?58:62;P.aim.x=clamp(w.x,Math.min(px+d*20,px+d*maxP),Math.max(px+d*20,px+d*maxP));P.aim.y=clamp(w.y,2,51.3);P.aimDraw();};
 root.addEventListener('pointerdown',e=>{if(!GM||!P)return;const st=e.target.closest('.gstage');if(!st||e.target.closest('.gpanel,.gcoach,.gact,.gover,button'))return;if(e.pointerType!=='mouse')isTouch=true;
  if(GM.phase==='aim'&&P.aimMode){aimTo(e);P.aimDrag=e.pointerId;return;}
  if(!P.live)return;if(joy&&joy.on&&e.pointerId!==joy.id){action();return;}
  const r=st.getBoundingClientRect();joy={on:true,id:e.pointerId,ox:e.clientX,oy:e.clientY,vx:0,vy:0};const jb=$g('gJoy');jb.style.left=(e.clientX-r.left)+'px';jb.style.top=(e.clientY-r.top)+'px';jb.classList.add('on');});
 root.addEventListener('pointermove',e=>{if(P&&P.aimDrag===e.pointerId&&P.aimMode){aimTo(e);return;}
  if(joy&&e.pointerId===joy.id){const dx=e.clientX-joy.ox,dy=e.clientY-joy.oy,m=Math.hypot(dx,dy),R=46;joy.vx=dx/Math.max(R,m)*(m>8?1:0);joy.vy=dy/Math.max(R,m)*(m>8?1:0);const k=$g('gJoy').querySelector('i');k.style.transform=`translate(${clamp(dx,-R,R)}px,${clamp(dy,-R,R)}px)`;}});
 const up=e=>{if(P&&P.aimDrag===e.pointerId)P.aimDrag=null;if(joy&&e.pointerId===joy.id){joy=null;const jb=$g('gJoy');if(jb){jb.classList.remove('on');jb.querySelector('i').style.transform='';jb.style.left='';jb.style.top='';}}};root.addEventListener('pointerup',up);root.addEventListener('pointercancel',up);}

window.openGame=function(){stopVoice();hideOvl();mode='game';playing=false;showPage('game');root=$g('gamePage');setupScreen();};
window.gameStop=function(){booth.stop();if(GM)GM.phase='over';GM=null;P=null;cancelAnimationFrame(raf);raf=0;};
window.__game={get GM(){return GM;},get P(){return P;},action,throwRead,PLAYS,booth,nextPlay,fieldGoal,setTS:v=>{TS=v;}};

const st=document.createElement('style');st.textContent=`
#gamePage{background:#0f1838;border:5px solid var(--navy);border-radius:26px;box-shadow:9px 9px 0 var(--navy);overflow:hidden}
body[data-page=game] .wrap{width:min(1240px,calc((100vh - 150px)*1.7778),calc(100vw - 24px));width:min(1240px,calc((100dvh - 150px)*1.7778),calc(100vw - 24px))}
body.fs[data-page=game] .wrap{width:min(calc(100vw - 24px),calc((100dvh - 80px)*1.7778))}
.gwrap{display:flex;flex-direction:column;height:100%;position:relative}
#gamePage [hidden]{display:none!important}
.gtop{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;background:var(--navy);color:#fff}.gtop h2{font-family:'Lilita One';font-weight:400;margin:0;font-size:28px}
.gtop .btn{font-size:15px;padding:5px 12px}.gtop .btn.round{width:38px;height:38px;padding:0;font-size:17px}.gtb{display:flex;gap:6px}
.gbug{display:flex;gap:5px;font-family:'Lilita One';font-size:clamp(12px,1.45vw,18px);white-space:nowrap;align-items:stretch;min-width:0}
.gbug .tm{background:var(--c);border:3px solid #fff;border-radius:10px;padding:2px 9px;display:flex;align-items:center;gap:6px;color:#fff;max-width:22vw;overflow:hidden}.gbug .tm b{font-weight:400;background:rgba(0,0,0,.28);border-radius:6px;padding:0 7px;font-size:1.15em}.gbug .tm i{font-style:normal;font-size:.85em}
.gbug .clk{background:#fff;color:var(--navy);border:3px solid #fff;border-radius:10px;padding:2px 9px;display:flex;align-items:center}
.gbug .dd{background:#2a3a6b;border:3px solid #fff;border-radius:10px;padding:2px 9px;color:var(--gold);display:flex;align-items:center}
.gstage{position:relative;aspect-ratio:16/9;background:#2f8a3a;container-type:size;touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden}
.gstage>svg{position:absolute;inset:0;width:100%;height:100%}
.march{animation:march 1s linear infinite}@keyframes march{to{stroke-dashoffset:-3.2}}
.gpanel{position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;gap:1cqh;padding:1.6cqh 1.4cqw;pointer-events:none;z-index:3}.gpanel>*{pointer-events:auto}
.callbar{display:flex;flex-direction:column;align-items:center;gap:1.2cqh;width:100%}
.gq{background:rgba(15,24,56,.92);color:#fff;font-weight:900;font-size:max(13px,3cqh);padding:.7cqh 2.2cqw;border-radius:999px;border:3px solid #fff}
.cards{display:flex;gap:1cqw;justify-content:safe center;flex-wrap:nowrap;overflow-x:auto;max-width:100%;padding:12px 4px 6px;scrollbar-width:thin}
.pc{position:relative;flex:0 0 auto;width:max(84px,calc(86cqw/var(--n,7)));font-family:Nunito;border:4px solid var(--navy);border-radius:16px;background:#fff;color:var(--navy);padding:.8cqh .6cqw 1cqh;cursor:pointer;box-shadow:4px 4px 0 var(--navy);display:flex;flex-direction:column;align-items:center;gap:.4cqh;transition:transform .12s}
.pc:hover:not(:disabled){transform:translateY(-4px)}.pc:disabled{opacity:.45;cursor:not-allowed}.pc .gdia{width:100%;border-radius:8px}
.pc b{font-family:'Lilita One';font-weight:400;font-size:max(13px,2.6cqh);line-height:1.05}.pc small{font-weight:800;font-size:max(10px,1.8cqh);opacity:.75;line-height:1.15}
.pc.pick{border-color:#1f9d55;box-shadow:4px 4px 0 #1f9d55}.pc em{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:#1f9d55;color:#fff;font-style:normal;font-weight:900;font-size:max(9px,1.6cqh);padding:1px 8px;border-radius:999px;white-space:nowrap}
.scout{background:#fff;border:4px solid var(--navy);border-radius:14px;padding:.8cqh 1.4cqw;font-weight:800;font-size:max(12px,2.3cqh);max-width:94%;box-shadow:4px 4px 0 var(--navy);line-height:1.3}
.scout .tend{display:inline-block;width:12cqw;height:1.6cqh;min-height:8px;background:#ff8a80;border:2px solid var(--navy);border-radius:6px;vertical-align:middle;overflow:hidden}.scout .tend i{display:block;height:100%;background:#ffc93c}.scout small{font-weight:900;opacity:.8}
.gann{position:absolute;left:1.4cqw;top:1.6cqh;max-width:44cqw;display:flex;flex-direction:column;gap:2px;background:#fff;border:4px solid var(--navy);border-radius:14px;padding:.7cqh 1.2cqw;font-weight:900;font-size:max(12px,2.5cqh);opacity:0;transform:translateY(-8px);transition:opacity .25s,transform .25s;box-shadow:4px 4px 0 var(--navy);pointer-events:none;line-height:1.25;z-index:4}
.gann.show{opacity:1;transform:none}.gann .who{font-size:.68em;letter-spacing:.5px;color:#fff;background:var(--navy);align-self:flex-start;border-radius:999px;padding:0 8px}.gann.ana{border-color:#138a7e;box-shadow:4px 4px 0 #138a7e}.gann.ana .who{background:#138a7e}
.gcoach{position:absolute;right:1.4cqw;top:1.6cqh;width:min(46cqw,470px);background:#fff;border:4px solid var(--navy);border-radius:16px;box-shadow:6px 6px 0 var(--gold);padding:1.2cqh 1.4cqw;font-size:max(12px,2.3cqh);font-weight:700;line-height:1.35;z-index:5}
.gcoach h4{font-family:'Lilita One';font-weight:400;font-size:max(16px,3.3cqh);margin:0 0 .6cqh}.gcoach p{margin:.4cqh 0}.gcoach .crow{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:.8cqh}.gcoach .btn{font-size:max(14px,2.7cqh);padding:.5cqh 1.6cqw}
.gcoach .lnk{background:none;border:0;color:#2f6fed;font-weight:900;text-decoration:underline;cursor:pointer;font-size:max(11px,1.9cqh)}.gcoach .dread{display:inline-block;background:#fff4d6;border-radius:8px;padding:1px 8px;font-weight:900}
.gcoach.short{width:min(40cqw,400px)}
.ghint{position:absolute;left:50%;bottom:2.4cqh;transform:translateX(-50%);background:rgba(15,24,56,.9);color:#fff;font-weight:900;font-size:max(13px,2.7cqh);padding:.7cqh 2cqw;border-radius:999px;opacity:0;transition:opacity .3s;white-space:nowrap;pointer-events:none;max-width:60cqw;overflow:hidden;text-overflow:ellipsis}.ghint.show{opacity:1}
.gtoast{position:absolute;left:50%;top:24cqh;transform:translateX(-50%);background:var(--gold);color:var(--navy);font-family:'Lilita One';font-size:max(16px,4.2cqh);padding:.5cqh 2.2cqw;border:4px solid var(--navy);border-radius:16px;opacity:0;pointer-events:none;white-space:nowrap;z-index:4}
.gtoast.show{animation:toastIn 2s forwards}@keyframes toastIn{0%{opacity:0;transform:translate(-50%,10px)}12%,78%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}
.gact{position:absolute;right:2cqw;bottom:2.6cqh;font-family:'Lilita One';font-size:max(17px,3.8cqh);color:var(--navy);background:var(--gold);border:4px solid var(--navy);border-radius:999px;padding:1.2cqh 2.6cqw;box-shadow:4px 4px 0 var(--navy);cursor:pointer;z-index:6;min-width:15cqw}
.gact.pulse{animation:actP 1s ease-in-out infinite}@keyframes actP{50%{transform:scale(1.07)}}.gact:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--navy)}
.gjoy{position:absolute;width:104px;height:104px;margin:-52px 0 0 -52px;border-radius:50%;border:4px solid rgba(255,255,255,.7);background:rgba(15,24,56,.25);pointer-events:none;left:14%;top:74%;opacity:.55;z-index:5}.gjoy.on{opacity:1}
.gjoy i{position:absolute;left:26px;top:26px;width:44px;height:44px;border-radius:50%;background:#fff;border:3px solid var(--navy)}
.kmeter{background:#fff;border:4px solid var(--navy);border-radius:16px;padding:1cqh 1.6cqw;box-shadow:4px 4px 0 var(--navy);width:min(60cqw,620px);margin-right:16cqw}
.kq{font-weight:900;font-size:max(13px,2.6cqh);margin-bottom:.8cqh}.kq small{opacity:.7;margin-left:6px}
.pbar,.abar{position:relative;height:max(18px,4cqh);border:3px solid var(--navy);border-radius:10px;background:#e7ecf5;overflow:hidden}
.pbar b{position:absolute;left:0;top:0;bottom:0;background:#ff8a1f}.pbar b.ok{background:#1fbf63}.pbar .need{position:absolute;top:-2px;bottom:-2px;width:4px;background:var(--navy);z-index:2}
.abar .zone{position:absolute;top:0;bottom:0;background:#7be495}.abar b{position:absolute;top:-2px;bottom:-2px;width:6px;margin-left:-3px;background:var(--navy);border-radius:3px}
.gkv{position:absolute;inset:0;z-index:2}.gkv svg{width:100%;height:100%}
.gover{position:absolute;inset:0;z-index:8;display:flex;align-items:center;justify-content:center;background:rgba(8,14,32,.55)}
.gban{background:#fff;border:5px solid var(--navy);border-radius:22px;padding:2cqh 4cqw;text-align:center;box-shadow:8px 8px 0 var(--gold)}.gban h2{font-family:'Lilita One';font-weight:400;font-size:max(26px,7cqh);margin:0}.gban p{font-weight:900;font-size:max(14px,3cqh);margin:.6cqh 0 0}
.gfinal{background:#fff;border:5px solid var(--navy);border-radius:24px;padding:2.4cqh 3cqw;text-align:center;box-shadow:8px 8px 0 var(--gold);max-width:92%}.gfinal .big{font-size:max(36px,10cqh);line-height:1}.gfinal h2{font-family:'Lilita One';font-weight:400;font-size:max(22px,5.6cqh);margin:.6cqh 0}
.gfinal .fs{display:flex;gap:10px;justify-content:center;margin:.6cqh 0}.gfinal .fs span{background:var(--c);color:#fff;font-family:'Lilita One';font-size:max(16px,3.6cqh);border:3px solid var(--navy);border-radius:12px;padding:2px 14px}.gfinal p{font-weight:800;font-size:max(12px,2.4cqh)}
.gfinal .row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.ghow{background:#fff;border:5px solid var(--navy);border-radius:24px;padding:2cqh 2.4cqw;max-width:94%;max-height:94%;overflow:auto;box-shadow:8px 8px 0 var(--gold);text-align:center}.ghow h2{font-family:'Lilita One';font-weight:400;font-size:max(20px,5cqh);margin:0 0 1cqh}
.ghgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2cqh 1.4cqw;text-align:left}.ghgrid div{background:#f4f7fc;border:3px solid var(--navy);border-radius:14px;padding:.8cqh 1cqw}.ghgrid span{font-size:max(18px,4cqh)}.ghgrid b{font-family:'Lilita One';font-weight:400;font-size:max(14px,2.8cqh);margin-left:6px}.ghgrid p{margin:.3cqh 0 0;font-weight:700;font-size:max(11px,2.1cqh);line-height:1.3}
.ghow #gHowGo{position:sticky;bottom:0}
.gkeys{font-weight:800;opacity:.7;font-size:max(11px,1.9cqh)}
.gsetup{flex:1;display:flex;align-items:center;justify-content:center;padding:2vh;background:radial-gradient(circle at 50% 30%,#2f8a3a,#1d5e27)}
.gcard2{background:#fff;border:5px solid var(--navy);border-radius:24px;box-shadow:8px 8px 0 var(--gold);padding:2.2vh 3vw;text-align:center;width:min(640px,100%);box-sizing:border-box}
.gcard2 h3{font-family:'Lilita One';font-weight:400;font-size:22px;margin:1vh 0 .7vh}
#gName{font-family:'Lilita One';font-size:26px;text-align:center;border:4px solid var(--navy);border-radius:14px;padding:4px 12px;width:min(360px,80%);color:var(--navy)}
.gcolors{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.gcol{background:#f4f7fc;border:4px solid #d5dbe8;border-radius:14px;cursor:pointer;padding:2px}.gcol.on{border-color:var(--navy);background:#fff4d6;box-shadow:3px 3px 0 var(--gold)}
.gdiff{display:flex;gap:8px;justify-content:center}.gd{font-family:'Lilita One';font-size:18px;border:4px solid var(--navy);border-radius:999px;background:#fff;color:var(--navy);padding:5px 18px;cursor:pointer}.gd.on{background:var(--gold)}
.gstart{font-size:24px;margin-top:1.6vh}.gwin{font-weight:800;opacity:.75;margin:1.2vh 0 0}

.coachon .gann{opacity:0!important}
@media (max-height:540px){.gstage:has(.gact:not([hidden])) .gcoach .crow{display:none}#gamePage{border-width:3px;border-radius:14px}.gtop{padding:3px 8px}.gtop h2{font-size:18px}.gtop .btn{font-size:12px;padding:3px 8px}.gtop .btn.round{width:30px;height:30px;font-size:14px}
 body[data-page=game] header{display:none}body[data-page=game] .wrap{width:min(calc(100vw - 16px),calc((100dvh - 50px)*1.7778))}.gbug{font-size:11px;gap:3px}.gbug .tm,.gbug .dd,.gbug .clk{padding:0 5px;border-width:2px}
 .gsetup{padding:6px}.gcard2{padding:8px 14px}.gcard2 h3{font-size:15px;margin:3px 0}#gName{font-size:18px;padding:1px 8px}.gcol svg{width:38px;height:52px}.gstart{font-size:17px;margin-top:5px}.gwin{font-size:12px;margin-top:3px}
 .pc{width:94px;padding:3px 4px 5px;border-width:3px}.pc .gdia{display:none}.gcoach{width:54cqw}.gcoach.short{width:46cqw}.ghgrid{grid-template-columns:repeat(3,1fr);gap:4px 6px}.ghgrid p{font-size:10px}.ghgrid b{font-size:12px}.ghgrid span{font-size:15px}.ghow{padding:6px 10px}.ghow h2{font-size:17px;margin:0 0 4px}.gkeys{display:none}.kmeter{width:56cqw}}
`;document.head.appendChild(st);
})();
