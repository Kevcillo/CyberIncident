// decide qué sitios web pueden llamar a la api desde un navegador

const path = require("path");
const cors = require("cors");

const { SinPermiso } = require("../errors/errores");

require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

// la lista sale del .env, separada por comas
const lista = (process.env.CORS_ORIGENES || "")
    .split(",")
    .map((origen) => origen.trim())
    .filter(Boolean);

// la propia página del proyecto siempre está permitida
const propio = `http://localhost:${process.env.PORT || 3000}`;
const permitidos = [...new Set([propio, ...lista])];

module.exports = cors({
    origin(origen, responder) {
        // postman, las pruebas y la misma página sin origen pasan directo
        if (!origen || permitidos.includes(origen)) {
            return responder(null, true);
        }

        responder(new SinPermiso(`El origen ${origen} no tiene permiso para usar esta API.`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
});

module.exports.permitidos = permitidos;
