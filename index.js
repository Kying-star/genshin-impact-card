const express = require('express')
const compression = require('compression')
const pino = require('pino');
const cache = require('./utils/cache')
const userInfo = require('./userInfo')
const svg = require('./utils/svg')

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const app = express()
app.use(compression())

app.get('/:skin/:uid', cache(60 * 60), (req, res) => {
  const { skin, uid } = req.params
  logger.info('收到请求 uid:%s, skin:%s', uid, skin)

  userInfo(uid)
    .then(data => {
      svg({ data, skin })
        .then(svgImage => {
          res.set({
            'content-type': 'image/svg+xml',
            'cache-control': 'max-age=3600'
          })

          res.send(svgImage)
        })
    })
    .catch(err => {
      res.json({
        msg: err,
        code: -1
      })
    })

})

app.get('/heart-beat', (req, res) => {
  res.set({
    'cache-control': 'max-age=0, no-cache, no-store, must-revalidate'
  })

  res.json({
    msg: 'alive',
    code: 0
  })

  logger.info('heart-beat')
});

const listener = app.listen(3000, () => {
  logger.info('Your app is listening on port ' + listener.address().port)
})