// arranque del servidor de cyberincident

async function iniciar() {
    let app;

    try {
        app = require("./app");
        const { sequelize } = require("./models");

        await sequelize.authenticate();

        // la tabla la crean las migraciones
        const tablas = await sequelize.getQueryInterface().showAllTables();

        if (!tablas.includes("incidentes")) {
            throw new Error("La base de datos no tiene la tabla incidentes. Ejecute npm run setup");
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
