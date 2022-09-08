import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import getAccessToken from './utils/accessToken.js'
import marketplaceParticipant from './utils/awsSDK.js'
import { processCSV } from './utils/processCsv.js'

dotenv.config()

const app = express();
app.use(express.json({ limit: '100mb' }))
app.use(bodyParser.json({ limit: '100mb' }));
app.use(cors())

app.get('/aws', async (req, res) => {
  const accessToken = await getAccessToken()
  // console.log()
  const connection = await marketplaceParticipant(accessToken)
  res.json(connection)

  // console.log(JSON.stringify(connection))
  // res.json(accessToken)
}, (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode)
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? null : error.stack
  })
})

app.post('/csv', async (req, res) => {
  const csvItems = req.body.items
  const processedCSV = await processCSV(csvItems)
  res.status(200)
  res.json(processedCSV)
}, (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode)
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? null : error.stack
  })
})

export default app
