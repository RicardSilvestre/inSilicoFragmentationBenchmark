import { expect, test } from 'vitest';

import fragmentationChallenger from '../fragmentationChallenger.js';

test('should run fragmentation challenge for Challenge-082', async () => {
  const result = await fragmentationChallenger({
    challengeSpectrumPath:
      'src/data/CASMI2016_Cat2and3_Challenge_positive_peaklist/Challenge-082.txt',
    challengeCandidatesPath:
      'src/data/CASMI2016_Cat2and3_Challenge_Candidates/Challenge-082.csv',
    solutionsPath: 'src/data/solutions_casmi2016_cat2and3.csv',
    challengeName: 'Challenge-082',
    ionMode: 'positive',
    testMode: true,
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "adductLabels": [
        "Ionization-H",
        "Ionization-Radical",
        "Ionization-Na",
      ],
      "challengeName": "Challenge-082",
      "correctRank": 1,
      "inTop1": true,
      "inTop10": true,
      "inTop5": true,
      "results": [
        {
          "adductScores": {
            "Ionization-H": {
              "cosine": 0.9924131794442371,
              "nbCommonPeaks": 4,
              "nbPeaks1": 18,
              "nbPeaks2": 4,
              "tanimoto": 0.2222222222222222,
            },
            "Ionization-Na": {
              "cosine": 0,
              "nbCommonPeaks": 0,
              "nbPeaks1": 18,
              "nbPeaks2": 0,
              "tanimoto": 0,
            },
            "Ionization-Radical": {
              "cosine": 0,
              "nbCommonPeaks": 0,
              "nbPeaks1": 18,
              "nbPeaks2": 0,
              "tanimoto": 0,
            },
          },
          "bestAdduct": "Ionization-H",
          "candidate": {
            "CompoundName": "Cyromazine",
            "Identifier": "43550",
            "InChI": "InChI=1S/C6H10N6/c7-4-10-5(8)12-6(11-4)9-3-1-2-3/h3H,1-2H2,(H5,7,8,9,10,11,12)",
            "InChIKey": "LVQDKIWDGQRHTE-UHFFFAOYSA-N",
            "MolecularFormula": "C6H10N6",
            "MonoisotopicMass": 166.096695,
            "SMILES": "C1CC1Nc2nc(nc(n2)N)N",
          },
          "cosineSimilarity": 0.9924131794442371,
          "similarity": {
            "cosine": 0.9924131794442371,
            "nbCommonPeaks": 4,
            "nbPeaks1": 18,
            "nbPeaks2": 4,
            "tanimoto": 0.2222222222222222,
          },
        },
        {
          "adductScores": {
            "Ionization-H": {
              "cosine": 0.043096257981795824,
              "nbCommonPeaks": 1,
              "nbPeaks1": 18,
              "nbPeaks2": 1,
              "tanimoto": 0.05555555555555555,
            },
            "Ionization-Na": {
              "cosine": 0,
              "nbCommonPeaks": 0,
              "nbPeaks1": 18,
              "nbPeaks2": 0,
              "tanimoto": 0,
            },
            "Ionization-Radical": {
              "cosine": 0.004604208771397529,
              "nbCommonPeaks": 2,
              "nbPeaks1": 18,
              "nbPeaks2": 2,
              "tanimoto": 0.1111111111111111,
            },
          },
          "bestAdduct": "Ionization-H",
          "candidate": {
            "CompoundName": "Sodium caprylate [USAN]",
            "Identifier": "15307",
            "InChI": "InChI=1S/C8H16O2.Na/c1-2-3-4-5-6-7-8(9)10;/h2-7H2,1H3,(H,9,10);/q;+1/p-1",
            "InChIKey": "BYKRNSHANADUFY-UHFFFAOYSA-M",
            "MolecularFormula": "C8H15NaO2",
            "MonoisotopicMass": 166.09697,
            "SMILES": "CCCCCCCC(=O)[O-].[Na+]",
          },
          "cosineSimilarity": 0.043096257981795824,
          "similarity": {
            "cosine": 0.043096257981795824,
            "nbCommonPeaks": 1,
            "nbPeaks1": 18,
            "nbPeaks2": 1,
            "tanimoto": 0.05555555555555555,
          },
        },
        {
          "adductScores": {
            "Ionization-H": {
              "cosine": 0.043096257981795824,
              "nbCommonPeaks": 1,
              "nbPeaks1": 18,
              "nbPeaks2": 1,
              "tanimoto": 0.05555555555555555,
            },
            "Ionization-Na": {
              "cosine": 0,
              "nbCommonPeaks": 0,
              "nbPeaks1": 18,
              "nbPeaks2": 0,
              "tanimoto": 0,
            },
            "Ionization-Radical": {
              "cosine": 0.004604208771397529,
              "nbCommonPeaks": 2,
              "nbPeaks1": 18,
              "nbPeaks2": 2,
              "tanimoto": 0.1111111111111111,
            },
          },
          "bestAdduct": "Ionization-H",
          "candidate": {
            "CompoundName": "Sodium 2-ethylhexanoate",
            "Identifier": "80512",
            "InChI": "InChI=1S/C8H16O2.Na/c1-3-5-6-7(4-2)8(9)10;/h7H,3-6H2,1-2H3,(H,9,10);/q;+1/p-1",
            "InChIKey": "VYPDUQYOLCLEGS-UHFFFAOYSA-M",
            "MolecularFormula": "C8H15NaO2",
            "MonoisotopicMass": 166.09697,
            "SMILES": "CCCCC(CC)C(=O)[O-].[Na+]",
          },
          "cosineSimilarity": 0.043096257981795824,
          "similarity": {
            "cosine": 0.043096257981795824,
            "nbCommonPeaks": 1,
            "nbPeaks1": 18,
            "nbPeaks2": 1,
            "tanimoto": 0.05555555555555555,
          },
        },
        {
          "adductScores": {
            "Ionization-H": {
              "cosine": 0.043096257981795824,
              "nbCommonPeaks": 1,
              "nbPeaks1": 18,
              "nbPeaks2": 1,
              "tanimoto": 0.05555555555555555,
            },
            "Ionization-Na": {
              "cosine": 0,
              "nbCommonPeaks": 0,
              "nbPeaks1": 18,
              "nbPeaks2": 0,
              "tanimoto": 0,
            },
            "Ionization-Radical": {
              "cosine": 0.004604208771397529,
              "nbCommonPeaks": 2,
              "nbPeaks1": 18,
              "nbPeaks2": 2,
              "tanimoto": 0.1111111111111111,
            },
          },
          "bestAdduct": "Ionization-H",
          "candidate": {
            "CompoundName": "Sodium (2R)-2-ethylhexanoate",
            "Identifier": "144153",
            "InChI": "InChI=1S/C8H16O2.Na/c1-3-5-6-7(4-2)8(9)10;/h7H,3-6H2,1-2H3,(H,9,10);/q;+1/p-1/t7-;/m1./s1",
            "InChIKey": "VYPDUQYOLCLEGS-OGFXRTJISA-M",
            "MolecularFormula": "C8H15NaO2",
            "MonoisotopicMass": 166.09697,
            "SMILES": "CCCC[C@@H](CC)C(=O)[O-].[Na+]",
          },
          "cosineSimilarity": 0.043096257981795824,
          "similarity": {
            "cosine": 0.043096257981795824,
            "nbCommonPeaks": 1,
            "nbPeaks1": 18,
            "nbPeaks2": 1,
            "tanimoto": 0.05555555555555555,
          },
        },
        {
          "adductScores": {
            "Ionization-H": {
              "cosine": 0,
              "nbCommonPeaks": 0,
              "nbPeaks1": 18,
              "nbPeaks2": 0,
              "tanimoto": 0,
            },
            "Ionization-Na": {
              "cosine": 0,
              "nbCommonPeaks": 0,
              "nbPeaks1": 18,
              "nbPeaks2": 0,
              "tanimoto": 0,
            },
            "Ionization-Radical": {
              "cosine": 0.0018424867747758311,
              "nbCommonPeaks": 1,
              "nbPeaks1": 18,
              "nbPeaks2": 1,
              "tanimoto": 0.05555555555555555,
            },
          },
          "bestAdduct": "Ionization-Radical",
          "candidate": {
            "CompoundName": "sodium valproate",
            "Identifier": "13428",
            "InChI": "InChI=1S/C8H16O2.Na/c1-3-5-7(6-4-2)8(9)10;/h7H,3-6H2,1-2H3,(H,9,10);/q;+1/p-1",
            "InChIKey": "AEQFSUDEHCCHBT-UHFFFAOYSA-M",
            "MolecularFormula": "C8H15NaO2",
            "MonoisotopicMass": 166.09697,
            "SMILES": "CCCC(CCC)C(=O)[O-].[Na+]",
          },
          "cosineSimilarity": 0.0018424867747758311,
          "similarity": {
            "cosine": 0.0018424867747758311,
            "nbCommonPeaks": 1,
            "nbPeaks1": 18,
            "nbPeaks2": 1,
            "tanimoto": 0.05555555555555555,
          },
        },
      ],
      "solution": {
        "INCHIKEY": "LVQDKIWDGQRHTE-UHFFFAOYSA-N",
        "NAME": "Cyromazine",
      },
      "totalCandidates": 5,
    }
  `);
}, 10000);
