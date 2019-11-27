import csv from 'fast-csv';
import path from 'path';

export const parseCsv = (filepath: string, transform = data => data, options = {}) =>
  new Promise(resolve => {
    const data = [];
    csv
      .parseFile(path.resolve(__dirname, '../../data', filepath), {
        headers: true,
        ignoreEmpty: true,
        trim: true,
        ...options,
      })
      .on('error', error => console.error(error))
      .on('data', row => data.push(row))
      .on('end', () => resolve(transform(data)));
  });
