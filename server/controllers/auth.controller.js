class AuthController {
    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            return res.json({
                success: true,
                message: 'Login exitoso (ruta pública validada).',
                token: 'este_es_un_token_jwt_simulado',
                user: { email, role: 'admin' }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
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
