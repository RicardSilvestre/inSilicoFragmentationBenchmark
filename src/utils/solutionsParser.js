import fs from 'fs/promises';

export default async function solutionsParser(pathToFile) {
  // Read the CSV file
  const fileContent = await fs.readFile(pathToFile, 'utf-8');

  // Split into lines
  const lines = fileContent.trim().split('\n');

  // Skip header line and parse data rows
  const solutions = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line (handle quoted fields)
    const values = parseCSVLine(line);

    if (values.length >= 12) {
      solutions.push({
        SourceFile: values[0],
        ChallengeName: values[1],
        PRECURSOR_MZ: parseFloat(values[2]),
        ION_MODE: values[3].trim(),
        RT: parseFloat(values[4]),
        nPeaks: parseInt(values[5], 10),
        NAME: values[6],
        SMILES: values[7],
        INCHI: values[8],
        INCHIKEY: values[9],
        CSID: values[10],
        PC_CID: values[11],
      });
    }
  }

  return solutions;
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
