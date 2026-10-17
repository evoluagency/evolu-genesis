#!/usr/bin/env node
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs/promises';
import fss from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn,spawnSync} from 'node:child_process';

const ROOT=path.resolve(process.env.UX_HOMOLOGATION_ROOT||process.cwd());
const OUT=path.resolve(process.env.UX_HOMOLOGATION_OUT||path.join(ROOT,'.local','ux-homologation'));
const SELF=process.argv.includes('--self-test');
const HEADLESS=process.env.UX_BROWSER_HEADLESS!=='0';
const PAGES=[
 ['office','/preview/office-workspace/?tab=queue&cnpj=m&period=2026-09'],
 ['company','/preview/company-access-home/?cnpj=a&period=2026-09'],
 ['finance','/preview/company-financial-workspace/?role=company&cnpj=m&period=2026-09&activity=moves'],
 ['fiscal','/preview/tenant-fiscal-workspace/?tab=received&cnpj=m&period=2026-09'],
 ['advisory','/preview/tenant-advisory-workspace/?tab=contexts&cnpj=m&period=2026-09']
];
const VIEWS=[['1440x900',1440,900],['1366x768',1366,768],['1280x720',1280,720],['short',1366,600],['mobile',390,844,true],['zoom200-equivalent',720,450,false,true]];
const SELF_HTML=`<!doctype html><html lang="pt-BR"><style>*{box-sizing:border-box}body{margin:0}.ux-app{display:grid;grid-template-columns:236px 1fr;min-height:100vh}.ux-main{min-width:0;padding:12px}.ux-card-scroll{height:80px;overflow:auto}body.ux-collapsed .ux-app{grid-template-columns:76px 1fr}@media(max-width:767px){.ux-app{display:block}.ux-sidebar{display:none}}</style><body><div class="ux-app"><aside class="ux-sidebar" data-ux-sidebar><button data-ux-brand>Brand</button><nav class="ux-nav"><button class="active">Home</button></nav></aside><main class="ux-main"><button data-locale-toggle>EN</button><p>DADOS SINTÉTICOS</p><div class="ux-card-scroll"><div class="ux-list"><button>A</button><button>B</button><button>C</button></div></div></main></div><script>document.querySelector('[data-ux-brand]').onclick=()=>document.body.classList.toggle('ux-collapsed');document.querySelector('[data-locale-toggle]').onclick=()=>document.documentElement.lang='en'</script>`;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function browserPath(){
 if(process.env.CHROME_BIN&&fss.existsSync(process.env.CHROME_BIN))return process.env.CHROME_BIN;
 for(const n of process.platform==='win32'?['chrome.exe','msedge.exe']:['chromium','chromium-browser','google-chrome','google-chrome-stable','microsoft-edge']){
  const p=spawnSync(process.platform==='win32'?'where':'which',[n],{encoding:'utf8'});if(p.status===0)return p.stdout.trim().split(/\r?\n/)[0];
 }
 throw new Error('Chromium/Chrome not found. Set CHROME_BIN.');
}
function freePort(){return new Promise((ok,bad)=>{const s=net.createServer();s.unref();s.once('error',bad);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>ok(p))})})}
async function serve(){
 const port=await freePort();
 const server=http.createServer(async(req,res)=>{try{
  const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/, '');let file=path.resolve(ROOT,rel||'index.html');
  if(!file.startsWith(ROOT+path.sep)&&file!==ROOT)throw new Error('forbidden');let st;try{st=await fs.stat(file)}catch{}if(st?.isDirectory())file=path.join(file,'index.html');
  const data=await fs.readFile(file);res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(data);
 }catch(e){res.writeHead(404,{'content-type':'text/plain'});res.end(String(e.message||e))}});
 await new Promise((ok,bad)=>server.listen(port,'127.0.0.1',ok).once('error',bad));return{server,port};
}
async function launch(){
 const exe=browserPath(),debug=await freePort(),dir=await fs.mkdtemp(path.join(os.tmpdir(),'evolu-ux-'));
 const args=[`--remote-debugging-port=${debug}`,`--user-data-dir=${dir}`,'--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-sync','--disable-extensions','--no-sandbox','--disable-dev-shm-usage',...(HEADLESS?['--headless=new']:[]),'about:blank'];
 const proc=spawn(exe,args,{stdio:['ignore','ignore','pipe']});let version;
 for(let i=0;i<150;i++){try{const r=await fetch(`http://127.0.0.1:${debug}/json/version`);if(r.ok){version=await r.json();break}}catch{}await sleep(100)}
 if(!version)throw new Error('Browser debugging port did not start');return{exe,debug,dir,proc,version};
}
class CDP{
 constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map();this.events=new Map()}
 async open(){await new Promise((ok,bad)=>{this.ws.addEventListener('open',ok,{once:true});this.ws.addEventListener('error',bad,{once:true})});this.ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=this.pending.get(m.id);if(!p)return;this.pending.delete(m.id);m.error?p[1](new Error(m.error.message)):p[0](m.result||{});return}for(const f of this.events.get(m.method)||[])f(m.params||{})})}
 send(method,params={}){return new Promise((ok,bad)=>{const id=++this.id;this.pending.set(id,[ok,bad]);this.ws.send(JSON.stringify({id,method,params}))})}
 once(method,ms=15000){return new Promise((ok,bad)=>{const f=x=>{clearTimeout(t);this.events.get(method)?.delete(f);ok(x)};if(!this.events.has(method))this.events.set(method,new Set());this.events.get(method).add(f);const t=setTimeout(()=>{this.events.get(method)?.delete(f);bad(new Error(`timeout ${method}`))},ms)})}
 on(method,f){if(!this.events.has(method))this.events.set(method,new Set());this.events.get(method).add(f)} close(){this.ws.close()}
}
async function pageTarget(port){const r=await fetch(`http://127.0.0.1:${port}/json/list`),a=await r.json();return a.find(x=>x.type==='page')}
async function ev(cdp,expression){const r=await cdp.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);return r.result?.value}
async function viewport(cdp,v){await cdp.send('Emulation.setDeviceMetricsOverride',{width:v[1],height:v[2],deviceScaleFactor:1,mobile:Boolean(v[3]),screenWidth:v[1],screenHeight:v[2]})}
async function go(cdp,url){if(SELF){const t=await cdp.send('Page.getFrameTree');await cdp.send('Page.setDocumentContent',{frameId:t.frameTree.frame.id,html:SELF_HTML});await sleep(100);return}const done=cdp.once('Page.loadEventFired');await cdp.send('Page.navigate',{url});await done;await sleep(250)}
async function shot(cdp,file){const r=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(file,Buffer.from(r.data,'base64'))}
const INSPECT=`(()=>{const vis=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};const side=document.querySelector('[data-ux-sidebar]'),main=document.querySelector('.ux-main');const f=[...document.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(vis);const bad=f.filter(e=>{const r=e.getBoundingClientRect();return r.left<-1||r.right>innerWidth+1});const txt=(document.body.innerText||'').toUpperCase();return{blocked:/YOUR ORGANIZATION.*(DOESN.T ALLOW|BLOCKED)|IS BLOCKED/.test(txt),lang:document.documentElement.lang,title:document.title,side:!!side,brand:!!document.querySelector('[data-ux-brand]'),main:!!main,active:[...document.querySelectorAll('.ux-nav .active,.ux-nav [aria-current="page"],[aria-current="page"].ux-nav-link')].filter(vis).length,synthetic:/DADOS SINT[ÉE]TICOS|DADOS FICT[ÍI]CIOS|DEMONSTRA[CÇ][AÃ]O|SYNTHETIC|DEMO/.test(txt),collapsed:document.body.classList.contains('ux-collapsed'),sr:side?side.getBoundingClientRect().toJSON():null,mr:main?main.getBoundingClientRect().toJSON():null,w:innerWidth,h:innerHeight,docW:document.documentElement.scrollWidth,overflowX:document.documentElement.scrollWidth>innerWidth+2,badX:bad.map(e=>(e.innerText||e.tagName).trim().slice(0,60)),focus:f.length}})()`;

