// lluvia de ceros y unos detrás del inicio de sesión, en un canvas sin librerías

const TAMANO = 16;
const PAUSA_MS = 70;
const COLORES = ["#8ea2ff", "#3987e5", "#199e70"];

export function activarFondo() {
    const canvas = document.querySelector("#lluvia-binaria");
    const acceso = document.querySelector("#acceso");

    if (!canvas || !acceso) {
        return;
    }

    const contexto = canvas.getContext("2d");
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let columnas = [];
    let ultimo = 0;
    let cuadro = null;

    // ajusta el canvas a su caja y reparte una gota por columna
    function medir() {
        const escala = window.devicePixelRatio || 1;
        const { width, height } = canvas.getBoundingClientRect();

        canvas.width = Math.round(width * escala);
        canvas.height = Math.round(height * escala);
        contexto.setTransform(escala, 0, 0, escala, 0, 0);
        contexto.font = `${TAMANO}px Consolas, "Courier New", monospace`;

        columnas = Array.from({ length: Math.ceil(width / TAMANO) }, () => Math.random() * -height);
    }

    // cada paso oscurece un poco lo anterior y deja caer un 0 o un 1 en cada columna
    function pintar() {
        const { width, height } = canvas.getBoundingClientRect();

        contexto.fillStyle = "rgba(11, 17, 32, 0.2)";
        contexto.fillRect(0, 0, width, height);

        columnas.forEach((y, indice) => {
            contexto.globalAlpha = 0.35 + Math.random() * 0.5;
            contexto.fillStyle = COLORES[indice % COLORES.length];
            contexto.fillText(Math.random() < 0.5 ? "0" : "1", indice * TAMANO, y);

            columnas[indice] = y > height && Math.random() > 0.97 ? 0 : y + TAMANO;
        });

        contexto.globalAlpha = 1;
    }

    function animar(tiempo) {
        cuadro = requestAnimationFrame(animar);

        if (tiempo - ultimo >= PAUSA_MS) {
            ultimo = tiempo;
            pintar();
        }
    }

    function detener() {
        cancelAnimationFrame(cuadro);
        cuadro = null;
    }

    // solo corre mientras se ve el inicio de sesión y la pestaña está activa
    function actualizar() {
        const visible = !acceso.hidden && document.visibilityState === "visible";

        if (!visible) {
            detener();
            return;
        }

        medir();

        if (quieto) {
            // con movimiento reducido queda una imagen fija
            for (let paso = 0; paso < 60; paso++) {
                pintar();
            }
        } else if (!cuadro) {
            cuadro = requestAnimationFrame(animar);
        }
    }

    new MutationObserver(actualizar).observe(acceso, { attributes: true, attributeFilter: ["hidden"] });
    document.addEventListener("visibilitychange", actualizar);
    window.addEventListener("resize", actualizar);

    actualizar();
}
