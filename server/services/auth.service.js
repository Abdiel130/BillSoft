const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../db/index');
const { user } = require('../db/schema');
const { eq } = require('drizzle-orm');
const { UnauthorizedException } = require('../errors/exceptions');

class AuthService {
    async login(username, password) {
        // Encontrar al usuario
        const result = await db.select().from(user).where(eq(user.username, username)).limit(1);
        const userRecord = result[0];

        if (!userRecord) throw new UnauthorizedException('Credenciales inválidas.');

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, userRecord.password);

        if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas.');

        // Generar JWT
        const token = jwt.sign(
            { id: userRecord.id, username: userRecord.username, rol: userRecord.rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '8h' }
        );

        // Retornar datos (omitiendo contraseña)
        const { password: _, ...userWithoutPassword } = userRecord;

        return {
            token,
            user: userWithoutPassword
        };
    }
}

module.exports = new AuthService();