async function main(){
 await fs.mkdir(OUT,{recursive:true});if(!SELF){const miss=PAGES.map(([,r])=>path.join(ROOT,r.split('?')[0],'index.html')).filter(x=>!fss.existsSync(x));if(miss.length)throw new Error(`Run from repository root. Missing:\n${miss.join('\n')}`)}
 const hosted=SELF?{server:null,port:0}:await serve(),browser=await launch(),target=await pageTarget(browser.debug),cdp=new CDP(target.webSocketDebuggerUrl);await cdp.open();await cdp.send('Page.enable');await cdp.send('Runtime.enable');const errors=[];cdp.on('Runtime.exceptionThrown',p=>errors.push(p.exceptionDetails?.exception?.description||p.exceptionDetails?.text||'runtime exception'));
 const report={generatedAt:new Date().toISOString(),browser:browser.version.Browser,selfTest:SELF,environment:'pending',gates:{T13:[],T14:[],T15:[],T16:[],T17:[]},runtimeErrors:errors};
 try{
  for(const [id,route] of PAGES){const url=`http://127.0.0.1:${hosted.port}${route}`;await viewport(cdp,VIEWS[0]);await go(cdp,url);const a=await ev(cdp,INSPECT);if(!SELF&&a.blocked){report.environment='blocked_by_browser_policy';break}report.environment=SELF?'self_test':'local_http_ok';
   await ev(cdp,`document.querySelector('[data-ux-brand]')?.click()`);await sleep(250);const b=await ev(cdp,INSPECT);const noOverlap=x=>!x.sr||!x.mr||x.w<768||x.mr.left>=x.sr.right-2;report.gates.T13.push({page:id,status:a.side&&b.collapsed!==a.collapsed&&noOverlap(a)&&noOverlap(b)&&(b.sr?.width||0)<(a.sr?.width||Infinity)?'PASS':'FAIL'});await shot(cdp,path.join(OUT,`T13-${id}.png`));
   for(const v of VIEWS){await viewport(cdp,v);await go(cdp,url);const s=await ev(cdp,INSPECT);report.gates.T14.push({page:id,viewport:v[0],status:s.overflowX||s.badX.length?'FAIL':v[4]?'REVIEW':'PASS',overflowX:s.overflowX,clipped:s.badX});await shot(cdp,path.join(OUT,`T14-${id}-${v[0]}.png`))}
   await viewport(cdp,VIEWS[0]);await go(cdp,url);await ev(cdp,`document.querySelector('[data-locale-toggle]')?.click()`);await sleep(150);const en=await ev(cdp,INSPECT);report.gates.T15.push({page:id,status:en.lang.toLowerCase().startsWith('en')&&!en.overflowX&&!en.badX.length?'PASS':'FAIL'});await shot(cdp,path.join(OUT,`T15-${id}.png`));
   const k=await ev(cdp,`(()=>{const vis=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};const regions=[...document.querySelectorAll('.ux-card-scroll,table,.ux-list,[role="table"]')].filter(vis);const f=[...document.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(vis);let fail=0;for(const e of f){e.focus();if(document.activeElement!==e)fail++}return{regions:regions.length,focusables:f.length,fail}})()`);report.gates.T16.push({page:id,status:k.fail?'FAIL':k.regions?'PASS':'REVIEW',...k});
   const s=await ev(cdp,INSPECT);report.gates.T17.push({page:id,status:s.side&&s.brand&&s.main&&s.synthetic&&s.active>0&&s.focus>0?'PASS':'FAIL',activeNav:s.active,synthetic:s.synthetic});
  }
  if(report.environment==='blocked_by_browser_policy'){report.summary={status:'ENVIRONMENT_BLOCKED'};await fs.writeFile(path.join(OUT,'report.json'),JSON.stringify(report,null,2));await fs.writeFile(path.join(OUT,'SUMMARY.md'),'# Platform UX Browser Homologation\n\n**ENVIRONMENT_BLOCKED** — browser policy blocked local HTTP. No Platform gate was marked FAIL. Run locally with unrestricted Chrome/Chromium.\n');console.log('ENVIRONMENT_BLOCKED');process.exitCode=2;return}
  const auto={};for(const [g,rows] of Object.entries(report.gates))auto[g]=rows.some(x=>x.status==='FAIL')?'FAIL':rows.some(x=>x.status==='REVIEW')?'REVIEW':'PASS';const final={};for(const [g,s] of Object.entries(auto))final[g]=s==='FAIL'?'FAIL':SELF?'SELFTEST_ONLY':'REVIEW_REQUIRED';report.summary={automated:auto,final,status:Object.values(auto).includes('FAIL')||errors.length?'AUTOMATED_FAIL':SELF?'SELFTEST_PASS':'AUTOMATED_PASS_REVIEW_REQUIRED'};await fs.writeFile(path.join(OUT,'report.json'),JSON.stringify(report,null,2));await fs.writeFile(path.join(OUT,'SUMMARY.md'),`# Platform UX Browser Homologation\n\n${Object.keys(auto).map(g=>`- ${g}: ${auto[g]} / ${final[g]}`).join('\n')}\n\nRuntime errors: ${errors.length}\n`);await fs.writeFile(path.join(OUT,'HUMAN_REVIEW.md'),'# Human review T-13…T-17\n\n- [ ] T-13 sidebar no overlap\n- [ ] T-14 viewports + actual 200% browser zoom\n- [ ] T-15 English text no collision\n- [ ] T-16 keyboard/pointer reachability + scroll/pagination\n- [ ] T-17 coherent Shell/navigation/scope/access boundaries\n');console.log({...report.summary,runtimeErrors:errors.length});if(Object.values(auto).includes('FAIL')||errors.length)process.exitCode=1;
 }finally{cdp.close();hosted.server?.close();browser.proc.kill('SIGTERM');await sleep(250);try{await fs.rm(browser.dir,{recursive:true,force:true,maxRetries:3,retryDelay:100})}catch{}}
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
