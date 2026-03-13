const jwt = require('jsonwebtoken');
const API = require('../services/response.service');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return API.error(res, 'No autorizado. Se requiere un token de sesión válido.', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (error) {
        return API.error(res, 'No autorizado. La sesión no es válida, no existe o ha expirado.', 401);
    }
};

module.exports = authMiddleware;
