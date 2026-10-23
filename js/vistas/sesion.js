// vista de la sesión: el inicio de sesión y el usuario conectado

import { anunciar, marcarCampoInvalido, marcarCampoValido } from "./comun.js";

// nombre del dato y el campo de la página donde se escribe
const CAMPOS = { correo: "acceso-correo", contrasena: "acceso-contrasena" };

export class VistaSesion {

    constructor() {
        this.$acceso = $("#acceso");
        this.$formulario = $("#form-acceso");
        this.$mensaje = $("#mensaje-acceso");
        this.$panel = $("#inicio, nav");
        this.$usuario = $("#usuario-sesion");
    }

    // avisos al controlador

    alIniciarSesion(accion) {
        this.$formulario.on("submit", (evento) => {
            evento.preventDefault();
            accion(this.leerDatos());
        });
    }

    alCerrarSesion(accion) {
        $("#boton-salir").on("click", accion);
    }

    // lectura de la página

    leerDatos() {
        return {
            correo: $("#acceso-correo").val().trim(),
            contrasena: $("#acceso-contrasena").val(),
        };
    }

    // dibujo en la página

    mostrarErrores(errores) {
        Object.entries(CAMPOS).forEach(([dato, idCampo]) => {
            if (errores[dato]) {
                marcarCampoInvalido(idCampo, errores[dato]);
            } else {
                marcarCampoValido(idCampo);
            }
        });

        if (Object.keys(errores).length > 0) {
            anunciar("Revise los campos marcados.");
        }
    }

    esperando(activo) {
        this.$formulario.find("button[type=submit]").prop("disabled", activo);
    }

    // tras un intento fallido se borra la contraseña para escribirla de nuevo
    reintentar(mensaje) {
        this.mostrarMensaje(mensaje);
        $("#acceso-contrasena").val("").trigger("focus");
    }

    // pantalla de inicio de sesión, oculta todo el panel
    mostrarAcceso(mensaje, tipo = "error") {
        this.$panel.attr("hidden", true);
        this.$usuario.attr("hidden", true);
        this.$acceso.removeAttr("hidden");
        this.$formulario[0].reset();

        if (mensaje) {
            this.mostrarMensaje(mensaje, tipo);
        } else {
            this.ocultarMensaje();
        }

        $("#acceso-correo").trigger("focus");
    }

    // panel de incidentes con el nombre y rol del usuario
    mostrarPanel(usuario) {
        this.$acceso.attr("hidden", true);
        this.$panel.removeAttr("hidden");
        this.ocultarMensaje();

        $("#usuario-nombre").text(usuario.nombre);
        $("#usuario-rol").text(usuario.rol);
        this.$usuario.removeAttr("hidden");

        $("#titulo-resumen").attr("tabindex", "-1").trigger("focus");
    }

    // tipo es error o exito, cambia el color del aviso
    mostrarMensaje(mensaje, tipo = "error") {
        this.$mensaje
            .removeClass("error exito")
            .addClass(tipo)
            .text(mensaje)
            .removeAttr("hidden");
        anunciar(mensaje);
    }

    ocultarMensaje() {
        this.$mensaje.attr("hidden", true).text("");
    }
}
