// conexión a la base de datos y registro de modelos

const { Sequelize } = require("sequelize");
const configuraciones = require("../config/database");

const entorno = process.env.NODE_ENV || "development";
const config = configuraciones[entorno];

if (!config) {
    throw new Error(`El entorno ${entorno} no está configurado en config/database.js`);
}

const sequelize = new Sequelize(config);

const Incidente = require("./incidente")(sequelize);
const Usuario = require("./usuario")(sequelize);

module.exports = { sequelize, Incidente, Usuario };
