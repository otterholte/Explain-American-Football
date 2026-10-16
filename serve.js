// Football 101 local server: serves the site and powers "Ask Coach" (Gemini). Run: node serve.js
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=8101,root=__dirname;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.wav':'audio/wav','.json':'application/json'};
const KEY=()=>{try{return fs.readFileSync(path.join(root,'gemini_key.txt'),'utf8').trim();}catch(e){return '';}};
const SYSTEM=`You are "Coach Sam", a warm, patient 5th-grade teacher who loves American football. You help complete beginners understand NFL football.
How to answer:
- Use 2 to 5 short sentences at a 5th-grade reading level.
- Use simple words. If you use a football word, explain it in plain words.
- Use friendly everyday comparisons (road trips, recess games, the classroom) when they help.
- Be accurate about current NFL rules. If a rule is complicated, give the simple version and say there are extra details.
- If you're not sure, say so honestly.
- If the question isn't about football, kindly steer back to football.
- No headings or long lists. You may use **bold** for one or two key words.`;
async function gemini(model,body){const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'x-goog-api-key':KEY(),'Content-Type':'application/json'},body:JSON.stringify(body)});
 const j=await r.json();if(!r.ok)throw new Error(j.error?.message||('HTTP '+r.status));const t=(j.candidates?.[0]?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('').trim();if(!t)throw new Error('empty answer');return t;}
async function chat(req,res){let raw='';req.on('data',c=>{raw+=c;if(raw.length>50000)req.destroy();});req.on('end',async()=>{
 try{const {messages=[],step=''}=JSON.parse(raw||'{}');
  const contents=messages.slice(-10).filter(m=>m&&m.text).map(m=>({role:m.role==='model'?'model':'user',parts:[{text:String(m.text).slice(0,1500)}]}));
  if(!contents.length)throw new Error('no question');
  const body={systemInstruction:{parts:[{text:SYSTEM+(step?`\nThe learner is currently on the lesson step: "${step}".`:'')}]},contents,generationConfig:{maxOutputTokens:600,temperature:.6}};
  let text;try{text=await gemini('gemini-3.8-flash',{...body,generationConfig:{...body.generationConfig,thinkingConfig:{thinkingLevel:'low'}}});}
  catch(e){try{text=await gemini('gemini-3.8-flash',body);}catch(e2){text=await gemini('gemini-3.5-flash-lite',body);}}
  res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({text}));}
 catch(e){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:String(e.message||e)}));}});}
http.createServer((req,res)=>{
 if(req.method==='POST'&&req.url==='/api/chat')return chat(req,res);
 let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(root,path.normalize(p));
 if(!f.startsWith(root)||/gemini_key|tts\.js|gen\.js|serve\.js|narration/.test(f)){res.writeHead(403);return res.end();}
 fs.readFile(f,(e,data)=>{if(e){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);});
}).listen(PORT,'127.0.0.1',()=>console.log('Football 101 running at http://localhost:'+PORT));
