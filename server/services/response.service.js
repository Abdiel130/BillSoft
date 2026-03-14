class API {
    /**
     * Respuesta Exitosan (2xx).
     * @param {Object} res - Express response object
     * @param {string} message - Mensaje para el Frontend
     * @param {any} data - Data a retornar (opcional)
     * @param {number} statusCode - Código HTTP (Por defecto 200)
     */
    static success(res, message, data = null, statusCode = 200) {
        const responseData = {
            success: true,
            message: message
        };

        // Solo agremos a 'data' de la respuesta si mandan datos
        if (data !== undefined && data !== null) {
            responseData.data = data;
        }

        return res.status(statusCode).json(responseData);
    }

    /**
     * Respuesta de Error Estándar.
     * @param {Object} res - Express response object
     * @param {string} message - Mensaje de error para el Frontend
     * @param {number} statusCode - Código de Error HTTP
     * @param {any} data - Data adicional del error (opcional)
     */
    static error(res, message, statusCode = 400, data = null) {
        const responseData = {
            success: false,
            message: message
        };

        if (data !== undefined && data !== null) {
            responseData.data = data;
        }

        return res.status(statusCode).json(responseData);
    }

    // Sugar Sintax (Atajos rápidos) para Success:
    static created(res, message, data = null) {
        return this.success(res, message, data, 201);
    }
}

module.exports = API;
