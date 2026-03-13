const { db } = require('./db/index');
const { user } = require('./db/schema');
const { eq } = require('drizzle-orm');

async function test() {
    try {
        console.log('Testing connection...');
        const result = await db.select().from(user).where(eq(user.username, 'test')).limit(1);
        console.log('Result:', result);
    } catch (err) {
        console.error('Test error:', err);
        console.error('Cause:', err.cause);
    }
    process.exit(0);
}
test();
