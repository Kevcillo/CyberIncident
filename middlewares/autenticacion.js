// exige un token válido en la cabecera Authorization: Bearer <token>

const jwt = require("jsonwebtoken");

const { Usuario } = require("../models");
const { claveToken } = require("../config/seguridad");
const { NoAutorizado } = require("../errors/errores");

async function autenticacion(req, res, next) {
    const cabecera = req.get("Authorization") || "";
    const [tipo, token] = cabecera.split(" ");

    if (tipo !== "Bearer" || !token) {
        throw new NoAutorizado("Falta el token de acceso. Inicie sesión para continuar.");
    }

    let datos;

    try {
        datos = jwt.verify(token, claveToken, { algorithms: ["HS256"] });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new NoAutorizado("La sesión expiró. Inicie sesión nuevamente.");
        }

        throw new NoAutorizado("El token de acceso no es válido.");
    }

    // el usuario se consulta de nuevo por si fue eliminado o cambió de rol
    const usuario = await Usuario.findByPk(datos.sub);

    if (!usuario) {
        throw new NoAutorizado("El usuario de este token ya no existe.");
    }

    req.usuario = { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol };

    next();
}

module.exports = autenticacion;
