const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const webRoutes = require('./routes/web');
app.use('/', webRoutes);
app.get('/', (req, res) => res.send('API del Sistema de Facturas funcionando'));
app.listen(3000, () => console.log('Servidor en puerto 3000'));