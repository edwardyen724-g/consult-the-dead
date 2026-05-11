import test from 'node:test';
import assert from 'node:assert/strict';

import { DOMAIN_SILHOUETTES, getDomainSilhouetteStyle } from '../src/components/canvas/domainSilhouettes.mjs';

test('domain silhouette tokens stay distinct across the five overview categories', () => {
  const categories = ['science', 'strategy', 'art', 'governance', 'computing'];
  const clipPaths = new Set();

  for (const category of categories) {
    const style = DOMAIN_SILHOUETTES[category];
    assert.ok(style, `missing silhouette token for ${category}`);
    assert.equal(typeof style.clipPath, 'string');
    assert.match(style.clipPath, /^polygon\(/);
    clipPaths.add(style.clipPath);
  }

  assert.equal(clipPaths.size, categories.length);
});

test('unknown domain categories fall back to the computing silhouette', () => {
  const fallback = getDomainSilhouetteStyle('not-a-domain');
  assert.equal(fallback.clipPath, DOMAIN_SILHOUETTES.computing.clipPath);
});
