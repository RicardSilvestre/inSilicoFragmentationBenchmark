/**
 * Per-adduct fragmentation challenger.
 *
 * For each candidate molecule, this module:
 * 1. Filters the DWAR reaction database per ionization label.
 * 2. Runs fragmentation separately for each adduct (synchronously).
 * 3. Scores each (candidate × adduct) independently using cosine similarity.
 * 4. Ranks candidates by their **best** adduct score.
 *
 * Adapted from the example/ folder's architecture.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { reactionFragmentation } from 'mass-fragmentation';
import OCL from 'openchemlib';

import challengeParser from './challengeParser.js';
import candidatesParser from './candidatesParser.js';
import solutionsParser from './solutionsParser.js';
import { getIonizationLabels, filterDwarByIonization } from './dwarFilter.js';
import { createComparator, scoreSpectrum } from './scoring.js';
import { fragmentationOptions } from './fragmentationOptions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DWAR_PATH = path.join(__dirname, '..', 'ReactionMassFragmentation.dwar');

// ── Scoring parameters (matching example/ folder) ──────────────────────
const MASS_POWER = 3;
const INTENSITY_POWER = 0.6;
const PRECISION = 20;

/** Ionization labels to exclude. */
const EXCLUDE_LABELS = ['Ionization-K'];

/**
 * Fragment a molecule once per adduct label, returning a Map of label → masses.
 *
 * For each ionization label, a filtered DWAR (keeping only that ionization
 * + all reaction rows) is used. This ensures each adduct's masses are
 * independent, avoiding false-positive mass inflation in the cosine score.
 *
 * @param {import('openchemlib').Molecule} molecule
 * @param {Map<string, string>} filteredDwars - Pre-filtered DWARs keyed by label.
 * @param {string[]} labels - Ionization labels to process.
 * @param {object} options - Fragmentation options including mode.
 * @returns {Map<string, number[]>} Map from adduct label to sorted m/z array.
 */
function fragmentByAdduct(molecule, filteredDwars, labels, options) {
  const result = new Map();

  for (const label of labels) {
    const filteredDwar = filteredDwars.get(label);
    const fragments = reactionFragmentation(molecule, {
      ...options,
      dwar: filteredDwar,
    });

    const masses = fragments.masses.map((m) => m.mz).sort((a, b) => a - b);

    result.set(label, masses);
  }

  return result;
}

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
  const spectrum = {
    x: experimentalSpectrum.data.x,
    y: experimentalSpectrum.data.y,
  };

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

  // Load DWAR reaction database
  const dwar = await fs.readFile(DWAR_PATH, 'utf-8');

  // Discover ionization labels for this mode
  const mode = ionMode.toLowerCase();
  const allLabels = getIonizationLabels(dwar, mode);
  const excludeSet = new Set(EXCLUDE_LABELS);
  const labels = allLabels.filter((l) => !excludeSet.has(l));

  // Pre-filter DWAR once per label
  const filteredDwars = new Map();
  for (const label of labels) {
    filteredDwars.set(label, filterDwarByIonization(dwar, label));
  }

  // Create the comparator with ppm-based delta
  const comparator = createComparator({
    massPower: MASS_POWER,
    intensityPower: INTENSITY_POWER,
    precision: PRECISION,
  });

  // Limit candidates in test mode
  if (testMode) {
    candidates = candidates.slice(0, 5);
  }

  // ── Fragment and score each candidate ──────────────────────────────
  const results = [];

  for (const candidate of candidates) {
    try {
      // Parse SMILES to molecule using OpenChemLib
      const molecule = OCL.Molecule.fromSmiles(candidate.SMILES);

      // Fragment per adduct (with mode-specific options)
      const fragOptions = {
        ...fragmentationOptions,
        modes: [mode],
      };
      const adductMasses = fragmentByAdduct(
        molecule,
        filteredDwars,
        labels,
        fragOptions,
      );

      // Score each adduct independently, keep the best
      let bestSimilarity = null;
      let bestCosine = 0;
      let bestAdduct = '';
      const adductScores = {};

      for (const label of labels) {
        const masses = adductMasses.get(label) ?? [];
        const similarity = scoreSpectrum(comparator, spectrum, masses);
        adductScores[label] = similarity;

        if (similarity.cosine > bestCosine) {
          bestCosine = similarity.cosine;
          bestSimilarity = similarity;
          bestAdduct = label;
        }
      }

      results.push({
        candidate,
        similarity: bestSimilarity || {
          cosine: 0,
          tanimoto: 0,
          nbCommonPeaks: 0,
          nbPeaks1: 0,
          nbPeaks2: 0,
        },
        cosineSimilarity: bestCosine,
        bestAdduct,
        adductScores,
      });
    } catch (error) {
      // If fragmentation fails, assign zero similarity
      results.push({
        candidate,
        similarity: null,
        cosineSimilarity: 0,
        bestAdduct: '',
        adductScores: {},
        error: error.message,
      });
    }
  }

  // Sort candidates by best cosine similarity (descending)
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
    adductLabels: labels,
    results,
  };
}
