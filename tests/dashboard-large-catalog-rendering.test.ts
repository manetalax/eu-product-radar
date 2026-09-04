import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dashboard = readFileSync(new URL('../components/Dashboard.tsx', import.meta.url), 'utf8');
const scalable = readFileSync(new URL('../components/ScalableCatalogView.tsx', import.meta.url), 'utf8');
const dashboardPage = readFileSync(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8');

test('large catalog results are paginated before table rows are rendered', () => {
  assert.match(dashboard, /<ScalableProductResults/);
  assert.doesNotMatch(dashboard, /<tbody>\{results\.map/);
  assert.match(scalable, /filtered\.slice\(safePage \* pageSize, safePage \* pageSize \+ pageSize\)/);
  assert.match(scalable, /state\.visible\.map/);
  assert.match(scalable, /\[50, 100, 250\]/);
});

test('documentation guide is also paginated for thousand-product analyses', () => {
  assert.match(dashboard, /<ScalableDocumentationList/);
  assert.doesNotMatch(dashboard, /current\.products\.map\(\(product, index\)/);
});

test('legacy DOM row-hiding scale controller is no longer mounted', () => {
  assert.doesNotMatch(dashboardPage, /DashboardProductScaleTools/);
});
