const fs = require('fs');
const path = require('path');
const hash = require('object-hash');

const CARPETA_DATA = path.join(__dirname, '..', 'data');
const EJEMPLO_USO =
  'Ejemplo: npm start -- "Una tormenta amenaza la ciudad" "Aerópolis, ciudad flotante" rojo azul verde dorado violeta';

function validarArgumentos(args) {
  if (args.length !== 7) {
    throw new Error(
      `Se esperaban 7 argumentos y llegaron ${args.length}. ¿Olvidaste las comillas o el doble guion?\n${EJEMPLO_USO}`
    );
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i].trim() === '') {
      throw new Error(`Ningún argumento puede estar vacío.\n${EJEMPLO_USO}`);
    }
  }

  const coloresMinusculas = [];
  for (let i = 2; i < args.length; i++) {
    coloresMinusculas.push(args[i].trim().toLowerCase());
  }

  for (let i = 0; i < coloresMinusculas.length; i++) {
    for (let j = i + 1; j < coloresMinusculas.length; j++) {
      if (coloresMinusculas[i] === coloresMinusculas[j]) {
        throw new Error(`Los 5 colores deben ser distintos.\n${EJEMPLO_USO}`);
      }
    }
  }
}

function crearMundo(args) {
  validarArgumentos(args);

  const situacion = args[0].trim();
  const mundo = args[1].trim();
  const colores = [];

  for (let i = 2; i < args.length; i++) {
    colores.push(args[i].trim());
  }

  const datosParaHash = {
    situacion: situacion,
    mundo: mundo,
    colores: colores,
  };
  const id = hash(datosParaHash).slice(0, 8);

  return {
    id: id,
    situacion: situacion,
    mundo: mundo,
    colores: colores,
    creadoEn: new Date().toISOString(),
  };
}

function guardarMundo(mundo) {
  fs.mkdirSync(CARPETA_DATA, { recursive: true });
  const rutaArchivo = path.join(CARPETA_DATA, `mundo_${mundo.id}.json`);
  const textoJson = JSON.stringify(mundo, null, 2);
  fs.writeFileSync(rutaArchivo, textoJson, 'utf-8');
  return rutaArchivo;
}

function leerMundo(ruta) {
  const textoJson = fs.readFileSync(ruta, 'utf-8');
  const objetoMundo = JSON.parse(textoJson);
  return objetoMundo;
}

module.exports = {
  crearMundo: crearMundo,
  guardarMundo: guardarMundo,
  leerMundo: leerMundo,
};
