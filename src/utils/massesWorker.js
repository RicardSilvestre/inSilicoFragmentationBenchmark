/**
 * Lightweight worker thread for reaction fragmentation (masses only).
 *
 * This worker does not set up a DOM, does not filter trees, and does not
 * render SVGs. It only computes the predicted m/z values, making it much
 * faster and lighter — ideal for bulk candidate screening.
 *
 * Communication:
 * - **In** (`workerData`): molfile, filteredDwar, fragmentation options,
 *   candidate info, and ionization label.
 * - **Out** (`postMessage`): candidate info, ionization label, and sorted
 *   m/z array.
 *
 * Adapted from the example/ folder's massesOnlyWorker.ts pattern.
 */

import { parentPort, workerData } from 'node:worker_threads';

import { reactionFragmentation } from 'mass-fragmentation';
import OCL from 'openchemlib';

const { candidate, molfile, filteredDwar, options, label } = workerData;

const molecule = OCL.Molecule.fromMolfile(molfile);

const fragments = reactionFragmentation(molecule, {
  ...options,
  dwar: filteredDwar,
});

const masses = fragments.masses.map((m) => m.mz).sort((a, b) => a - b);

parentPort.postMessage({ candidate, label, masses });
