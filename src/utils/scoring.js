/**
 * MS2 spectral similarity scoring utilities.
 *
 * Wraps MSComparator from `ms-spectrum` and exposes a simple function
 * that scores predicted masses against an experimental spectrum.
 *
 * Adapted from the example/ folder's scoring.ts pattern.
 */

import { MSComparator } from 'ms-spectrum';

/**
 * Create a reusable comparator instance from the given options.
 *
 * The delta function defines mass tolerance as ppm-based:
 *   delta(mass) = mass × 1e-6 × precision
 *
 * @param {{ massPower?: number, intensityPower?: number, precision?: number }} options
 * @returns {MSComparator}
 */
export function createComparator({
  massPower = 3,
  intensityPower = 0.6,
  precision = 20,
} = {}) {
  return new MSComparator({
    delta: (mass) => mass * 1e-6 * precision,
    massPower,
    intensityPower,
  });
}

/**
 * Score predicted fragment masses against an experimental spectrum.
 *
 * @param {MSComparator} comparator
 * @param {{ x: number[], y: number[] }} spectrum - Experimental spectrum.
 * @param {number[]} masses - Sorted array of predicted m/z values.
 * @returns {{ cosine: number, tanimoto: number, nbCommonPeaks: number, nbPeaks1: number, nbPeaks2: number }}
 */
export function scoreSpectrum(comparator, spectrum, masses) {
  return comparator.getSimilarityToMasses(spectrum, masses);
}
