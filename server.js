const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 1 Capa de Servicios y def la ruta API HTTP
app.get('/api/incidentes', (req, res) => {
    
    // Apuntamos a tu archivo JSON simulando la Base de Datos
    const dataPath = path.join(__dirname, 'data', 'incidentes.json');

    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error al leer el archivo:", err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        // Código 2h
        res.status(200).json(JSON.parse(data));
    });
});

// 2. Ruta de salud 
app.get('/salud', (req, res) => {
    res.json({ estado: 'ok' });
});

// 3. Capa de Presentació  
app.use(express.static(__dirname));

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`Revisa la API en http://localhost:${PORT}/api/incidentes`);
});