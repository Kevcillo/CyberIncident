// incidentes de demostración con todas las severidades, tipos y estados

const incidentesDemostracion = [
    {
        titulo: "Ransomware en servidor de archivos",
        tipo: "Malware",
        prioridad: "Crítica",
        estado: "En investigación",
        fecha: "2026-10-14",
        reportadoPor: "soporte@cyberincident.com",
        responsable: "Equipo de Respuesta a Incidentes",
        descripcion: "Un ransomware cifró las carpetas compartidas del servidor de archivos. El servidor fue desconectado de la red y se están restaurando los respaldos.",
    },
    {
        titulo: "Exfiltración de base de clientes",
        tipo: "Fuga de información",
        prioridad: "Crítica",
        estado: "Abierto",
        fecha: "2026-10-18",
        reportadoPor: "admin@cyberincident.com",
        responsable: "Equipo de Seguridad",
        descripcion: "Se detectó la transferencia de un volcado de la base de datos de clientes hacia un servidor externo no autorizado.",
    },
    {
        titulo: "Cuenta de administrador comprometida",
        tipo: "Intrusión",
        prioridad: "Crítica",
        estado: "Cerrado",
        fecha: "2026-08-12",
        reportadoPor: "admin@cyberincident.com",
        responsable: "Equipo de Seguridad",
        descripcion: "Un atacante obtuvo la contraseña de una cuenta de administrador del dominio. Se revocó el acceso, se cambiaron las credenciales y se activó la autenticación multifactor.",
    },
    {
        titulo: "Campaña de phishing a recursos humanos",
        tipo: "Phishing",
        prioridad: "Media",
        estado: "Cerrado",
        fecha: "2026-09-16",
        reportadoPor: "usuario@cyberincident.com",
        responsable: "Equipo de Seguridad",
        descripcion: "Empleados de recursos humanos recibieron correos que suplantaban al banco de la empresa. Nadie ingresó sus datos y se bloqueó el dominio remitente.",
    },
    {
        titulo: "Software no autorizado en estaciones",
        tipo: "Otro",
        prioridad: "Media",
        estado: "Abierto",
        fecha: "2026-08-27",
        reportadoPor: "soporte@cyberincident.com",
        responsable: "Mesa de Ayuda",
        descripcion: "Se encontró software de acceso remoto instalado sin autorización en tres estaciones de trabajo del área contable.",
    },
    {
        titulo: "Escaneo de puertos desde red externa",
        tipo: "Intrusión",
        prioridad: "Baja",
        estado: "Cerrado",
        fecha: "2026-10-21",
        reportadoPor: "soporte@cyberincident.com",
        responsable: "Equipo de Redes",
        descripcion: "El firewall registró un escaneo de puertos desde una dirección IP externa. El tráfico fue bloqueado automáticamente sin afectar los servicios.",
    },
];

module.exports = {
    incidentesDemostracion,

    async up(queryInterface) {
        const ahora = new Date();

        await queryInterface.bulkInsert(
            "incidentes",
            incidentesDemostracion.map((incidente) => ({ ...incidente, createdAt: ahora, updatedAt: ahora }))
        );
    },

    // al deshacer solo se borran estos, los demás incidentes se mantienen
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("incidentes", {
            titulo: { [Sequelize.Op.in]: incidentesDemostracion.map((incidente) => incidente.titulo) },
        });
    },
};
