const fs = require('fs');
const path = require('path');
const { crearMundo, guardarMundo, leerMundo } = require('./mundo');
const { describirMundo } = require('./texto');
const { generarImagen } = require('./imagen');

const RAIZ = path.join(__dirname, '..');
const CARPETA_DESC = path.join(RAIZ, 'descripciones');
const CARPETA_IMG = path.join(RAIZ, 'imagenes');

function explicarError(error) {
    if (error.name === 'TimeoutError') {
        return 'El servicio tardó demasiado en responder.';
    }

    if (error.name === 'TypeError') {
        return 'No se pudo conectar. Revisa tu conexión a internet o la URL en .env.';
    }

    if (error.name === 'SyntaxError') {
        return 'El servicio devolvió una respuesta con formato no válido.';
    }

    if (error.code === 'ENOENT') {
        return 'No se encontró un archivo requerido. Verifica que el archivo .env exista.';
    }

    if (error.status === 400) {
        return 'La petición fue rechazada por datos o modelo no válidos (código 400). Revisa tu configuración en .env.';
    }

    if (error.status === 401 || error.status === 403) {
        return `La API key no es válida o no tiene permisos (código ${error.status}). Revisa tu archivo .env.`;
    }

    if (error.status === 402 || error.status === 429) {
        let detalleEspera = ' Espera un momento antes de volver a intentar.';
        if (error.origen === 'imagen') {
            detalleEspera = ' En el servicio de imágenes debes esperar unos 45 segundos.';
        }
        if (error.retryAfter) {
            detalleEspera = `${detalleEspera} Tiempo sugerido: ${error.retryAfter} segundos.`;
        }
        return `Superaste el límite gratuito (código ${error.status}).${detalleEspera}`;
    }

    if (error.status === 404 || error.status === 410) {
        return `El modelo o la URL no existen (código ${error.status}). Revisa tu configuración en .env.`;
    }

    if (error.status) {
        return `El servicio devolvió un error al procesar la petición (código ${error.status}).`;
    }

    return error.message;
}

async function main() {
    try {
        process.loadEnvFile(path.join(RAIZ, '.env'));

        const argumentos = process.argv.slice(2);
        const nuevoMundo = crearMundo(argumentos);
        const rutaJson = guardarMundo(nuevoMundo);
        console.log(`Paso 1: mundo guardado en data/mundo_${nuevoMundo.id}.json`);

        const mundoGuardado = leerMundo(rutaJson);

        fs.mkdirSync(CARPETA_DESC, { recursive: true });
        const rutaTxt = path.join(CARPETA_DESC, `mundo_${mundoGuardado.id}.txt`);

        if (fs.existsSync(rutaTxt)) {
            console.log('Paso 2: la descripción ya existía, no se llamó al modelo de texto.');
        } else {
            const descripcion = await describirMundo(mundoGuardado);
            fs.writeFileSync(rutaTxt, descripcion, 'utf-8');
            console.log(`Paso 2: descripción guardada en descripciones/mundo_${mundoGuardado.id}.txt`);
        }

        fs.mkdirSync(CARPETA_IMG, { recursive: true });
        const rutaImagen = path.join(CARPETA_IMG, `mundo_${mundoGuardado.id}.jpg`);

        if (fs.existsSync(rutaImagen)) {
            console.log('Paso 3: la imagen ya existía, no se llamó al modelo de imágenes.');
        } else {
            const descripcionGuardada = fs.readFileSync(rutaTxt, 'utf-8');
            const bytesImagen = await generarImagen(descripcionGuardada);
            fs.writeFileSync(rutaImagen, bytesImagen);
            console.log(`Paso 3: imagen guardada en imagenes/mundo_${mundoGuardado.id}.jpg`);
        }

        console.log('Listo. Revisa la carpeta imagenes/');
    } catch (error) {
        console.error(`Error: ${explicarError(error)}`);
        process.exitCode = 1;
    }
}

main();
