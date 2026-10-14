// pruebas de la api de incidentes, casos correctos y casos de error

const request = require("supertest");

const app = require("../app");
const { sequelize, Incidente, Usuario } = require("../models");
const { incidentesIniciales } = require("../seeders/20261003000001-incidentes-iniciales");

let token;

// peticiones con la sesión del administrador
function api() {
    const cliente = request(app);
    const conToken = (peticion) => peticion.set("Authorization", `Bearer ${token}`);

    return {
        get: (url) => conToken(cliente.get(url)),
        post: (url) => conToken(cliente.post(url)),
        put: (url) => conToken(cliente.put(url)),
        patch: (url) => conToken(cliente.patch(url)),
        delete: (url) => conToken(cliente.delete(url)),
    };
}

const nuevoValido = {
    titulo: "Ransomware en servidor",
    tipo: "Malware",
    prioridad: "Crítica",
    fecha: "2026-10-02",
    reportadoPor: "soporte@empresa.com",
    descripcion: "Archivos cifrados en el servidor de archivos principal.",
};

// un administrador para todas las pruebas
beforeAll(async () => {
    await Usuario.destroy({ where: {} });
    await Usuario.create({
        nombre: "Administrador",
        correo: "admin@cyberincident.com",
        contrasena: "Admin123!",
        rol: "admin",
    });

    const res = await request(app)
        .post("/api/auth/login")
        .send({ correo: "admin@cyberincident.com", contrasena: "Admin123!" });

    token = res.body.datos.token;
});

// cada prueba empieza con los 4 incidentes iniciales y ids del 1 al 4
beforeEach(async () => {
    await Incidente.destroy({ where: {} });
    await sequelize.query("DELETE FROM sqlite_sequence WHERE name = 'incidentes'");
    await Incidente.bulkCreate(incidentesIniciales);
});

afterEach(() => {
    jest.restoreAllMocks();
});

afterAll(async () => {
    await sequelize.close();
});

describe("casos correctos", () => {

    test("lista todos los incidentes", async () => {
        const res = await api().get("/api/incidentes");

        expect(res.status).toBe(200);
        expect(res.body.exito).toBe(true);
        expect(res.body.total).toBe(4);
        expect(res.body.datos[0].codigo).toBe("INC-001");
    });

    test("filtra por estado", async () => {
        const res = await api().get("/api/incidentes").query({ estado: "Abierto" });

        expect(res.status).toBe(200);
        expect(res.body.total).toBe(2);
        res.body.datos.forEach((i) => expect(i.estado).toBe("Abierto"));
    });

    test("filtra por prioridad", async () => {
        const res = await api().get("/api/incidentes").query({ prioridad: "Alta" });

        expect(res.status).toBe(200);
        expect(res.body.total).toBe(2);
        res.body.datos.forEach((i) => expect(i.prioridad).toBe("Alta"));
    });

    test("combina filtros de estado y prioridad", async () => {
        const res = await api().get("/api/incidentes").query({ estado: "Abierto", prioridad: "Crítica" });

        expect(res.status).toBe(200);
        expect(res.body.total).toBe(1);
        expect(res.body.datos[0].titulo).toBe("Acceso no autorizado");
    });

    test("un filtro sin coincidencias devuelve una lista vacía", async () => {
        const res = await api().get("/api/incidentes").query({ estado: "Cerrado", prioridad: "Crítica" });

        expect(res.status).toBe(200);
        expect(res.body.total).toBe(0);
    });

    test("obtiene un incidente por id", async () => {
        const res = await api().get("/api/incidentes/2");

        expect(res.status).toBe(200);
        expect(res.body.datos.codigo).toBe("INC-002");
        expect(res.body.datos.tipo).toBe("Intrusión");
    });

    test("crea un incidente y queda guardado en la base", async () => {
        const res = await api().post("/api/incidentes").send(nuevoValido);

        expect(res.status).toBe(201);
        expect(res.body.datos.codigo).toBe("INC-005");
        expect(res.body.datos.estado).toBe("Abierto");
        expect(res.body.datos.responsable).toBe("Equipo de Seguridad");

        const guardado = await Incidente.findByPk(res.body.datos.id);
        expect(guardado.titulo).toBe("Ransomware en servidor");
    });

    test("rechaza campos que no se pueden enviar al crear", async () => {
        const res = await api()
            .post("/api/incidentes")
            .send({ ...nuevoValido, id: 99, estado: "Cerrado" });

        expect(res.status).toBe(400);
        expect(res.body.errores.id).toBe("Campo no permitido.");
        expect(res.body.errores.estado).toBe("Campo no permitido.");
        expect(await Incidente.count()).toBe(4);
    });

    test("actualiza solo los campos enviados", async () => {
        const res = await api().patch("/api/incidentes/1").send({ estado: "Cerrado" });

        expect(res.status).toBe(200);
        expect(res.body.datos.estado).toBe("Cerrado");
        expect(res.body.datos.titulo).toBe("Correo sospechoso");

        const guardado = await Incidente.findByPk(1);
        expect(guardado.estado).toBe("Cerrado");
    });

    test("elimina un incidente de la base", async () => {
        const res = await api().delete("/api/incidentes/3");

        expect(res.status).toBe(200);
        expect(await Incidente.findByPk(3)).toBeNull();
        expect(await Incidente.count()).toBe(3);
    });

    test("responde el estado del servicio", async () => {
        const res = await api().get("/api/estado");

        expect(res.status).toBe(200);
        expect(res.body.estado).toBe("activo");
    });
});

