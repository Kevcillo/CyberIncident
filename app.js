// aplicación express, separada del arranque para poder probarla

const express = require("express");
const path = require("path");

const registro = require("./middlewares/registro");
const { rutaNoEncontrada, manejadorErrores } = require("./middlewares/errores");
const rutasIncidentes = require("./routes/incidentes");

const app = express();

// en las pruebas no se llena la consola
if (process.env.NODE_ENV !== "test") {
    app.use(registro);
}

app.use(express.json());

// solo se publican los archivos de la página
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.use("/api/incidentes", rutasIncidentes);

app.get("/api/estado", (req, res) => {
    res.status(200).json({
        servicio: "CyberIncident API",
        estado: "activo",
        fecha: new Date().toISOString(),
    });
});

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

module.exports = app;
