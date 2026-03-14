const puppeteer = require('puppeteer');
const selectors = require('../../config/satSelectors');
const Logger = require('../logger.service');
const { FolioRepository, DOWNLOAD_STATES } = require('../../controllers/repository.controller.js');
const { CaptchaError, SatNavigationError, SatAuthError } = require('../../errors/SatErrors');

class SatScraperService {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        Logger.info(`Iniciando navegador SAT y cargando: ${selectors.page}`);
        
        try {
            this.browser = await puppeteer.launch({
                headless: 'new',
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage'
                ]
            });
            this.page = await this.browser.newPage();
        
            
            const response = await this.page.goto(selectors.page, { 
                waitUntil: 'networkidle2', 
                timeout: 40000 
            });
            if (!response || !response.ok()) {
                const status = response ? response.status() : 'No response';
                throw new SatNavigationError('Error de conexión con el portal del SAT.', `Status ${status} al cargar ${selectors.page}`);
            }
            Logger.info(`Página cargada exitosamente: ${this.page.url()}`);
        } catch (error) { throw new SatNavigationError('Fallo inesperado al conectar con el SAT.', error.message);}

        try {
            await this.page.waitForSelector(selectors.login.captchaImage, { timeout: 10000 });
            const captchaSrc = await this.page.$eval(selectors.login.captchaImage, el => el.src);

            const isCorrect = captchaSrc.includes('base64,');

            if (!isCorrect) throw new CaptchaError('Contenido de captcha vacío o inválido.', `Fallo al extraer src del selector ${selectors.login.captchaImage}. Captcha obtenida: ${captchaSrc}`);
            
            Logger.info('Captcha extraído correctamente.');
            return captchaSrc;

        } catch (error) { throw new CaptchaError('No se pudo obtener la imagen del captcha.', error.message); }
    }

    async loginAndContinue(rfc, ciec, captchaText, actionParams) {
        Logger.info(`Intentando login SAT para RFC: ${rfc}`);
        
        try {
            await this.page.type(selectors.login.rfcInput, rfc);
            await this.page.type(selectors.login.ciecInput, ciec);
            await this.page.type(selectors.login.captchaInput, captchaText);
            
            Logger.info('Formulario de acceso enviado.');
            await this.page.click(selectors.login.submitBtn);

            // Esperar navegación con timeout razonable
            await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 35000 });
            
            const currentUrl = this.page.url();
            Logger.info(`Navegación post-login completada. URL actual: ${currentUrl}`);

            // 1. Verificar si sigue en login (Error de credenciales o captcha)
            const isStillAtLogin = await this.page.$(selectors.login.rfcInput);
            if (isStillAtLogin) {
                // Intentar capturar mensaje de error del DOM si existe
                const errorMessage = await this.page.evaluate(() => {
                    const errEl = document.querySelector('.errores, #error-msg, .alert-danger');
                    return errEl ? errEl.innerText.trim() : null;
                });

                Logger.warn('El login no fue exitoso, permanecemos en la página de acceso.', { satMessage: errorMessage });
                
                const newCaptcha = await this.init(); 
                throw new CaptchaError(
                    errorMessage || 'Credenciales o captcha incorrectos.', 
                    `Login fallido en ${currentUrl}. RFC: ${rfc}`,
                    newCaptcha
                );
            }

            // 2. Verificar si nos mandó a una página de error o mantenimiento
            if (currentUrl.includes('error') || currentUrl.includes('mantenimiento')) {
                throw new SatNavigationError('El portal del SAT reporta un error técnico o mantenimiento.', `Redirección a URL de error: ${currentUrl}`);
            }

            Logger.info('Login exitoso en el portal del SAT.');
            return await this.requestPackage(actionParams);

        } catch (error) {
            if (error.isCustomException) throw error;
            throw new SatNavigationError('Ocurrió un error al procesar el acceso.', error.message);
        }
    }

    async requestPackage(params) {
        Logger.info('Iniciando solicitud de paquete de folios...', { type: params.type });
        
        const menuSelector = params.type === 'issued' ? selectors.menu.issued : selectors.menu.received;
        await this.page.click(menuSelector);
        await this.page.waitForNavigation({ waitUntil: 'networkidle2' });

        // ... Lógica de búsqueda ...
        await this.page.click(selectors.search.btnSearch);
        await this.page.waitForSelector(selectors.search.chkSelectAll);
        await this.page.click(selectors.search.chkSelectAll);
        await this.page.click(selectors.search.btnDownload);

        const alert = await this.page.waitForSelector(selectors.search.successAlert, { timeout: 30000 });
        const alertText = await this.page.evaluate(el => el.innerText, alert);
        
        const folioMatch = alertText.match(/folio de descarga:?\s*([A-F0-9\-]{36})/i);
        
        if (!folioMatch || !folioMatch[1]) {
            Logger.error('No se pudo localizar el folio de descarga en el mensaje de éxito.', { alertText });
            throw new SatNavigationError('Descarga solicitada, pero no se recuperó el folio de seguimiento.', 'Regex de folio falló sobre el texto del alert');
        }

        const generatedFolio = folioMatch[1].toUpperCase();
        Logger.info(`Folio de descarga obtenido: ${generatedFolio}`);

        await FolioRepository.store(generatedFolio, params);
        return generatedFolio;
    }

    async processPendingDownloads() {
        Logger.info('Procesando descargas pendientes desde el portal SAT');
        // ... Lógica existente con Logger ...
    }

    async close() {
        if (this.browser) {
            Logger.info('Cerrando instancia del navegador SAT.');
            await this.browser.close();
        }
    }
}

module.exports = SatScraperService;