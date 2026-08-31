import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Latest regulatory assessment validates history and detail 2xx payloads before state', async () => {
  const source = await readFile(new URL('../components/LatestRegulatoryAssessment.tsx', import.meta.url), 'utf8');
  assert.match(source, /async function trustedJsonObject\(response: Response\)/);
  assert.match(source, /if \(!response\.ok\) return null/);
  assert.match(source, /analysisSummariesFromUnknown\(historyBody\.analyses\)/);
  assert.match(source, /analysisFromUnknown\(body\.analysis\)/);
  assert.match(source, /analysisMarket\(validated\) !== 'EU'/);
  assert.doesNotMatch(source, /history\.analyses\?\.\[0\]/);
  assert.doesNotMatch(source, /setAnalysis\(body\.analysis/);
});
