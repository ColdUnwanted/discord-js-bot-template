const pino = require("pino");
const pretty = require("pino-pretty");

const stream = pretty({
  translateTime: "SYS:yyyy-mm-dd hh:MM:ss.l TT",
  colorize: true,
  ignore: "pid,hostname",
});

const logger = pino(
  {
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  stream,
);

module.exports = logger;
