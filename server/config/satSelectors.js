module.exports = {
    page: "https://portalcfdi.facturaelectronica.sat.gob.mx/",
    login: {
        rfcInput: '#rfc',
        ciecInput: '#password',
        captchaImage: '#divCaptcha img',
        captchaInput: '#userCaptcha',
        submitBtn: '#submit'
    },
    menu: {
        issued: 'a[href="ConsultaEmisor.aspx"]',
        received: 'a[href="ConsultaReceptor.aspx"]'
    },
    search: {
        startDate: '#ctl00_MainContent_CldFechaInicial2_Calendario_text',
        endDate: '#ctl00_MainContent_CldFechaFinal2_Calendario_text',
        btnSearch: '#ctl00_MainContent_BtnBusqueda',
        chkSelectAll: '#seleccionador',
        btnDownload: '#ctl00_MainContent_BtnDescargar',
        successAlert: '.alert-success'
    },
    downloads: {
        menuRecover: 'a[href="ConsultaDescargaMasiva.aspx"]',
        resultsTable: '#ctl00_MainContent_GridViewReporte',
        btnDownloadPackage: 'span.glyphicon-cloud-download'
    }
};