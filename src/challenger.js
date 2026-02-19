import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} from 'node:worker_threads';

import fragmentationChallenger from './utils/fragmentationChallenger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_ZIP = path.join(__dirname, 'data.zip');

/**
 * Ensure the data/ directory exists.
 * If it is missing but data.zip is present, extract it automatically.
 */
function ensureData() {
  if (existsSync(DATA_DIR)) return;

  if (!existsSync(DATA_ZIP)) {
    throw new Error(
      `Data directory "${DATA_DIR}" is missing and no data.zip found at "${DATA_ZIP}".\n` +
        'Please place data.zip next to challenger.js or manually restore the data/ folder.',
    );
  }

  console.log('[Challenger] data/ folder not found – extracting data.zip …');
  execSync(`unzip -q -o "${DATA_ZIP}" -d "${__dirname}"`, {
    stdio: 'inherit',
  });
  console.log('[Challenger] data/ extracted successfully.');
}
const CANDIDATES_DIR = path.join(
  DATA_DIR,
  'CASMI2016_Cat2and3_Challenge_Candidates',
);
const POS_DIR = path.join(
  DATA_DIR,
  'CASMI2016_Cat2and3_Challenge_positive_peaklist',
);
const NEG_DIR = path.join(
  DATA_DIR,
  'CASMI2016_Cat2and3_Challenge_negative_peaklist',
);
const SOLUTIONS_PATH = path.join(DATA_DIR, 'solutions_casmi2016_cat2and3.csv');
const RESULTS_DIR = path.join(__dirname, 'results');
const RESULTS_POS_DIR = path.join(RESULTS_DIR, 'positive');
const RESULTS_NEG_DIR = path.join(RESULTS_DIR, 'negative');

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function challengeNameFromFile(fileName) {
  return fileName.replace(/\.csv$/i, '');
}

async function resolvePeaklistPath(challengeName) {
  const base = `${challengeName}.txt`;
  const positivePath = path.join(POS_DIR, base);
  if (await fileExists(positivePath)) {
    return { path: positivePath, ionMode: 'positive' };
  }

  const negativePath = path.join(NEG_DIR, base);
  if (await fileExists(negativePath)) {
    return { path: negativePath, ionMode: 'negative' };
  }

  throw new Error(`Peaklist not found for ${challengeName}`);
}

async function ensureResultsDirs() {
  await fs.mkdir(RESULTS_DIR, { recursive: true });
  await fs.mkdir(RESULTS_POS_DIR, { recursive: true });
  await fs.mkdir(RESULTS_NEG_DIR, { recursive: true });
}

function computeSummary(allResults) {
  const totalChallenges = allResults.length;
  const top1Hits = allResults.filter((r) => r.inTop1).length;
  const top5Hits = allResults.filter((r) => r.inTop5).length;
  const top10Hits = allResults.filter((r) => r.inTop10).length;

  const pct = (hits) =>
    totalChallenges === 0 ? 0 : (hits / totalChallenges) * 100;

  return {
    totalChallenges,
    top1Hits,
    top5Hits,
    top10Hits,
    top1AccuracyPct: pct(top1Hits),
    top5AccuracyPct: pct(top5Hits),
    top10AccuracyPct: pct(top10Hits),
  };
}

function getConcurrency() {
  const cpu = os.cpus()?.length || 2;
  return Math.max(1, Math.floor(cpu / 2));
}

// Worker entry point: run a single challenge and send result back
if (!isMainThread && workerData) {
  (async () => {
    try {
      ensureData();
      const result = await fragmentationChallenger(workerData);
      parentPort.postMessage({ ok: true, result });
    } catch (error) {
      parentPort.postMessage({
        ok: false,
        error: error?.message || String(error),
        stack: error?.stack,
      });
    }
  })();
}

export default async function runChallenger({ testMode = false } = {}) {
  ensureData();

  const allowWrites = !testMode;
  if (allowWrites) {
    await ensureResultsDirs();
  }

  const startTime = Date.now();

  const fmtElapsed = () => {
    const ms = Date.now() - startTime;
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const candidateFiles = (await fs.readdir(CANDIDATES_DIR))
    .filter((f) => f.toLowerCase().endsWith('.csv'))
    .sort();

  const grouped = { positive: [], negative: [] };

  for (const file of candidateFiles) {
    const challengeName = challengeNameFromFile(file);
    const challengeCandidatesPath = path.join(CANDIDATES_DIR, file);
    const { path: challengeSpectrumPath, ionMode } =
      await resolvePeaklistPath(challengeName);

    grouped[ionMode]?.push({
      challengeName,
      challengeCandidatesPath,
      challengeSpectrumPath,
      candidatesFile: file,
      ionMode,
    });
  }

  if (testMode) {
    if (grouped.positive.length > 2) {
      grouped.positive = grouped.positive.slice(0, 2);
    }
    if (grouped.negative.length > 2) {
      grouped.negative = grouped.negative.slice(0, 2);
    }
  }

  const aggregatedResults = { positive: [], negative: [] };

  function runTaskInWorker(payload) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('challenger.js', import.meta.url), {
        workerData: payload,
        type: 'module',
      });

      worker.on('message', (msg) => {
        if (msg?.ok) return resolve(msg.result);
        const err = new Error(msg?.error || 'Worker failed');
        if (msg?.stack) err.stack = msg.stack;
        reject(err);
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  async function processGroup(group, outDir) {
    const total = group.length;
    const concurrency = getConcurrency();
    let completed = 0;
    let started = 0;

    const runNext = async () => {
      const idx = started++;
      if (idx >= group.length) return;
      const item = group[idx];
      const progress = `${idx + 1}/${total}`;
      console.log(
        `[Challenger] ${item.challengeName} | mode=${item.ionMode} | ${progress} | elapsed=${fmtElapsed()}`,
      );

      const result = await runTaskInWorker({
        challengeSpectrumPath: item.challengeSpectrumPath,
        challengeCandidatesPath: item.challengeCandidatesPath,
        solutionsPath: SOLUTIONS_PATH,
        challengeName: item.challengeName,
        ionMode: item.ionMode,
        testMode,
      });

      aggregatedResults[item.ionMode].push(result);

      if (allowWrites) {
        const outPath = path.join(outDir, `${item.challengeName}.json`);
        await fs.writeFile(outPath, JSON.stringify(result, null, 2), 'utf-8');
      }

      completed += 1;
      console.log(
        `[Challenger] Finished ${item.challengeName}: rank=${result.correctRank}/${result.totalCandidates}, top1=${result.inTop1}, top5=${result.inTop5}, top10=${result.inTop10} | elapsed=${fmtElapsed()}`,
      );

      await runNext();
    };

    const runners = Array.from(
      { length: Math.min(concurrency, group.length) },
      () => runNext(),
    );

    await Promise.all(runners);
  }

  await processGroup(grouped.positive, RESULTS_POS_DIR);
  await processGroup(grouped.negative, RESULTS_NEG_DIR);

  const summary = {
    positive: computeSummary(aggregatedResults.positive),
    negative: computeSummary(aggregatedResults.negative),
  };

  if (allowWrites) {
    await fs.writeFile(
      path.join(RESULTS_POS_DIR, 'summary.json'),
      JSON.stringify(summary.positive, null, 2),
      'utf-8',
    );
    await fs.writeFile(
      path.join(RESULTS_NEG_DIR, 'summary.json'),
      JSON.stringify(summary.negative, null, 2),
      'utf-8',
    );
  }

  console.log('[Challenger] Summary (positive):', summary.positive);
  console.log('[Challenger] Summary (negative):', summary.negative);

  return { summary, results: aggregatedResults };
}
