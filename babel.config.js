// permite que las pruebas lean el código de la página, que usa import y export

module.exports = {
    presets: [["@babel/preset-env", { targets: { node: "current" } }]],
};
