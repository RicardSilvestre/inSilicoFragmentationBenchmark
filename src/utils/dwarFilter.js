/**
 * Utility to parse and filter a DataWarrior (DWAR) file per ionization label.
 *
 * The DWAR format is a tab-separated text file with a header section,
 * column properties section, data rows, and trailing metadata. The data
 * rows include a `label`, `kind`, and `mode` column. Ionization rows have
 * labels like `Ionization-H`, `Ionization-Na`, `Ionization-K`, `Ionization-Radical`.
 *
 * This module exposes:
 * - {@link getIonizationLabels} — discover which ionization labels exist
 *   in a DWAR string for a given mode.
 * - {@link filterDwarByIonization} — return a copy of the DWAR keeping
 *   only one ionization label (other ionization rows are removed).
 *
 * Adapted from the example/ folder's filterDwarIonization.ts pattern.
 */

// ── DWAR parsing helpers ────────────────────────────────────────────────

/**
 * Split a DWAR string into its three logical parts:
 * 1. Everything before the data rows (header + column properties + column names).
 * 2. The data rows themselves.
 * 3. Everything after the data rows (hitlist data, datawarrior properties …).
 * @param {string} dwar - Raw DWAR file content as a string.
 * @returns {{ columnNames: string[], preamble: string, rows: string[], epilogue: string }}
 */
function splitDwar(dwar) {
  const lines = dwar.split('\n');

  // Find the end of <column properties> block and start of data rows.
  let dataStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]?.startsWith('</column properties>')) {
      dataStart = i + 1;
      break;
    }
  }
  if (dataStart === -1) {
    throw new Error('Could not find </column properties> in DWAR');
  }

  // The first data line is the column header row.
  const headerLine = lines[dataStart];
  if (!headerLine) {
    throw new Error('Missing column header row in DWAR');
  }
  const columnNames = headerLine.split('\t');

  // Find the end of data rows: first line starting with '<' after header.
  let dataEnd = lines.length;
  for (let i = dataStart + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line?.startsWith('<')) {
      dataEnd = i;
      break;
    }
  }

  const preamble = lines.slice(0, dataStart + 1).join('\n'); // includes column header
  const rows = lines.slice(dataStart + 1, dataEnd);
  const epilogue = lines.slice(dataEnd).join('\n');

  return { columnNames, preamble, rows, epilogue };
}

/**
 * Parse a single tab-separated DWAR data row into a record using the
 * provided column names.
 * @param {string} row - A single tab-separated data row.
 * @param {string[]} columnNames - Column names from the DWAR header.
 * @returns {Record<string, string>}
 */
function parseRow(row, columnNames) {
  const values = row.split('\t');
  const record = {};
  for (let i = 0; i < columnNames.length; i++) {
    const name = columnNames[i];
    if (name !== undefined) {
      record[name] = values[i] ?? '';
    }
  }
  return record;
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Discover all distinct ionization labels present in a DWAR for a given mode.
 *
 * Scans data rows where `kind === 'ionization'` and `mode` contains the
 * specified mode string, collecting unique `label` values
 * (e.g. `Ionization-H`, `Ionization-Na`).
 * @param {string} dwar - Raw DWAR file content as a string.
 * @param {'positive' | 'negative'} mode - The ionization mode to filter for.
 * @returns {string[]} Array of ionization label strings found.
 */
export function getIonizationLabels(dwar, mode = 'positive') {
  const { columnNames, rows } = splitDwar(dwar);
  const labels = new Set();

  for (const row of rows) {
    if (row.trim() === '') continue;
    const record = parseRow(row, columnNames);
    if (
      record.kind === 'ionization' &&
      record.mode?.includes(mode) &&
      record.label
    ) {
      labels.add(record.label);
    }
  }

  return [...labels];
}

/**
 * Return a copy of the DWAR keeping only one specific ionization label.
 *
 * All ionization rows whose `label` does **not** match the given
 * `keepLabel` are removed. Non-ionization rows (reactions) are left untouched.
 * The `<rowcount>` in the header is updated to reflect the new count.
 * @param {string} dwar - Raw DWAR file content as a string.
 * @param {string} keepLabel - The ionization label to keep (e.g. `'Ionization-H'`).
 * @returns {string} A new DWAR string with only the specified ionization.
 */
export function filterDwarByIonization(dwar, keepLabel) {
  const { columnNames, preamble, rows, epilogue } = splitDwar(dwar);

  const filteredRows = rows.filter((row) => {
    if (row.trim() === '') return false;
    const record = parseRow(row, columnNames);
    // Keep all non-ionization rows, and only the matching ionization row.
    if (record.kind === 'ionization') {
      return record.label === keepLabel;
    }
    return true;
  });

  // Update the rowcount in the preamble.
  const updatedPreamble = preamble.replace(
    /<rowcount="\d+">/,
    `<rowcount="${String(filteredRows.length)}">`,
  );

  return [updatedPreamble, ...filteredRows, epilogue].join('\n');
}
