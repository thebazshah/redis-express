const express = require('express')
var cors = require('cors')

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

const port = 5000

const redis_host = "127.0.0.1"
const Redis = require("ioredis");
const redis = new Redis(redis_host);

app.get('/', (req, res) => {
  res.send('Zap express-redis api is running...')
})

app.get('/oracles', function (req, res, next) {
  let oracles = [];

  redis.watch("oracles", err => {
    if (err) {
      throw err;
    } else {
      redis.get("oracles", (err, result) => {
        if (err) {
          throw err;
        } else {
          oracles = JSON.parse(result);
          res.json(oracles)
        }
      });
    }
  });
})

app.post("/oracles", function(req, res, next) {
  const oracles = req.body
  console.log(oracles)
  if (oracles !== null || Array.isArray(oracles)) {
    redis.set("oracles", JSON.stringify(oracles)).then(result => {
      console.log("Save oracle result: ", result);
      if (result === "OK") {
        return res.json({ result: "success" });
      } else {
        return { result: "failure" };
      }
    });
  } else {
    return false;
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
