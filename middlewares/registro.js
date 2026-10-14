// muestra en consola cada petición, su resultado y cuánto tardó

function registro(req, res, next) {
    const inicio = Date.now();

    res.on("finish", () => {
        const fecha = new Date().toISOString();
        const duracion = Date.now() - inicio;

        console.log(`[${fecha}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duracion}ms`);
    });

    next();
}

module.exports = registro;
