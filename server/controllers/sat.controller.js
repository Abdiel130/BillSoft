const SatScraperService = require('../services/sat/satScraper.service');
const sessionManager = require('../services/sat/satSession.service');
const { FolioRepository } = require('./repository.controller.js');
const { CaptchaError } = require('../errors/SatErrors');
const API = require('../services/response.service');

const startDownload = async (req, res) => {
    try {
        const scraper = new SatScraperService();
        const captchaBase64 = await scraper.init(); 
        
        // Aquí el navegador se queda ABIERTO, guardado en el SessionManager
        const sessionId = sessionManager.createSession(scraper);

        return API.success(res, "Sesión iniciada. Resuelve el captcha.", {
            sessionId: sessionId,
            captchaImage: `data:image/png;base64,${captchaBase64}`
        });
    } catch (error) {
        return API.error(res, `Fallo al iniciar el portal del SAT: ${error.message}`, 500);
    }
};

const requestInvoices = async (req, res) => {
    const { sessionId } = req.params;
    const { rfc, ciec, captchaText, searchParams } = req.body;
    
    // Recuperamos el navegador que dejamos abierto en el paso 1
    const session = sessionManager.getSession(sessionId);
    if (!session) {
        return API.error(res, "Sesión expirada o inválida. El SAT da 5 minutos para resolver el captcha. Inicia de nuevo.", 404);
    }

    try {
        // 1. Escribe credenciales en la página que ya está abierta y da Enter
        await session.scraper.loginAndContinue(rfc, ciec, captchaText, searchParams);
        
        // 2. Ejecuta la navegación para solicitar el paquete ZIP
        const folio = await session.scraper.requestPackage(searchParams);

        // 3. (Opcional) Revisamos si el ZIP salió rapidísimo
        await session.scraper.processPendingDownloads();

        const currentStatus = await FolioRepository.getStatus(folio);
        
        // Cerramos el navegador para liberar la memoria RAM
        await sessionManager.closeSession(sessionId);

        return API.success(res, currentStatus === 'COMPLETED' 
            ? "Descarga completada con éxito." 
            : "Solicitud en proceso por el SAT. El folio está pendiente.", {
            folio: folio,
            status: currentStatus
        });

    } catch (error) {
        if (error instanceof CaptchaError) {
            // El usuario se equivocó al escribir el CAPTCHA, el SAT recargó y devolvió uno nuevo
            return API.error(res, "Captcha incorrecto", 401, {
                newCaptchaImage: `data:image/png;base64,${error.newCaptcha}` 
            });
        } else {
            console.error(`Error en scraping:`, error);
            await sessionManager.closeSession(sessionId);
            return API.error(res, `Fallo en el proceso: ${error.message}`, 500);
        }
    }
};

const checkPending = async (req, res) => {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
        return API.error(res, "Sesión inválida. Se requiere iniciar login y captcha para revisar pendientes.", 404);
    }

    try {
        // Nombre de función corregido según tu satScraper.service.js
        const result = await session.scraper.processPendingDownloads(); 
        
        await sessionManager.closeSession(sessionId);
        return API.success(res, "Pendientes revisados correctamente.", result);
    } catch (error) {
        await sessionManager.closeSession(sessionId);
        return API.error(res, `Error al revisar pendientes: ${error.message}`, 500);
    }
};

module.exports = { startDownload, requestInvoices, checkPending };