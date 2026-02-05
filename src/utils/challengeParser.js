import { Spectrum } from 'ms-spectrum';
import fs from 'fs/promises';

export default async function challengeParser(pathToFile) {
  // Read the file content
  const fileContent = await fs.readFile(pathToFile, 'utf-8');

  // Parse the lines and extract X and Y values
  const lines = fileContent.trim().split('\n');
  const x = [];
  const y = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [xValue, yValue] = trimmedLine.split(/\s+/);
      if (xValue && yValue) {
        x.push(parseFloat(xValue));
        y.push(parseFloat(yValue));
      }
    }
  }
  // Create the spectrum with Y and X vectors
  const spectrum = new Spectrum({ y, x });

  return spectrum;
}
