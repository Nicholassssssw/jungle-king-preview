import { choosePrediction } from './pipeline.js?v=20261108';
import { recognitionOptions } from './site-config.js?v=20261108';

export const backgroundLabels = new Set(['other', 'background', 'unknown', 'none', 'empty']);

// Validate the complete label set before replacing a working model.
export function modelPieces(labels, labelMap) {
  if (!Array.isArray(labels) || labels.some(label => typeof label !== 'string' || !label.trim())) throw new Error('Model metadata needs non-empty class labels.');
  const names = labels.map(label => label.trim().toLowerCase());
  if (new Set(names).size !== names.length) throw new Error('Model labels must be unique.');
  if (!names.some(name => backgroundLabels.has(name))) throw new Error('Include an other/background class to reject empty scenes.');
  const unknown = names.filter(name => !backgroundLabels.has(name) && !labelMap.has(name));
  if (unknown.length) throw new Error(`No animal story matches: ${unknown.join(', ')}. Update the label mapping first.`);
  const ids = [...new Set(names.filter(name => !backgroundLabels.has(name)).map(name => labelMap.get(name)))];
  if (!ids.length) throw new Error('The model needs at least one mapped animal.');
  return ids;
}

export function recognize(predictions, labelMap, options = recognitionOptions) {
  if (!Number.isFinite(options.threshold) || options.threshold < 0.5 || options.threshold > 1 || !Number.isFinite(options.margin) || options.margin < 0 || options.margin > 1) throw new Error('Use a score from 0.5 to 1 and a margin from 0 to 1.');
  return choosePrediction(predictions, labelMap, options.threshold, options.margin);
}

export function summarizeTests(rows) {
  const animals = rows.filter(row => row.expected !== 'other');
  const background = rows.filter(row => row.expected === 'other');
  return {
    total: rows.length,
    correct: animals.filter(row => row.actual === row.expected).length,
    missed: animals.filter(row => row.actual === 'other').length,
    wrong: animals.filter(row => row.actual !== 'other' && row.actual !== row.expected).length,
    falseMatches: background.filter(row => row.actual !== 'other').length,
    background: background.length,
  };
}

export function reportCsv(rows) {
  const columns = ['file', 'expected', 'actual', 'topLabel', 'score', 'threshold', 'margin', 'modelName', 'exportedAt', 'testedAt'];
  // Keep photo filenames safe when opening the downloaded report in a spreadsheet.
  const cell = value => `"${String(value ?? '').replace(/^[ \t\r\n]*[=+@-]/, "'$&").replaceAll('"', '""')}"`;
  return [columns.join(','), ...rows.map(row => columns.map(key => cell(row[key])).join(','))].join('\r\n');
}
