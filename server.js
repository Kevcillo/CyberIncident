// arranque del servidor de cyberincident

const { preparar, migrarBase, faltaPreparar } = require("./scripts/setup");
const { esProduccion, revisarProduccion } = require("./config/entorno");
const bitacora = require("./config/bitacora");

// las tablas que crean las migraciones
async function tablasFaltantes(sequelize) {
    const tablas = await sequelize.getQueryInterface().showAllTables();
    return ["incidentes", "usuarios"].filter((tabla) => !tablas.includes(tabla));
}

// producción: la configuración viene del proveedor, si falta algo no se arranca
function arrancarProduccion() {
    const problemas = revisarProduccion();

    if (problemas.length > 0) {
        throw new Error(`Configuración de producción incompleta: ${problemas.join("; ")}.`);
    }

    migrarBase();
}

// desarrollo: si nunca se ejecutó npm run setup, el proyecto se prepara solo
function arrancarDesarrollo() {
    if (faltaPreparar()) {
        bitacora.info("Primera ejecución: preparando el proyecto");
        preparar();
    }
}

async function iniciar() {
    let app;

    try {
        if (esProduccion()) {
            arrancarProduccion();
        } else {
            arrancarDesarrollo();
        }

        app = require("./app");
        const { sequelize } = require("./models");

        await sequelize.authenticate();

        // en desarrollo la base puede existir sin tablas, también se prepara sola
        if (!esProduccion() && (await tablasFaltantes(sequelize)).length > 0) {
            bitacora.warn("Faltan tablas en la base de datos: preparando el proyecto");
            preparar();
        }

        const faltantes = await tablasFaltantes(sequelize);

        if (faltantes.length > 0) {
            throw new Error(`Faltan las tablas ${faltantes.join(", ")}. Ejecute npm run setup`);
        }
    } catch (error) {
        bitacora.error(`No se pudo iniciar el servidor. ${error.message}`);
        process.exit(1);
    }

    const puerto = process.env.PORT || 3000;

    app.listen(puerto, () => {
        bitacora.info("Servidor CyberIncident iniciado", {
            puerto,
            entorno: esProduccion() ? "producción" : "desarrollo",
        });
    });
}

iniciar();
