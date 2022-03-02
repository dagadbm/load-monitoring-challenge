'use strict'

const { test } = require('tap')
const { build } = require('../helper')

test('metrics are returned', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    url: '/metrics/cpu'
  })

  const data = JSON.parse(res.payload);
  t.match(data, { timestamp: /\d/, loadAverage: /\d/ });
})
