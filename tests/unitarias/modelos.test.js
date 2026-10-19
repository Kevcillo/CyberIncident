// reglas de negocio de los modelos, se validan sin guardar nada en la base

const { sequelize, Incidente, Usuario } = require("../../models");

const valido = {
    titulo: "Correo sospechoso",
    tipo: "Phishing",
    prioridad: "Alta",
    fecha: "2026-10-17",
    reportadoPor: "soc@cyberincident.com",
    descripcion: "Se recibió un correo que pide verificar las credenciales.",
};

// devuelve los campos con error, o una lista vacía si todo está bien
async function camposConError(datos) {
    try {
        await Incidente.build(datos).validate();
        return [];
    } catch (error) {
        return error.errors.map((e) => e.path);
    }
}

afterAll(async () => {
    await sequelize.close();
});

describe("reglas del incidente", () => {

    test("un incidente completo y correcto es válido", async () => {
        expect(await camposConError(valido)).toEqual([]);
    });

    test("un incidente nuevo empieza abierto y con el equipo de seguridad", () => {
        const incidente = Incidente.build(valido);

        expect(incidente.estado).toBe("Abierto");
        expect(incidente.responsable).toBe("Equipo de Seguridad");
    });

    test("el título debe tener entre 5 y 100 caracteres", async () => {
        expect(await camposConError({ ...valido, titulo: "Abcd" })).toContain("titulo");
        expect(await camposConError({ ...valido, titulo: "Abcde" })).toEqual([]);
        expect(await camposConError({ ...valido, titulo: "x".repeat(100) })).toEqual([]);
        expect(await camposConError({ ...valido, titulo: "x".repeat(101) })).toContain("titulo");
    });

    test("solo se aceptan los tipos, prioridades y estados definidos", async () => {
        expect(await camposConError({ ...valido, tipo: "Virus" })).toContain("tipo");
        expect(await camposConError({ ...valido, prioridad: "Urgente" })).toContain("prioridad");
        expect(await camposConError({ ...valido, estado: "Pendiente" })).toContain("estado");
    });

    test("el reportante debe tener un correo válido", async () => {
        expect(await camposConError({ ...valido, reportadoPor: "correo-malo" })).toContain("reportadoPor");
    });

    test("la fecha debe existir y tener formato AAAA-MM-DD", async () => {
        expect(await camposConError({ ...valido, fecha: "17/10/2026" })).toContain("fecha");
        expect(await camposConError({ ...valido, fecha: "2026-13-45" })).toContain("fecha");
    });

    test("la descripción debe tener entre 20 y 500 caracteres", async () => {
        expect(await camposConError({ ...valido, descripcion: "corta" })).toContain("descripcion");
        expect(await camposConError({ ...valido, descripcion: "x".repeat(501) })).toContain("descripcion");
    });

    test("el código visible tiene el formato INC con tres cifras", () => {
        expect(Incidente.build({ ...valido, id: 7 }).codigo).toBe("INC-007");
        expect(Incidente.build({ ...valido, id: 123 }).codigo).toBe("INC-123");
    });
});

describe("reglas del usuario", () => {

    test("la contraseña se cifra antes de guardarse", async () => {
        const usuario = Usuario.build({ nombre: "Prueba", correo: "p@p.com", contrasena: "Clave123!" });

        await Usuario.runHooks("beforeSave", usuario, {});

        expect(usuario.contrasena).toMatch(/^\$2[aby]\$10\$/);
        expect(usuario.contrasena).not.toBe("Clave123!");
    });

    test("la contraseña correcta se acepta y la incorrecta se rechaza", async () => {
        const usuario = Usuario.build({ nombre: "Prueba", correo: "p@p.com", contrasena: "Clave123!" });
        await Usuario.runHooks("beforeSave", usuario, {});

        expect(await usuario.verificarContrasena("Clave123!")).toBe(true);
        expect(await usuario.verificarContrasena("otra")).toBe(false);
    });

    test("el correo se guarda en minúsculas y sin espacios", async () => {
        const usuario = Usuario.build({ nombre: "Prueba", correo: "  ANA@Correo.com ", contrasena: "Clave123!" });

        await Usuario.runHooks("beforeSave", usuario, {});

        expect(usuario.correo).toBe("ana@correo.com");
    });

    test("la contraseña nunca se incluye al convertir el usuario en respuesta", () => {
        const usuario = Usuario.build({ nombre: "Prueba", correo: "p@p.com", contrasena: "Clave123!" });

        expect(usuario.toJSON()).not.toHaveProperty("contrasena");
    });

    test("solo existen los roles admin y analista", async () => {
        const usuario = Usuario.build({ nombre: "Prueba", correo: "p@p.com", contrasena: "Clave123!", rol: "jefe" });

        await expect(usuario.validate()).rejects.toThrow(/rol debe ser uno de/);
    });
});
