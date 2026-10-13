#!/usr/bin/env node
// EVOLU Intelligence — Chrome-only UX smoke gate. Synthetic local pages; no API writes.
import http from "node:http";
import fs from "node:fs/promises";
import {existsSync} from "node:fs";
import path from "node:path";
import os from "node:os";
import {spawn,spawnSync} from "node:child_process";

const root=process.cwd();
const out=path.resolve(process.env.INTELLIGENCE_BROWSER_OUT||".local/intelligence-browser");
const pages=["tenant-fiscal-workspace","tenant-advisory-workspace"];
const size=[["desktop",1366,768],["mobile",390,844]];
const sleep=t=>new Promise(r=>setTimeout(r,t));
function expect(ok,msg){if(!ok)throw new Error("UX_GATE_FAIL: "+msg)}
function chrome(){
 if(process.env.CHROME_BIN&&existsSync(process.env.CHROME_BIN))return process.env.CHROME_BIN;
 for(const n of ["chromium","chromium-browser","google-chrome","google-chrome-stable"]){
  const p=spawnSync("which",[n],{encoding:"utf8"});
  if(p.status===0)return p.stdout.trim();
 }
 throw new Error("ENVIRONMENT_BLOCKED: Chromium unavailable");
}
async function freePort(){
 const net=await import("node:net");
 return await new Promise((ok,bad)=>{
  const s=net.createServer();s.once("error",bad);
  s.listen(0,"127.0.0.1",()=>{const p=s.address().port;s.close(()=>ok(p))});
 });
}
async function startServer(){
 const port=await freePort();
 const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
 const server=http.createServer(async(req,res)=>{
  try{
   const rel=decodeURIComponent((req.url||"/").split("?")[0]).replace(/^\/+/,"");
   let file=path.resolve(root,rel);
   if(!file.startsWith(root+path.sep))throw new Error("invalid_path");
   const s=await fs.stat(file);if(s.isDirectory())file=path.join(file,"index.html");
   const data=await fs.readFile(file);
   res.writeHead(200,{"content-type":mime[path.extname(file)]||"application/octet-stream"});
   res.end(data);
  }catch{res.writeHead(404);res.end("Not found")}
 });
 await new Promise((ok,bad)=>server.listen(port,"127.0.0.1",ok).once("error",bad));
 return {server,port};
}
async function startChrome(){
 const port=await freePort(),profile=await fs.mkdtemp(path.join(os.tmpdir(),"evolu-int-browser-"));
 const args=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-sync",
  "--disable-background-networking","--disable-extensions","--no-first-run",
  "--remote-allow-origins=*","--remote-debugging-port="+port,"--user-data-dir="+profile,"about:blank"];
 const proc=spawn(chrome(),args,{stdio:"ignore"});
 let browser;
 for(let i=0;i<120;i++){
  try{const r=await fetch("http://127.0.0.1:"+port+"/json/version");
    if(r.ok){browser=await r.json();break}}catch{}
  await sleep(100);
 }
 expect(browser,"chrome_start_failed");
 const targets=await (await fetch("http://127.0.0.1:"+port+"/json/list")).json();
 const page=targets.find(x=>x.type==="page");
 expect(page,"chrome_page_missing");
 return {proc,profile,port,page,browser:browser.Browser};
}
class CDP{
 constructor(url){this.ws=new WebSocket(url);this.n=0;this.pending=new Map();this.events=new Map()}
 async open(){
  await new Promise((ok,bad)=>{
   this.ws.addEventListener("open",ok,{once:true});
   this.ws.addEventListener("error",bad,{once:true});
  });
  this.ws.addEventListener("message",e=>{
   const m=JSON.parse(e.data);
   if(m.id){
    const task=this.pending.get(m.id);if(!task)return;
    this.pending.delete(m.id);
    m.error?task[1](new Error(m.error.message)):task[0](m.result||{});
   }else for(const f of this.events.get(m.method)||[])f(m.params||{});
  });
 }
 send(method,params={}){return new Promise((ok,bad)=>{
  const id=++this.n;this.pending.set(id,[ok,bad]);
  this.ws.send(JSON.stringify({id,method,params}));
 })}
 once(method){
  return new Promise((ok,bad)=>{
   const fn=p=>{clearTimeout(timer);this.events.get(method).delete(fn);ok(p)};
   if(!this.events.has(method))this.events.set(method,new Set());
   this.events.get(method).add(fn);
   const timer=setTimeout(()=>{this.events.get(method).delete(fn);bad(new Error("Timeout "+method))},15000);
  });
 }
 close(){this.ws.close()}
}
async function js(c,code){
 const r=await c.send("Runtime.evaluate",{expression:code,returnByValue:true,userGesture:true});
 if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);
 return r.result?.value;
}
async function navigate(c,url){
 const loaded=c.once("Page.loadEventFired");
 await c.send("Page.navigate",{url});
 await loaded;await sleep(200);
}
const state="(()=>{"+
"const $=q=>document.querySelector(q),d=$('.intelligence-drawer'),b=$('.intelligence-trigger');"+
"const bg=b?getComputedStyle(b).backgroundColor:null,style=d?getComputedStyle(d).backgroundColor:null;"+
"const r=d?.getBoundingClientRect(),logo=$('.intelligence-trigger img');"+
"return {locale:document.documentElement.lang,theme:document.documentElement.dataset.theme,"+
"open:!!d&&!d.hidden,optIn:$('.intelligence-observation-label input')?.checked,"+
"hasControls:!!$('[data-locale-toggle]')&&!!$('[data-theme-toggle]'),"+
"duplicates:document.querySelectorAll('.intelligence-layer [data-locale-toggle],.intelligence-layer [data-theme-toggle]').length,"+
"prompt:$('.intelligence-dynamic-intent')?.innerText||'',stream:$('.intelligence-stream')?.innerText||'',"+
"label:b?.getAttribute('aria-label'),background:bg,color:style,"+
"logoLoaded:logo?.complete&&logo?.naturalWidth>0,"+
"x:r?.left,right:r?.right,top:r?.top,bottom:r?.bottom,"+
"vw:innerWidth,vh:innerHeight,docWidth:document.documentElement.scrollWidth};})()";
async function run(){
 await fs.mkdir(out,{recursive:true});
 let server,browser,cdp;
 const report={createdAt:new Date().toISOString(),checks:[],shots:[],errors:[],status:"PENDING"};
 try{
  for(const p of pages)expect(existsSync(path.join(root,"preview",p,"index.html")),p+"_not_found");
  server=await startServer();browser=await startChrome();
  report.browser=browser.browser;
  cdp=new CDP(browser.page.webSocketDebuggerUrl);await cdp.open();
  await cdp.send("Page.enable");await cdp.send("Runtime.enable");
  cdp.ws.addEventListener("message",e=>{
   const m=JSON.parse(e.data);
   if(m.method==="Runtime.exceptionThrown")report.errors.push(m.params.exceptionDetails?.text||"runtime_exception");
  });
  for(const p of pages)for(const [view,w,h] of size){
   await cdp.send("Emulation.setDeviceMetricsOverride",
    {width:w,height:h,deviceScaleFactor:1,mobile:w<768,screenWidth:w,screenHeight:h});
   await navigate(cdp,"http://127.0.0.1:"+server.port+"/preview/"+p+"/");
   const start=await js(cdp,state);
   expect(start.logoLoaded&&start.background==="rgba(0, 0, 0, 0)",p+"_"+view+"_transparent_logo");
   expect(!start.optIn&&start.hasControls&&start.duplicates===0,p+"_"+view+"_shared_controls");
   await js(cdp,"(()=>{"+
    "document.querySelector('.intelligence-trigger').click();"+
    "document.querySelector('#intelligence-question').value='Texto original do profissional';"+
    "document.querySelector('.intelligence-demo-mode select').value='ASK';"+
    "document.querySelector('.intelligence-composer').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));"+
    "})()");
   const pt=await js(cdp,state);
   expect(pt.open&&pt.prompt.includes("Qual informação técnica")&&
    pt.stream.includes("Texto original do profissional"),p+"_"+view+"_pt");
   expect(pt.x>=-1&&pt.right<=w+1&&pt.top>=-1&&pt.bottom<=h+1&&pt.docWidth<=w+2,
    p+"_"+view+"_bounds");
   const img1=await cdp.send("Page.captureScreenshot",{format:"png"});
   const f1=p+"-"+view+"-dark-pt.png";await fs.writeFile(path.join(out,f1),Buffer.from(img1.data,"base64"));report.shots.push(f1);
   await js(cdp,"(()=>{document.querySelector('[data-theme-toggle]').click();document.querySelector('[data-locale-toggle]').click()})()");
   const en=await js(cdp,state);
   expect(en.theme==="light"&&en.locale.startsWith("en")&&en.open,p+"_"+view+"_host_theme_locale");
   expect(en.prompt.includes("Which technical detail")&&en.stream.includes("Texto original do profissional"),p+"_"+view+"_en");
   expect(en.label==="Open EVOLU Intelligence"&&en.color!==pt.color&&
    en.background==="rgba(0, 0, 0, 0)",p+"_"+view+"_theme_logo");
   const img2=await cdp.send("Page.captureScreenshot",{format:"png"});
   const f2=p+"-"+view+"-light-en.png";await fs.writeFile(path.join(out,f2),Buffer.from(img2.data,"base64"));report.shots.push(f2);
   await js(cdp,"document.querySelector('[data-locale-toggle]').click()");
   const back=await js(cdp,state);
   expect(back.label==="Abrir EVOLU Intelligence"&&back.prompt.includes("Qual informação técnica"),p+"_"+view+"_roundtrip");
   await js(cdp,"document.querySelector('.intelligence-observation-label input').click()");
   const opt=await js(cdp,state);expect(opt.optIn===true,p+"_"+view+"_opt_in");
   // A semantic signal is recognized only in the allowed page scope,
   // and only with explicit opt-in and without leaking field values.
   await js(cdp,"document.querySelector('.intelligence-trigger').click()");
   const inactive=await js(cdp,state);expect(!inactive.open,p+"_"+view+"_drawer_closed");
   await js(cdp,"(()=>{const root=document.querySelector('.ux-app');const pageId=root.dataset.intelligencePageId;"+
    "const emit=d=>document.dispatchEvent(new CustomEvent('evolu:activity-signal',{detail:d}));"+
    "emit({kind:'REPEATED_ATTEMPT',pageId,value:'PRIVATE FIELD CONTENT'});"+
    "emit({kind:'REPEATED_ATTEMPT',pageId:'another.page'});"+
    "emit({kind:'UNKNOWN',pageId});})()");
   const ignored=await js(cdp,state);expect(!ignored.invitation,p+"_"+view+"_reject_unknown_and_private_signal");
   await js(cdp,"(()=>{const pageId=document.querySelector('.ux-app').dataset.intelligencePageId;"+
    "for(let i=0;i<3;i++)document.dispatchEvent(new CustomEvent('evolu:activity-signal',"+
    "{detail:{kind:'REPEATED_ATTEMPT',pageId}}));})()");
   const invited=await js(cdp,state);
   expect(invited.invitation,p+"_"+view+"_allowlisted_contextual_invitation");
   await js(cdp,"document.querySelector('.intelligence-invitation .ux-btn:not(.ux-btn-primary)').click()");
   const dismissed=await js(cdp,state);expect(!dismissed.invitation,p+"_"+view+"_invitation_dismissed");
   await js(cdp,"(()=>{const pageId=document.querySelector('.ux-app').dataset.intelligencePageId;"+
    "for(let i=0;i<3;i++)document.dispatchEvent(new CustomEvent('evolu:activity-signal',"+
    "{detail:{kind:'REPEATED_ATTEMPT',pageId}}));})()");
   const silent=await js(cdp,state);
   expect(!silent.invitation,p+"_"+view+"_dismissal_cooldown");


   await js(cdp,"document.querySelector('.intelligence-observation-label input').click()");
   const off=await js(cdp,state);expect(off.optIn===false,p+"_"+view+"_opt_out");
   report.checks.push({page:p,viewport:view,result:"PASS",ptDark:pt.color,enLight:en.color,semanticSignal:true});
  }
  expect(report.errors.length===0,"browser_runtime_exceptions");
  report.status="PASS";
 }catch(e){report.status="FAIL";report.error=String(e.stack||e);process.exitCode=1}
 finally{
  await fs.writeFile(path.join(out,"report.json"),JSON.stringify(report,null,2));
  await fs.writeFile(path.join(out,"SUMMARY.md"),
   "# EVOLU Intelligence browser gate\n\n"+report.status+"\n\n"+
   report.checks.map(x=>"- "+x.page+" / "+x.viewport+" "+x.result).join("\n")+
   "\n\nSynthetic UX only; production colors and nine-screen layout still require human review.\n"+
   (report.error?"\n"+report.error+"\n":""));
  cdp?.close();server?.server.close();browser?.proc.kill("SIGTERM");
  if(browser?.profile)await fs.rm(browser.profile,{recursive:true,force:true,maxRetries:3,retryDelay:100}).catch(()=>{});
  console.log("INTELLIGENCE_BROWSER_GATE="+report.status);
  if(report.error)console.error(report.error);
 }
}
await run();
