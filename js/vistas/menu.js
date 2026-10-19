// menú de navegación para pantallas pequeñas

export function activarMenu() {
    const $navegacion = $("nav");
    const $botonMenu = $(".menu-toggle");

    function cerrar() {
        $navegacion.removeClass("menu-abierto");
        $botonMenu.attr("aria-expanded", "false");
    }

    $botonMenu.on("click", () => {
        const menuAbierto = !$navegacion.hasClass("menu-abierto");

        $navegacion.toggleClass("menu-abierto", menuAbierto);
        $botonMenu.attr("aria-expanded", menuAbierto);
    });

    $("nav a").on("click", cerrar);

    $navegacion.on("keydown", (evento) => {
        if (evento.key === "Escape") {
            cerrar();
            $botonMenu.trigger("focus");
        }
    });
}
