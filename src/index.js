// Paso 0: importar módulos nativos y nuestras funciones locales
const fs = require('fs');
const path = require('path');
const { crearMundo, guardarMundo, leerMundo } = require('./mundo');
const { describirMundo } = require('./texto');

// Definir rutas principales desde la ubicación de este archivo
const RAIZ = path.join(__dirname, '..');
const CARPETA_DESC = path.join(RAIZ, 'descripciones');

async function main() {
  try {
    // Paso 0.1: cargar las variables del archivo .env
    process.loadEnvFile(path.join(RAIZ, '.env'));

    // Paso 1: validar argumentos, guardar el JSON y volver a leerlo desde el disco
    const argumentos = process.argv.slice(2);
    const nuevoMundo = crearMundo(argumentos);
    const rutaJson = guardarMundo(nuevoMundo);
    console.log(`Paso 1: mundo guardado en data/mundo_${nuevoMundo.id}.json`);

    const mundoGuardado = leerMundo(rutaJson);

    // Paso 2: enviar el JSON leído al modelo de texto y guardar la descripción en .txt
    const descripcion = await describirMundo(mundoGuardado);
    fs.mkdirSync(CARPETA_DESC, { recursive: true });
    const rutaTxt = path.join(CARPETA_DESC, `mundo_${mundoGuardado.id}.txt`);
    fs.writeFileSync(rutaTxt, descripcion, 'utf-8');
    console.log(`Paso 2: descripción guardada en descripciones/mundo_${mundoGuardado.id}.txt`);
  } catch (error) {
    if (error.status) {
      console.error(`Error: ${error.message} (código ${error.status})`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    process.exitCode = 1;
  }
}

main();
