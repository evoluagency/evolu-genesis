#!/usr/bin/env node
import path from 'node:path';
import {verifyArtifact} from './public-site-lib.mjs';
const args=process.argv.slice(2);
const arg = key => { const n=args.indexOf(key); return n<0?null:args[n+1]; };
const root=path.resolve(arg('--root')??process.cwd());
const dist=path.resolve(root,arg('--dist')??'.evolu-public-dist');
try { if(dist!==path.join(root,'.evolu-public-dist')) throw Object.assign(new Error('dist must be fixed'),{code:'INVALID_DIST_PATH'});
 console.log(JSON.stringify(verifyArtifact(root,dist)));
} catch(e) {console.error(JSON.stringify({status:'BLOCKED',code:e.code??'UNEXPECTED_FAILURE',message:e.message}));process.exitCode=2;}
