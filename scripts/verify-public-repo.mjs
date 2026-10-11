#!/usr/bin/env node
/** Verify GitHub-tracked paths do not publish private material from PUBLIC Genesis repo.
 * Does not attempt to detect secrets in arbitrary files; use secret-scanning too.
 */
import {spawnSync} from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const response = spawnSync('git',['ls-files','-z','--cached'],{cwd:root,encoding:'buffer',maxBuffer:4*1024*1024});
if (response.status !== 0 || !response.stdout || response.error) {
  console.error(JSON.stringify({status:'BLOCKED',code:'GIT_INDEX_REQUIRED',detail:'Must run in checked-out repository with Git index.'}));
  process.exit(2);
}
const paths = response.stdout.toString('utf8').split('\0').filter(Boolean).map(s=>s.replaceAll('\\','/'));
const forbidden = paths.filter(name=>{
  const lower=name.toLowerCase();
  const base=path.posix.basename(lower);
  return (
    lower==='private-ux' || lower.startsWith('private-ux/') ||
    lower==='.evolu-public-dist' || lower.startsWith('.evolu-public-dist/') ||
    lower.startsWith('.evolu-site-build-') ||
    lower==='node_modules' || lower.startsWith('node_modules/') ||
    base==='.env' || base.startsWith('.env.') ||
    /\.(?:pem|p12|pfx|key|tsbuildinfo)$/i.test(base)
  );
});
if (forbidden.length){
  console.error(JSON.stringify({status:'BLOCKED',code:'FORBIDDEN_PUBLIC_GIT_PATHS',paths:forbidden}));
  process.exit(2);
}
console.log(JSON.stringify({status:'PUBLIC_REPO_PATHS_VERIFIED',trackedPaths:paths.length}));
