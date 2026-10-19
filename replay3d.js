/* =========================================================
   Football 101 — 3D slow-motion replays for "Watch a Game".
   window.R3.render(spec, t) draws one frame of a replay at local time t (seconds);
   window.R3.hide() hides it. Three.js (vendor/three.min.js) loads on first use.
   Coordinates are yards: x along the field (0–120, goal lines at 10 and 110),
   z across the field (0–53.3), y up.
   ========================================================= */
(function(){
let loading=null;
function load(){if(window.THREE)return Promise.resolve();if(loading)return loading;
 loading=new Promise((res,rej)=>{const s=document.createElement('script');s.src='vendor/three.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});return loading;}

const TEAM={blue:{jersey:0x2f6fed,trim:0xffc93c,helmet:0x1d2b53,pants:0xf3efe2,num:'#ffffff',numEdge:'#1d2b53'},
            red:{jersey:0xe2483f,trim:0xffffff,helmet:0x8f1d17,pants:0xffffff,num:'#ffffff',numEdge:'#8f1d17'}};
let R=null,lastCall=0,builtFor=null,cast=[];
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

/* ---------- textures ---------- */
function fieldTexture(T){const W=3072,H=1536,x0=-12,x1=132,z0=-10,z1=63.33;const sx=W/(x1-x0),sz=H/(z1-z0);
 const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 const X=x=>(x-x0)*sx,Z=z=>(z-z0)*sz;
 g.fillStyle='#3f8f45';g.fillRect(0,0,W,H);
 for(let x=10;x<110;x+=5){g.fillStyle=((x/5)%2)?'#4ea455':'#56ad5c';g.fillRect(X(x),Z(0),5*sx+1,53.33*sz);}
 // grass grain
 for(let i=0;i<26000;i++){g.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?40:90},0,${Math.random()*.06})`;g.fillRect(Math.random()*W,Math.random()*H,2,2);}
 // end zones
 const ez=(xa,col,name,flip)=>{g.fillStyle=col;g.fillRect(X(xa),Z(0),10*sx,53.33*sz);g.save();g.translate(X(xa+5),Z(26.67));g.rotate(flip?Math.PI/2:-Math.PI/2);g.fillStyle='rgba(255,255,255,.92)';g.font=`900 ${5.2*sz}px Arial Black,Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText(name,0,0);g.restore();};
 ez(0,'#2f5fd0','THUNDER',false);ez(110,'#c83a32','TITANS',true);
 g.strokeStyle='#fff';g.fillStyle='#fff';
 // border + lines
 g.lineWidth=.22*sx;for(let x=10;x<=110;x+=5){g.beginPath();g.moveTo(X(x),Z(0));g.lineTo(X(x),Z(53.33));g.stroke();}
 g.lineWidth=.5*sz;g.strokeRect(X(0),Z(0),120*sx,53.33*sz);g.beginPath();g.moveTo(X(10),Z(0));g.lineTo(X(10),Z(53.33));g.moveTo(X(110),Z(0));g.lineTo(X(110),Z(53.33));g.lineWidth=.35*sx;g.stroke();
 // hashes
 g.lineWidth=.12*sx;for(let x=11;x<110;x++){if(x%5===0)continue;for(const [za,zb] of [[.6,1.3],[52.03,52.73],[23.0,23.7],[29.63,30.33]]){g.beginPath();g.moveTo(X(x),Z(za));g.lineTo(X(x),Z(zb));g.stroke();}}
 // numbers
 g.font=`700 ${2.2*sz}px Arial`;g.textAlign='center';g.textBaseline='middle';
 for(let x=20;x<=100;x+=10){const n=x<=60?x-10:110-x;for(const [z,rot] of [[9,0],[44.33,Math.PI]]){g.save();g.translate(X(x),Z(z));g.rotate(rot);g.fillText(String(n),0,0);g.restore();}}
 // sideline apron
 g.fillStyle='rgba(255,255,255,.95)';g.fillRect(X(-12),Z(-2),144*sx,.5*sz);g.fillRect(X(-12),Z(55.33),144*sx,.5*sz);
 const t=new T.CanvasTexture(c);t.anisotropy=8;t.encoding=T.sRGBEncoding;return{t,x0,x1,z0,z1};}
function crowdTexture(T){const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');g.fillStyle='#2b3350';g.fillRect(0,0,1024,256);
 const cols=['#e2483f','#2f6fed','#ffffff','#ffc93c','#1d2b53','#f3a6a0','#9fc1ff'];
 for(let r=0;r<16;r++)for(let i=0;i<120;i++){g.fillStyle=cols[(Math.random()*cols.length)|0];const x=i*8.5+(r%2)*4+Math.random()*2,y=r*16+4;g.beginPath();g.arc(x,y,3.2,0,7);g.fill();g.fillRect(x-3,y+3,6,6);}
 const t=new T.CanvasTexture(c);t.wrapS=T.RepeatWrapping;t.repeat.set(6,1);t.encoding=T.sRGBEncoding;return t;}
function numberTexture(T,num,team){const c=document.createElement('canvas');c.width=128;c.height=128;const g=c.getContext('2d');
 g.font='900 92px Arial Black,Arial';g.textAlign='center';g.textBaseline='middle';g.lineWidth=12;g.strokeStyle=TEAM[team].numEdge;g.strokeText(String(num),64,70);g.fillStyle=TEAM[team].num;g.fillText(String(num),64,70);
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;}

/* ---------- renderer and stadium ---------- */
function init(){const T=THREE;const host=document.querySelector('.screen');if(!host)return null;
 const canvas=document.createElement('canvas');canvas.className='r3c';
 const ov=document.createElement('div');ov.className='r3o';ov.innerHTML='<div class="r3vig"></div><div class="r3bar"><span class="r3tag">⟲ REPLAY</span><span class="r3t"></span></div><div class="r3slow">SLOW MOTION</div><div class="r3note"></div><div class="r3flash"></div>';
 host.appendChild(canvas);host.appendChild(ov);
 if(!document.getElementById('r3css')){const st=document.createElement('style');st.id='r3css';st.textContent=`
.r3c{position:absolute;inset:0;width:100%;height:100%;display:none;z-index:6;pointer-events:none}
.r3o{position:absolute;inset:0;display:none;z-index:7;pointer-events:none;font-family:'Lilita One',Nunito,sans-serif}
.r3vig{position:absolute;inset:0;box-shadow:inset 0 0 12cqw rgba(0,0,0,.55)}
.r3bar{position:absolute;left:2.2cqw;top:2.6cqh;display:flex;gap:1cqw;align-items:center}
.r3tag{background:#e2483f;color:#fff;border:.4cqw solid #fff;border-radius:999px;padding:.5cqh 1.4cqw;font-size:2.3cqw;letter-spacing:.1cqw;box-shadow:.4cqw .4cqw 0 rgba(0,0,0,.35)}
.r3t{background:rgba(29,43,83,.92);color:#fff;border-radius:999px;padding:.6cqh 1.4cqw;font-size:2cqw}
.r3slow{position:absolute;right:2.4cqw;top:3.2cqh;color:#fff;font-size:1.6cqw;letter-spacing:.3cqw;opacity:.85}
.r3note{position:absolute;left:50%;bottom:16cqh;transform:translateX(-50%);background:#ffd84a;color:#1d2b53;border:.45cqw solid #1d2b53;border-radius:999px;padding:.6cqh 2cqw;font-size:2.6cqw;opacity:0;white-space:nowrap}
.r3flash{position:absolute;inset:0;background:#fff;opacity:0}`;document.head.appendChild(st);}
 const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.NoToneMapping;
 const scene=new T.Scene();scene.background=new T.Color(0x9fd3ff);scene.fog=new T.Fog(0x9fd3ff,90,220);
 const camera=new T.PerspectiveCamera(38,16/9,.05,500);
 scene.add(new T.HemisphereLight(0xdff1ff,0x3a6b2c,.55));
 const sun=new T.DirectionalLight(0xfff3dc,1.05);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=-18;sc.right=18;sc.top=18;sc.bottom=-18;sc.near=1;sc.far=120;sun.shadow.bias=-.0004;scene.add(sun,sun.target);
 // field
 const ft=fieldTexture(T);const fg=new T.PlaneGeometry(ft.x1-ft.x0,ft.z1-ft.z0);const field=new T.Mesh(fg,new T.MeshStandardMaterial({map:ft.t,roughness:.95}));
 field.rotation.x=-Math.PI/2;field.position.set((ft.x0+ft.x1)/2,0,(ft.z0+ft.z1)/2);field.receiveShadow=true;scene.add(field);
 const apron=new T.Mesh(new T.PlaneGeometry(400,300),new T.MeshStandardMaterial({color:0x2f6a35,roughness:1}));apron.rotation.x=-Math.PI/2;apron.position.set(60,-.02,26.67);scene.add(apron);
 // stands
 const crowd=crowdTexture(T);const standMat=new T.MeshStandardMaterial({map:crowd,roughness:1});const wallMat=new T.MeshStandardMaterial({color:0x1d2b53,roughness:.8});
 for(const [z,rot] of [[-16,0],[69.33,Math.PI]]){const g=new T.Group();const s=new T.Mesh(new T.PlaneGeometry(190,22),standMat);s.rotation.x=-Math.PI/2+.62;s.position.set(0,9,0);g.add(s);
  const w=new T.Mesh(new T.BoxGeometry(190,2.2,.6),wallMat);w.position.set(0,1.1,5);g.add(w);g.position.set(60,0,z);g.rotation.y=rot;scene.add(g);}
 for(const [x,rot] of [[-26,Math.PI/2],[146,-Math.PI/2]]){const s=new T.Mesh(new T.PlaneGeometry(110,22),standMat);s.position.set(x,9,26.67);s.rotation.y=rot;s.rotation.x=0;scene.add(s);}
 // goal posts and pylons
 const postMat=new T.MeshStandardMaterial({color:0xffd84a,roughness:.4,metalness:.2});
 for(const x of [0,120]){const g=new T.Group();const cyl=(r,h)=>new T.Mesh(new T.CylinderGeometry(r,r,h,12),postMat);
  const base=cyl(.18,3.3);base.position.y=1.65;g.add(base);const cb=new T.Mesh(new T.CylinderGeometry(.09,.09,6.17,10),postMat);cb.rotation.x=Math.PI/2;cb.position.y=3.33;g.add(cb);
  for(const s of [-1,1]){const up=cyl(.08,10);up.position.set(0,3.33+5,s*3.08);g.add(up);}g.position.set(x,0,26.67);g.traverse(m=>m.castShadow=true);scene.add(g);}
 const pyl=new T.MeshStandardMaterial({color:0xff7a1a});for(const x of [10,110])for(const z of [0,53.33]){const p=new T.Mesh(new T.BoxGeometry(.11,.5,.11),pyl);p.position.set(x,.25,z);scene.add(p);}
 // first-down line overlay (positioned per replay)
 const fdl=new T.Mesh(new T.PlaneGeometry(.28,53.33),new T.MeshBasicMaterial({color:0xffd84a,transparent:true,opacity:.9}));fdl.rotation.x=-Math.PI/2;fdl.position.set(-50,.02,26.67);scene.add(fdl);
 // foot marks
 const marks=[0,1].map(()=>{const m=new T.Mesh(new T.RingGeometry(.22,.36,32),new T.MeshBasicMaterial({color:0xffd84a,transparent:true,opacity:0,side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.03;scene.add(m);return m;});
 // ball
 const ball=new T.Group();const bm=new T.Mesh(new T.SphereGeometry(.16,24,16),new T.MeshStandardMaterial({color:0x7a3b17,roughness:.55}));bm.scale.set(1.75,1,1);ball.add(bm);ball.scale.setScalar(1.25);
 const lace=new T.Mesh(new T.BoxGeometry(.13,.02,.02),new T.MeshStandardMaterial({color:0xffffff}));lace.position.set(0,.16,0);ball.add(lace);
 for(const s of [-1,1]){const st=new T.Mesh(new T.TorusGeometry(.115,.012,6,20),new T.MeshStandardMaterial({color:0xffffff}));st.rotation.y=Math.PI/2;st.position.x=s*.18;ball.add(st);}
 ball.traverse(m=>m.castShadow=true);scene.add(ball);
 R={T,host,canvas,ov,renderer,scene,camera,sun,fdl,marks,ball,mats:{},geo:{},w:0,h:0};
 setInterval(()=>{if(R&&R.canvas.style.display==='block'&&performance.now()-lastCall>350)hide();},150);
 return R;}

/* ---------- a player model ---------- */
function mat(color,o={}){const k=color+JSON.stringify(o);if(!R.mats[k]){const m=new R.T.MeshStandardMaterial({color,roughness:o.r??.6,metalness:o.m??0});m.color.convertSRGBToLinear();R.mats[k]=m;}return R.mats[k];}
function limb(r1,r2,len,m){const T=R.T;const g=new T.Group();const c=new T.Mesh(new T.CylinderGeometry(r1,r2,len,12),m);c.position.y=-len/2;c.castShadow=true;g.add(c);const j=new T.Mesh(new T.SphereGeometry(r1*1.02,12,10),m);j.castShadow=true;g.add(j);return g;}
function makePlayer(team,num){const T=R.T,C=TEAM[team];const root=new T.Group(),body=new T.Group();root.add(body);
 const jer=mat(C.jersey,{r:.55}),pants=mat(C.pants,{r:.7}),skin=mat(0x8d5a3b,{r:.7}),sock=mat(C.jersey),shoe=mat(0x161616,{r:.5}),hel=mat(C.helmet,{r:.25,m:.35}),trim=mat(C.trim);
 const hips=new T.Group();hips.position.y=1.0;body.add(hips);
 const legs=[-1,1].map(s=>{const th=limb(.12,.1,.5,pants);th.position.set(s*.14,0,0);hips.add(th);const sh=limb(.095,.075,.48,sock);sh.position.y=-.5;th.add(sh);
  const f=new T.Mesh(new T.BoxGeometry(.13,.08,.3),shoe);f.position.set(0,-.5,.07);f.castShadow=true;sh.add(f);return{th,sh};});
 const torso=new T.Group();hips.add(torso);
 const tm=new T.Mesh(new T.CylinderGeometry(.27,.22,.66,16),jer);tm.scale.z=.72;tm.position.y=.36;tm.castShadow=true;torso.add(tm);
 const pads=new T.Mesh(new T.SphereGeometry(.34,16,10),jer);pads.scale.set(1.35,.55,.85);pads.position.y=.66;pads.castShadow=true;torso.add(pads);
 const tex=numberTexture(T,num,team);for(const s of [-1,1]){const p=new T.Mesh(new T.PlaneGeometry(.34,.34),new T.MeshStandardMaterial({map:tex,transparent:true,roughness:.6}));p.position.set(0,.4,s*.205);if(s<0)p.rotation.y=Math.PI;torso.add(p);}
 const stripe=new T.Mesh(new T.CylinderGeometry(.225,.225,.04,16),trim);stripe.scale.z=.72;stripe.position.y=.04;torso.add(stripe);
 const neck=new T.Mesh(new T.CylinderGeometry(.08,.09,.14,10),skin);neck.position.y=.82;torso.add(neck);
 const head=new T.Group();head.position.y=1.0;torso.add(head);
 const hm=new T.Mesh(new T.SphereGeometry(.2,20,16),hel);hm.scale.set(.95,1,1.08);hm.castShadow=true;head.add(hm);
 const hs=new T.Mesh(new T.BoxGeometry(.05,.02,.36),trim);hs.position.set(0,.2,0);hs.rotation.x=0;head.add(hs);
 const mask=mat(0xd9d9d9,{r:.3,m:.6});for(const y of [-.06,.0]){const b=new T.Mesh(new T.TorusGeometry(.17,.012,6,16,Math.PI),mask);b.position.set(0,y,.1);b.rotation.set(Math.PI/2+.25,0,0);head.add(b);}
 const visor=new T.Mesh(new T.BoxGeometry(.012,.12,.012),mask);visor.position.set(0,-.04,.24);head.add(visor);
 const arms=[-1,1].map(s=>{const up=limb(.085,.075,.36,jer);up.position.set(s*.38,.66,0);torso.add(up);const fo=limb(.07,.06,.32,skin);fo.position.y=-.36;up.add(fo);
  const hand=new T.Mesh(new T.SphereGeometry(.065,10,8),mat(0x222222));hand.position.y=-.34;fo.add(hand);return{up,fo,hand};});
 root.traverse(m=>{if(m.isMesh)m.castShadow=true;});
 return{root,body,hips,torso,head,legs,arms};}

/* ---------- poses ---------- */
const POSES={
 stand:(ph,sp)=>({hip:[0,0],knee:[.08,.08],sh:[.15,.15],shz:[.12,.12],el:[-.3,-.3],lean:.04,pitch:0,roll:0,y:0}),
 run:(ph,sp)=>{const a=clamp(sp/6.5,.25,1),s=Math.sin(ph);return{hip:[s*.95*a,-s*.95*a],knee:[(.25+Math.max(0,-s)*1.3)*a+.1,(.25+Math.max(0,s)*1.3)*a+.1],sh:[-s*.9*a,s*.9*a],shz:[.1,.1],el:[-1.4,-1.4],lean:.18+.14*a,pitch:0,roll:0,y:Math.abs(Math.cos(ph))*.07*a};},
 catch:(ph,sp)=>{const r=POSES.run(ph,sp*.7);return{...r,sh:[-2.75,-2.75],shz:[.25,.25],el:[-.25,-.25],lean:.06};},
 shoulder:(ph,sp)=>{const r=POSES.run(ph,sp);return{...r,sh:[-2.4,-2.1],shz:[.35,.1],el:[-.5,-.4],lean:.08};},
 reach:(ph,sp)=>{const r=POSES.run(ph,sp);return{...r,sh:[-1.6,-1.6],shz:[.1,.1],el:[-.15,-.15],lean:.32};},
 leap:(ph,sp)=>({hip:[-.6,.3],knee:[1.1,.4],sh:[-2.9,-2.7],shz:[.2,.2],el:[-.2,-.2],lean:.1,pitch:0,roll:0,y:.55}),
 tiptoe:(ph,sp)=>({hip:[.05,-.12],knee:[.05,.08],sh:[-2.3,-2.0],shz:[.3,.3],el:[-.9,-.9],lean:-.05,pitch:0,roll:-.12,y:.06}),
 dive:(ph,sp)=>({hip:[-.15,.25],knee:[.2,.4],sh:[-2.9,-2.9],shz:[.15,.15],el:[-.1,-.1],lean:.1,pitch:1.42,roll:0,y:.0}),
 tackle:(ph,sp)=>({hip:[.4,-.3],knee:[.6,.5],sh:[-1.5,-1.5],shz:[-.25,-.25],el:[-1.1,-1.1],lean:.55,pitch:.45,roll:0,y:-.05}),
 fall:(ph,sp)=>({hip:[.3,-.2],knee:[.5,.7],sh:[-2.2,-1.4],shz:[.5,.6],el:[-.4,-.6],lean:.2,pitch:1.5,roll:.15,y:0}),
 fallback:(ph,sp)=>({hip:[-.9,-.6],knee:[.4,.8],sh:[-2.4,-.8],shz:[.6,.7],el:[-.3,-.9],lean:-.1,pitch:-1.45,roll:-.2,y:0}),
 block:(ph,sp)=>{const r=POSES.run(ph,Math.min(sp,2.2));return{...r,hip:[r.hip[0]*.5+.25,r.hip[1]*.5-.15],knee:[.55,.55],sh:[-1.5,-1.5],shz:[-.12,-.12],el:[-.55,-.55],lean:.55,y:-.06};},
 celebrate:(ph,sp)=>({hip:[0,0],knee:[.1,.1],sh:[-3,-3],shz:[.4,.4],el:[-.1,-.1],lean:-.08,pitch:0,roll:0,y:Math.abs(Math.sin(ph*3))*.18}),
};
function mix(a,b,t){const o={};for(const k in a){o[k]=Array.isArray(a[k])?a[k].map((v,i)=>lerp(v,b[k][i],t)):lerp(a[k],b[k],t);}return o;}
function applyPose(P,p){P.legs.forEach((l,i)=>{l.th.rotation.x=-p.hip[i];l.sh.rotation.x=p.knee[i];});
 P.arms.forEach((a,i)=>{const s=i?1:-1;a.up.rotation.x=p.sh[i];a.up.rotation.z=-s*p.shz[i]*-1;a.fo.rotation.x=p.el[i];});
 P.torso.rotation.x=p.lean;P.body.rotation.x=p.pitch;P.body.rotation.z=p.roll;P.body.position.y=p.y;}

/* ---------- spec → cast (precomputed samples for heading and stride phase) ---------- */
function keyAt(keys,t){if(t<=keys[0][0])return keys[0].slice(1);for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const a=keys[i-1],b=keys[i];const u=(t-a[0])/((b[0]-a[0])||1);return a.slice(1).map((v,j)=>lerp(v,b[j+1],u));}return keys[keys.length-1].slice(1);}
function smoothKey(keys,t){// Catmull-Rom through key points
 if(keys.length<3)return keyAt(keys,t);if(t<=keys[0][0])return keys[0].slice(1);if(t>=keys[keys.length-1][0])return keys[keys.length-1].slice(1);
 let i=1;while(t>keys[i][0])i++;const p0=keys[Math.max(0,i-2)],p1=keys[i-1],p2=keys[i],p3=keys[Math.min(keys.length-1,i+1)];const u=(t-p1[0])/((p2[0]-p1[0])||1),u2=u*u,u3=u2*u;
 return p1.slice(1).map((_,j)=>{const a=p0[j+1],b=p1[j+1],c=p2[j+1],d=p3[j+1];return .5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u2+(-a+3*b-3*c+d)*u3);});}
function build(spec){for(const c of cast)R.scene.remove(c.P.root);cast=[];
 for(const a of spec.actors){const P=makePlayer(a.team,a.num);R.scene.add(P.root);const smp=[];let d=0,hd=a.face??null,prev=null;
  for(let t=0;t<=spec.dur+1e-6;t+=1/60){const [x,z]=smoothKey(a.key,t);if(prev){const dx=x-prev[0],dz=z-prev[1],m=Math.hypot(dx,dz);d+=m;if(m>.004&&a.face==null)hd=Math.atan2(dx,dz);}if(hd==null)hd=a.team==='blue'?Math.PI/2:-Math.PI/2;smp.push([t,x,z,d,hd]);prev=[x,z];}
  // smooth heading
  for(let k=1;k<smp.length;k++){let a1=smp[k-1][4],a2=smp[k][4];while(a2-a1>Math.PI)a2-=2*Math.PI;while(a2-a1<-Math.PI)a2+=2*Math.PI;smp[k][4]=lerp(a1,a2,.18);}
  cast.push({a,P,smp});}
 R.fdl.position.x=spec.fd??-50;builtFor=spec;}
function sampleAt(c,t){const s=c.smp,i=clamp(Math.round(t*60),0,s.length-1);return s[i];}

function hide(){if(!R)return;R.canvas.style.display='none';R.ov.style.display='none';}
function render(spec,t){lastCall=performance.now();if(!window.THREE){load();return;}if(!R&&!init())return;
 const T=R.T;if(builtFor!==spec)build(spec);
 const host=R.host,w=host.clientWidth,h=host.clientHeight;if(w!==R.w||h!==R.h){R.renderer.setSize(w,h,false);R.camera.aspect=w/h;R.camera.updateProjectionMatrix();R.w=w;R.h=h;}
 R.canvas.style.display='block';R.ov.style.display='block';
 // players
 const holders=spec.hold||[];let holder=null;for(const [ht,idx] of holders)if(t>=ht)holder=idx;
 for(const c of cast){const [st,x,z,d,hd]=sampleAt(c,t);const sp=(()=>{const a=sampleAt(c,Math.max(0,t-.1)),b=sampleAt(c,t+.1);return Math.hypot(b[1]-a[1],b[2]-a[2])/.2;})();
  c.P.root.position.set(x,0,z);c.P.root.rotation.y=hd;
  const pk=c.a.pose||[[0,'run']];let cur=pk[0],prev=null;for(const k of pk)if(t>=k[0]){prev=cur===k?prev:cur;cur=k;}
  const ph=d*2.1+(c.a.num%7);const pc=POSES[cur[1]](ph,sp);let pose=pc;
  if(prev&&prev!==cur){const u=clamp((t-cur[0])/(cur[2]||.25));pose=mix(POSES[prev[1]](ph,sp),pc,ease(u));}
  applyPose(c.P,pose);}
 // ball
 if(holder!=null&&cast[holder]){const P=cast[holder].P;P.root.updateMatrixWorld(true);const v=new T.Vector3(.22,.42,.2);P.torso.localToWorld(v);R.ball.position.copy(v);R.ball.rotation.set(0,P.root.rotation.y+Math.PI/2,.5);}
 else if(spec.ball){const [x,y,z]=smoothKey(spec.ball,t);R.ball.position.set(x,y,z);const [x2,y2,z2]=smoothKey(spec.ball,t+.03);R.ball.rotation.set(t*14,Math.atan2(-(z2-z),x2-x),Math.atan2(y2-y,Math.hypot(x2-x,z2-z)));}
 // foot marks
 R.marks.forEach((m,i)=>{const mk=(spec.marks||[])[i];if(!mk){m.material.opacity=0;return;}m.position.x=mk[1];m.position.z=mk[2];const a=clamp((t-mk[0])/.25);m.material.opacity=t<mk[0]?0:.95*a;m.scale.setScalar((mk[3]||1)*(1+.12*Math.sin(t*6)));});
 // camera
 const [cx,cy,cz,tx,ty,tz]=smoothKey(spec.cam.map(k=>[k[0],...k[1],...k[2]]),t);R.camera.position.set(cx,cy,cz);R.camera.lookAt(tx,ty,tz);R.camera.fov=spec.fov||38;R.camera.updateProjectionMatrix();
 R.sun.position.set(tx-14,32,tz+20);R.sun.target.position.set(tx,0,tz);
 // overlay
 R.ov.querySelector('.r3t').textContent=spec.title||'';const note=R.ov.querySelector('.r3note');let nt='';let no=0;for(const [a,b,txt] of spec.notes||[])if(t>=a&&t<=b){nt=txt;no=clamp(Math.min((t-a)/.25,(b-t)/.25));}note.textContent=nt;note.style.opacity=no;
 R.ov.querySelector('.r3flash').style.opacity=t<.3?1-t/.3:(t>spec.dur-.3?(t-(spec.dur-.3))/.3:0);
 R.renderer.render(R.scene,R.camera);}
window.R3={render,hide,load};
})();
