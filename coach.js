/* =========================================================
   Coach Sam — a small AI model that runs entirely in the visitor's browser (WebGPU).
   No server, no API key, no cost. The model downloads once and is cached by the browser.
   ========================================================= */
const WEBLLM='https://esm.run/@mlc-ai/web-llm@0.2.84';
const SIZES={small:['Qwen3.5-0.8B','about 0.4 GB'],normal:['Qwen3.5-2B','about 1.3 GB'],big:['Qwen3.5-4B','about 2.5 GB']};
const FACTS=`Key facts (NFL):
- 11 players per team on the field. 100-yard field plus two 10-yard end zones. 50-yard line is midfield.
- Offense has 4 downs (tries) to gain 10 yards. Gaining 10 yards = first down (tries reset). "3rd & 4" = third try, 4 yards to go.
- Touchdown 6 points. Extra point kick 1 point (from a short distance, almost always made). Two-point try from the 2-yard line. Field goal 3 points. Safety 2 points for the defense.
- On 4th down teams usually punt, try a field goal if close enough (most kickers top out around 60 yards; NFL record 68 yards), or go for it.
- Touchback: a punt into the end zone is placed at the receiving team's 20. Kickoff touchbacks are placed farther out under the newer kickoff rules.
- Turnovers: interception and fumble. Turnover on downs: failing on 4th down.
- Game: 60 minutes, four 15-minute quarters, halftime after the 2nd quarter. Play clock 40 seconds. Each team has 3 timeouts per half. Two-minute warning in each half.
- Catch: control of the ball, two feet (or another body part) in bounds, and a football move.
- Penalties: false start (offense moves early, 5 yards), offside (defense across the line at the snap, 5), delay of game (5), offensive holding (10), defensive holding (5 + automatic first down), defensive pass interference (ball placed at the spot of the foul + first down), offensive pass interference (10), roughing the passer (15 + first down), roughing the kicker (15 + first down), running into the kicker (5), face mask (15).
- Positions: offense QB, center, offensive line (5), running back, fullback, wide receivers, tight end. Defense: defensive line, linebackers, cornerbacks, safeties (cornerbacks + safeties = defensive backs). Special teams: kicker, punter, returners.
- Defenses: 4-3, 3-4, nickel (5 defensive backs), blitz. Man coverage vs zone coverage. Play-action = fake handoff then pass. Motion = one player moving sideways/back before the snap.
- Super Bowl = the NFL championship game.`;
const SYSTEM=`You are Coach Sam, a friendly football coach who explains American football (mostly the NFL) to complete beginners, like a great 5th-grade teacher.
Rules: answer in 2 to 5 short, simple sentences. Use everyday words and a quick example or comparison when it helps. Be accurate; if you are not sure about a specific fact, number, date or person, say so honestly instead of guessing. If the question is not about football or sports, gently steer back to football. No markdown headings or tables; you may use **bold** for one key word.
${FACTS}`;
let engine=null,loading=null,loadedId=null,f16=true;
function pickSize(){try{const s=localStorage.getItem('f101_coachsize');if(s&&SIZES[s])return s;}catch(e){}
 const mobile=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)||(navigator.deviceMemory&&navigator.deviceMemory<=4);return mobile?'small':'normal';}
async function load(onProg){if(engine)return engine;if(loading)return loading;
 loading=(async()=>{onProg&&onProg({progress:0,text:'starting'});const adapter=await navigator.gpu.requestAdapter();if(!adapter)throw new Error('nogpu');f16=adapter.features.has('shader-f16');
  const webllm=await import(WEBLLM);const size=pickSize();const id=`${SIZES[size][0]}-${f16?'q4f16_1':'q4f32_1'}-MLC`;
  engine=await webllm.CreateMLCEngine(id,{initProgressCallback:p=>onProg&&onProg(p)});loadedId=id;return engine;})();
 try{return await loading;}catch(e){loading=null;throw e;}}
window.coachLocal={
 supported:()=>!!navigator.gpu,
 size:()=>pickSize(),sizes:SIZES,loaded:()=>!!engine,
 setSize:async s=>{try{localStorage.setItem('f101_coachsize',s);}catch(e){}if(engine){try{await engine.unload();}catch(e){}engine=null;loading=null;}},
 async ask(history,onToken,onProg,stepTitle){const eng=await load(onProg);
  const msgs=[{role:'system',content:SYSTEM+(stepTitle?`\nThe learner is currently on the lesson step: "${stepTitle}".`:'')},...history.slice(-8).map(m=>({role:m.role==='model'?'assistant':'user',content:m.text}))];
  const stream=await eng.chat.completions.create({messages:msgs,stream:true,temperature:.4,max_tokens:320,extra_body:{enable_thinking:false}});
  let out='';for await(const c of stream){out+=c.choices[0]?.delta?.content||'';const clean=out.replace(/<think>[\s\S]*?(<\/think>|$)/g,'').trimStart();onToken(clean);}
  return out.replace(/<think>[\s\S]*?<\/think>/g,'').trim();}};
