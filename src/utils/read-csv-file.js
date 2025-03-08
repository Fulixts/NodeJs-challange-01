import csv from 'csv-parser'
import { createReadStream } from 'node:fs'

export function readCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = []

    createReadStream(filePath)
      .pipe(
        csv({
          headers: false,
          skipLines: 1,
        }),
      )
      .on('data', (row) => {
        results.push(row)
      })
      .on('end', () => {
        resolve(results)
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}
