const { ValidationException } = require('./exceptions');

/**
 * Servicio Validator
 * Basado en los principios SOLID (Single Responsibility, Open/Closed principles, Dependency Inversion)
 * Se encarga de evaluar un esquema de validación contra un conjunto de datos (ej. req.body)
 * 
 * Uso:
 * const validator = new Validator({
 *   email: [Validator.string({min: 5, max: 100}), Validator.required(), Validator.email()]
 * });
 * const validData = validator.run(req.body); // Lanza ValidationException si falla.
 */
class Validator {
    /**
     * Inicializa el validador con un esquema de reglas
     * @param {Object} schema Esquema de validación
     */
    constructor(schema) {
        this.schema = schema;
        this.errors = {};
        this.validatedData = {};
    }
    /**
     * Regla que hace que un campo sea obligatorio
     */
    static required() {
        return (value, key) => {
            if (value === undefined || value === null || value === '') {
                return `El campo '${key}' es requerido.`;
            }
            return null;
        };
    }

    /**
     * Regla que valida si un campo es de tipo string y su tamaño
     */
    static string(options = {}) {
        return (value, key) => {
            if (value !== undefined && value !== null && value !== '') {
                if (typeof value !== 'string') {
                    return `El campo '${key}' debe ser de tipo texto.`;
                }
                if (options.min !== undefined && value.length < options.min) {
                    return `El campo '${key}' debe tener al menos ${options.min} caracteres.`;
                }
                if (options.max !== undefined && value.length > options.max) {
                    return `El campo '${key}' no debe superar los ${options.max} caracteres.`;
                }
            }
            return null;
        };
    }

