async function generarImagen(descripcion) {
  let urlBase = process.env.IMAGEN_URL;
  if (!urlBase || urlBase.trim() === '') {
    throw new Error('Falta configurar IMAGEN_URL en el archivo .env.');
  }

  urlBase = urlBase.trim();
  if (urlBase[urlBase.length - 1] !== '/') {
    urlBase = urlBase + '/';
  }

  let descripcionRecortada = descripcion.trim();
  if (descripcionRecortada.length > 900) {
    descripcionRecortada = descripcionRecortada.slice(0, 900);
  }

  const textoCodificado = encodeURIComponent(descripcionRecortada);
  const urlFinal = `${urlBase}${textoCodificado}?width=1024&height=1024&nologo=true`;

  const respuesta = await fetch(urlFinal, {
    method: 'GET',
    signal: AbortSignal.timeout(120000),
  });

  if (!respuesta.ok) {
    const error = new Error('Error HTTP del modelo de imágenes.');
    error.status = respuesta.status;
    error.retryAfter = respuesta.headers.get('retry-after');
    error.origen = 'imagen';
    throw error;
  }

  const tipoContenido = respuesta.headers.get('content-type');
  if (!tipoContenido || tipoContenido.toLowerCase().slice(0, 6) !== 'image/') {
    throw new Error('El servicio no devolvió una imagen válida.');
  }

  const datosBinarios = await respuesta.arrayBuffer();
  const bytesImagen = Buffer.from(datosBinarios);

  if (bytesImagen.length === 0) {
    throw new Error('La imagen llegó vacía.');
  }

  return bytesImagen;
}

module.exports = {
  generarImagen: generarImagen,
};
