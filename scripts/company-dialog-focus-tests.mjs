/**
 * Local production-function tests with focus/event fixtures.
 * Not browser interaction, native zoom evidence or human HR-06 acceptance.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const file=new URL('../preview/company-access-home/app.js',import.meta.url);
const source=readFileSync(file,'utf8');
const ast=ts.createSourceFile(file.pathname,source,ts.ScriptTarget.ES2022,true,ts.ScriptKind.JS);
const functions=new Map();let stateDeclaration,keyboard;
function visit(node){
 if(ts.isFunctionDeclaration(node)&&node.name)functions.set(node.name.text,node);
 if(ts.isVariableStatement(node)&&node.declarationList.declarations.some(d=>d.name.getText(ast)==='openDialog'))stateDeclaration=node;
 if(ts.isCallExpression(node)&&node.expression.getText(ast)==='document.addEventListener'&&
    node.arguments[0]?.text==='keydown')keyboard=node.arguments[1];
 ts.forEachChild(node,visit);
}
visit(ast);
for(const name of ['openModal','closeModal','addEntry'])assert.ok(functions.has(name),name);
assert.ok(stateDeclaration&&keyboard,'actual dialog state and keyboard handler');
const actual=stateDeclaration.getText(ast)+'\n'+
 ['openModal','closeModal','addEntry'].map(n=>functions.get(n).getText(ast)).join('\n')+
 '\nglobalThis.dialogTest={openModal,closeModal,addEntry,keydown:'+keyboard.getText(ast)+'};';
function fixture({readOnly=false,openerConnected=true}={}){
 let document,focusables,renderCount=0;
 class Element {
  constructor(id){this.id=id;this.hidden=false;this.disabled=false;this.isConnected=true;this.tabIndex=0;this.value='';this.innerHTML='';this.textContent='';}
  focus(){document.activeElement=this;}
  getClientRects(){return this.hidden||this.disabled||!this.isConnected?[]:[{}];}
  contains(node){return node===this||(this.id==='modalBack'&&focusables.includes(node));}
  querySelector(){return focusables.find(n=>!n.hidden&&!n.disabled)||null;}
  querySelectorAll(){return focusables.filter(n=>!n.hidden&&!n.disabled);}
 }
 const ids=['modalBack','modalTitle','modalDesc','modalFields','modalSubmit','modalCancel','modalForm',
  'entryName','entryAmount','entryRef','docKind','brandSidebarToggle'];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
 nodes.modalBack.hidden=true;nodes.modalForm.reset=()=>{};
 nodes.entryName.value='Synthetic receipt';nodes.docKind.value='typeInvoice';nodes.entryAmount.value='10';
 focusables=[nodes.entryName,nodes.entryAmount,nodes.entryRef,nodes.modalCancel,nodes.modalSubmit];
 Object.defineProperty(nodes.modalFields,'innerHTML',{set(html){
  const ids=[...html.matchAll(/<(?:input|textarea|select)\b[^>]*\bid="([^"]+)"/g)].map(m=>m[1]);
  focusables=[...ids.map(id=>nodes[id]),nodes.modalCancel,nodes.modalSubmit];
 }});
 const opener=new Element('synthetic-opener');opener.isConnected=openerConnected;
 document={activeElement:opener,getElementById:id=>nodes[id]||null};
 const context={document,HTMLElement:Element,readOnly,$:id=>nodes[id],t:x=>x,
  sources:()=>'',reqs:[],records:[],documents:[],notify:()=>{},
  content(){renderCount++;opener.isConnected=false;},
  clearTimeout,Number};
 vm.runInNewContext(actual,context,{timeout:1000});
 const api=context.dialogTest;
 const key=(name,shiftKey=false)=>{
  const event={key:name,shiftKey,prevented:false,preventDefault(){this.prevented=true;}};
  api.keydown(event);return event;
 };
 return {api,document,nodes,opener,key,getRenderCount:()=>renderCount};
}
test('closing an opened Company dialog returns focus to its connected opener',()=>{
 const f=fixture();f.api.openModal('expense');
 assert.equal(f.document.activeElement,f.nodes.entryName);
 f.api.closeModal();assert.equal(f.nodes.modalBack.hidden,true);
 assert.equal(f.document.activeElement,f.opener);
});
test('Escape closes the dialog, prevents the background action and returns focus',()=>{
 const f=fixture();f.api.openModal('document');const event=f.key('Escape');
 assert.equal(f.nodes.modalBack.hidden,true);assert.equal(f.document.activeElement,f.opener);
 assert.equal(event.prevented,true);
});
test('Tab at the last dialog control wraps to the first',()=>{
 const f=fixture();f.api.openModal('expense');f.nodes.modalSubmit.focus();
 const event=f.key('Tab');assert.equal(f.document.activeElement,f.nodes.entryName);assert.equal(event.prevented,true);
});
test('Shift+Tab at the first dialog control wraps to the last',()=>{
 const f=fixture();f.api.openModal('expense');
 const event=f.key('Tab',true);assert.equal(f.document.activeElement,f.nodes.modalSubmit);assert.equal(event.prevented,true);
});
test('hidden submit in the source dialog is excluded from the focus boundary',()=>{
 const f=fixture();f.api.openModal('source');f.nodes.modalCancel.focus();
 const event=f.key('Tab');assert.equal(f.document.activeElement,f.nodes.modalCancel);assert.equal(event.prevented,true);
});
test('a Tab arriving from outside an open modal cannot remain in background content',()=>{
 const f=fixture();f.api.openModal('expense');f.opener.focus();
 const event=f.key('Tab');assert.equal(f.document.activeElement,f.nodes.entryName);assert.equal(event.prevented,true);
});
test('removed opener falls back to a connected stable navigation control',()=>{
 const f=fixture();f.api.openModal('expense');f.opener.isConnected=false;f.api.closeModal();
 assert.equal(f.document.activeElement,f.nodes.brandSidebarToggle);
});
test('saving updates content before returning focus, without targeting a removed opener',()=>{
 const f=fixture();f.api.openModal('document');f.api.addEntry({preventDefault(){}});
 assert.equal(f.getRenderCount(),1);assert.equal(f.nodes.modalBack.hidden,true);
 assert.equal(f.document.activeElement,f.nodes.brandSidebarToggle);
});
test('read-only mode cannot open a mutation dialog or steal focus',()=>{
 const f=fixture({readOnly:true});f.api.openModal('expense');
 assert.equal(f.nodes.modalBack.hidden,true);assert.equal(f.document.activeElement,f.opener);
});
test('Escape outside a closed dialog leaves the current focus alone',()=>{
 const f=fixture();const event=f.key('Escape');
 assert.equal(f.document.activeElement,f.opener);assert.equal(event.prevented,false);
});
