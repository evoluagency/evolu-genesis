import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require=createRequire(import.meta.url),ts=require("typescript");
const source=readFileSync(new URL("../src/features/company/CnpjIdentityView.ts",import.meta.url),"utf8");
const out=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
assert.equal((out.diagnostics||[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
const mod={exports:{}};
new Function("module","exports",out.outputText)(mod,mod.exports);
const {renderCnpjIdentity}=mod.exports;
class Element {
 constructor(tag,doc){this.tag=tag;this.ownerDocument=doc;this.children=[];this.attrs={};this.text="";}
 set textContent(value){this.text=String(value);this.children=[];}
 get textContent(){return this.text+this.children.map(x=>x.textContent).join("");}
 set innerHTML(_value){throw new Error("HTML interpolation forbidden");}
 setAttribute(key,value){this.attrs[key]=value;}
 append(...items){this.children.push(...items);}
 appendChild(item){this.append(item);}
 replaceChildren(...items){this.text="";this.children=[...items];}
}
const doc={createElement(tag){return new Element(tag,doc);}};
const host=()=>new Element("host",doc);
const item={cnpjId:"fixture-establishment",cnpj:"00000000000000",legalName:"Estabelecimento sintético",state:"SP"};
test("shared Company identity preserves name, formatted CNPJ and UF",()=>{
 const h=host();renderCnpjIdentity(h,item);
 assert.equal(h.children[0].attrs["data-genesis-company-identity"],"1.0.0");
 assert.equal(h.children[0].attrs["aria-label"],"Estabelecimento");
 assert.equal(h.textContent,"Estabelecimento sintéticoEstabelecimento · 00.000.000/0000-00 · SP");
});
test("English labels use the host locale without changing facts",()=>{
 const h=host();renderCnpjIdentity(h,item,"en");
 assert.equal(h.children[0].attrs["aria-label"],"Establishment");
 assert.match(h.textContent,/Establishment · 00.000.000\/0000-00 · SP/);
});
test("missing UF is unavailable, never a default state",()=>{
 const h=host();renderCnpjIdentity(h,{...item,state:undefined});assert.match(h.textContent,/· —$/);
});
test("alphanumeric CNPJ is preserved as supplied",()=>{
 const h=host();renderCnpjIdentity(h,{...item,cnpj:"AB123456000100"});
 assert.match(h.textContent,/AB123456000100/);
});
test("source text uses DOM text nodes, never HTML interpolation",()=>{
 const h=host();renderCnpjIdentity(h,{...item,legalName:'<img src=x onerror="private()">'});assert.ok(h.textContent.includes("<img"));
 assert.deepEqual(h.children[0].children.map(n=>n.tag),["b","small"]);
});
test("unavailable replaces previous identity",()=>{
 const h=host();renderCnpjIdentity(h,item);renderCnpjIdentity(h,null);
 assert.doesNotMatch(h.textContent,/sintético/);assert.match(h.textContent,/indisponíveis/);
 assert.equal(h.children[0].attrs.role,"status");
});
test("repeated rendering replaces the row rather than duplicating it",()=>{
 const h=host();renderCnpjIdentity(h,item);renderCnpjIdentity(h,{...item,legalName:"Outra"});
 assert.equal(h.children.length,1);assert.doesNotMatch(h.textContent,/sintético/);
});
for(const [field,value] of [["cnpjId",""],["cnpj","bad"],["legalName",""],["state","INVALID"],["establishmentType","owner"]]){
 test("invalid "+field+" clears stale identity before rejection",()=>{
  const h=host();renderCnpjIdentity(h,item);
  assert.throws(()=>renderCnpjIdentity(h,{...item,[field]:value}),/CNPJ_IDENTITY_UNAVAILABLE/);
  assert.equal(h.textContent,"");
 });
}
test("tracked preview runtime matches the shared TypeScript source",()=>{
 const emitted=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
 assert.equal(readFileSync(new URL("../preview/runtime/features/company/CnpjIdentityView.js",import.meta.url),"utf8"),emitted);
});
test("Company information uses the shared row and scoped styles",()=>{
 const app=readFileSync(new URL("../preview/company-access-home/app.js",import.meta.url),"utf8");
 const html=readFileSync(new URL("../preview/company-access-home/index.html",import.meta.url),"utf8");
 assert.match(app,/renderCnpjIdentity,/);
 assert.ok(app.includes('renderCnpjIdentity(identityHost,activeCnpjSummary(),lang,{company:workspaceContext.company,kind:"company"})'));
 assert.match(html,/shared-ux\/company-identity\.css/);
});

const company={tenantId:"fixture-tenant",companyId:"fixture-company",legalName:"Empresa sintética",tradeName:"Nome de apresentação"};
test("group context uses the same identity row, preserving the establishment",()=>{
 const h=host();renderCnpjIdentity(h,item,"pt",{company,kind:"group"});
 assert.equal(h.children.length,1);
 assert.equal(h.children[0].children[0].attrs["data-genesis-company-context"],"group");
 assert.match(h.textContent,/Grupo empresarial · Nome de apresentação/);
 assert.match(h.textContent,/Estabelecimento sintéticoEstabelecimento · 00.000.000/);
});
test("Company context keeps company semantics and host English locale",()=>{
 const h=host();renderCnpjIdentity(h,item,"en",{company,kind:"company"});
 assert.match(h.textContent,/Company · Nome de apresentação/);
 assert.doesNotMatch(h.textContent,/Business group/);
});
test("existing Company name presentation is shared with the header",()=>{
 assert.equal(mod.exports.companyIdentityName(company),"Nome de apresentação");
 assert.equal(mod.exports.companyIdentityName({...company,tradeName:undefined}),"Empresa sintética");
});
test("unsupported context kind clears the previous view",()=>{
 const h=host();renderCnpjIdentity(h,item);
 assert.throws(()=>renderCnpjIdentity(h,item,"pt",{company,kind:"tenant"}),/COMPANY_IDENTITY_UNAVAILABLE/);
 assert.equal(h.textContent,"");
});
test("unavailable establishment does not reveal an unrelated company",()=>{
 const h=host();renderCnpjIdentity(h,null,"pt",{company,kind:"group"});
 assert.doesNotMatch(h.textContent,/Empresa sintética|Nome de apresentação/);
});
for(const [key,value] of [["companyId",""],["tenantId",""],["legalName",""],["tradeName",123]]){
 test("invalid context "+key+" is unavailable without stale output",()=>{
  const h=host();renderCnpjIdentity(h,item,"pt",{company,kind:"group"});
  assert.throws(()=>renderCnpjIdentity(h,item,"pt",{company:{...company,[key]:value},kind:"group"}),/COMPANY_IDENTITY_UNAVAILABLE/);
  assert.equal(h.textContent,"");
 });
}
test("context names remain text instead of markup",()=>{
 const h=host();renderCnpjIdentity(h,item,"pt",{company:{...company,tradeName:undefined,legalName:"<img src=x>"},kind:"group"});
 assert.match(h.textContent,/<img src=x>/);
 assert.deepEqual(h.children[0].children.map(x=>x.tag),["small","b","small"]);
});
