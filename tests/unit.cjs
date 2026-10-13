const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  validDate,
  zonedNow,
  overlaps,
  canClientChange,
  wallTimeInstant,
} = require('../server/dist/utils/bookingRules');
const {
  csvCell,
  escapeRegex,
  escapeHtml,
  newToken,
  hashToken,
} = require('../server/dist/utils/security');
const { validateFile } = require('../server/dist/utils/fileRules');
const { isStudioQuestion } = require('../server/dist/services/chatAssistant');

test('studio assistant refuses unrelated and mixed-topic questions', () => {
  assert.equal(isStudioQuestion('How much does a website cost?'), true);
  assert.equal(isStudioQuestion('What about booking?', ['How much does a website cost?']), true);
  assert.equal(isStudioQuestion('What is the capital of France?'), false);
  assert.equal(isStudioQuestion('What does a website cost, and what is the capital of France?'), false);
});

test('calendar validation rejects impossible dates and permits leap days', () => {
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('2024-02-29'), true);
  assert.equal(validDate('not-a-date'), false);
});
test('booking dates use the studio timezone across UTC midnight', () => {
  assert.deepEqual(zonedNow('Asia/Kolkata', new Date('2026-10-13T20:00:00Z')), {
    date: '2026-10-14',
    minute: 90,
  });
});
test('interval overlap detects different starts without rejecting adjacent slots', () => {
  assert.equal(overlaps('09:00', '09:45', '09:30', '10:00'), true);
  assert.equal(overlaps('09:00', '09:30', '09:30', '10:00'), false);
});
test('client change deadline is enforced at the boundary', () => {
  const now = new Date('2026-10-13T03:30:00Z');
  assert.equal(canClientChange('2026-10-14', '09:00', 24, 'Asia/Kolkata', now), false);
  assert.equal(canClientChange('2026-10-14', '09:30', 24, 'Asia/Kolkata', now), true);
});
test('CSV output quotes multiline values and neutralizes formulas', () => {
  assert.equal(csvCell('=1+1'), '"\'=1+1"');
  assert.equal(csvCell('hello,"world"\nnext'), '"hello,""world""\nnext"');
});
test('daylight saving does not create nonexistent slots or shorten the notice policy', () => {
  assert.equal(wallTimeInstant('2026-03-08', '02:30', 'America/New_York'), null);
  assert.equal(
    canClientChange(
      '2026-03-08',
      '09:30',
      24,
      'America/New_York',
      new Date('2026-03-07T14:00:00Z'),
    ),
    false,
  );
  assert.equal(
    canClientChange(
      '2026-11-01',
      '09:00',
      24,
      'America/New_York',
      new Date('2026-10-31T13:00:00Z'),
    ),
    true,
  );
});
test('search and HTML escaping treat user content as text', () => {
  const literal = '[a-z]+(x)';
  assert.equal(new RegExp(escapeRegex(literal)).test(literal), true);
  assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
});
test('upload validation rejects executable or mismatched content and oversized files', () => {
  assert.throws(() =>
    validateFile('brief.pdf', 'application/pdf', Buffer.from('MZ executable').toString('base64')),
  );
  assert.throws(() =>
    validateFile('brief.exe', 'application/pdf', Buffer.from('%PDF-1.4').toString('base64')),
  );
  const large = Buffer.alloc(5 * 1024 * 1024 + 1);
  large.write('%PDF-');
  assert.throws(() => validateFile('brief.pdf', 'application/pdf', large.toString('base64')));
  assert.equal(
    validateFile('../brief.pdf', 'application/pdf', Buffer.from('%PDF-1.4').toString('base64'))
      .filename,
    '.._brief.pdf',
  );
});
test('tracking credentials are unpredictable and persisted as hashes', () => {
  const token = newToken();
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.notEqual(newToken(), token);
  assert.notEqual(hashToken(token), token);
});
