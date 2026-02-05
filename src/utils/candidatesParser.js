import fs from 'fs/promises';

export default async function candidatesParser(pathToFile) {
  // Read the CSV file
  const fileContent = await fs.readFile(pathToFile, 'utf-8');

  // Split into lines
  const lines = fileContent.trim().split('\n');

  // Skip header line and parse data rows
  const candidates = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line (handle quoted fields)
    const values = parseCSVLine(line);

    if (values.length >= 7) {
      candidates.push({
        Identifier: values[0],
        CompoundName: values[1],
        MonoisotopicMass: parseFloat(values[2]),
        MolecularFormula: values[3],
        SMILES: values[4],
        InChI: values[5],
        InChIKey: values[6],
      });
    }
  }

  return candidates;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last value
  values.push(current);

  return values;
}
