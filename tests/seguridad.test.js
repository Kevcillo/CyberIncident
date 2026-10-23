// pruebas de seguridad: sesión, roles, datos inválidos y cors

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const { sequelize, Incidente, Usuario } = require("../models");
const { claveToken } = require("../config/seguridad");
const { incidentesIniciales } = require("../seeders/20261003000001-incidentes-iniciales");

const ADMIN = { correo: "admin@cyberincident.com", contrasena: "Admin123!" };
const ANALISTA = { correo: "analista@cyberincident.com", contrasena: "Analista123!" };

const nuevoValido = {
    titulo: "Acceso sospechoso a VPN",
    tipo: "Intrusión",
    prioridad: "Alta",
    fecha: "2026-10-09",
    reportadoPor: "soc@cyberincident.com",
    descripcion: "Varios intentos de conexión a la VPN desde un país no habitual.",
};

let tokenAdmin;
let tokenAnalista;

async function iniciarSesion(credenciales) {
    const res = await request(app).post("/api/auth/login").send(credenciales);
    return res.body.datos.token;
}

const conToken = (token) => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
    await Usuario.destroy({ where: {} });
    await Usuario.create({ nombre: "Administrador", ...ADMIN, rol: "admin" });
    await Usuario.create({ nombre: "Analista de Seguridad", ...ANALISTA, rol: "analista" });

    tokenAdmin = await iniciarSesion(ADMIN);
    tokenAnalista = await iniciarSesion(ANALISTA);
});

// cada prueba empieza con los 4 incidentes iniciales
beforeEach(async () => {
    await Incidente.destroy({ where: {} });
    await sequelize.query("DELETE FROM sqlite_sequence WHERE name = 'incidentes'");
    await Incidente.bulkCreate(incidentesIniciales);
});

afterAll(async () => {
    await sequelize.close();
});

describe("inicio de sesión y contraseñas", () => {

    test("con datos correctos entrega un token y no envía la contraseña", async () => {
        const res = await request(app).post("/api/auth/login").send(ADMIN);

        expect(res.status).toBe(200);
        expect(res.body.datos.token).toBeDefined();
        expect(res.body.datos.usuario.rol).toBe("admin");
        expect(JSON.stringify(res.body)).not.toMatch(/contrasena|Admin123/);
    });

    test("con contraseña incorrecta responde 401", async () => {
        const res = await request(app).post("/api/auth/login").send({ ...ADMIN, contrasena: "incorrecta" });

        expect(res.status).toBe(401);
        expect(res.body.mensaje).toBe("Correo o contraseña incorrectos.");
    });

    test("con correo inexistente responde el mismo mensaje", async () => {
        const res = await request(app).post("/api/auth/login").send({ correo: "nadie@x.com", contrasena: "Admin123!" });

        expect(res.status).toBe(401);
        expect(res.body.mensaje).toBe("Correo o contraseña incorrectos.");
    });

    test("sin datos responde 400", async () => {
        const res = await request(app).post("/api/auth/login").send({});

        expect(res.status).toBe(400);
        expect(res.body.errores.correo).toBeDefined();
        expect(res.body.errores.contrasena).toBeDefined();
    });

    test("las contraseñas se guardan cifradas", async () => {
        const [filas] = await sequelize.query("SELECT contrasena FROM usuarios");

        filas.forEach((fila) => {
            expect(fila.contrasena).toMatch(/^\$2[aby]\$10\$/);
            expect(fila.contrasena).not.toContain("123");
        });
    });
});

describe("acceso sin token o con token inválido", () => {

    test("sin token responde 401", async () => {
        const res = await request(app).get("/api/incidentes");

        expect(res.status).toBe(401);
        expect(res.body.mensaje).toMatch(/Falta el token/);
    });

    test("con un token inventado responde 401", async () => {
        const res = await request(app).get("/api/incidentes").set(conToken("abc.def.ghi"));

        expect(res.status).toBe(401);
    });

    test("con un token vencido responde 401", async () => {
        const vencido = jwt.sign({ sub: 1, rol: "admin" }, claveToken, { expiresIn: -10 });
        const res = await request(app).get("/api/incidentes").set(conToken(vencido));

        expect(res.status).toBe(401);
        expect(res.body.mensaje).toMatch(/expiró/);
    });

    test("con un token firmado con otra clave responde 401", async () => {
        const falso = jwt.sign({ sub: 1, rol: "admin" }, "otra-clave-cualquiera-de-mas-de-treinta-y-dos");
        const res = await request(app).get("/api/incidentes").set(conToken(falso));

        expect(res.status).toBe(401);
    });

    test("sin token tampoco se puede crear ni eliminar", async () => {
        const crear = await request(app).post("/api/incidentes").send(nuevoValido);
        const eliminar = await request(app).delete("/api/incidentes/1");

        expect(crear.status).toBe(401);
        expect(eliminar.status).toBe(401);
        expect(await Incidente.count()).toBe(4);
    });
});

