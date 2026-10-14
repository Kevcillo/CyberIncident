// permite seguir solo a los usuarios con alguno de los roles indicados

const { SinPermiso } = require("../errors/errores");

function permitirRoles(...roles) {
    return (req, res, next) => {
        if (!req.usuario || !roles.includes(req.usuario.rol)) {
            throw new SinPermiso(
                `Su rol no tiene permiso para esta acción. Se requiere: ${roles.join(" o ")}.`
            );
        }

        next();
    };
}

module.exports = permitirRoles;
