const bcrypt = require('bcrypt');
const { db } = require('../index');
const { user } = require('../schema');
const { eq } = require('drizzle-orm');
require('dotenv').config();

async function seed() {
    try {
        const username = 'desarrollo';
        const passwordEnv = process.env.DEV_PASSWORD;

        if (!passwordEnv) {
            console.error('❌ Error: La variable DEV_PASSWORD no está definida en el archivo .env');
            process.exit(1);
        }

        console.log(`🔍 Buscando usuario '${username}'...`);
        const existingUser = await db.select().from(user).where(eq(user.username, username)).limit(1);

        if (existingUser.length > 0) {
            console.log(`⚠️ El usuario '${username}' ya existe. No se realizarán cambios.`);
            process.exit(0);
        }

        console.log(`⏳ Encriptando contraseña y creando usuario '${username}'...`);
        
        // Cifrar la contraseña usando bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordEnv, salt);

        // Insertar en la base de datos
        await db.insert(user).values({
            username: username,
            password: hashedPassword,
            name: 'Admin',
            lastname: 'Desarrollo',
            rol: 1 // Por defecto le asignamos un rol (ej. 1 = Admin)
        });

        console.log('✅ ¡Usuario de desarrollo creado exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al realizar el seed:', error);
        process.exit(1);
    }
}

seed();
