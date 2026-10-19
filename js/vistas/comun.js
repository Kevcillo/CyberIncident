// funciones de vista que comparten la sesión y los incidentes

// evita que el texto escrito por el usuario se interprete como html
export function escaparHtml(texto) {
    const contenedor = document.createElement("div");
    contenedor.textContent = String(texto ?? "");
    return contenedor.innerHTML;
}

// aviso para lectores de pantalla
export function anunciar(mensaje) {
    const $anuncios = $("#anuncios-aria");
    $anuncios.text("");
    // la pausa hace que se lea aunque el mensaje se repita
    setTimeout(() => $anuncios.text(mensaje), 50);
}

export function marcarCampoInvalido(idCampo, mensaje) {
    $(`#${idCampo}`).attr("aria-invalid", "true");
    $(`#error-${idCampo}`).text(mensaje);
}

export function marcarCampoValido(idCampo) {
    $(`#${idCampo}`).attr("aria-invalid", "false");
    $(`#error-${idCampo}`).text("");
}
