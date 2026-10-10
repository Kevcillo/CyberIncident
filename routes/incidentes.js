/**
 * RUTAS (mapea metodo HTTP + URL -> funcion del controlador)
 */

const express = require("express");
const controlador = require("../js/controllers/incidentesController");

const router = express.Router();

// GET /api/incidentes -> lista completa (JSON)
router.get("/", controlador.listarIncidentes);

// GET /api/incidentes/:id -> un incidente puntual (JSON)
router.get("/:id", controlador.obtenerIncidente);

module.exports = router;