    /**
     * Regla para validar formato de email
     */
    static email() {
        return (value, key) => {
            if (value !== undefined && value !== null && value !== '') {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!regex.test(value)) {
                    return `El campo '${key}' debe ser un email válido.`;
                }
            }
            return null;
        };
    }

    /**
     * Regla que establece un valor por defecto si no existe (no genera error)
     */
    static default(defaultValue) {
        return (value) => {
            if (value === undefined || value === null || value === '') {
                return { type: 'DEFAULT_VALUE', value: defaultValue };
            }
            return null;
        };
    }

    /**
     * Regla que valida si un campo es un número válido (acepta números y strings numéricos)
     * Opciones: min, max (representan los límites de valor numérico, no su tamaño en caracteres)
     */
    static numeric(options = {}) {
        return (value, key) => {
            if (value !== undefined && value !== null && value !== '') {
                const numericValue = Number(value);
                if (isNaN(numericValue)) {
                    return `El campo '${key}' debe ser un número válido.`;
                }
                if (options.min !== undefined && numericValue < options.min) {
                    return `El campo '${key}' debe ser mayor o igual a ${options.min}.`;
                }
                if (options.max !== undefined && numericValue > options.max) {
                    return `El campo '${key}' debe ser menor o igual a ${options.max}.`;
                }
            }
            return null;
        };
    }

    /**
     * Regla que valida si un campo es booleano. (Acepta true, false, 'true', 'false', 1, 0)
     */
    static boolean() {
        return (value, key) => {
            if (value !== undefined && value !== null && value !== '') {
                const isValid = typeof value === 'boolean' ||
                    ['true', 'false', '1', '0', 1, 0].includes(value);
                if (!isValid) {
                    return `El campo '${key}' debe ser un booleano verdadero o falso válido.`;
                }
            }
            return null;
        };
    }

    /**
     * Regla que verifica si un valor coincide exactamente con una expresión regular dada
     * Sirve para patrones custom, rfc, curp, contraseñas que requieren mayúscula, etc.
     */
    static regex(pattern, customMessage) {
        return (value, key) => {
            if (value !== undefined && value !== null && value !== '') {
                if (!pattern.test(value)) {
                    return customMessage || `El campo '${key}' no tiene un formato válido.`;
                }
            }
            return null;
        };
    }

    /**
     * Regla que valída si el campo es un arreglo, opcionalmente su tamaño
     */
    static array(options = {}) {
        return (value, key) => {
            if (value !== undefined && value !== null && value !== '') {
                if (!Array.isArray(value)) {
                    return `El campo '${key}' debe ser una lista o arreglo.`;
                }
                if (options.min !== undefined && value.length < options.min) {
                    return `La lista del campo '${key}' debe contener al menos ${options.min} elementos.`;
                }
                if (options.max !== undefined && value.length > options.max) {
                    return `La lista del campo '${key}' no debe superar los ${options.max} elementos.`;
                }
            }
            return null;
        };
    }

    /**
     * Regla que valida que el valor se encuentre dentro de una lista de opciones declaradas
     */
    static inList(allowedValues = []) {
        return (value, key) => {
            if (value !== undefined && value !== null && value !== '') {
                if (!allowedValues.includes(value)) {
                    return `El campo '${key}' debe ser uno de los opciones permitidas: ${allowedValues.join(', ')}.`;
                }
            }
            return null;
        };
    }

    /**
     * Regla que valida que el valor sea una fecha válida (formato parseable por Date)
     */
    static date() {
        return (value, key) => {
            if (value !== undefined && value !== null && value !== '') {
                const dateObj = new Date(value);
                if (isNaN(dateObj.getTime())) {
                    return `El campo '${key}' debe ser una fecha válida.`;
                }
            }
            return null;
        };
    }

    /**
     * Regla para validaciones cruzadas: Fuerza a que el campo coincida en valor con otro del mismo schema.
     * Muy útil para campos de "confirmar contraseñas" ej. Validator.match('password')
     */
    static match(otherField, fieldNameCustom) {
        return (value, key, payload) => {
            if (value !== undefined && value !== null && value !== '') {
                if (value !== payload[otherField]) {
                    const matchName = fieldNameCustom || otherField;
                    return `El campo '${key}' no coincide con el valor del campo '${matchName}'.`;
                }
            }
            return null;
        };
    }

    /**
     * Regla que verifica si el valor cumple con una estructura de UUID válida
     */
    static uuid() {
        return (value, key) => {
            if (value !== undefined && value !== null && value !== '') {
                const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!regex.test(value)) {
                    return `El campo '${key}' debe ser un identificador (UUID) válido.`;
                }
            }
            return null;
        };
    }

    /**
     * Regla que valida que el campo sea un objeto estructural válido JSON (no un array ni un escalar)
     */
    static object() {
        return (value, key) => {
            if (value !== undefined && value !== null && value !== '') {
                if (typeof value !== 'object' || Array.isArray(value)) {
                    return `El campo '${key}' debe ser un objeto estructurado válido.`;
                }
            }
            return null;
        };
    }

    /**
     * Inicia la validación de los datos y retorna los datos validados o un error.
     * @param {Object} data Datos a evaluar (ej. req.body o req.query)
     * @returns {Object} Los datos validados (con los default si aplican)
     */
    run(data = {}) {
        this.errors = {};
        this.validatedData = {};

        for (const [key, rules] of Object.entries(this.schema)) {
            // Soporta tanto array simple: [r1, r2] como arreglo bidimensional accidental: [[r1, r2]]
            const validations = Array.isArray(rules[0]) ? rules[0] : rules;

            let val = data[key];
            let fieldErrors = [];

            for (const rule of validations) {
                // Se invoca la función validadora (inyectamos value, nombre del campo y todo el payload para validar cruces)
                const result = rule(val, key, data);

                if (result) {
                    if (result.type === 'DEFAULT_VALUE') {
                        val = result.value;
                    } else if (typeof result === 'string') {
                        fieldErrors.push(result);
                    }
                }
            }

            if (fieldErrors.length > 0) {
                this.errors[key] = fieldErrors;
            } else {
                this.validatedData[key] = val; // Solo se guardan los datos declarados en el schema evitando inyección de campos
            }
        }

        if (Object.keys(this.errors).length > 0) {
            throw new ValidationException('Errores de validación en la estructura de la petición.', this.errors);
        }

        return this.validatedData;
    }
}

module.exports = Validator;
