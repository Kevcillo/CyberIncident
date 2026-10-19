// errores propios de la aplicación, el middleware central los convierte en respuestas

class ErrorApp extends Error {
    constructor(estado, mensaje, errores) {
        super(mensaje);
        this.name = "ErrorApp";
        this.estado = estado;
        this.errores = errores;
    }
}

class NoEncontrado extends ErrorApp {
    constructor(mensaje) {
        super(404, mensaje);
        this.name = "NoEncontrado";
    }
}

class DatosInvalidos extends ErrorApp {
    constructor(errores, mensaje = "Los datos enviados no son válidos.") {
        super(400, mensaje, errores);
        this.name = "DatosInvalidos";
    }
}

class NoAutorizado extends ErrorApp {
    constructor(mensaje = "Debe iniciar sesión para continuar.") {
        super(401, mensaje);
        this.name = "NoAutorizado";
    }
}

class SinPermiso extends ErrorApp {
    constructor(mensaje = "No tiene permisos para realizar esta acción.") {
        super(403, mensaje);
        this.name = "SinPermiso";
    }
}

module.exports = { ErrorApp, NoEncontrado, DatosInvalidos, NoAutorizado, SinPermiso };
