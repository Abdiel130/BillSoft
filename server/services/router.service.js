const express = require('express');
const Logger = require('./logger.service');
const API = require('./response.service');

/**
 * RouterService
 * Actúa como una fachada legible para agrupar y definir rutas de manera ágil,
 * fuertemente inspirado en el sistema de enrutamiento de Laravel.
 */
class RouterService {
    constructor() {
        this.router = express.Router();
        this.currentPrefix = '';
        this.currentMiddlewares = [];
    }

    /**
     * Agrupa rutas bajo un prefijo o middlewares compartidos.
     * @param {Object} options - Opciones como { prefix: '/ruta', middlewares: [mid1] }
     * @param {Function} callback - Función que contiene las definiciones de rutas
     */
    group(options, callback) {
        const previousPrefix = this.currentPrefix;
        const previousMiddlewares = [...this.currentMiddlewares];

        if (options.prefix) {
            this.currentPrefix += options.prefix;
        }
        if (options.middlewares) {
            this.currentMiddlewares = this.currentMiddlewares.concat(options.middlewares);
        }

        callback();

        this.currentPrefix = previousPrefix;
        this.currentMiddlewares = previousMiddlewares;
    }

    _register(method, path, action, middlewares = []) {
        const fullPath = this.currentPrefix + path;
        const allMiddlewares = [...this.currentMiddlewares, ...middlewares];

        // Ejecutamos la función de la ruta envolviéndola en un try/catch global
        const wrappedAction = async (req, res, next) => {
            try {
                await action(req, res, next);
            } catch (error) {
                // ==========================================
                // MANEJADOR GLOBAL DE EXCEPCIONES EN RUTAS
                // ==========================================

                // 1. ¿Es una excepción controlada (Nuestra clase CustomException/ValidationException etc)?
                if (error.isCustomException) {

                    // ¿Debemos loguearlo? (Ej. es un error 500 DB, o forzamos un logeo de un 400 importante)
                    if (error.shouldLog) {
                        Logger.error(`[CONTROLLED] ${error.logMessage} en ${method.toUpperCase()} ${fullPath}`, {
                            userMessage: error.userMessage,
                            stack: error.stack
                        });
                    }

                    // Respondemos estandarizado al FrontEnd con el mensaje de usuario.
                    if (!res.headersSent) {
                        return API.error(res, error.userMessage, error.statusCode);
                    }
                }

                // 2. Es una excepción Nativa / No controlada (Ej. null reference, TypeError, syntax errors...)
                else {
                    // SIEMPRE que falle el código nativamente (No controlado), es Crítico y se debe loguear fuerte.
                    Logger.error(`[UNHANDLED FATAL] Falla en ${method.toUpperCase()} ${fullPath}`, {
                        errorMessage: error.message,
                        stack: error.stack
                    });

                    // Mensaje genérico para no exponer la estructura interna en el Front.
                    if (!res.headersSent) {
                        return API.error(res, 'Ocurrió un error interno en el servidor.', 500);
                    }
                }
            }
        };

        this.router[method](fullPath, ...allMiddlewares, wrappedAction);
    }

    // Al recibir el 'action' directamente se asegura el autocompletado en IDEs
    get(path, action, middlewares = []) { this._register('get', path, action, middlewares); }
    post(path, action, middlewares = []) { this._register('post', path, action, middlewares); }
    put(path, action, middlewares = []) { this._register('put', path, action, middlewares); }
    delete(path, action, middlewares = []) { this._register('delete', path, action, middlewares); }

    /**
     * Define dinámicamente: index, show, store, update y destroy
     * API Resource recibe la instancia entera del Controlador
     */
    apiResource(path, Controller, middlewares = []) {
        if (typeof Controller.index === 'function') this.get(path, Controller.index, middlewares);
        if (typeof Controller.store === 'function') this.post(path, Controller.store, middlewares);
        if (typeof Controller.show === 'function') this.get(`${path}/:id`, Controller.show, middlewares);
        if (typeof Controller.update === 'function') this.put(`${path}/:id`, Controller.update, middlewares);
        if (typeof Controller.destroy === 'function') this.delete(`${path}/:id`, Controller.destroy, middlewares);
    }

    export() {
        return this.router;
    }
}

module.exports = new RouterService();
