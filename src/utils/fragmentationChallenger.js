import { MSComparator } from 'ms-spectrum';
import { reactionFragmentation, getDatabase } from 'mass-fragmentation';
import OCL from 'openchemlib';
import getMasses from './getMasses.js';

import challengeParser from './challengeParser.js';
import candidatesParser from './candidatesParser.js';
import solutionsParser from './solutionsParser.js';

export default async function fragmentationChallenger({
  challengeSpectrumPath,
  challengeCandidatesPath,
  solutionsPath,
  challengeName,
  ionMode = 'positive',
  testMode = false,
}) {
  // Parse the challenge spectrum
  const experimentalSpectrum = await challengeParser(challengeSpectrumPath);
  // Parse the candidates
  let candidates = await candidatesParser(challengeCandidatesPath);

  // Parse the solutions
  const allSolutions = await solutionsParser(solutionsPath);
  const solution = allSolutions.find(
    (sol) => sol.ChallengeName === challengeName,
  );

  if (!solution) {
    throw new Error(`Solution not found for ${challengeName}`);
  }

  // Get fragmentation database
  const database = getDatabase({
    ionizations: ['esi'],
    modes: [ionMode.toLowerCase()],
  });

  // Create MS comparator
  const comparator = new MSComparator();

  // Process each candidate
  const results = [];
  // check if testMode is enabled
  if (testMode) {
    candidates = candidates.slice(0, 5); // Limit to first 5 candidates for testing
  }
  for (const candidate of candidates) {
    try {
      // Parse SMILES to molecule using OpenChemLib
      const molecule = OCL.Molecule.fromSmiles(candidate.SMILES);

      // Perform fragmentation
      const fragments = reactionFragmentation(molecule, { database });

      // Get masses from fragments
      const massesArray = getMasses(fragments.masses);
      // Compare with experimental spectrum
      const similarity = comparator.getSimilarityToMasses(
        { x: experimentalSpectrum.data.x, y: experimentalSpectrum.data.y },
        massesArray,
      );

      results.push({
        candidate,
        similarity,
        cosineSimilarity: similarity.cosine,
      });
    } catch (error) {
      // If fragmentation fails, assign zero similarity
      results.push({
        candidate,
        similarity: null,
        cosineSimilarity: 0,
        error: error.message,
      });
    }
  }

  // Sort candidates by cosine similarity (descending)
  results.sort((a, b) => b.cosineSimilarity - a.cosineSimilarity);

  // Find the rank of the correct solution
  const correctInChIKey = solution.INCHIKEY;
  const correctRank =
    results.findIndex((r) => r.candidate.InChIKey === correctInChIKey) + 1;

  return {
    challengeName,
    solution: {
      NAME: solution.NAME,
      INCHIKEY: solution.INCHIKEY,
    },
    totalCandidates: candidates.length,
    correctRank,
    inTop1: correctRank === 1,
    inTop5: correctRank > 0 && correctRank <= 5,
    inTop10: correctRank > 0 && correctRank <= 10,
    results,
  };
}
