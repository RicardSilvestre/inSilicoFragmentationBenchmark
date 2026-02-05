# inSilicoFragmentationBenchmark

[![NPM version](https://img.shields.io/npm/v/inSilicoFragmentationBenchmark.svg)](https://www.npmjs.com/package/inSilicoFragmentationBenchmark)
[![npm download](https://img.shields.io/npm/dm/inSilicoFragmentationBenchmark.svg)](https://www.npmjs.com/package/inSilicoFragmentationBenchmark)
[![test coverage](https://img.shields.io/codecov/c/github/cheminfo/inSilicoFragmentationBenchmark.svg)](https://codecov.io/gh/cheminfo/inSilicoFragmentationBenchmark)
[![license](https://img.shields.io/npm/l/inSilicoFragmentationBenchmark.svg)](https://github.com/cheminfo/inSilicoFragmentationBenchmark/blob/main/LICENSE)

Benchmark of the in-silico fragmentation tool. Includes utilities to parse challenges, candidates, and solutions, and a multi-core challenger runner.

## Installation

```console
npm install inSilicoFragmentationBenchmark
```

## Quick start

Install dependencies:

```bash
npm install
```

Run the full challenger (processes all challenges, writes per-mode results and summaries):

```bash
npm run challenge
```

Run in test mode (no file writes, limits to two positives and two negatives):

```bash
node -e "import('./src/challenger.js').then(({ default: runChallenger }) => runChallenger({ testMode: true }))"
```

## Concurrency

The challenger uses worker threads and defaults to `cpu/2` concurrent workers. Override via environment variable:

```bash
CHALLENGER_CONCURRENCY=6 npm run challenge
```

## Outputs

- Results per challenge are written to `results/positive/` and `results/negative/`.
- Summaries per mode are written to `results/positive/summary.json` and `results/negative/summary.json`.

## Tests

```bash
npm test
```

## License

[MIT](./LICENSE)
