// sesión del usuario, guarda el token mientras la pestaña esté abierta

const CLAVE = "cyberincident.sesion";

// el navegador puede bloquear el almacenamiento, en ese caso la sesión vive solo en memoria
function leerGuardado() {
    try {
        return JSON.parse(sessionStorage.getItem(CLAVE)) || null;
    } catch {
        return null;
    }
}

function guardar(datos) {
    try {
        if (datos) {
            sessionStorage.setItem(CLAVE, JSON.stringify(datos));
        } else {
            sessionStorage.removeItem(CLAVE);
        }
    } catch {
        // sin almacenamiento la sesión dura hasta recargar la página
    }
}

export class Sesion {

    constructor(urlAuth) {
        this.urlAuth = urlAuth;
        this.datos = leerGuardado();
    }

    get token() {
        return this.datos ? this.datos.token : null;
    }

    get usuario() {
        return this.datos ? this.datos.usuario : null;
    }

    esAdmin() {
        return this.usuario?.rol === "admin";
    }

    async iniciar(correo, contrasena) {
        const respuesta = await fetch(`${this.urlAuth}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo, contrasena }),
        });

        const cuerpo = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            const error = new Error(cuerpo.mensaje || "No se pudo iniciar sesión.");
            error.errores = cuerpo.errores || {};
            throw error;
        }

        this.datos = { token: cuerpo.datos.token, usuario: cuerpo.datos.usuario };
        guardar(this.datos);

        return this.usuario;
    }

    // confirma con el servidor que el token guardado sigue siendo válido
    async verificar() {
        if (!this.token) {
            return false;
        }

        const respuesta = await fetch(`${this.urlAuth}/perfil`, {
            headers: { Authorization: `Bearer ${this.token}` },
        });

        if (!respuesta.ok) {
            this.cerrar();
            return false;
        }

        const cuerpo = await respuesta.json();
        this.datos = { ...this.datos, usuario: cuerpo.datos };
        guardar(this.datos);

        return true;
    }

    cerrar() {
        this.datos = null;
        guardar(null);
    }
}
