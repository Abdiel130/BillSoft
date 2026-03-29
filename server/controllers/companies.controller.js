const API = require('../services/response.service');
const { db } = require('../db/index');
const { companies, taxRegimes } = require('../db/schema');
const { eq, and, isNull } = require('drizzle-orm');

class CompaniesController {

    index = async (req, res) => {
        try {
            const result = await db
                .select({
                    id: companies.id,
                    rfc: companies.rfc,
                    legalName: companies.legalName,
                    zipCode: companies.zipCode,
                    nickname: companies.nickname,
                    taxRegimeId: companies.taxRegimeId,
                    type: companies.type,
                    createdAt: companies.createdAt,
                })
                .from(companies)
                .where(isNull(companies.deletedAt));

            return API.success(res, 'Lista de empresas obtenida.', result);
        } catch (error) {
            console.error(error);
            return API.error(res, 'Error al obtener empresas.', 500);
        }
    };

    show = async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db
                .select()
                .from(companies)
                .where(and(eq(companies.id, Number(id)), isNull(companies.deletedAt)))
                .limit(1);

            if (!result.length) return API.error(res, 'Empresa no encontrada.', 404);
            return API.success(res, 'Empresa obtenida.', result[0]);
        } catch (error) {
            console.error(error);
            return API.error(res, 'Error al obtener empresa.', 500);
        }
    };

    store = async (req, res) => {
        try {
            const { rfc, legalName, zipCode, nickname, taxRegimeId, type } = req.body;

            if (!rfc || !legalName || !zipCode || !type) {
                return API.error(res, 'Los campos rfc, legalName, zipCode y type son requeridos.', 422);
            }

            const [inserted] = await db.insert(companies).values({
                rfc,
                legalName,
                zipCode,
                nickname: nickname || null,
                taxRegimeId: taxRegimeId || null,
                type,
            });

            const newCompany = await db
                .select()
                .from(companies)
                .where(eq(companies.id, inserted.insertId))
                .limit(1);

            return API.created(res, 'Empresa creada exitosamente.', newCompany[0]);
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return API.error(res, 'El RFC ya está registrado.', 409);
            }
            return API.error(res, 'Error al crear empresa.', 500);
        }
    };

    update = async (req, res) => {
        try {
            const { id } = req.params;
            const { rfc, legalName, zipCode, nickname, taxRegimeId, type } = req.body;

            const existing = await db
                .select()
                .from(companies)
                .where(and(eq(companies.id, Number(id)), isNull(companies.deletedAt)))
                .limit(1);

            if (!existing.length) return API.error(res, 'Empresa no encontrada.', 404);

            await db.update(companies)
                .set({
                    rfc: rfc ?? existing[0].rfc,
                    legalName: legalName ?? existing[0].legalName,
                    zipCode: zipCode ?? existing[0].zipCode,
                    nickname: nickname !== undefined ? nickname : existing[0].nickname,
                    taxRegimeId: taxRegimeId !== undefined ? taxRegimeId : existing[0].taxRegimeId,
                    type: type ?? existing[0].type,
                })
                .where(eq(companies.id, Number(id)));

            const updated = await db
                .select()
                .from(companies)
                .where(eq(companies.id, Number(id)))
                .limit(1);

            return API.success(res, 'Empresa actualizada correctamente.', updated[0]);
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return API.error(res, 'El RFC ya está registrado.', 409);
            }
            return API.error(res, 'Error al actualizar empresa.', 500);
        }
    };

    destroy = async (req, res) => {
        try {
            const { id } = req.params;

            const existing = await db
                .select()
                .from(companies)
                .where(and(eq(companies.id, Number(id)), isNull(companies.deletedAt)))
                .limit(1);

            if (!existing.length) return API.error(res, 'Empresa no encontrada.', 404);

            await db.update(companies)
                .set({ deletedAt: new Date() })
                .where(eq(companies.id, Number(id)));

            return API.success(res, `Empresa con ID ${id} eliminada correctamente.`);
        } catch (error) {
            console.error(error);
            return API.error(res, 'Error al eliminar empresa.', 500);
        }
    };
}

module.exports = new CompaniesController();
