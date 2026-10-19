// controlador de la sesión: entrar, salir y revisar si ya hay sesión al abrir

import { validarAcceso } from "../modelos/reglas.js";

export class ControladorSesion {

    // alEntrar y alSalir avisan al resto de la página
    constructor(sesion, vista, { alEntrar, alSalir }) {
        this.sesion = sesion;
        this.vista = vista;
        this.alEntrar = alEntrar;
        this.alSalir = alSalir;

        this.vista.alIniciarSesion((datos) => this.iniciarSesion(datos));
        this.vista.alCerrarSesion(() => this.salir("Sesión cerrada correctamente.", "exito"));
    }

    // al abrir la página se revisa si ya hay una sesión válida
    async iniciar() {
        try {
            if (await this.sesion.verificar()) {
                await this.entrar();
            } else {
                this.vista.mostrarAcceso();
            }
        } catch {
            this.vista.mostrarAcceso("No se pudo conectar con el servidor. Intente nuevamente.");
        }
    }

    async iniciarSesion(datos) {
        const errores = validarAcceso(datos);
        this.vista.mostrarErrores(errores);

        if (Object.keys(errores).length > 0) {
            return;
        }

        this.vista.esperando(true);

        try {
            await this.sesion.iniciar(datos.correo, datos.contrasena);
            await this.entrar();
        } catch (error) {
            this.vista.reintentar(error.message);
        } finally {
            this.vista.esperando(false);
        }
    }

    async entrar() {
        this.vista.mostrarPanel(this.sesion.usuario);
        await this.alEntrar();
    }

    salir(mensaje, tipo = "error") {
        this.sesion.cerrar();
        this.alSalir();
        this.vista.mostrarAcceso(mensaje, tipo);
    }
}
