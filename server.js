/**
 * SERVIDOR NODE.JS (Express)
 * -------------------------------------------------------------------
 * Punto de entrada de la plataforma digital.
 *
 * - Sirve la capa de PRESENTACIÓN como archivos estáticos
 *   desde la carpeta raíz del proyecto.
 * - Expone la capa de APLICACIÓN mediante rutas HTTP bajo /api.
 * - La capa de DATOS queda oculta detrás del repositorio.
 */

const express = require("express");
const path = require("path");

const rutasIncidentes = require("./routes/incidentes");

const app = express();
const PUERTO = process.env.PORT || 3000;

// Permite recibir información en formato JSON
app.use(express.json());

// -------------------------------------------------------------------
// Capa de PRESENTACIÓN
// -------------------------------------------------------------------
// Se mantiene la estructura anterior:
// index.html, CSS, JS y demás archivos están en la raíz del proyecto.
app.use(express.static(__dirname));

// -------------------------------------------------------------------
// Capa de APLICACIÓN
// -------------------------------------------------------------------
// Las peticiones a /api/incidentes son gestionadas por las rutas
// correspondientes.
app.use("/api/incidentes", rutasIncidentes);

// -------------------------------------------------------------------
// Ruta de verificación rápida del servicio (Health Check)
// -------------------------------------------------------------------
app.get("/api/estado", (req, res) => {

    res.status(200).json({
        servicio: "CyberIncident API",
        estado: "activo",
        fecha: new Date().toISOString(),
    });
});

// -------------------------------------------------------------------
// Iniciar servidor
// -------------------------------------------------------------------
app.listen(PUERTO, () => {

    console.log(
        `Servidor CyberIncident escuchando en http://localhost:${PUERTO}`
    );

    console.log(
        `API de incidentes disponible en http://localhost:${PUERTO}/api/incidentes`
    );

    console.log(
        `Health check disponible en http://localhost:${PUERTO}/api/estado`
    );
});