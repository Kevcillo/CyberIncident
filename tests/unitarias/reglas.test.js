// reglas de negocio del formulario de la página, ahora en el modelo

import { validarCampo, validarIncidente, validarAcceso, CAMPOS_FORMULARIO } from "../../js/modelos/reglas.js";

const valido = {
    titulo: "Correo sospechoso",
    tipo: "Phishing",
    prioridad: "Alta",
    correo: "soc@cyberincident.com",
    fecha: "2026-10-17",
    descripcion: "Se recibió un correo que pide verificar las credenciales.",
};

describe("reglas del formulario de incidentes", () => {

    test("un formulario completo no tiene errores", () => {
        expect(validarIncidente(valido)).toEqual({});
    });

    test("un formulario vacío tiene un error por cada campo obligatorio", () => {
        expect(Object.keys(validarIncidente({}))).toEqual(CAMPOS_FORMULARIO);
    });

    test("el título necesita al menos 5 caracteres sin contar espacios", () => {
        expect(validarCampo("titulo", "  Abcd  ")).toMatch(/al menos 5/);
        expect(validarCampo("titulo", "Abcde")).toBe(true);
    });

    test("la descripción necesita al menos 20 caracteres", () => {
        expect(validarCampo("descripcion", "corta")).toMatch(/al menos 20/);
        expect(validarCampo("descripcion", "x".repeat(20))).toBe(true);
    });

    test("se exige elegir una prioridad", () => {
        expect(validarCampo("prioridad", "")).toMatch(/prioridad/);
        expect(validarCampo("prioridad", undefined)).toMatch(/prioridad/);
    });

    test("el correo debe tener un formato válido", () => {
        expect(validarCampo("correo", "correo-malo")).toMatch(/correo/);
        expect(validarCampo("correo", "ana@correo.com")).toBe(true);
    });

    test("al editar no se valida el correo, porque no se puede cambiar", () => {
        expect(validarIncidente({ ...valido, correo: "" }, { editando: true })).toEqual({});
    });

    test("un campo sin regla siempre es válido", () => {
        expect(validarCampo("estado", "")).toBe(true);
    });
});

describe("reglas del inicio de sesión", () => {

    test("con correo y contraseña no hay errores", () => {
        expect(validarAcceso({ correo: "admin@cyberincident.com", contrasena: "Admin123!" })).toEqual({});
    });

    test("señala el correo inválido y la contraseña vacía", () => {
        expect(validarAcceso({ correo: "admin", contrasena: "" })).toEqual({
            correo: "Ingrese un correo electrónico válido.",
            contrasena: "Ingrese su contraseña.",
        });
    });
});
