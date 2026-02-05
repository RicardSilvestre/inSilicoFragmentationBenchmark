import { expect, test } from 'vitest';

import challengeParser from '../challengeParser.js';

test('should return 42', async () => {
  const pathChallengePositive =
    'src/data/CASMI2016_Cat2and3_Challenge_positive_peaklist/Challenge-082.txt';

  const result = await challengeParser(pathChallengePositive);
  expect(result).toMatchInlineSnapshot(`
    Spectrum {
      "cache": {},
      "data": {
        "x": [
          56.0496,
          58.0653,
          60.0557,
          68.0244,
          70.04,
          81.0447,
          83.0604,
          85.0508,
          100.0869,
          108.0556,
          110.0461,
          112.0617,
          125.0821,
          127.0727,
          139.0725,
          140.093,
          150.0775,
          167.1039,
        ],
        "y": [
          890015.8,
          2683323,
          19158144,
          2064966.2,
          448485.8,
          459195.2,
          8710302,
          32494888,
          846321,
          6498543.5,
          1230449,
          576228.1,
          17335174,
          814654.5,
          2935127.5,
          1145310.1,
          826622.3,
          206684544,
        ],
      },
      "info": {
        "maxX": 167.1039,
        "maxY": 206684544,
        "minX": 56.0496,
        "minY": 448485.8,
      },
      "options": {
        "threshold": 0.00025,
      },
      "peaks": [],
    }
  `);
});
