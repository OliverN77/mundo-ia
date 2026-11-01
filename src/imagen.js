// Paso 3.1: preparar la descripción y construir la URL para Pollinations (sin clave)
async function generarImagen(descripcion) {
  let urlBase = process.env.IMAGEN_URL;
  if (!urlBase || urlBase.trim() === '') {
    throw new Error('Falta configurar IMAGEN_URL en el archivo .env.');
  }

  urlBase = urlBase.trim();
  if (urlBase[urlBase.length - 1] !== '/') {
    urlBase = urlBase + '/';
  }

  // Paso 3.2: recortar la descripción en memoria para no romper la URL (sin tocar el .txt)
  let descripcionRecortada = descripcion.trim();
  if (descripcionRecortada.length > 900) {
    descripcionRecortada = descripcionRecortada.slice(0, 900);
  }

  const textoCodificado = encodeURIComponent(descripcionRecortada);
  const urlFinal = `${urlBase}${textoCodificado}?width=1024&height=1024&nologo=true`;

  // Paso 3.3: enviar la petición GET con límite de 120 segundos y sin cabeceras de clave
  const respuesta = await fetch(urlFinal, {
    method: 'GET',
    signal: AbortSignal.timeout(120000),
  });

  // Paso 3.4: verificar si el servidor respondió con un código de error HTTP
  if (!respuesta.ok) {
    const error = new Error('Error HTTP del modelo de imágenes.');
    error.status = respuesta.status;
    error.retryAfter = respuesta.headers.get('retry-after');
    error.origen = 'imagen';
    throw error;
  }

  // Paso 3.5: validar que la cabecera Content-Type empiece por "image/"
  const tipoContenido = respuesta.headers.get('content-type');
  if (!tipoContenido || tipoContenido.toLowerCase().slice(0, 6) !== 'image/') {
    throw new Error('El servicio no devolvió una imagen válida.');
  }

  // Paso 3.6: convertir los bytes directos en un Buffer y comprobar que no esté vacío
  const datosBinarios = await respuesta.arrayBuffer();
  const bytesImagen = Buffer.from(datosBinarios);

  if (bytesImagen.length === 0) {
    throw new Error('La imagen llegó vacía.');
  }

  return bytesImagen;
}

// Paso 3.7: exportar la función para usarla desde index.js
module.exports = {
  generarImagen: generarImagen,
};
