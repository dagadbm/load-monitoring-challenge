'use strict'
const os = require('os');

module.exports = async function (fastify, opts) {
  fastify.get('/cpu', async function (request, reply) {
    const cpus = os.cpus().length;
    const cpusAvg = os.loadavg();
    const loadAverage = cpusAvg[0] / cpus;
    const now = new Date();
    return { 
      utc: now.toUTCString(),
      iso: now.toISOString(),
      cpusAvg,
      loadAverage,
    };
  })
}
