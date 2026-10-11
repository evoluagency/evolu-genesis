import fs from 'node:fs';
import path from 'node:path';

const SAFE_SUFFIXES = new Set(['.html', '.js', '.css', '.svg', '.png', '.webp', '.ico', '.woff2']);
const FORBIDDEN_NAMES = /(EvoluSameOriginGatewayTransport|EvoluPlatformV1Boundary|private-ux\/|sb_secret_|SUPABASE_SERVICE_ROLE_KEY)/i;
const FORBIDDEN_COMPONENTS = new Set(['private-ux', 'src', 'scripts', 'docs', '.github', 'node_modules', '.git', 'supabase']);
export class PublicSiteGateError extends Error {
  constructor(code, detail = '') { super(`${code}${detail ? `: ${detail}` : ''}`); this.name = 'PublicSiteGateError'; this.code = code; }
}

export function normalizeRelative(value) {
  if (typeof value !== 'string' || !value || value.includes('\\') || value.startsWith('/') || value.includes('\0'))
    throw new PublicSiteGateError('UNSAFE_MANIFEST_PATH', String(value));
  const segments = value.split('/');
  if (segments.some(s => !s || s === '.' || s === '..') || path.posix.normalize(value) !== value ||
      segments.some(s => FORBIDDEN_COMPONENTS.has(s)) || value.toLowerCase().includes('.env') ||
      (value !== '.nojekyll' && !SAFE_SUFFIXES.has(path.posix.extname(value))))
    throw new PublicSiteGateError('UNSAFE_MANIFEST_PATH', value);
  return value;
}

export function readManifest(root) {
  const file = path.join(root, 'public-files.json');
  if (!fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink()) throw new PublicSiteGateError('MANIFEST_NOT_FOUND');
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (m.schemaVersion !== '1.0.0' || m.outputDirectory !== '.evolu-public-dist' || !Array.isArray(m.files))
    throw new PublicSiteGateError('MANIFEST_SCHEMA_MISMATCH');
  const paths = m.files.map(normalizeRelative);
  if (!paths.includes('index.html') || paths.length === 0 || new Set(paths).size !== paths.length)
    throw new PublicSiteGateError('MANIFEST_DUPLICATE_OR_NO_ENTRYPOINT');
  return {m, files: paths};
}

export function safeFile(root, relative) {
  const filename = normalizeRelative(relative);
  let cursor = root;
  for (const part of filename.split('/')) {
    cursor = path.join(cursor, part);
    let stat;
    try { stat = fs.lstatSync(cursor); } catch { throw new PublicSiteGateError('MISSING_PUBLIC_ASSET', filename); }
    if (stat.isSymbolicLink()) throw new PublicSiteGateError('SYMLINK_BLOCKED', filename);
  }
  if (!fs.statSync(cursor).isFile()) throw new PublicSiteGateError('PUBLIC_ASSET_NOT_FILE', filename);
  if (fs.statSync(cursor).size > 2_000_000) throw new PublicSiteGateError('PUBLIC_ASSET_OVERSIZE', filename);
  if (['.html', '.js', '.css'].includes(path.extname(cursor))) {
    if (FORBIDDEN_NAMES.test(fs.readFileSync(cursor, 'utf8')))
      throw new PublicSiteGateError('PRIVATE_CODE_IN_PUBLIC_ASSET', filename);
  }
  return cursor;
}

export function checkInputs(root) {
  if (!fs.existsSync(root) || fs.lstatSync(root).isSymbolicLink() || !fs.statSync(root).isDirectory())
    throw new PublicSiteGateError('INVALID_CHECKOUT_ROOT');
  const {m, files} = readManifest(root);
  for (const file of files) safeFile(root, file);
  checkHtmlReferences(root, files);
  return {m, files};
}

function referencedLocalPath(htmlPath, url) {
  let ref = url.replaceAll('&amp;', '&').trim();
  if (!ref || /^(?:#|mailto:|tel:|data:|https?:|javascript:|blob:|\/\/)/i.test(ref)) return null;
  ref = ref.split(/[?#]/, 1)[0];
  if (!ref) return null;
  try { ref = decodeURIComponent(ref); } catch { throw new PublicSiteGateError('INVALID_ASSET_URL', `${htmlPath} -> ${url}`); }
  if (ref.includes('\\') || ref.includes('\0')) throw new PublicSiteGateError('INVALID_ASSET_URL', `${htmlPath} -> ${url}`);
  const absolute = ref.startsWith('/');
  const dest = path.posix.normalize(path.posix.join(absolute ? '' : path.posix.dirname(htmlPath), ref));
  if (dest === '..' || dest.startsWith('../')) throw new PublicSiteGateError('PUBLIC_LINK_ESCAPES_ROOT', `${htmlPath} -> ${url}`);
  return !dest || dest === '.' || ref.endsWith('/') || !path.posix.extname(dest) ?
    path.posix.join(dest === '.' ? '' : dest, 'index.html') : dest;
}

export function checkHtmlReferences(root, allowed) {
  const set = new Set(allowed);
  let checked = 0;
  for (const rel of allowed) {
    if (!rel.endsWith('.html')) continue;
    const html = fs.readFileSync(path.join(root, rel), 'utf8');
    for (const match of html.matchAll(/\b(?:href|src)\s*=\s*['"]([^'"]+)['"]/gi)) {
      const target = referencedLocalPath(rel, match[1]);
      if (target === null) continue;
      checked++;
      if (!set.has(target)) throw new PublicSiteGateError('MISSING_REFERENCED_PUBLIC_ASSET', `${rel} -> ${match[1]} (${target})`);
    }
  }
  return checked;
}

export function verifyArtifact(root, dist) {
  const {files} = checkInputs(root);
  if (!fs.existsSync(dist) || fs.lstatSync(dist).isSymbolicLink() || !fs.statSync(dist).isDirectory())
    throw new PublicSiteGateError('PUBLIC_ARTIFACT_MISSING');
  const expected = new Set(files);
  function visit(dir, prefix='') {
    for (const child of fs.readdirSync(dir, {withFileTypes:true})) {
      const rel = prefix ? `${prefix}/${child.name}` : child.name;
      if (child.isSymbolicLink()) throw new PublicSiteGateError('SYMLINK_IN_PUBLIC_ARTIFACT', rel);
      if (child.isDirectory()) {visit(path.join(dir,child.name), rel);continue;}
      if (!child.isFile() || !expected.delete(rel)) throw new PublicSiteGateError('UNLISTED_FILE_IN_PUBLIC_ARTIFACT', rel);
      if (!fs.readFileSync(path.join(root,rel)).equals(fs.readFileSync(path.join(dir,child.name))))
        throw new PublicSiteGateError('PUBLIC_ARTIFACT_CONTENT_DRIFT', rel);
    }
  }
  visit(dist);
  if (expected.size) throw new PublicSiteGateError('PUBLIC_ARTIFACT_MISSING_FILES', [...expected].join(','));
  return {status:'PUBLIC_ARTIFACT_VERIFIED',total:files.length,html:files.filter(x=>x.endsWith('.html')).length,privateExcluded:true};
}
