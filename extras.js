/* =========================================================
   Football 101 — extras: bonus quiz + flashcards
   ========================================================= */
(function(){
/* ---------- Bonus quiz (10 more questions on the crash course) ---------- */
const BONUS=[];
BONUS.push({title:'Bonus Quiz',quiz:true,build(S){rays(S,'#c8f0e3','#b5e9d8',360);S.beat('Bonus round! Ten more questions about the crash course. No tricks.',3.5);}});
COURSES.bonus={key:'bonus',short:'Bonus',list:BONUS,cap:'b',ask:'bqa',fq:'bq',fin:'bfin_',
 finMsg:['PERFECT! You really know your football! 🏈','Nice work! You remembered a lot.','Good start! Rewatch a few steps and try again.'],
 quiz:[
  ['How many players does each team have on the field during a play?',['11','9','15'],0,'Each team has <b>11</b> players on the field at a time.'],
  ['What is the line of scrimmage?',['The imaginary line where the ball sits before the snap','The line at the back of the end zone','The line down the middle of the field'],0,'The <b>line of scrimmage</b> is where the ball sits. Nobody crosses it until the snap.'],
  ['It\'s 3rd & 2, and the offense gains 5 yards. What happens next?',['They earn a first down, so it\'s 1st & 10','It becomes 4th & 2','It becomes 3rd & 7'],0,'They went past the yellow line, so they get a <b>first down</b> and 4 fresh tries.'],
  ['How many points is a field goal worth?',['3','6','1'],0,'A <b>field goal</b> is worth 3 points.'],
  ['A punt goes into the end zone. What is that called?',['A touchback, and the other team starts at its own 20','A safety, worth 2 points','A touchdown for the kicking team'],0,'That\'s a <b>touchback</b>: the ball comes out to the 20-yard line.'],
  ['Which player snaps the ball to start a play?',['The center','The quarterback','The kicker'],0,'The <b>center</b> snaps the ball back to the quarterback.'],
  ['What is a safety?',['2 points for the defense, when the ball carrier is tackled in his own end zone','6 points for the offense','A penalty for a late hit'],0,'A <b>safety</b> is a rare play worth 2 points for the defense.'],
  ['How long is the game clock in an NFL game?',['60 minutes, in four 15-minute quarters','90 minutes, in two halves','40 minutes, in four quarters'],0,'The game clock has <b>60 minutes</b>, split into four quarters.'],
  ['A runner is tackled near the sideline. Where does the next play start?',['At the nearest hash marks, so both teams have room','Right at the sideline','Back where the last play started'],0,'The ball is slid in to the <b>hash marks</b>, so there\'s room on both sides.'],
  ['In man defense, what does each defender do?',['Sticks with one player, like a shadow','Guards one area of the field','Rushes the quarterback'],0,'In <b>man defense</b>, each defender picks one player and stays with him.']]};

/* ---------- Flashcards ---------- */
const V=(t,d,e='')=>({t,d,e});
const DECKS={
 basics:{name:'Crash Course',col:'#2f6fed',cards:[
  V('End zone','The colored area at each end of the field. Get the ball into the other team\'s end zone to score.','🏁'),
  V('Touchdown','6 points. Carry or catch the ball in the other team\'s end zone.','🏈'),
  V('Extra point','1 point after a touchdown. A really short field goal that kickers almost always make.','🦶'),
  V('Two-point try','2 points after a touchdown, by running or passing it in from the 2-yard line.','✌️'),
  V('Field goal','3 points. Kick the ball through the goal posts, above the crossbar.','🥅'),
  V('Safety (score)','2 points for the defense, when the ball carrier is tackled in his own end zone. Rare!','🛡️'),
  V('Offense','The team with the ball. On the attack, trying to score.','⚔️'),
  V('Defense','The team without the ball. They defend their end zone.','🛡️'),
  V('Line of scrimmage','The imaginary line where the ball sits before a play. Nobody crosses it until the snap.','📏'),
  V('Snap','The center passes the ball back to the quarterback. It starts every play.','👐'),
  V('Down','A try. The offense gets 4 downs to go 10 yards.','4️⃣'),
  V('First down','Gaining 10 yards. The tries reset, and a new yellow line appears 10 yards ahead.','✅'),
  V('Down & distance','Like "2nd & 7": the 2nd try, with 7 yards to go.','🔢'),
  V('Drive','A series of plays moving down the field, like a road trip to the end zone.','🚗'),
  V('50-yard line','The middle of the field. The yard numbers count down toward each end zone.','↔️'),
  V('Hash marks','Short lines near the middle of the field. The ball is placed there after plays near the sideline.','📍'),
  V('Quarterback (QB)','The leader. Calls the play, then hands off or throws.','🎯'),
  V('Center','Middle of the offensive line. Snaps the ball to the QB.','🧱'),
  V('Offensive line','Five big blockers who protect the QB and open holes for runners.','🧱'),
  V('Running back','He runs! Takes handoffs and carries the ball.','🏃'),
  V('Wide receiver','Lines up wide, and receives passes.','📡'),
  V('Tight end','Lines up tight to the line. Big enough to block, quick enough to catch.','💪'),
  V('Defensive line','The first line of defense. Pushes past blockers to stop runs and chase the QB.','🧱'),
  V('Linebacker','Backs up the defensive line. Chases runners and covers short passes.','🦾'),
  V('Cornerback','Out on the corners, guarding the wide receivers.','📐'),
  V('Safety (position)','Plays farthest back. The last line of defense.','🛟'),
  V('Special teams','Kickers, punters and returners who come in for kicking plays.','⭐'),
  V('Sack','Tackling the quarterback before he can throw.','💥'),
  V('Incomplete pass','A pass nobody catches. No gain, and the clock stops.','❌'),
  V('Interception','A defender catches a pass meant for the offense. His team takes the ball.','✋'),
  V('Fumble','A player drops the ball. Either team can grab it.','🤲'),
  V('Turnover','The ball is taken away by the defense: an interception or a fumble.','🔄'),
  V('Turnover on downs','The offense fails on 4th down, so the other team takes over right there.','🛑'),
  V('Punt','A kick on 4th down that gives the ball away on purpose, but far down the field.','🦵'),
  V('Touchback','A kick that goes into the end zone. The other team starts at its own 20.','↩️'),
  V('Kickoff','A kick that starts each half and comes after every score.','🚀'),
  V('Play clock','The offense has 40 seconds to snap the ball after each play.','⏱️'),
  V('Quarter','One of four 15-minute parts of the game.','🕒'),
  V('Halftime','The break after the 2nd quarter.','🎤'),
  V('Man defense','Each defender sticks with one player, like a shadow.','👥'),
  V('Zone defense','Each defender guards an area of the field.','🗺️')]},
 rules:{name:'Rules & Penalties',col:'#ff5a4e',cards:[
  V('Foul','Breaking a rule.','🚫'),
  V('Penalty','The punishment for a foul, usually 5, 10 or 15 yards.','📉'),
  V('Yellow flag','What an official throws when he sees a foul.','🚩'),
  V('Automatic first down','Some penalties also give the other team 4 fresh tries.','✅'),
  V('Accept or decline','The fouled team picks: take the penalty yards, or keep the result of the play.','⚖️'),
  V('False start','An offensive player moves before the snap. The offense starts too early. 5 yards.','🏁'),
  V('Offside','A defender is on the wrong side of the line at the snap. 5 yards.','↔️'),
  V('Delay of game','The play clock hits zero before the snap. 5 yards.','⏱️'),
  V('Catch','Control the ball, two feet in bounds, and a football move.','🙌'),
  V('The pocket','The safe space the offensive line builds around the quarterback.','🛡️'),
  V('Holding','Grabbing a player to stop him. Offense: 10 yards. Defense: 5 yards and a first down.','✊'),
  V('Pass interference','Grabbing or pushing a player to stop a catch. On defense, the ball goes to the spot of the foul.','🚧'),
  V('Roughing the passer','A late or dangerous hit on the quarterback. 15 yards and a first down.','🤕'),
  V('Roughing the kicker','Crashing into the kicker. 15 yards and a first down.','🦶'),
  V('Running into the kicker','A lighter bump on the kicker. 5 yards.','👟'),
  V('Face mask','Grabbing and twisting the helmet\'s cage. 15 yards.','😷')]},
 smarts:{name:'Football Smarts',col:'#2ec4b6',cards:[
  V('Formation','How a team lines up before the snap.','📐'),
  V('Under center','The QB stands right behind the center. Great for quick handoffs.','🤝'),
  V('Shotgun','The QB stands about 5 yards back, with more time to see the field.','🔭'),
  V('Fullback','A big running back whose main job is blocking for the runner.','🚜'),
  V('Power running','Running straight ahead behind a wall of blockers, a few tough yards at a time.','💪'),
  V('I-formation','A fullback and a running back lined up one behind the other, behind the QB.','🅸'),
  V('4-3 defense','4 defensive linemen in front, 3 linebackers behind them.','4️⃣'),
  V('3-4 defense','3 defensive linemen in front, 4 linebackers behind them.','3️⃣'),
  V('Defensive backs','The cornerbacks and safeties: the defenders who cover passes.','🛟'),
  V('Nickel','A defense with 5 defensive backs. A nickel is worth 5 cents!','🪙'),
  V('Blitz','Sending extra defenders charging at the quarterback.','⚡'),
  V('Motion','One player moving sideways or back before the snap.','➡️'),
  V('Audible','The QB changes the play at the line of scrimmage.','🗣️'),
  V('Play-action','Faking a handoff, then throwing a pass.','🎭'),
  V('Intended target','The receiver the quarterback actually plans to throw to.','🎯'),
  V('Field position','Where a drive starts. Starting close to the other end zone makes scoring easier.','📍')]}};
function quizDeck(){const out=[];for(const C of [COURSES.basics,COURSES.rules,COURSES.smarts,COURSES.bonus])for(const q of (C.quiz||[])){const an=q[1][q[2]],ex=q[3]||'';out.push(V(q[0],ex.toLowerCase().includes(an.toLowerCase().replace(/[.!]$/,''))?ex:`<b>${an}.</b> ${ex}`,'❓'));}return out;}

let fc={cards:[],i:0,flip:false,known:0,deck:'all',streak:0,best:0};
function buildDeck(k){let c=[];if(k==='all')for(const d of ['basics','rules','smarts'])c.push(...DECKS[d].cards.map(x=>({...x,col:DECKS[d].col})));
 else if(k==='quiz')c=quizDeck().map(x=>({...x,col:'#7c5cff'}));else c=DECKS[k].cards.map(x=>({...x,col:DECKS[k].col}));
 for(let i=c.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[c[i],c[j]]=[c[j],c[i]];}return c;}
function fcStart(k){fc={cards:buildDeck(k),i:0,flip:false,known:0,deck:k,streak:0,best:fc.best||0,total:0};fc.total=fc.cards.length;fcRender();}
const P=()=>document.getElementById('fcPage');
function fcRender(){const p=P();const tabs=[['all','All words'],['basics','Crash Course'],['rules','Rules'],['smarts','Smarts'],['quiz','Quiz questions']];
 if(!fc.cards.length){p.innerHTML=`<div class="fcwrap"><div class="fctop"><button class="btn" id="fcMenu">◀ Menu</button><h2>Flashcards</h2><span></span></div>
  <div class="fcdone"><div class="big">🏆</div><h2>Deck complete!</h2><p>You knew all ${fc.total} cards. Best streak: <b>${fc.best}</b> in a row.</p><div class="row"><button class="btn primary" id="fcAgain">↺ Play again</button><button class="btn" id="fcMenu2">◀ Menu</button></div></div></div>`;
  p.querySelector('#fcMenu').onclick=showMenu;p.querySelector('#fcMenu2').onclick=showMenu;p.querySelector('#fcAgain').onclick=()=>fcStart(fc.deck);if(window.confetti)confetti(160,true);SFX.play('fanfare');return;}
 const c=fc.cards[0];const done=fc.total-fc.cards.length;
 p.innerHTML=`<div class="fcwrap"><div class="fctop"><button class="btn" id="fcMenu">◀ Menu</button><h2>Flashcards</h2><div class="fcstats"><span>✅ ${done} / ${fc.total}</span><span>🔥 ${fc.streak}</span></div></div>
 <div class="fctabs">${tabs.map(([k,n])=>`<button class="fctab ${k===fc.deck?'on':''}" data-k="${k}">${n}</button>`).join('')}</div>
 <div class="fcbar"><i style="width:${done/fc.total*100}%"></i></div>
 <div class="fcscene"><div class="fccard ${fc.flip?'flip':''}" id="fcCard" style="--c:${c.col}">
  <div class="face front"><div class="fce">${c.e}</div><div class="fct">${c.t}</div><div class="fch">Tap to flip</div></div>
  <div class="face back"><div class="fct2">${c.t}</div><div class="fcd">${c.d}</div></div></div></div>
 <div class="fcbtns"><button class="btn" id="fcNo" ${fc.flip?'':'disabled'}>😅 Still learning</button><button class="btn primary" id="fcFlip">${fc.flip?'Flip back':'Flip ↻'}</button><button class="btn yes" id="fcYes" ${fc.flip?'':'disabled'}>✅ Got it</button></div>
 <div class="fchint">Space to flip · ← still learning · → got it</div></div>`;
 p.querySelector('#fcMenu').onclick=showMenu;p.querySelectorAll('.fctab').forEach(b=>b.onclick=()=>fcStart(b.dataset.k));
 const flip=()=>{fc.flip=!fc.flip;SFX.play('swoosh');const el=p.querySelector('#fcCard');el.classList.toggle('flip',fc.flip);p.querySelector('#fcFlip').textContent=fc.flip?'Flip back':'Flip ↻';p.querySelector('#fcNo').disabled=!fc.flip;p.querySelector('#fcYes').disabled=!fc.flip;};
 p.querySelector('#fcCard').onclick=flip;p.querySelector('#fcFlip').onclick=flip;
 p.querySelector('#fcYes').onclick=()=>fcAnswer(true);p.querySelector('#fcNo').onclick=()=>fcAnswer(false);}
function fcAnswer(ok){if(!fc.flip)return;const c=fc.cards.shift();if(ok){fc.streak++;fc.best=Math.max(fc.best,fc.streak);SFX.play('ding');if(fc.streak&&fc.streak%5===0&&window.confetti)confetti(60);}
 else{fc.streak=0;SFX.play('pop');fc.cards.splice(Math.min(fc.cards.length,3),0,c);}fc.flip=false;fcRender();}
document.addEventListener('keydown',e=>{if(document.getElementById('fcPage').hidden||['INPUT','TEXTAREA'].includes(e.target.tagName))return;
 if(e.key===' '){e.preventDefault();const b=document.getElementById('fcCard');if(b)b.click();}else if(e.key==='ArrowRight'){fcAnswer(true);}else if(e.key==='ArrowLeft'){fcAnswer(false);}});
window.F101_DECKS=DECKS;
window.openFlash=function(){stopVoice();hideOvl();mode='flash';playing=false;showPage('flash');fcStart('basics');};
window.FC_DECKS=DECKS;

/* styles */
const st=document.createElement('style');st.textContent=`
#fcPage{background:#fff;border:5px solid var(--navy);border-radius:26px;box-shadow:9px 9px 0 var(--navy);padding:2.2vh 2.4vw;min-height:calc(100vh - 110px);min-height:calc(100dvh - 110px)}
.fcwrap{display:flex;flex-direction:column;gap:1.6vh;height:100%}
.fctop{display:flex;align-items:center;justify-content:space-between;gap:10px}.fctop h2{font-family:'Lilita One';font-weight:400;font-size:clamp(24px,3vw,38px);margin:0}
.fcstats{display:flex;gap:10px;font-weight:900;font-size:16px}.fcstats span{background:var(--cream);border:3px solid var(--navy);border-radius:999px;padding:4px 12px}
.fctabs{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.fctab{font-family:'Lilita One';font-size:16px;border:3px solid var(--navy);border-radius:999px;background:#fff;color:var(--navy);padding:6px 14px;cursor:pointer}.fctab.on{background:var(--gold)}
.fcbar{height:12px;border:3px solid var(--navy);border-radius:10px;overflow:hidden;background:#fff}.fcbar i{display:block;height:100%;background:var(--teal);transition:width .3s}
.fcscene{flex:1;display:grid;place-items:center;perspective:1400px;min-height:240px}
.fccard{position:relative;width:min(640px,100%);height:clamp(220px,38vh,360px);transform-style:preserve-3d;transition:transform .55s cubic-bezier(.3,1.3,.5,1);cursor:pointer}
.fccard.flip{transform:rotateY(180deg)}
.face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border:5px solid var(--navy);border-radius:26px;box-shadow:8px 8px 0 var(--navy);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 28px;text-align:center}
.front{background:#fff;border-top:18px solid var(--c)}.back{background:var(--cream);transform:rotateY(180deg);border-top:18px solid var(--c)}
.fce{font-size:clamp(40px,7vh,72px);line-height:1}.fct{font-family:'Lilita One';font-size:clamp(28px,4.4vw,52px);margin-top:10px;line-height:1.1}.fch{margin-top:12px;font-weight:800;opacity:.5}
.fct2{font-family:'Lilita One';font-size:clamp(20px,2.6vw,30px);color:var(--c);margin-bottom:10px}.fcd{font-weight:800;font-size:clamp(17px,2.2vw,26px);line-height:1.35}
.fcbtns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}.fcbtns .yes{background:#8be0a0}
.fchint{text-align:center;font-weight:800;font-size:13px;opacity:.55}
.fcdone{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.fcdone .big{font-size:90px}.fcdone h2{font-family:'Lilita One';font-weight:400;font-size:40px;margin:6px}.fcdone p{font-weight:800;font-size:18px}
@media (max-height:540px){#fcPage{min-height:0;height:calc(100dvh - 54px);padding:8px 14px;border-width:3px;border-radius:16px}.fcwrap{gap:6px}.fctop h2{font-size:20px}.fctab{font-size:12px;padding:3px 9px}.fccard{height:calc(100dvh - 230px);min-height:120px}.fcscene{min-height:0}.fct{font-size:26px}.fce{font-size:32px}.fcd{font-size:15px}.fchint{display:none}.fcbtns .btn{font-size:13px}}
`;document.head.appendChild(st);
})();
