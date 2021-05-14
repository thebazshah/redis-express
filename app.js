const serverless = require('serverless-http');
const Redis = require("ioredis");
const express = require('express')
const { json } = require('body-parser');

const app = express()

var origins = [
  'http://localhost:3000',
  'https://zap.org'
]

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// const host = "redis-oracle-001.2synia.0001.use2.cache.amazonaws.com"
const host = "redis-oracle-ro.2synia.ng.0001.use2.cache.amazonaws.com"
const port = "6379"

app.all("/oracles", (req, res, next) => {
  const orig = req.get('origin');
  if (origins.indexOf(orig) >= 0) {
    res.set("Access-Control-Allow-Origin", orig);
  } else {
    res.set("Access-Control-Allow-Origin", "https://zap.org");
  }
  res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.set("Access-Control-Allow-Credentials", true);
  res.set("Access-Control-Allow-Headers", "Authorization");
  next()
})

app.get('/', (req, res) => {
  res.send('Zap express-redis api is listening...')
})

app.get('/oracles', async (req, res, next) => {
  const oracles = []
  const redis = new Redis(port, host);
  const oraclesExist = await redis.exists("oracles");
  if (oraclesExist && typeof (oraclesExist) === "number" && oraclesExist === 1) {
    // list of oracle exists
    redis.lrange("oracles", 0, 1999).then(oras => {
      console.log("Total oracles", oras.length)
      if (oras && Array.isArray(oras)) {
        for (const ora of oras) {
          try {
            const oraJson = JSON.parse(JSON.stringify(ora));
            oracles.push(oraJson)
          } catch (e) {
            console.log("Oracle object is not JSON parseable", e)
          }
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
