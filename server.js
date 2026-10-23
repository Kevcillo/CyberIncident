// arranque del servidor de cyberincident

const { preparar, faltaPreparar } = require("./scripts/setup");

// las tablas que crean las migraciones
async function tablasFaltantes(sequelize) {
    const tablas = await sequelize.getQueryInterface().showAllTables();
    return ["incidentes", "usuarios"].filter((tabla) => !tablas.includes(tabla));
}

async function iniciar() {
    let app;

    try {
        
        if (faltaPreparar()) {
            console.log("Primera ejecución: preparando el proyecto...");
            preparar();
        }

        app = require("./app");
        const { sequelize } = require("./models");

        await sequelize.authenticate();

        
        if ((await tablasFaltantes(sequelize)).length > 0) {
            console.log("Faltan tablas en la base de datos: preparando el proyecto...");
            preparar();
        }

        const faltantes = await tablasFaltantes(sequelize);

        if (faltantes.length > 0) {
            throw new Error(`Faltan las tablas ${faltantes.join(", ")}. Ejecute npm run setup`);
        }
    } catch (error) {
        console.error(`No se pudo iniciar el servidor. ${error.message}`);
        process.exit(1);
    }

    const puerto = process.env.PORT || 3000;

    app.listen(puerto, () => {
        console.log(`Servidor CyberIncident en http://localhost:${puerto}`);
    });
}

iniciar();