describe("permisos por rol", () => {

    test("el analista consulta, crea y actualiza", async () => {
        const listar = await request(app).get("/api/incidentes").set(conToken(tokenAnalista));
        const crear = await request(app).post("/api/incidentes").set(conToken(tokenAnalista)).send(nuevoValido);
        const actualizar = await request(app)
            .patch(`/api/incidentes/${crear.body.datos.id}`)
            .set(conToken(tokenAnalista))
            .send({ estado: "Cerrado" });

        expect(listar.status).toBe(200);
        expect(crear.status).toBe(201);
        expect(actualizar.status).toBe(200);
        expect(actualizar.body.datos.estado).toBe("Cerrado");
    });

    test("el analista no puede eliminar y el incidente sigue en la base", async () => {
        const res = await request(app).delete("/api/incidentes/1").set(conToken(tokenAnalista));

        expect(res.status).toBe(403);
        expect(res.body.mensaje).toMatch(/Se requiere: admin/);
        expect(await Incidente.findByPk(1)).not.toBeNull();
    });

    test("el administrador sí puede eliminar", async () => {
        const res = await request(app).delete("/api/incidentes/1").set(conToken(tokenAdmin));

        expect(res.status).toBe(200);
        expect(await Incidente.findByPk(1)).toBeNull();
    });
});

describe("validación y limpieza de entradas", () => {

    test("elimina etiquetas html y bloques de código del texto", async () => {
        const res = await request(app)
            .post("/api/incidentes")
            .set(conToken(tokenAdmin))
            .send({ ...nuevoValido, titulo: "<script>alert('x')</script>Correo <b>falso</b>" });

        expect(res.status).toBe(201);
        expect(res.body.datos.titulo).toBe("Correo falso");
    });

    test("rechaza campos no permitidos", async () => {
        const res = await request(app)
            .post("/api/incidentes")
            .set(conToken(tokenAdmin))
            .send({ ...nuevoValido, rol: "admin" });

        expect(res.status).toBe(400);
        expect(res.body.errores.rol).toBe("Campo no permitido.");
    });

    test("rechaza valores que no son texto", async () => {
        const res = await request(app)
            .post("/api/incidentes")
            .set(conToken(tokenAdmin))
            .send({ ...nuevoValido, prioridad: ["Alta"] });

        expect(res.status).toBe(400);
        expect(res.body.errores.prioridad).toBe("Debe ser un texto.");
    });

    test("rechaza peticiones de más de 10 KB", async () => {
        const res = await request(app)
            .post("/api/incidentes")
            .set(conToken(tokenAdmin))
            .send({ ...nuevoValido, descripcion: "x".repeat(20000) });

        expect(res.status).toBe(413);
    });

    test("PUT exige todos los campos y PATCH acepta cambios parciales", async () => {
        const incompleto = await request(app)
            .put("/api/incidentes/2")
            .set(conToken(tokenAdmin))
            .send({ estado: "Cerrado" });

        const completo = await request(app)
            .put("/api/incidentes/2")
            .set(conToken(tokenAdmin))
            .send({
                titulo: "Acceso no autorizado contenido",
                tipo: "Intrusión",
                prioridad: "Crítica",
                estado: "Cerrado",
                fecha: "2026-09-05",
                responsable: "Equipo de Seguridad",
                descripcion: "El acceso fue bloqueado y se cambiaron las credenciales afectadas.",
            });

        expect(incompleto.status).toBe(400);
        expect(completo.status).toBe(200);
        expect(completo.body.datos.estado).toBe("Cerrado");
    });
});

describe("cors", () => {

    test("un sitio no permitido recibe 403", async () => {
        const res = await request(app).get("/api/estado").set("Origin", "http://sitio-malicioso.com");

        expect(res.status).toBe(403);
    });

    test("la página del proyecto está permitida", async () => {
        const res = await request(app).get("/api/estado").set("Origin", "http://localhost:3000");

        expect(res.status).toBe(200);
        expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    });
});

describe("bitácora", () => {

    test("cada respuesta lleva un identificador distinto", async () => {
        const primera = await request(app).get("/api/estado");
        const segunda = await request(app).get("/api/estado");

        expect(primera.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
        expect(primera.headers["x-request-id"]).not.toBe(segunda.headers["x-request-id"]);
    });
});
