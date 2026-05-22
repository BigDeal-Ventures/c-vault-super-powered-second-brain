const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

const publicDocs = [
  'docs/overview.md',
  'docs/core-workflows.md',
  'docs/cmo-skills.md',
  'docs/cmo-skills-start-here.md',
  'docs/cmo-skills-playbooks.md',
  'docs/cmo-skills-decision-guide.md',
  'docs/cmo-skills-operating-cadence.md',
  'docs/cmo-skills-example-outputs.md',
  'docs/examples.md',
  'docs/install-update-safety.md',
];

test('public docs include navigation back to README and related docs', () => {
  for (const rel of publicDocs) {
    const text = fs.readFileSync(path.join(root, rel), 'utf8');
    assert.match(text, /\[Docs Home\]\(\.\.\/README\.md\)/, `${rel} should link back to README`);
    assert.match(text, /## Related Docs/, `${rel} should include related docs`);
  }
});

test('README links all public docs', () => {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  for (const rel of publicDocs) {
    assert.match(readme, new RegExp(`\\(${rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`), `README should link ${rel}`);
  }
});
