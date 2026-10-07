import { readFile, readdir, lstat, realpath } from 'node:fs/promises';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isInside = (root, path) => {
  const rel = relative(root, path);
  return rel !== '..' && !rel.startsWith(`..${sep}`) && !rel.startsWith(sep);
};

export async function validatePlugin(inputRoot) {
  const root = await realpath(inputRoot);
  const errors = [];
  const fail = message => errors.push(message);
  let manifest;
  try { manifest = JSON.parse(await readFile(resolve(root, 'plugin.json'), 'utf8')); }
  catch (error) { return [`Cannot read plugin.json: ${error.message}`]; }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return ['plugin.json must be an object'];
  for (const key of Object.keys(manifest)) {
    if (!['$schema', 'name', 'description'].includes(key)) fail(`Unsupported manifest property: ${key}`);
  }
  if (typeof manifest.name !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(manifest.name)) fail('Invalid plugin name');
  if (manifest.description !== undefined && typeof manifest.description !== 'string') fail('Invalid plugin description');
  if (manifest.$schema !== undefined && manifest.$schema !== 'https://antigravity.google/schemas/v1/plugin.json') fail('Unexpected plugin schema URL');

  const walk = async dir => {
    const files = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = resolve(dir, entry.name);
      if (entry.isSymbolicLink()) { fail(`Symlinks are not allowed in plugin components: ${relative(root, path)}`); continue; }
      if (entry.isDirectory()) files.push(...await walk(path));
      else files.push(path);
    }
    return files;
  };
  const frontmatter = async file => {
    const text = await readFile(file, 'utf8');
    const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
    if (!match) { fail(`Missing frontmatter: ${relative(root, file)}`); return {}; }
    const doc = parseDocument(match[1]);
    if (doc.errors.length) { fail(`Invalid YAML in ${relative(root, file)}: ${doc.errors[0].message}`); return {}; }
    const data = doc.toJS();
    if (!data || typeof data !== 'object' || Array.isArray(data)) { fail(`Frontmatter must be a mapping: ${relative(root, file)}`); return {}; }
    if (!text.slice(match[0].length).trim()) fail(`Empty component instructions: ${relative(root, file)}`);
    return data;
  };
  const requiredText = (data, key, file) => {
    if (typeof data[key] !== 'string' || !data[key].trim()) fail(`Missing ${key}: ${relative(root, file)}`);
  };
  const componentFiles = [];
  for (const folder of ['skills', 'agents', 'rules']) {
    const dir = resolve(root, folder);
    try {
      if (!(await lstat(dir)).isDirectory()) { fail(`${folder} must be a directory`); continue; }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      continue;
    }
    const files = await walk(dir);
    componentFiles.push(...files);
    if (folder === 'skills') {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) { fail(`Skills must be directory bundles: ${entry.name}`); continue; }
        const file = resolve(dir, entry.name, 'SKILL.md');
        try {
          const data = await frontmatter(file);
          requiredText(data, 'description', file);
          if (data.name !== undefined && data.name !== entry.name) fail(`Skill name does not match folder: ${entry.name}`);
        } catch (error) { fail(`Missing skill instructions: ${entry.name}/SKILL.md (${error.code})`); }
      }
    }
    if (folder === 'agents') {
      for (const file of files.filter(file => file.endsWith('.md'))) {
        const data = await frontmatter(file);
        requiredText(data, 'name', file);
        requiredText(data, 'description', file);
        if (data.tools !== undefined && (!Array.isArray(data.tools) || data.tools.some(tool => !['view_file', 'grep_search', 'run_command'].includes(tool)))) fail(`Unverified agent tool name: ${relative(root, file)}`);
        if (data.model !== undefined && !['inherit', 'flash', 'pro'].includes(data.model)) fail(`Unsupported agent model: ${relative(root, file)}`);
        if (data.commandExecutionPolicy !== undefined && data.commandExecutionPolicy !== 'sandbox') fail(`Agent must retain sandbox policy: ${relative(root, file)}`);
        for (const key of ['mainAgent', 'subagent']) if (data[key] !== undefined && typeof data[key] !== 'boolean') fail(`Invalid ${key}: ${relative(root, file)}`);
        if (data.skills !== undefined) {
          if (!Array.isArray(data.skills)) fail(`Agent skills must be an array: ${relative(root, file)}`);
          else for (const path of data.skills) {
            if (typeof path !== 'string') { fail(`Invalid agent skill path: ${relative(root, file)}`); continue; }
            const target = resolve(root, path);
            if (!isInside(root, target)) { fail(`Agent skill escapes package: ${path}`); continue; }
            try { await readFile(resolve(target, 'SKILL.md')); }
            catch { fail(`Missing agent skill: ${path}`); }
          }
        }
      }
    }
    if (folder === 'rules') {
      for (const file of files.filter(file => file.endsWith('.md'))) {
        if (dirname(file) !== dir) fail(`Rule would not be discovered at nested path: ${relative(root, file)}`);
        const data = await frontmatter(file);
        if (!['always_on', 'model_decision', 'glob', 'manual'].includes(data.trigger)) fail(`Invalid rule trigger: ${relative(root, file)}`);
        if (data.trigger === 'model_decision') requiredText(data, 'description', file);
        if (data.trigger === 'glob' && !(data.globs || data.glob)) fail(`Missing rule glob: ${relative(root, file)}`);
      }
    }
  }
  if (!componentFiles.some(file => file.endsWith('SKILL.md'))) fail('CodeRabbit package must include at least one skill');
  for (const file of componentFiles.filter(file => file.endsWith('.md'))) {
    const text = await readFile(file, 'utf8');
    if (text.includes('\u2014')) fail(`Em dash in ${relative(root, file)}`);
    for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const link = match[1].split('#')[0];
      if (!link || /^[a-z]+:/i.test(link)) continue;
      const target = resolve(dirname(file), decodeURIComponent(link));
      if (!isInside(root, target)) { fail(`Reference escapes package: ${relative(root, file)} -> ${link}`); continue; }
      try {
        const actual = await realpath(target);
        if (!isInside(root, actual)) fail(`Reference resolves outside package: ${link}`);
      } catch { fail(`Broken local reference: ${relative(root, file)} -> ${link}`); }
    }
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = await validatePlugin(process.argv[2] || defaultRoot);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log('Plugin manifest, skills, agents, rules, and local references are valid. Runtime loading still requires Antigravity.');
}
