// índice combinado para filtrar por estado y prioridad a la vez

module.exports = {
    async up(queryInterface) {
        await queryInterface.addIndex("incidentes", ["estado", "prioridad"], {
            name: "incidentes_estado_prioridad",
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex("incidentes", "incidentes_estado_prioridad");
    },
};
