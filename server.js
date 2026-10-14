// arranque del servidor de cyberincident

async function iniciar() {
    let app;

    try {
        app = require("./app");
        const { sequelize } = require("./models");

        await sequelize.authenticate();

        // las tablas las crean las migraciones
        const tablas = await sequelize.getQueryInterface().showAllTables();
        const faltantes = ["incidentes", "usuarios"].filter((tabla) => !tablas.includes(tabla));

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
