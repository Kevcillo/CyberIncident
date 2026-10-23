// configuración de eslint, el revisor automático de código

const js = require("@eslint/js");
const globals = require("globals");

// reglas de buenas prácticas para todo el proyecto
const reglas = {
    eqeqeq: ["error", "always"],
    "no-var": "error",
    "prefer-const": "error",
    // los errores del servidor sí deben quedar registrados
    "no-console": ["warn", { allow: ["error", "warn"] }],
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    curly: ["error", "all"],
};

module.exports = [
    {
        ignores: ["node_modules/", "database/", "evidencias/", "coverage/"],
    },

    js.configs.recommended,

    // servidor, usa require y module.exports
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: { ...globals.node },
        },
        rules: reglas,
    },

    // página, se ejecuta en el navegador con import y export
    {
        files: ["js/**/*.js"],
        languageOptions: {
            sourceType: "module",
            globals: { ...globals.browser, $: "readonly" },
        },
    },

    // archivos cuyo trabajo es escribir mensajes en la terminal
    {
        files: ["scripts/**/*.js", "config/bitacora.js"],
        rules: { "no-console": "off" },
    },

    // pruebas
    {
        files: ["tests/**/*.js"],
        languageOptions: {
            sourceType: "module",
            globals: { ...globals.node, ...globals.jest },
        },
    },
];
