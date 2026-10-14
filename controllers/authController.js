// inicio de sesión, entrega un token si el correo y la contraseña son correctos

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { Usuario } = require("../models");
const { claveToken, duracionToken } = require("../config/seguridad");
const { DatosInvalidos, NoAutorizado } = require("../errors/errores");

// hash de relleno para que un correo inexistente tarde lo mismo que uno real
const HASH_RELLENO = bcrypt.hashSync("contrasena-de-relleno", Usuario.COSTO_HASH);

// POST /api/auth/login
async function iniciarSesion(req, res) {
    const { correo, contrasena } = req.body || {};
    const errores = {};

    if (typeof correo !== "string" || correo.trim() === "") {
        errores.correo = "El correo es obligatorio.";
    }

    if (typeof contrasena !== "string" || contrasena === "") {
        errores.contrasena = "La contraseña es obligatoria.";
    }

    if (Object.keys(errores).length > 0) {
        throw new DatosInvalidos(errores);
    }

    const usuario = await Usuario.scope("conContrasena").findOne({
        where: { correo: correo.trim().toLowerCase() },
    });

    const correcta = usuario
        ? await usuario.verificarContrasena(contrasena)
        : await bcrypt.compare(contrasena, HASH_RELLENO);

    // el mismo mensaje en ambos casos, así no se revela qué correos existen
    if (!usuario || !correcta) {
        throw new NoAutorizado("Correo o contraseña incorrectos.");
    }

    const token = jwt.sign(
        { sub: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
        claveToken,
        { expiresIn: duracionToken }
    );

    res.status(200).json({
        exito: true,
        datos: {
            token,
            expiraEn: duracionToken,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol,
            },
        },
    });
}

// GET /api/auth/perfil
function perfil(req, res) {
    res.status(200).json({ exito: true, datos: req.usuario });
}

module.exports = { iniciarSesion, perfil };
