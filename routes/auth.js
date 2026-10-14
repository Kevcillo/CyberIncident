// rutas de autenticación

const express = require("express");
const controlador = require("../controllers/authController");
const autenticacion = require("../middlewares/autenticacion");
const validarCuerpo = require("../middlewares/validacion");

const router = express.Router();

router.post("/login", validarCuerpo(["correo", "contrasena"]), controlador.iniciarSesion);

// devuelve el usuario del token, la página lo usa para saber quién está conectado
router.get("/perfil", autenticacion, controlador.perfil);

module.exports = router;
