import { expect, test } from 'vitest';

import solutionsParser from '../solutionsParser.js';

test('should parse solutions CSV file correctly', async () => {
  const pathSolutions = 'src/data/solutions_casmi2016_cat2and3.csv';

  const result = await solutionsParser(pathSolutions);

  // Should return an array of solutions
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBeGreaterThan(0);
  // Check first solution structure
  expect(result[0]).toMatchInlineSnapshot(`
    {
      "CSID": "8101",
      "ChallengeName": "Challenge-001",
      "INCHI": "InChI=1S/C10H9NO3S/c11-10-3-1-2-7-6-8(15(12,13)14)4-5-9(7)10/h1-6H,11H2,(H,12,13,14)",
      "INCHIKEY": "UWPJYQYRSWYIGZ-UHFFFAOYSA-N",
      "ION_MODE": "NEGATIVE",
      "NAME": "5-Aminonaphthalene-2-sulfonic acid",
      "PC_CID": "8408",
      "PRECURSOR_MZ": 222.023,
      "RT": 0.803,
      "SMILES": "NC1=C2C=CC(=CC2=CC=C1)S(O)(=O)=O",
      "SourceFile": "XX834151",
      "nPeaks": 5,
    }
  `);
});
