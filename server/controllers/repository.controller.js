const DOWNLOAD_STATES = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
};

class FolioRepository {
    constructor() {
        // Simulated DB: Map<folio, { status, requestDate, params }>
        this.simulatedDb = new Map(); 
    }

    async store(folio, params) {
        this.simulatedDb.set(folio, { 
            status: DOWNLOAD_STATES.PENDING, 
            params, 
            date: new Date() 
        });
        console.log(`[DB] New folio registered: ${folio} - Status: PENDING`);
        return true;
    }

    async updateStatus(folio, newStatus) {
        if (this.simulatedDb.has(folio)) {
            const record = this.simulatedDb.get(folio);
            record.status = newStatus;
            this.simulatedDb.set(folio, record);
            console.log(`[DB] Folio ${folio} updated to: ${newStatus}`);
        }
    }

    async getPending() {
        const pendingItems = [];
        for (const [folio, data] of this.simulatedDb.entries()) {
            if (data.status === DOWNLOAD_STATES.PENDING) {
                pendingItems.push({ folio, ...data });
            }
        }
        return pendingItems;
    }

    async getStatus(folio) {
        const record = this.simulatedDb.get(folio);
        return record ? record.status : null;
    }
}

module.exports = { FolioRepository: new FolioRepository(), DOWNLOAD_STATES };