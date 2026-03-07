const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
const { migrate } = require('drizzle-orm/mysql2/migrator');
require('dotenv').config();

async function runMigrations() {
    console.log('Running migrations...');

    // Create a dedicated standalone connection for migrations
    const poolConnection = mysql.createPool({
        uri: process.env.DATABASE_URL,
        connectionLimit: 1
    });

    const db = drizzle(poolConnection);

    try {
        // Run the migrations generated in the "drizzle" folder
        await migrate(db, { migrationsFolder: './drizzle' });
        console.log('Migrations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        // Ensure the connection is closed after completing the process
        await poolConnection.end();
    }
}

runMigrations();
