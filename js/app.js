/**
 * PUNTO DE ENTRADA DE LA APLICACIÓN
 * -----------------------------------------------------------------------
 * Instancia el Modelo, la Vista y el Controlador (arquitectura MVC) y
 * arranca la carga de datos apenas el DOM está listo (jQuery ready).
 */

import { IncidentModel } from "./model.js";
import { IncidentView } from "./view.js";
import { IncidentController } from "./controller.js";

$(function () {

    console.log("CyberIncident: JavaScript (Unidad 2) conectado correctamente.");

    const $navegacion = $("nav");
    const $botonMenu = $(".menu-toggle");

    $botonMenu.on("click", () => {
        const menuAbierto = !$navegacion.hasClass("menu-abierto");

        $navegacion.toggleClass("menu-abierto", menuAbierto);
        $botonMenu.attr("aria-expanded", menuAbierto);
    });

    $("nav a").on("click", () => {
        $navegacion.removeClass("menu-abierto");
        $botonMenu.attr("aria-expanded", "false");
    });

    $navegacion.on("keydown", (evento) => {
        if (evento.key === "Escape") {
            $navegacion.removeClass("menu-abierto");
            $botonMenu.attr("aria-expanded", "false");
            $botonMenu.trigger("focus");
        }
    });

    const modelo = new IncidentModel("/api/incidentes");
    const vista = new IncidentView();
    const controlador = new IncidentController(modelo, vista);

    controlador.iniciar();
});
