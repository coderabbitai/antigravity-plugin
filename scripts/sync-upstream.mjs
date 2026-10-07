import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lock = JSON.parse(await readFile(resolve(root, 'upstream.json'), 'utf8'));
const args = process.argv.slice(2);
const value = flag => args[args.indexOf(flag) + 1];
for (const flag of ['--skills-root', '--cursor-root']) {
  if (!args.includes(flag) || !value(flag) || value(flag).startsWith('--')) {
    throw new Error(`Provide ${flag} pointing at a local checkout of the pinned upstream commit.`);
  }
}
const check = args.includes('--check');
const skills = resolve(value('--skills-root'));
const cursor = resolve(value('--cursor-root'));
for (const [path, pin] of [[skills, lock.skills], [cursor, lock.cursor]]) {
  const commit = execFileSync('git', ['-C', path, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (commit !== pin.commit) throw new Error(`Expected ${pin.repository} at ${pin.commit}, got ${commit}`);
  // Read committed blobs rather than potentially modified working-tree files.
}
const blob = (path, file) => execFileSync('git', ['-C', path, 'show', `HEAD:${file}`], { encoding: 'utf8' });
const replaceExactlyOnce = (text, before, after) => {
  if (text.split(before).length !== 2) throw new Error('Upstream adaptation target changed; review the transformation.');
  return text.replace(before, after);
};

let review = blob(skills, 'skills/code-review/SKILL.md');
review = replaceExactlyOnce(review, 'name: code-review\n', 'name: coderabbit-review\n');
review = replaceExactlyOnce(review,
  'AI-powered code review using CodeRabbit. Enables developers to implement features, review code, and fix issues in autonomous cycles without manual intervention.',
  'Run CodeRabbit reviews from Antigravity and apply independently validated fixes within the user\'s authorized scope.');
review = replaceExactlyOnce(review,
  '6. Report remaining findings and stop when the requested fixes are verified; avoid unbounded review loops',
  '6. Use the user\'s review-run limit, or at most three review invocations per change set. Report remaining findings and any edits not re-reviewed at the limit.');
review = replaceExactlyOnce(review,
  'Create a task list for issues found that need to be addressed.',
  'Inspect the terminal `type: complete` event and process exit status. A `review_completed` event with `outcome: failed` or a positive `unreviewedFileCount` is incomplete; retain any findings as partial and report the emitted reason. Warnings alone and absent legacy outcome fields are not failures. A nonzero exit or exit without a terminal completion event is failed or incomplete. State a finding count only when emitted or countable from a complete collection.\n\nCreate a task list for issues found that need to be addressed.');

let auth = blob(skills, 'skills/code-review/references/auth-recovery.md');
const boundaryStart = auth.indexOf('In a local agent sandbox,');
const boundaryEnd = auth.indexOf('Host-native agents use their normal shell.');
if (boundaryStart < 0 || boundaryEnd < boundaryStart) throw new Error('Auth adaptation target changed.');
auth = auth.slice(0, boundaryStart) +
  'Use Antigravity\'s normal command runner in the selected review environment.\n' +
  'Follow its supported approval controls when execution requires permission.\n' +
  'If the sandbox cannot access the trusted CLI or its authentication, report the\n' +
  'blocker and hand the exact command to the user\'s terminal in the same review\n' +
  'environment. Do not invent a host-execution tool, weaken sandbox settings, or\n' +
  'extract credentials. A host retry is eligible only when supported and authorized.\n\n' +
  auth.slice(boundaryEnd);

let autofix = blob(cursor, 'skills/autofix/SKILL.md').replaceAll('Cursor', 'Antigravity');
autofix = replaceExactlyOnce(autofix, 'name: autofix\n', 'name: coderabbit-autofix\n');
autofix = replaceExactlyOnce(autofix,
  'Map severity:\n\n- Critical or High means critical.\n- Medium means warning.\n- Minor or Low means info.\n- Info or Suggestion means info.\n- Security issues should be treated as high priority.',
  'Preserve native severity:\n\n- Keep Critical, Major, Minor, Trivial, Info, or None as emitted by CodeRabbit.\n- Display Unknown when severity is missing or unrecognized, retaining any supplied label.\n- Do not infer severity from issue type, icons, effort, or description.\n- Confirm actionability from local inspection independently of severity.');
autofix = replaceExactlyOnce(autofix,
  'Offer to run the repository\'s relevant checks from `AGENTS.md`, README, package scripts, or project conventions. Report pass or fail clearly.',
  'Run the repository\'s required and relevant checks from `AGENTS.md`, README, package scripts, or project conventions before pushing. Report failures and do not claim the fixes are validated.');

const outputs = new Map([
  ['LICENSE', blob(skills, 'LICENSE')],
  ['skills/coderabbit-review/SKILL.md', review],
  ['skills/coderabbit-review/references/auth-recovery.md', auth],
  ['skills/coderabbit-review/references/cli-workflows.md', blob(skills, 'skills/code-review/references/cli-workflows.md')],
  ['skills/coderabbit-autofix/SKILL.md', autofix],
]);
if (JSON.stringify([...outputs.keys()].sort()) !== JSON.stringify([...lock.generated].sort())) {
  throw new Error('Generated-file inventory does not match upstream.json');
}
for (const [file, content] of outputs) {
  const target = resolve(root, file);
  if (check) {
    if (await readFile(target, 'utf8') !== content) throw new Error(`Generated file differs: ${file}`);
  } else {
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
  }
}
console.log(`${check ? 'Verified' : 'Synced'} ${outputs.size} files from pinned CodeRabbit sources.`);
