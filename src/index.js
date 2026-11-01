// Paso 0: importar las funciones del módulo mundo.js
const { crearMundo, guardarMundo, leerMundo } = require('./mundo');

// Paso 1: ejecutar la validación, guardado y lectura del JSON
function main() {
    try {
        const argumentos = process.argv.slice(2);
        const nuevoMundo = crearMundo(argumentos);
        const rutaJson = guardarMundo(nuevoMundo);
        const mundoGuardado = leerMundo(rutaJson);

        console.log(`Paso 1: mundo guardado en data/mundo_${mundoGuardado.id}.json`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
    }
}

main();