describe("casos de error", () => {

    test("id inexistente devuelve 404", async () => {
        const res = await api().get("/api/incidentes/999");

        expect(res.status).toBe(404);
        expect(res.body.exito).toBe(false);
    });

    test("id que no es número devuelve 400", async () => {
        const res = await api().get("/api/incidentes/abc");

        expect(res.status).toBe(400);
        expect(res.body.errores.id).toBeDefined();
    });

    test("crear sin datos devuelve un error por cada campo obligatorio", async () => {
        const res = await api().post("/api/incidentes").send({});

        expect(res.status).toBe(400);
        expect(Object.keys(res.body.errores).sort()).toEqual(
            ["descripcion", "fecha", "prioridad", "reportadoPor", "tipo", "titulo"]
        );
        expect(await Incidente.count()).toBe(4);
    });

    test("crear con título corto devuelve 400", async () => {
        const res = await api().post("/api/incidentes").send({ ...nuevoValido, titulo: "Ab" });

        expect(res.status).toBe(400);
        expect(res.body.errores.titulo).toMatch(/entre 5 y 100/);
    });

    test("crear con correo inválido devuelve 400", async () => {
        const res = await api().post("/api/incidentes").send({ ...nuevoValido, reportadoPor: "correo-malo" });

        expect(res.status).toBe(400);
        expect(res.body.errores.reportadoPor).toBeDefined();
    });

    test("crear con prioridad fuera de la lista devuelve 400", async () => {
        const res = await api().post("/api/incidentes").send({ ...nuevoValido, prioridad: "Urgente" });

        expect(res.status).toBe(400);
        expect(res.body.errores.prioridad).toBeDefined();
    });

    test("crear con fecha inválida devuelve 400", async () => {
        const res = await api().post("/api/incidentes").send({ ...nuevoValido, fecha: "2026-13-45" });

        expect(res.status).toBe(400);
        expect(res.body.errores.fecha).toBeDefined();
    });

    test("crear con descripción corta devuelve 400", async () => {
        const res = await api().post("/api/incidentes").send({ ...nuevoValido, descripcion: "corta" });

        expect(res.status).toBe(400);
        expect(res.body.errores.descripcion).toBeDefined();
    });

    test("actualizar con estado inválido devuelve 400 y no cambia nada", async () => {
        const res = await api().patch("/api/incidentes/1").send({ estado: "Pendiente" });

        expect(res.status).toBe(400);
        expect(res.body.errores.estado).toBeDefined();
        expect((await Incidente.findByPk(1)).estado).toBe("En investigación");
    });

    test("actualizar sin campos devuelve 400", async () => {
        const res = await api().patch("/api/incidentes/1").send({});

        expect(res.status).toBe(400);
        expect(res.body.errores.general).toBeDefined();
    });

    test("actualizar un id inexistente devuelve 404", async () => {
        const res = await api().patch("/api/incidentes/999").send({ estado: "Cerrado" });

        expect(res.status).toBe(404);
    });

    test("eliminar un id inexistente devuelve 404", async () => {
        const res = await api().delete("/api/incidentes/999");

        expect(res.status).toBe(404);
        expect(await Incidente.count()).toBe(4);
    });

    test("filtro con valor no permitido devuelve 400", async () => {
        const res = await api().get("/api/incidentes").query({ estado: "Perdido" });

        expect(res.status).toBe(400);
        expect(res.body.errores.estado).toBeDefined();
    });

    test("json mal escrito devuelve 400", async () => {
        const res = await api()
            .post("/api/incidentes")
            .set("Content-Type", "application/json")
            .send("{titulo: sin comillas");

        expect(res.status).toBe(400);
        expect(res.body.mensaje).toMatch(/JSON/);
    });

    test("ruta inexistente devuelve 404 en json", async () => {
        const res = await api().get("/api/no-existe");

        expect(res.status).toBe(404);
        expect(res.body.exito).toBe(false);
    });

    test("un fallo de la base devuelve 500 sin mostrar detalles internos", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        jest.spyOn(Incidente, "findAll").mockRejectedValue(new Error("fallo interno"));

        const res = await api().get("/api/incidentes");

        expect(res.status).toBe(500);
        expect(res.body.mensaje).not.toMatch(/fallo interno/);
    });
});
