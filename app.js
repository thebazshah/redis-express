const serverless = require('serverless-http');
const Redis = require("ioredis");
const express = require('express')
var cors = require('cors');
const { json } = require('body-parser');

const app = express()

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://zap.org"
  ],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// const host = "redis-oracle-001.2synia.0001.use2.cache.amazonaws.com"
const host = "redis-oracle-ro.2synia.ng.0001.use2.cache.amazonaws.com"
const port = "6379"

app.get('/', (req, res) => {
  res.send('Zap express-redis api is listening...')
})

app.get('/oracles', async (req, res, next) => {
  const oracles = []
  const redis = new Redis(port, host);
  const oraclesExist = await redis.exists("oracles");
  if (oraclesExist && typeof (oraclesExist) === "number" && oraclesExist === 1) {
    // list of oracle exists
    redis.lrange("oracles", 0, -1).then(oras => {
      if (oras && Array.isArray(oras)) {
        for (const ora of oras) {
          // const oracle = JSON.parse(JSON.parse(ora))
          oracles.push(ora)
        }
        res.json(oracles)
      } else {
        // couldn't find oracles
        res.status(404).send({ message: "Couldn't find list of oracles" })
      }
    }).catch(err => {
      res.status(500).send({ message: "Error in fetching list of oracles " + err })
    })
  } else {
    res.status(404).send({ message: "Couldn't find list of oracles" })
  }
})

module.exports.handler = serverless(app)
