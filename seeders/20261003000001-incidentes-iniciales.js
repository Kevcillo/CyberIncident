// incidentes iniciales de la plataforma

const incidentesIniciales = [
    {
        titulo: "Correo sospechoso",
        tipo: "Phishing",
        prioridad: "Alta",
        estado: "En investigación",
        fecha: "2026-09-05",
        reportadoPor: "usuario@cyberincident.com",
        responsable: "Equipo de Seguridad",
        descripcion: "Se recibió un correo electrónico sospechoso que solicita verificar las credenciales de acceso a un servicio interno.",
    },
    {
        titulo: "Acceso no autorizado",
        tipo: "Intrusión",
        prioridad: "Crítica",
        estado: "Abierto",
        fecha: "2026-09-05",
        reportadoPor: "admin@cyberincident.com",
        responsable: "Equipo de Seguridad",
        descripcion: "Se detectó un intento de acceso no autorizado a un recurso interno de la organización.",
    },
    {
        titulo: "Equipo infectado",
        tipo: "Malware",
        prioridad: "Alta",
        estado: "Abierto",
        fecha: "2026-09-04",
        reportadoPor: "soporte@cyberincident.com",
        responsable: "Equipo de Seguridad",
        descripcion: "Se identificó actividad sospechosa en un equipo y se inició el proceso de contención del incidente.",
    },
    {
        titulo: "Credenciales expuestas",
        tipo: "Fuga de información",
        prioridad: "Media",
        estado: "Cerrado",
        fecha: "2026-09-03",
        reportadoPor: "usuario@cyberincident.com",
        responsable: "Equipo de Seguridad",
        descripcion: "Se detectó la posible exposición de credenciales y se realizaron acciones para proteger las cuentas afectadas.",
    },
];

module.exports = {
    incidentesIniciales,

    async up(queryInterface) {
        const ahora = new Date();

        await queryInterface.bulkInsert(
            "incidentes",
            incidentesIniciales.map((incidente) => ({ ...incidente, createdAt: ahora, updatedAt: ahora }))
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("incidentes", null, {});
    },
};
