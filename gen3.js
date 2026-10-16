// Football 101 narration generator (Gemini TTS, voice Achird).
// Batches several lines per request and splits the audio at the pauses, to stay within daily limits.
// Usage: node gen3.js                 (uses TTS_MODEL env or gemini-3.8-flash-tts; skips clips already made)
//        node gen3.js --force         (regenerate everything, e.g. after setting TTS_MODEL=gemini-3.8-flash-tts)
const fs=require('fs'),path=require('path');
const KEY=fs.readFileSync(path.join(__dirname,'gemini_key.txt'),'utf8').trim();
const MODEL=process.env.TTS_MODEL||'gemini-3.8-flash-tts',VOICE='Achird',FORCE=process.argv.includes('--force');
const STYLE='a warm, friendly, upbeat narrator of a fun animated educational video for beginners; natural pace, smiling; pause for two full seconds between paragraphs';
const dir=path.join(__dirname,'audio');fs.mkdirSync(dir,{recursive:true});
const items=JSON.parse(fs.readFileSync(path.join(__dirname,'narration.json'),'utf8'));
const cacheF=path.join(dir,'durations.json');let cache={};try{cache=JSON.parse(fs.readFileSync(cacheF,'utf8'));}catch(e){}
for(const k in cache)if(typeof cache[k]==='number')cache[k]={d:cache[k],m:'?'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function tts(text){for(let a=0;a<8;a++){const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,{method:'POST',headers:{'x-goog-api-key':KEY,'Content-Type':'application/json'},
  body:JSON.stringify({contents:[{role:'user',parts:[{text,speech_metadata:{style:STYLE}}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{voice:VOICE}}}})});
 const j=await r.json();if(r.ok){const p=j.candidates?.[0]?.content?.parts?.find(p=>p.inlineData);if(p){let b=Buffer.from(p.inlineData.data,'base64');let rate=24000,off=0,end=b.length;
  if(b.slice(0,4).toString()==='RIFF'){rate=b.readUInt32LE(24);let q=12;while(q+8<=b.length){const id=b.slice(q,q+4).toString(),sz=b.readUInt32LE(q+4);if(id==='data'){off=q+8;end=(sz>0&&sz<0xFFFFFFF0&&off+sz<=b.length)?off+sz:b.length;break;}q+=8+sz+(sz&1);}}
  else{const m=(p.inlineData.mimeType||'').match(/rate=(\d+)/);if(m)rate=+m[1];}
  const n=Math.floor((end-off)/2);const pcm=new Int16Array(n);for(let i=0;i<n;i++)pcm[i]=b.readInt16LE(off+2*i);return{pcm,rate};}}
 const full=JSON.stringify(j),msg=full.slice(0,160);console.log('  retry',r.status,msg);if(full.includes('per_day')||full.includes('PerDay'))throw new Error('DAILY_LIMIT');await sleep(r.status===429?20000:3000);}throw new Error('failed');}
function wav(pcm,rate){const h=Buffer.alloc(44);const len=pcm.length*2;h.write('RIFF',0);h.writeUInt32LE(36+len,4);h.write('WAVE',8);h.write('fmt ',12);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(1,22);h.writeUInt32LE(rate,24);h.writeUInt32LE(rate*2,28);h.writeUInt16LE(2,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(len,40);return Buffer.concat([h,Buffer.from(pcm.buffer,pcm.byteOffset,len)]);}
function trim(pcm,rate){const win=Math.round(rate*.02);let mx=1;for(let i=0;i<pcm.length;i++)mx=Math.max(mx,Math.abs(pcm[i]));const thr=mx*.012;let s=0,e=pcm.length;
 while(s<e){let pk=0;for(let k=s;k<Math.min(e,s+win);k++)pk=Math.max(pk,Math.abs(pcm[k]));if(pk>thr)break;s+=win;}
 while(e>s){let pk=0;for(let k=Math.max(s,e-win);k<e;k++)pk=Math.max(pk,Math.abs(pcm[k]));if(pk>thr)break;e-=win;}
 const pad=Math.round(rate*.22);return pcm.slice(Math.max(0,s-pad),Math.min(pcm.length,e+pad));}
function split(pcm,rate,nParts,texts){const win=Math.round(rate*.02);const rms=[];for(let i=0;i+win<=pcm.length;i+=win){let s=0;for(let k=0;k<win;k++)s+=pcm[i+k]*pcm[i+k];rms.push(Math.sqrt(s/win));}
 const thr=Math.max(...rms)*.025;const gaps=[];let st=-1;rms.forEach((v,i)=>{if(v<thr){if(st<0)st=i;}else{if(st>0&&i-st>=15)gaps.push({mid:Math.round((st+(i-st)*.6)*win),len:(i-st)*.02});st=-1;}});
 const need=nParts-1;if(gaps.length<need)return null;
 // expected cut positions from word counts
 const w=texts.map(t=>t.split(/\s+/).length+2);const tot=w.reduce((a,b)=>a+b,0);const L=pcm.length;let acc=0;const exp=[];for(let i=0;i<need;i++){acc+=w[i];exp.push(acc/tot*L);}
 // DP: pick increasing gaps; cost = distance from expected (in seconds) minus bonus for long gaps
 const G=gaps.length,INF=1e18;const cost=(i,g)=>Math.abs(gaps[g].mid-exp[i])/rate*1.0-gaps[g].len*3;
 const dp=Array.from({length:need},()=>new Array(G).fill(INF)),pr=Array.from({length:need},()=>new Array(G).fill(-1));
 for(let g=0;g<G;g++)dp[0][g]=cost(0,g);
 for(let i=1;i<need;i++){let best=INF,bi=-1;for(let g=0;g<G;g++){if(g>0&&dp[i-1][g-1]<best){best=dp[i-1][g-1];bi=g-1;}if(bi>=0){dp[i][g]=best+cost(i,g);pr[i][g]=bi;}}}
 let bg=-1,bv=INF;for(let g=0;g<G;g++)if(dp[need-1][g]<bv){bv=dp[need-1][g];bg=g;}if(bg<0)return null;
 const pick=[];for(let i=need-1;i>=0;i--){pick.unshift(bg);bg=pr[i][bg];}
 const cuts=[0,...pick.map(g=>gaps[g].mid),L];const parts=[];
 for(let i=0;i<nParts;i++){const seg=cuts[i+1]-cuts[i];const e=w[i]/tot*L;if(seg<e*.45||seg>e*2.1)return null;parts.push(trim(pcm.slice(cuts[i],cuts[i+1]),rate));}
 return parts;}
function finish(pcm,rate){const out=Int16Array.from(pcm);const f=Math.min(out.length,Math.round(rate*.015));for(let k=0;k<f;k++){out[k]=Math.round(out[k]*(k/f));out[out.length-1-k]=Math.round(out[out.length-1-k]*(k/f));}const all=new Int16Array(out.length+Math.round(rate*.12));all.set(out);return all;}
const save=(it,pcm0,rate)=>{const pcm=finish(pcm0,rate);fs.writeFileSync(path.join(dir,it.file),wav(pcm,rate));cache[it.file]={d:+(pcm.length/rate).toFixed(2),m:MODEL};fs.writeFileSync(cacheF,JSON.stringify(cache));writeMan();};
const writeMan=()=>{const m={};for(const it of items)if(cache[it.file]&&fs.existsSync(path.join(dir,it.file)))m[it.id]={f:it.file,d:cache[it.file].d};fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(m));};
(async()=>{const todo=items.filter(it=>FORCE?cache[it.file]?.m!==MODEL:!(cache[it.file]&&fs.existsSync(path.join(dir,it.file))));
 const seen=new Set();const uniq=todo.filter(it=>!seen.has(it.file)&&seen.add(it.file));console.log('model',MODEL,'to generate:',uniq.length);writeMan();
 const groups={};for(const it of uniq){const g=it.id.split('_')[0];(groups[g]=groups[g]||[]).push(it);}
 const chunks=[];for(const g of Object.values(groups)){const cs=process.env.SINGLE?1:7;for(let i=0;i<g.length;i+=cs)chunks.push(g.slice(i,i+cs));}
 try{for(const ch of chunks){const r=await tts(ch.map(x=>x.text).join('\n\n'));const parts=ch.length===1?[trim(r.pcm,r.rate)]:split(r.pcm,r.rate,ch.length,ch.map(x=>x.text));
   if(parts){const bad=[];ch.forEach((it,i)=>{const q=parts[i].length/r.rate/it.text.split(/\s+/).length;if(ch.length>1&&(q<.24||q>.62))bad.push(it);else save(it,parts[i],r.rate);});console.log('ok batch',ch.map(x=>x.id).join(' '));
   for(const it of bad){const s=await tts(it.text);save(it,trim(s.pcm,s.rate),s.rate);console.log('redo single',it.id);}}
   else{console.log('split failed, one by one:',ch.map(x=>x.id).join(' '));for(const it of ch){const s=await tts(it.text);save(it,trim(s.pcm,s.rate),s.rate);console.log('ok',it.id);}}}}
 catch(e){console.log('stopped:',e.message);}
 for(const it of items){const c=cache[it.file];if(!c)continue;const r=c.d/it.text.split(/\s+/).length;if(r<.22||r>.62)console.log('CHECK ratio',it.id,r.toFixed(2),it.text.slice(0,60));}
 writeMan();console.log('done',Object.keys(JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')))).length,'/',items.length);})();
