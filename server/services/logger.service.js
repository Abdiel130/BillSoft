const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

/**
 * LogService utilizando Winston.
 * Centraliza y estandariza cómo se guardan los errores del sistema.
 */

// Formato personalizado para los logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // Extraer el StackTrace
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        if (stack) {
            logMessage += `\nStackTrace: ${stack}`;
        }
        if (Object.keys(meta).length) {
            logMessage += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
        }
        return logMessage;
    })
);

// Configuración de los Transportes (A donde va el log)
const transports = [
    // 1. Mostrar Errores en la Consola (Con colores)
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            logFormat
        )
    }),

    // 2. Guardar errores en un archivo general
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
        format: logFormat
    }),

    // 3. Guardar todo lo demás (info, warn) en otro combinando
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/combined.log'),
        format: logFormat
    })
];

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    transports: transports
});

class Logger {
    /**
     * Registra un error grave o controlado.
     * @param {string} message - Mensaje técnico del sistema
     * @param {Object|Error} meta - Objeto de error nativo u objetos adicionales
     */
    static error(message, meta = {}) {
        logger.error(message, meta);
    }

    /**
     * Registra información relevante.
     */
    static info(message, meta = {}) {
        logger.info(message, meta);
    }
}

module.exports = Logger;
