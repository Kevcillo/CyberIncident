// reglas de negocio de los formularios, no tocan la página

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// cada regla devuelve true o el mensaje de error
const REGLAS = {
    titulo: (valor) => valor.trim().length >= 5 || "El título debe tener al menos 5 caracteres.",
    tipo: (valor) => valor !== "" || "Debe seleccionar un tipo de incidente.",
    prioridad: (valor) => valor !== "" || "Debe seleccionar una prioridad.",
    correo: (valor) => CORREO_VALIDO.test(valor.trim()) || "Ingrese un correo electrónico válido.",
    fecha: (valor) => valor !== "" || "Debe seleccionar una fecha.",
    descripcion: (valor) => valor.trim().length >= 20 || "La descripción debe tener al menos 20 caracteres.",
};

// campos del formulario en el orden en que aparecen en la página
export const CAMPOS_FORMULARIO = ["titulo", "tipo", "prioridad", "correo", "fecha", "descripcion"];

export function validarCampo(campo, valor, { editando = false } = {}) {
    const regla = REGLAS[campo];

    // al editar el correo no se puede cambiar, no hace falta validarlo
    if (!regla || (campo === "correo" && editando)) {
        return true;
    }

    return regla(valor ?? "");
}

// devuelve los errores del formulario, vacío si todo está bien
export function validarIncidente(datos, opciones = {}) {
    const errores = {};

    CAMPOS_FORMULARIO.forEach((campo) => {
        const resultado = validarCampo(campo, datos[campo], opciones);

        if (resultado !== true) {
            errores[campo] = resultado;
        }
    });

    return errores;
}

export function validarAcceso({ correo, contrasena }) {
    const errores = {};

    if (!CORREO_VALIDO.test(correo ?? "")) {
        errores.correo = "Ingrese un correo electrónico válido.";
    }

    if (!contrasena) {
        errores.contrasena = "Ingrese su contraseña.";
    }

    return errores;
}
