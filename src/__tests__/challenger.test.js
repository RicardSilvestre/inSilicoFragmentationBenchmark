import { expect, test } from 'vitest';

import runChallenger from '../challenger.js';

test('runChallenger processes two positives and two negatives in test mode', async () => {
  const { summary, results } = await runChallenger({ testMode: true });
  expect(Object.keys(results)).toHaveLength(2);
  expect(summary.positive).toMatchInlineSnapshot(`
    {
      "top10AccuracyPct": 50,
      "top10Hits": 1,
      "top1AccuracyPct": 50,
      "top1Hits": 1,
      "top5AccuracyPct": 50,
      "top5Hits": 1,
      "totalChallenges": 2,
    }
  `);

  expect(summary.negative).toMatchInlineSnapshot(`
    {
      "top10AccuracyPct": 50,
      "top10Hits": 1,
      "top1AccuracyPct": 0,
      "top1Hits": 0,
      "top5AccuracyPct": 50,
      "top5Hits": 1,
      "totalChallenges": 2,
    }
  `);
}, 20000);
