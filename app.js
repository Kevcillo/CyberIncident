// aplicación express, separada del arranque para poder probarla

const express = require("express");
const path = require("path");
const compression = require("compression");

const registro = require("./middlewares/registro");
const autenticacion = require("./middlewares/autenticacion");
const { limpieza } = require("./middlewares/limpieza");
const controlCors = require("./middlewares/cors");
const { rutaNoEncontrada, manejadorErrores } = require("./middlewares/errores");
const rutasIncidentes = require("./routes/incidentes");
const rutasAuth = require("./routes/auth");

const app = express();

// en las pruebas no se llena la consola
if (process.env.NODE_ENV !== "test") {
    app.use(registro);
}

// comprime las respuestas para que pesen menos en la red
app.use(compression());

// solo los sitios permitidos pueden llamar a la api desde un navegador
app.use("/api", controlCors);

// peticiones de máximo 10 KB, se limpian antes de llegar a las rutas
app.use(express.json({ limit: "10kb" }));
app.use(limpieza);

// solo se publican los archivos de la página
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
// las imágenes casi no cambian, el navegador las guarda 7 días
app.use("/img", express.static(path.join(__dirname, "img"), { maxAge: "7d" }));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// el login y el estado son públicos, los incidentes exigen sesión
app.use("/api/auth", rutasAuth);
app.use("/api/incidentes", autenticacion, rutasIncidentes);

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
