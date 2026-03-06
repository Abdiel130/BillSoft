/**
 * CustomException.js
 * Clase base para estandarizar las excepciones de la aplicación.
 * Permite definir mensajes amigables para el usuario (frontend) y 
 * mensajes técnicos/detallados para el log (backend).
 */
class CustomException extends Error {
    /**
     * @param {string} userMessage - Mensaje amigable que verá el usuario en el frontend.
     * @param {string} logMessage - Detalle técnico del error para el log del backend (opcional).
     * @param {number} statusCode - Código de estado HTTP (ej. 400, 404, 401). Pordefecto 400 (Bad Request).
     * @param {boolean} shouldLog - Indica si este error debe guardarse en el log. Por defecto false para errores controlados.
     */
    constructor(userMessage, logMessage = '', statusCode = 400, shouldLog = false) {
        super(logMessage || userMessage); // Error nativo recibe el msj técnico si existe, sino el de usuario

        this.name = this.constructor.name;
        this.isCustomException = true; // Flag para identificar que nosotros lanzamos este error

        this.userMessage = userMessage;
        this.logMessage = logMessage || userMessage;
        this.statusCode = statusCode;

        // Determinar si debemos loguear (siempre logueamos 500, pero podemos forzar loguear un 400 crítico)
        this.shouldLog = shouldLog || statusCode >= 500;

        Error.captureStackTrace(this, this.constructor);
    }
}

// ---------------------------------------------------------
// Excepciones Derivadas Frecuentes (Para facilitar el tirar errores)
// ---------------------------------------------------------

/** Para Errores de Validación (400) */
class ValidationException extends CustomException {
    constructor(userMessage, logMessage = '') {
        super(userMessage, logMessage, 400, false);
    }
}

/** Para No Autorizado / Sin Sesión (401) */
class UnauthorizedException extends CustomException {
    constructor(userMessage = 'No autorizado.', logMessage = '') {
        super(userMessage, logMessage, 401, false);
    }
}

/** Para Registros No Encontrados (404) */
class NotFoundException extends CustomException {
    constructor(userMessage = 'Registro no encontrado.', logMessage = '') {
        super(userMessage, logMessage, 404, false);
    }
}

/** Para Fallos en Base de Datos u otros externos que Sí o Sí se loguean (500) */
class DatabaseException extends CustomException {
    constructor(userMessage = 'Error interno procesando la solicitud.', logMessage = 'Fallo en la BD o servicio externo.') {
        // Al ser 500, shouldLog es true por defecto en la clase padre
        super(userMessage, logMessage, 500, true);
    }
}

module.exports = {
    CustomException,
    ValidationException,
    UnauthorizedException,
    NotFoundException,
    DatabaseException
};
