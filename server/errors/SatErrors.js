const { CustomException } = require('./exceptions');

class SatError extends CustomException {
    constructor(userMessage, logMessage = '', statusCode = 500, shouldLog = true) {
        super(userMessage, logMessage, statusCode, shouldLog);
        this.name = this.constructor.name;
    }
}

/** Error cuando el captcha falla o es incorrecto */
class CaptchaError extends SatError {
    constructor(userMessage = 'El captcha es incorrecto o ha expirado.', logMessage = 'Error de validación de captcha en el portal SAT', newCaptcha = null) {
        super(userMessage, logMessage, 400, false);
        this.newCaptcha = newCaptcha;
    }
}

/** Error de autenticación (RFC o CIEC incorrectos) */
class SatAuthError extends SatError {
    constructor(userMessage = 'Las credenciales del SAT son incorrectas.', logMessage = 'Fallo de autenticación: RFC o CIEC inválidos') {
        super(userMessage, logMessage, 401, false);
    }
}

/** Error de navegación o carga de elementos */
class SatNavigationError extends SatError {
    constructor(userMessage, logMessage = '', statusCode = 500) {
        super(userMessage, logMessage || userMessage, statusCode, true);
    }
}

/** Error por tiempos de espera agotados */
class ScrapingTimeoutError extends SatError {
    constructor(userMessage = 'El portal del SAT está tardando demasiado en responder.', logMessage = 'Timeout esperando elementos del DOM') {
        super(userMessage, logMessage, 504, true);
    }
}

module.exports = { 
    SatError, 
    CaptchaError, 
    SatAuthError,
    ScrapingTimeoutError, 
    SatNavigationError 
};