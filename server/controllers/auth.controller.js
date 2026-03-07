const Validator = require('../utils/Validator');

class AuthController {
    login = async (req, res, next) => {
        try {
            // Ejemplo de uso del Validator
            const validator = new Validator({
                email: [Validator.required(), Validator.email(), Validator.string({ max: 255 })],
                password: [Validator.required(), Validator.string({ min: 6 })],
                // validate an optional default field to test
                rememberMe: [Validator.default(false)]
            });

            // validate run throws ValidationException si hay errores, la cual será atrapada por catch
            const validData = validator.run(req.body);

            return res.json({
                success: true,
                message: 'Login exitoso (ruta pública validada).',
                token: 'este_es_un_token_jwt_simulado',
                user: { email: validData.email, role: 'admin', rememberMe: validData.rememberMe }
            });
        } catch (error) {
            // Pasamos el error al manejador global (que detectará ValidationException)
            next(error);
        }
    }

    profile = async (req, res) => {
        try {
            return res.json({
                success: true,
                message: 'Perfil de usuario obtenido correctamente. Has pasado por el middleware (ruta privada).',
                user: {
                    name: 'Usuario Test',
                    role: 'Administrador'
                }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al cargar perfil.' });
        }
    }
}

// Expulsamos una instancia de la clase, así en el router puedes usar solo la referencia y conservar el this.
module.exports = new AuthController();
