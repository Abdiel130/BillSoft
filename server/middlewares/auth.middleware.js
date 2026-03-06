const authMiddleware = (req, res, next) => {
    // TODO: Implementar la lógica de validación de sesión o token (ej. JWT)
    console.log('[AuthMiddleware] Verificando acceso a ruta privada protegida:', req.path);

    const isAuthenticated = true;

    if (isAuthenticated) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: 'No autorizado. La sesión no es válida, no existe o ha expirado.'
    });
};

module.exports = authMiddleware;
