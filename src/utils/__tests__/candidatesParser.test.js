import { expect, test } from 'vitest';

import candidatesParser from '../candidatesParser.js';

test('should parse candidates CSV file correctly', async () => {
  const pathCandidates =
    'src/data/CASMI2016_Cat2and3_Challenge_Candidates/Challenge-001.csv';

  const result = await candidatesParser(pathCandidates);
  // Should return an array of candidates
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBeGreaterThan(0);

  // Check first candidate structure
  const firstCandidate = result[0];
  expect(firstCandidate).toHaveProperty('Identifier');
  expect(firstCandidate).toHaveProperty('CompoundName');
  expect(firstCandidate).toHaveProperty('MonoisotopicMass');
  expect(firstCandidate).toHaveProperty('MolecularFormula');
  expect(firstCandidate).toHaveProperty('SMILES');
  expect(firstCandidate).toHaveProperty('InChI');
  expect(firstCandidate).toHaveProperty('InChIKey');

  // Verify first candidate data
  expect(firstCandidate.Identifier).toBe('6415');
  expect(firstCandidate.CompoundName).toBe(
    '1-Amino-2-naphthalenesulfonic acid',
  );
  expect(firstCandidate.MonoisotopicMass).toBe(223.030319);
  expect(firstCandidate.MolecularFormula).toBe('C10H9NO3S');
  expect(firstCandidate.SMILES).toBe('c1ccc2c(c1)ccc(c2N)S(=O)(=O)O');
  expect(firstCandidate.InChI).toBe(
    'InChI=1S/C10H9NO3S/c11-10-8-4-2-1-3-7(8)5-6-9(10)15(12,13)14/h1-6H,11H2,(H,12,13,14)',
  );
  expect(firstCandidate.InChIKey).toBe('ONZWNZGVZFLMNZ-UHFFFAOYSA-N');
  expect(result[0]).toMatchInlineSnapshot(`
    {
      "CompoundName": "1-Amino-2-naphthalenesulfonic acid",
      "Identifier": "6415",
      "InChI": "InChI=1S/C10H9NO3S/c11-10-8-4-2-1-3-7(8)5-6-9(10)15(12,13)14/h1-6H,11H2,(H,12,13,14)",
      "InChIKey": "ONZWNZGVZFLMNZ-UHFFFAOYSA-N",
      "MolecularFormula": "C10H9NO3S",
      "MonoisotopicMass": 223.030319,
      "SMILES": "c1ccc2c(c1)ccc(c2N)S(=O)(=O)O",
    }
  `);
});
