import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../lib/ai-provider.ts', import.meta.url), 'utf8');

test('Cloudflare Workers AI is a bounded free fallback after SiliconFlow', () => {
  assert.match(source, /@cf\/qwen\/qwen3\.8-27b/);
  assert.match(source, /https:\/\/api\.cloudflare\.com\/client\/v4\/accounts\/\$\{accountId\}\/ai\/v1/);
  assert.match(source, /\^\[a-f0-9\]\{32\}\$/i);
  assert.ok(source.indexOf('siliconFlowText(messages') < source.indexOf('cloudflareText(messages'));
  assert.ok(source.indexOf('siliconFlowVision(dataUrl') < source.indexOf('cloudflareVision(dataUrl'));
  assert.doesNotMatch(source, /CLOUDFLARE_BASE_URL/);
});
