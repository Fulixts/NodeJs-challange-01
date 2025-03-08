/* eslint-disable camelcase */
import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'
import { readCsvFile } from './utils/read-csv-file.js'
import { createWriteStream } from 'node:fs'
import { unlink } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const Busboy = require('busboy')

const db = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: async (req, res) => {
      const tasks = db.select('tasks')

      return res.end(JSON.stringify(tasks))
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: async (req, res) => {
      const { title, description } = req.body

      if (!description || !title) {
        return res
          .writeHead(400, { 'content-Type': 'application/json' })
          .end(JSON.stringify({ error: 'Title and description are required' }))
      }
      const timeNow = Date.now()

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_At: null,
        created_At: new Date(timeNow).toString(),
        updated_At: new Date(timeNow).toString(),
      }

      db.insert('tasks', task)

      return res.writeHead(201).end()
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks/import'),
    handler: async (req, res) => {
      if (!req.headers['content-type']?.includes('multipart/form-data')) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(
          JSON.stringify({ error: 'Content-Type must be multipart/form-data' }),
        )
      }

      const busboy = Busboy({ headers: req.headers })
      let filePath

      busboy.on('file', (fieldname, file, info) => {
        // Desestruture o objeto info:
        const { filename } = info

        // Agora filename é de fato uma string
        filePath = `./tmp/${randomUUID()}-${filename}`

        const writeStream = createWriteStream(filePath)
        file.pipe(writeStream)
      })

      busboy.on('finish', async () => {
        if (!filePath) {
          res.writeHead(400)
          return res.end('Nenhum arquivo foi enviado')
        }

        try {
          const dataRows = await readCsvFile(filePath)

          for (const row of dataRows) {
            const title = row['0']
            const description = row['1']

            if (!title || !description) {
              continue
            }

            const timeNow = Date.now()
            const task = {
              id: randomUUID(),
              title,
              description,
              completed_At: null,
              created_At: new Date(timeNow).toISOString(),
              updated_At: new Date(timeNow).toISOString(),
            }

            db.insert('tasks', task)
          }

          await unlink(filePath)

          res.writeHead(200, { 'Content-Type': 'application/json' })
          return res.end(
            JSON.stringify({ message: 'CSV importado com sucesso!' }),
          )
        } catch (err) {
          console.error(err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({ error: 'Erro ao processar CSV' }))
        }
      })

      return req.pipe(busboy)
    },
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: async (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      if (!description || !title) {
        return res
          .writeHead(400, { 'content-Type': 'application/json' })
          .end(JSON.stringify({ error: 'Title and description are required' }))
      }

      const getTasks = db.select('tasks')
      const taskExists = getTasks.find((task) => task.id === id)
      if (!taskExists) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        return res.end(
          JSON.stringify({ error: `Task with id ${id} does not exist` }),
        )
      }

      const timeNow = Date.now()

      const task = {
        title,
        description,
        updated_At: new Date(timeNow).toString(),
      }
      db.update('tasks', id, task)

      return res.writeHead(204).end()
    },
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: async (req, res) => {
      const { id } = req.params

      const getTasks = db.select('tasks')
      const taskExists = getTasks.find((task) => task.id === id)
      if (!taskExists) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        return res.end(
          JSON.stringify({ error: `Task with id ${id} does not exist` }),
        )
      }

      db.delete('tasks', id)

      return res.writeHead(204).end()
    },
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id'),
    handler: async (req, res) => {
      const { id } = req.params

      const getTasks = db.select('tasks')
      const taskExists = getTasks.find((task) => task.id === id)
      if (!taskExists) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        return res.end(
          JSON.stringify({ error: `Task with id ${id} does not exist` }),
        )
      }

      const timeNow = Date.now()

      const task = {
        completed_At: new Date(timeNow).toString(),
        updated_At: new Date(timeNow).toString(),
      }
      db.update('tasks', id, task)

      return res.writeHead(204).end()
    },
  },
]
