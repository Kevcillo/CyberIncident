// health check: confirma que el servidor y la base de datos responden

const { sequelize } = require("../models");
const { version } = require("../package.json");
const bitacora = require("../config/bitacora");

// si la base no contesta en este tiempo se considera caída
const ESPERA_MAXIMA_MS = 3000;

function conLimite(promesa, ms) {
    let temporizador;
    const limite = new Promise((_, rechazar) => {
        temporizador = setTimeout(() => rechazar(new Error(`sin respuesta en ${ms} ms`)), ms);
    });

    return Promise.race([promesa, limite]).finally(() => clearTimeout(temporizador));
}

async function revisarBase(id) {
    const inicio = Date.now();

    try {
        await conLimite(sequelize.authenticate(), ESPERA_MAXIMA_MS);
        return { estado: "conectada", motor: sequelize.getDialect(), latenciaMs: Date.now() - inicio };
    } catch (error) {
        bitacora.error("health check: la base de datos no responde", { id, tipo: error.name });
        return { estado: "sin conexión", motor: sequelize.getDialect() };
    }
}

async function estado(req, res) {
    const baseDeDatos = await revisarBase(req.id);
    const sano = baseDeDatos.estado === "conectada";

    // el proveedor reinicia el servicio cuando recibe 503 varias veces seguidas
    res.set("Cache-Control", "no-store");
    res.status(sano ? 200 : 503).json({
        servicio: "CyberIncident API",
        estado: sano ? "activo" : "sin servicio",
        version,
        entorno: process.env.NODE_ENV === "production" ? "producción" : "desarrollo",
        tiempoActivoSeg: Math.round(process.uptime()),
        fecha: new Date().toISOString(),
        baseDeDatos,
    });
}

module.exports = { estado };
