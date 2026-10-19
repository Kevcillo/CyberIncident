// punto de entrada de la página, solo crea las piezas y las conecta

import { Sesion } from "./modelos/sesion.js";
import { ModeloIncidentes } from "./modelos/incidentes.js";
import { VistaSesion } from "./vistas/sesion.js";
import { VistaIncidentes } from "./vistas/incidentes.js";
import { activarMenu } from "./vistas/menu.js";
import { ControladorSesion } from "./controladores/sesion.js";
import { ControladorIncidentes } from "./controladores/incidentes.js";

$(function () {

    activarMenu();

    const sesion = new Sesion("/api/auth");
    const modelo = new ModeloIncidentes("/api/incidentes", sesion);

    const incidentes = new ControladorIncidentes(modelo, new VistaIncidentes(), sesion);

    const controladorSesion = new ControladorSesion(sesion, new VistaSesion(), {
        alEntrar: () => incidentes.cargarPanel(),
        alSalir: () => incidentes.reiniciar(),
    });

    // si el token vence en cualquier petición, se vuelve al inicio de sesión
    modelo.alPerderSesion = (mensaje) => controladorSesion.salir(mensaje);

    controladorSesion.iniciar();
});
