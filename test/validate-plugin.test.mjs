import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validatePlugin } from '../scripts/validate-plugin.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'antigravity-package-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'skills/review'), { recursive: true });
  await writeFile(join(root, 'plugin.json'), JSON.stringify({ name: 'coderabbit', description: 'Code review' }));
  await writeFile(join(root, 'skills/review/SKILL.md'), '---\nname: review\ndescription: Reviews code\n---\n\nRun a review.\n');
  return root;
}
test('accepts a minimal native plugin', async t => {
  assert.deepEqual(await validatePlugin(await fixture(t)), []);
});
test('rejects Cursor metadata in the Antigravity manifest', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'plugin.json'), JSON.stringify({ name: 'coderabbit', publisher: 'CodeRabbit' }));
  assert.ok((await validatePlugin(root)).some(error => error.includes('publisher')));
});
test('catches a rule that Antigravity would silently ignore', async t => {
  const root = await fixture(t);
  await mkdir(join(root, 'rules'));
  await writeFile(join(root, 'rules/review.md'), '---\ntrigger: modelDecision\ndescription: Review\n---\n\nRun a review.');
  assert.ok((await validatePlugin(root)).some(error => error.includes('Invalid rule trigger')));
});
test('catches duplicate YAML keys instead of accepting ambiguous instructions', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'skills/review/SKILL.md'), '---\nname: review\ndescription: Reviews code\ndescription: Other\n---\n\nReview.');
  assert.ok((await validatePlugin(root)).some(error => error.includes('Invalid YAML')));
});
test('catches missing bundled references', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'skills/review/SKILL.md'), '---\nname: review\ndescription: Reviews code\n---\n\nRead [auth](references/auth.md).');
  assert.ok((await validatePlugin(root)).some(error => error.includes('Broken local reference')));
});
test('rejects symlinks and references outside the package', async t => {
  const root = await fixture(t);
  await symlink(tmpdir(), join(root, 'skills/review/external'));
  await writeFile(join(root, 'skills/review/SKILL.md'), '---\nname: review\ndescription: Reviews code\n---\n\nRead [external](../../../outside.md).');
  const errors = await validatePlugin(root);
  assert.ok(errors.some(error => error.includes('Symlinks')));
  assert.ok(errors.some(error => error.includes('escapes package')));
});
test('catches an unmapped subagent tool', async t => {
  const root = await fixture(t);
  await mkdir(join(root, 'agents'));
  await writeFile(join(root, 'agents/reviewer.md'), '---\nname: reviewer\ndescription: Reviews code\ntools: [Bash]\n---\n\nReview.');
  assert.ok((await validatePlugin(root)).some(error => error.includes('Unverified agent tool')));
});
