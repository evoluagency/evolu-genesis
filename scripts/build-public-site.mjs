#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {checkInputs, PublicSiteGateError, verifyArtifact} from './public-site-lib.mjs';

const args = process.argv.slice(2);
const val = key => { const n=args.indexOf(key); return n < 0 ? null : args[n+1]; };
const root = path.resolve(val('--root') ?? process.cwd());
const target = path.resolve(root, val('--out') ?? '.evolu-public-dist');
const shouldBuild = args.includes('--build');
try {
  if (target !== path.join(root,'.evolu-public-dist')) throw new PublicSiteGateError('OUTPUT_DIRECTORY_MUST_BE_FIXED');
  const {files} = checkInputs(root);
  if (shouldBuild) {
    // Don't delete existing build output or unexpected files; explicitly require a clean build workspace.
    if (fs.existsSync(target) || (() => { try { fs.lstatSync(target); return true; } catch(e) { if(e.code === 'ENOENT') return false; throw e; } })()) throw new PublicSiteGateError('OUTPUT_DIRECTORY_ALREADY_EXISTS');
    const temp=fs.mkdtempSync(path.join(root,'.evolu-site-build-'));
    let renamed=false;
    try {
      for (const relative of files) {
        const to=path.join(temp,relative);
        fs.mkdirSync(path.dirname(to),{recursive:true});
        fs.copyFileSync(path.join(root,relative),to,fs.constants.COPYFILE_EXCL);
      }
      // The exact artifact must be validated before becoming the deployable output.
      verifyArtifact(root,temp);
      fs.renameSync(temp,target);renamed=true;
    } finally { if(!renamed) fs.rmSync(temp,{recursive:true,force:true}); }
  }
  console.log(JSON.stringify({status:shouldBuild?'PUBLIC_BUILD_READY':'PUBLIC_INPUT_CHECK_PASSED',fileCount:files.length,output:target}));
} catch(error) {
  console.error(JSON.stringify({status:'BLOCKED',code:error.code??'UNEXPECTED_FAILURE',message:error.message}));
  process.exitCode=2;
}
