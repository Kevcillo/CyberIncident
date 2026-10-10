// rutas de la api de incidentes

const express = require("express");
const controlador = require("../controllers/incidentesController");

const router = express.Router();

router.get("/", controlador.listarIncidentes);
router.get("/:id", controlador.obtenerIncidente);
router.post("/", controlador.crearIncidente);
router.put("/:id", controlador.actualizarIncidente);
router.delete("/:id", controlador.eliminarIncidente);

module.exports = router;
