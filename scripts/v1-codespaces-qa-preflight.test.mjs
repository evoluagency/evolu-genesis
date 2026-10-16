import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync,
  appendFileSync, unlinkSync, existsSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

// Native tests of the actual, committed Bash runner with synthetic Git state.
// NO dependency installation, provider credentials, network, model, or deploy.
const scriptsDir=dirname(fileURLToPath(import.meta.url));
const runner=join(scriptsDir,'v1-codespaces-qa.sh');
const repoRoot=dirname(scriptsDir);
const name=JSON.parse(readFileSync(join(repoRoot,'package.json'),'utf8')).name;
const branches={
  '@evolu/platform-ux-contracts':'docs/intelligence-ui-unification-plan-v1',
  '@evolu/intelligence':'docs/genesis-consultative-handoff-v1',
};
const expectedBranch=branches[name];
assert.ok(expectedBranch,'Unexpected project: '+name);
const sensitive=[
  'OPENAI_API_KEY','AI_GATEWAY_API_KEY','GROQ_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY','VERCEL_OIDC_TOKEN',
];
function exec(cmd,args,cwd,env=process.env){
  const result=spawnSync(cmd,args,{cwd,env,encoding:'utf8',timeout:10000});
  if(result.error) throw result.error;
  return result;
}
function fixture(body){
  const cwd=mkdtempSync(join(tmpdir(),'evolu-codespaces-qa-'));
  try {
    mkdirSync(join(cwd,'scripts'));
    copyFileSync(runner,join(cwd,'scripts/v1-codespaces-qa.sh'));
    writeFileSync(join(cwd,'package-lock.json'),'{"lockfileVersion":3}\n');
    let result=exec('git',['init','-q','-b',expectedBranch],cwd);
    assert.equal(result.status,0,result.stderr);
    result=exec('git',['add','scripts/v1-codespaces-qa.sh','package-lock.json'],cwd);
    assert.equal(result.status,0,result.stderr);
    result=exec('git',[
      '-c','user.name=EVOLU Synthetic QA',
      '-c','user.email=qa@example.invalid',
      '-c','commit.gpgsign=false','commit','-q','-m','Synthetic source fixture'
    ],cwd);
    assert.equal(result.status,0,result.stderr);
    const env={...process.env,GITHUB_ACTIONS:''};
    for(const key of sensitive) delete env[key];
    const run=(args=['--dry-run'],change={})=>
      exec('bash',['scripts/v1-codespaces-qa.sh',...args],cwd,{...env,...change});
    body({cwd,run});
  } finally {
    rmSync(cwd,{recursive:true,force:true});
  }
}
test('actual Codespaces Bash runner has valid syntax',()=>{
  const r=exec('bash',['-n',runner],repoRoot);
  assert.equal(r.status,0,r.stderr);
});
test('synthetic correct-branch dry-run succeeds without install or compile',()=>fixture(({cwd,run})=>{
  const r=run();
  assert.equal(r.status,0,r.stderr);
  assert.match(r.stdout,/DRY RUN ONLY/);
  assert.equal(existsSync(join(cwd,'node_modules')),false);
  assert.doesNotMatch(r.stdout,/source QA passed/);
}));
test('wrong branch is rejected with exit 2',()=>fixture(({cwd,run})=>{
  const checkout=exec('git',['checkout','-q','-b','synthetic-wrong-branch'],cwd);
  assert.equal(checkout.status,0,checkout.stderr);
  const r=run();
  assert.equal(r.status,2);
  assert.match(r.stderr,/Wrong branch/);
}));
test('modified tracked files are rejected before QA',()=>fixture(({cwd,run})=>{
  appendFileSync(join(cwd,'scripts/v1-codespaces-qa.sh'),'\n# synthetic modification\n');
  const r=run();
  assert.equal(r.status,2);
  assert.match(r.stderr,/Tracked source changes present/);
}));
test('live credential indicators are rejected without printing their values',()=>fixture(({run})=>{
  for(const key of sensitive){
    const r=run(['--dry-run'],{[key]:'SYNTHETIC_PRIVATE_CANARY'});
    assert.equal(r.status,2,key);
    assert.doesNotMatch(r.stdout+r.stderr,/SYNTHETIC_PRIVATE_CANARY/);
  }
}));
test('GitHub Actions is rejected before installing dependencies',()=>fixture(({run})=>{
  const r=run(['--dry-run'],{GITHUB_ACTIONS:'true'});
  assert.equal(r.status,2);
  assert.match(r.stderr,/GitHub Actions/);
}));
test('missing lockfile is rejected without npm ci',()=>fixture(({cwd,run})=>{
  unlinkSync(join(cwd,'package-lock.json'));
  const r=run();
  assert.equal(r.status,2);
  assert.match(r.stderr,/lockfile|package-lock\.json/);
}));
test('unsupported argument never triggers QA',()=>fixture(({run})=>{
  const r=run(['--unsupported']);
  assert.equal(r.status,2);
  assert.match(r.stderr,/Usage:/);
}));
