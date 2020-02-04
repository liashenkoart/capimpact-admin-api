import { parseFile } from '@fast-csv/parse';
import path from 'path';
import fs from 'fs';

export const parseCsv = (filepath: string, transform = data => data, options = {}) =>
  new Promise(resolve => {
    const data = [];
    let filePath = path.resolve(__dirname, '../../data', filepath);
    if (!fs.existsSync(filePath)) {
      filePath = path.resolve(
        __dirname,
        '../../data',
        filepath
          .split('/')
          .slice(0, -1)
          .concat(['default.csv'])
          .join('/')
      );
    }
    parseFile(filePath, {
      headers: true,
      ignoreEmpty: true,
      trim: true,
      ...options,
    })
      .on('error', error => console.error(error))
      .on('data', row => data.push(row))
      .on('end', () => resolve(transform(data)));
  });
