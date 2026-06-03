const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

const LOGS_PATH = process.env.LOGS_PATH || path.join(__dirname, 'logs');
fs.ensureDirSync(LOGS_PATH);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) =>
      `[${timestamp}] ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(LOGS_PATH, 'orquestador.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;
