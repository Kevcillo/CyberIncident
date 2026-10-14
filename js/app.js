// punto de entrada de la página, arma el modelo, la vista y el controlador

import { Sesion } from "./sesion.js";
import { IncidentModel } from "./model.js";
import { IncidentView } from "./view.js";
import { IncidentController } from "./controller.js";

$(function () {

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

    const sesion = new Sesion("/api/auth");
    const modelo = new IncidentModel("/api/incidentes", sesion);
    const vista = new IncidentView();
    const controlador = new IncidentController(modelo, vista, sesion);

    controlador.iniciar();
});
