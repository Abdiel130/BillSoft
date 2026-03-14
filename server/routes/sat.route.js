const express = require('express');
const router = express.Router();
const satController = require('../controllers/sat.controller');

// 1. Inicia la instancia de Puppeteer, abre el SAT y devuelve el CAPTCHA en base64
router.post('/start', satController.startDownload);

// 2. Recibe las credenciales + CAPTCHA resuelto y solicita la generación del paquete (ZIP)
router.post('/solicitar-facturas/:sessionId', satController.requestInvoices);

// 3. Revisa la tabla de descargas del SAT para bajar los folios que estén PENDIENTES
router.get('/procesar-pendientes/:sessionId', satController.checkPending);

module.exports = router;