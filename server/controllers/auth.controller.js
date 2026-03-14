const Validator = require('../utils/Validator');
const authService = require('../services/auth.service');
const API = require('../services/response.service');

class AuthController {
    login = async (req, res) => {
        const validator = new Validator({
            username: [Validator.required(), Validator.string({ max: 100 })],
            password: [Validator.required(), Validator.string({ min: 6 })],
            rememberMe: [Validator.default(false)]
        });
        const validData = validator.run(req.body);

        const { token, user } = await authService.login(validData.username, validData.password);

        return API.success(res, 'Login exitoso.', { token, user, rememberMe: validData.rememberMe });
    }

    profile = async (req, res) => {
        return API.success(res, 'Perfil de usuario obtenido correctamente. Has pasado por el middleware (ruta privada).', {
            name: 'Usuario Test',
            role: 'Administrador'
        });
    }
}

// Export a class instance so the router can use just the reference and preserve `this`.
module.exports = new AuthController();
