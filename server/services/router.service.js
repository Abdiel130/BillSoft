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

    /**
     * Envuelve un handler en el try/catch global de excepciones.
     * @param {Function} action - El handler original (req, res, next)
     * @param {string} method - Método HTTP (para logging)
     * @param {string} fullPath - Ruta completa (para logging)
     * @returns {Function} Handler envuelto
     */
    _wrapHandler(action, method, fullPath) {
        return async (req, res, next) => {
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
    }

    _register(method, path, action, middlewares = []) {
        const fullPath = this.currentPrefix + path;
        const allMiddlewares = [...this.currentMiddlewares, ...middlewares];
        const wrappedAction = this._wrapHandler(action, method, fullPath);

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

    /**
     * Monta un express.Router() externo ENVOLVIENDO cada handler en el try/catch
     * automático de excepciones. Ideal para archivos de rutas tradicionales
     * que quieran beneficiarse del manejo centralizado de errores.
     *
     * @param {string} prefix - Prefijo donde montar las rutas (ej: '/api/products')
     * @param {express.Router} externalRouter - Router de Express exportado desde otro archivo
     * @param {Array} middlewares - Middlewares adicionales a aplicar a todas las rutas
     *
     * @example
     * // products.routes.js
     * const router = express.Router();
     * router.get('/', ProductController.index);
     * router.post('/', ProductController.store);
     * module.exports = router;
     *
     * // web.js
     * const productRoutes = require('./products.routes');
     * Route.useRouter('/api/products', productRoutes);
     */
    useRouter(prefix, externalRouter, middlewares = []) {
        const fullPrefix = this.currentPrefix + prefix;
        const allMiddlewares = [...this.currentMiddlewares, ...middlewares];

        // Recorremos cada layer (ruta) registrada en el router externo
        externalRouter.stack.forEach(layer => {
            if (layer.route) {
                const routePath = layer.route.path;

                // Cada ruta puede tener múltiples métodos (get, post, etc.)
                Object.keys(layer.route.methods).forEach(method => {
                    // Obtenemos los handlers originales de esta ruta+método
                    const handlers = layer.route.stack
                        .filter(s => s.method === method || !s.method)
                        .map(s => s.handle);

                    // El último handler es el action principal, los anteriores son middlewares de ruta
                    const routeMiddlewares = handlers.slice(0, -1);
                    const action = handlers[handlers.length - 1];

                    const wrappedFullPath = fullPrefix + routePath;
                    const wrappedAction = this._wrapHandler(action, method, wrappedFullPath);

                    this.router[method](
                        wrappedFullPath,
                        ...allMiddlewares,
                        ...routeMiddlewares,
                        wrappedAction
                    );
                });
            }
        });
    }

    /**
     * Monta un express.Router() externo SIN wrapping de excepciones.
     * Útil cuando el router ya tiene su propio manejo de errores o
     * es de un paquete de terceros.
     *
     * @param {string} prefix - Prefijo donde montar las rutas
     * @param {express.Router} externalRouter - Router de Express
     * @param {Array} middlewares - Middlewares adicionales
     */
    mount(prefix, externalRouter, middlewares = []) {
        const fullPrefix = this.currentPrefix + prefix;
        const allMiddlewares = [...this.currentMiddlewares, ...middlewares];

        if (allMiddlewares.length > 0) {
            this.router.use(fullPrefix, ...allMiddlewares, externalRouter);
        } else {
            this.router.use(fullPrefix, externalRouter);
        }
    }

    export() {
        return this.router;
    }
}

module.exports = new RouterService();
