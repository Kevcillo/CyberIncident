// antes de las pruebas crea una base de prueba limpia con las migraciones

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

module.exports = async () => {
    process.env.NODE_ENV = "test";

    const { test } = require("../config/database");

    fs.rmSync(test.storage, { force: true });

    execSync("npm run migrate", {
        cwd: path.join(__dirname, ".."),
        env: { ...process.env, NODE_ENV: "test" },
        stdio: "ignore",
    });
};
