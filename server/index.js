const express = require('express');
const app = express();

// Middleware para parsear el body como JSON
app.use(express.json());

// Importar y montar el enrutador principal con el árbol de rutas
const webRoutes = require('./routes/web');
app.use('/', webRoutes);

app.get('/', (req, res) => res.send('API del Sistema de Facturas funcionando'));

app.listen(3000, () => console.log('Servidor en puerto 3000'));