const { v4: uuidv4 } = require('uuid');

class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.EXPIRATION_TIME = (process.env.SAT_SESSION_EXPIRATION || 1200) * 1000;

    }

    createSession(scraperInstance) {
        const sessionId = uuidv4();
        
        const timeoutId = setTimeout(async () => {
            console.log(`Expiring session ${sessionId}...`);
            await scraperInstance.close();
            this.sessions.delete(sessionId);
        }, this.EXPIRATION_TIME);

        this.sessions.set(sessionId, { scraper: scraperInstance, timeoutId });
        return sessionId;
    }

    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    async closeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            clearTimeout(session.timeoutId);
            await session.scraper.close();
            this.sessions.delete(sessionId);
        }
    }
}

module.exports = new SessionManager(); // Singleton