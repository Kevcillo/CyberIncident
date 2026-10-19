// rutas de la api de incidentes, todas exigen sesión

const express = require("express");
const controlador = require("../controllers/incidentesController");
const permitirRoles = require("../middlewares/roles");
const validarCuerpo = require("../middlewares/validacion");

const router = express.Router();

const todos = permitirRoles("admin", "analista");
const soloAdmin = permitirRoles("admin");

const camposCrear = validarCuerpo(controlador.CAMPOS_CREAR);
const camposEditar = validarCuerpo(controlador.CAMPOS_EDITAR);

router.get("/", todos, controlador.listarIncidentes);
router.get("/:id", todos, controlador.obtenerIncidente);
router.post("/", todos, camposCrear, controlador.crearIncidente);
router.put("/:id", todos, camposEditar, controlador.reemplazarIncidente);
router.patch("/:id", todos, camposEditar, controlador.actualizarIncidente);

// eliminar es la acción más delicada, queda solo para el administrador
router.delete("/:id", soloAdmin, controlador.eliminarIncidente);

module.exports = router;
