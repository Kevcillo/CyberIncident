// regla de despliegue: producción no arranca si falta configuración obligatoria

const { revisarProduccion, OBLIGATORIAS } = require("../../config/entorno");

const completo = {
    JWT_SECRET: "x".repeat(48),
    DATABASE_URL: "postgres://usuario:clave@servidor:5432/base",
    CORS_ORIGENES: "https://cyberincident.onrender.com",
};

describe("configuración de producción", () => {

    test("con todas las variables no hay problemas", () => {
        expect(revisarProduccion(completo)).toEqual([]);
    });

    test("sin variables señala cada obligatoria por su nombre", () => {
        expect(revisarProduccion({})).toEqual(OBLIGATORIAS.map((nombre) => `falta ${nombre}`));
    });

    test("una variable con solo espacios cuenta como faltante", () => {
        expect(revisarProduccion({ ...completo, DATABASE_URL: "   " })).toEqual(["falta DATABASE_URL"]);
    });

    test("una clave corta se rechaza", () => {
        expect(revisarProduccion({ ...completo, JWT_SECRET: "corta" })).toEqual([
            "JWT_SECRET debe tener al menos 32 caracteres",
        ]);
    });

    test("un origen sin https se rechaza", () => {
        expect(revisarProduccion({ ...completo, CORS_ORIGENES: "http://localhost:3000" })).toEqual([
            "el origen http://localhost:3000 de CORS_ORIGENES debe usar https",
        ]);
    });

    test("los mensajes nunca muestran el valor de una variable", () => {
        const problemas = revisarProduccion({ ...completo, JWT_SECRET: "clave-secreta-corta" });

        expect(problemas.join(" ")).not.toContain("clave-secreta-corta");
    });
});
