// Football 101 narration generator (Gemini TTS, voice Achird).
// Batches several lines per request and splits the audio at the pauses, to stay within daily limits.
// Usage: node gen3.js                 (uses TTS_MODEL env or gemini-3.8-flash-tts; skips clips already made)
//        node gen3.js --force         (regenerate everything, e.g. after setting TTS_MODEL=gemini-3.8-flash-tts)
const fs=require('fs'),path=require('path');
const KEY=fs.readFileSync(path.join(__dirname,'gemini_key.txt'),'utf8').trim();
const MODEL=process.env.TTS_MODEL||'gemini-3.8-flash-tts',VOICE=process.env.VOICE||'Achird',FORCE=process.argv.includes('--force');
const STYLE=process.env.STYLE||'a warm, friendly, upbeat narrator of a fun animated educational video for beginners; natural pace, smiling; pause for two full seconds between paragraphs';
const dir=path.join(__dirname,'audio');fs.mkdirSync(dir,{recursive:true});
const items=JSON.parse(fs.readFileSync(path.join(__dirname,'narration.json'),'utf8'));


const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function tts(text){for(let a=0;a<8;a++){const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,{method:'POST',headers:{'x-goog-api-key':KEY,'Content-Type':'application/json'},
  body:JSON.stringify({contents:[{role:'user',parts:[{text,speech_metadata:{style:STYLE}}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{voice:VOICE}}}})});
 const j=await r.json();if(r.ok){const p=j.candidates?.[0]?.content?.parts?.find(p=>p.inlineData);if(p){let b=Buffer.from(p.inlineData.data,'base64');let rate=24000,off=0,end=b.length;
  if(b.slice(0,4).toString()==='RIFF'){rate=b.readUInt32LE(24);let q=12;while(q+8<=b.length){const id=b.slice(q,q+4).toString(),sz=b.readUInt32LE(q+4);if(id==='data'){off=q+8;end=(sz>0&&sz<0xFFFFFFF0&&off+sz<=b.length)?off+sz:b.length;break;}q+=8+sz+(sz&1);}}
  else{const m=(p.inlineData.mimeType||'').match(/rate=(\d+)/);if(m)rate=+m[1];}
  const n=Math.floor((end-off)/2);const pcm=new Int16Array(n);for(let i=0;i<n;i++)pcm[i]=b.readInt16LE(off+2*i);return{pcm,rate};}}
 const full=JSON.stringify(j),msg=full.slice(0,160);console.log('  retry',r.status,msg);if(full.includes('per_day')||full.includes('PerDay'))throw new Error('DAILY_LIMIT');await sleep(r.status===429?20000:3000);}throw new Error('failed');}
function wav(pcm,rate){const h=Buffer.alloc(44);const len=pcm.length*2;h.write('RIFF',0);h.writeUInt32LE(36+len,4);h.write('WAVE',8);h.write('fmt ',12);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(1,22);h.writeUInt32LE(rate,24);h.writeUInt32LE(rate*2,28);h.writeUInt16LE(2,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(len,40);return Buffer.concat([h,Buffer.from(pcm.buffer,pcm.byteOffset,len)]);}

// Raw batch mode: saves each batch's audio unsplit (raw/<n>.wav + raw/<n>.json) so it can be split precisely afterwards.
const ONLY=(process.env.ONLY||'').split(',').filter(Boolean);const SIZE=+(process.env.SIZE||10);
const rawDir=path.join(__dirname,'raw');fs.mkdirSync(rawDir,{recursive:true});
(async()=>{let todo=items.filter(it=>!fs.existsSync(path.join(dir,it.file)));if(ONLY.length)todo=todo.filter(it=>ONLY.some(p=>it.id.startsWith(p)));const EXC=(process.env.EXCLUDE||'').split(',').filter(Boolean);if(EXC.length)todo=todo.filter(it=>!EXC.some(p=>it.id.startsWith(p)));
 if(process.env.VF)todo=todo.filter(it=>process.env.VF==='pbp'?it.v==='pbp':!it.v);const seen=new Set();todo=todo.filter(it=>!seen.has(it.file)&&seen.add(it.file));
 const done=new Set();for(const f of fs.readdirSync(rawDir))if(f.endsWith('.json'))for(const x of JSON.parse(fs.readFileSync(path.join(rawDir,f))))done.add(x.file);
 todo=todo.filter(it=>!done.has(it.file));console.log('model',MODEL,'to generate:',todo.length);
 const groups={};for(const it of todo){const g=it.id.split('_')[0].replace(/\d+$/,'');(groups[g]=groups[g]||[]).push(it);}
 let n=fs.readdirSync(rawDir).filter(f=>f.endsWith('.json')).length;
 try{for(const g of Object.values(groups))for(let i=0;i<g.length;i+=SIZE){const ch=g.slice(i,i+SIZE);const r=await tts(ch.map(x=>x.text).join('\n\n'));
   const name='b'+String(n++).padStart(3,'0');fs.writeFileSync(path.join(rawDir,name+'.wav'),wav(r.pcm,r.rate));fs.writeFileSync(path.join(rawDir,name+'.json'),JSON.stringify(ch));console.log('ok',name,ch.map(x=>x.id).join(' '));}}
 catch(e){console.log('stopped:',e.message);}console.log('done');})();
