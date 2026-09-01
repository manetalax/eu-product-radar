import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const dashboard = readFileSync(new URL('../components/Dashboard.tsx', import.meta.url), 'utf8');
const accountCss = readFileSync(new URL('../app/account-security.css', import.meta.url), 'utf8');

test('account deletion moves focus into confirmation instead of dropping keyboard position', () => {
  assert.match(dashboard, /const deleteEmailInput = useRef<HTMLInputElement>\(null\)/);
  assert.match(dashboard, /if \(!deleteAccountOpen\) return;[\s\S]{0,180}requestAnimationFrame\(\(\) => deleteEmailInput\.current\?\.focus\(\)\)/);
  assert.match(dashboard, /<input ref=\{deleteEmailInput\} type="email"/);
});

test('cancelling account deletion restores focus to the opener after it remounts', () => {
  assert.match(dashboard, /const deleteAccountOpener = useRef<HTMLButtonElement>\(null\)/);
  assert.match(dashboard, /function closeDeleteAccount\(\) \{[\s\S]{0,260}requestAnimationFrame\(\(\) => deleteAccountOpener\.current\?\.focus\(\)\)/);
  assert.match(dashboard, /<button ref=\{deleteAccountOpener\} className="btn danger-outline"/);
  assert.match(dashboard, /onClick=\{closeDeleteAccount\}/);
});

test('mobile account deletion fields avoid iOS focus zoom while retaining touch-sized controls', () => {
  assert.match(accountCss, /\.account-delete-confirmation input \{[\s\S]{0,180}min-height: 46px;/);
  assert.match(accountCss, /@media \(max-width: 700px\) \{[\s\S]*\.account-delete-confirmation input \{\s*font-size: 16px;/);
});
