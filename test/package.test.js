const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

test('the packed installer copies skills and the plugin manifest', (t) => {
  const root = path.resolve(__dirname, '..');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ivorysql-skills-test-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));

  function run(args, cwd) {
    const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8' });
    assert.equal(result.status, 0, result.error?.message || result.stderr);
    return result.stdout;
  }

  // Exercise the package users receive, rather than the source checkout.
  const npm = process.env.npm_execpath;
  assert.ok(npm, 'Run this test with npm test');
  const [packed] = JSON.parse(run([
    npm, 'pack', '--ignore-scripts', '--json', '--pack-destination', temp,
  ], root));
  run([
    npm, 'install', path.join(temp, packed.filename), '--prefix', temp,
    '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false',
  ], temp);

  const destination = path.join(temp, 'destination');
  fs.mkdirSync(destination);
  run([path.join(temp, 'node_modules', '@ivorysql', 'skills', 'install.js')], destination);

  const manifestPath = path.join('.claude-plugin', 'manifest.json');
  const manifest = fs.readFileSync(path.join(root, manifestPath), 'utf8');
  assert.equal(fs.readFileSync(path.join(destination, manifestPath), 'utf8'), manifest);
  for (const skill of JSON.parse(manifest).skills) {
    assert.deepEqual(
      fs.readFileSync(path.join(destination, 'skills', skill, 'SKILL.md')),
      fs.readFileSync(path.join(root, 'skills', skill, 'SKILL.md')),
    );
  }
});
