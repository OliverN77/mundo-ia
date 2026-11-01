// Paso 2.1: pedir al modelo de texto una descripción visual en inglés a partir del JSON
async function describirMundo(mundo) {
  const mensajeSistema =
    'You are a visual concept artist creating an image description from a JSON object that contains a situation, a world, and five colors. ' +
    'Write exactly one paragraph in English between 80 and 120 words. ' +
    'Describe a single static image by detailing the main scene, visual elements, lighting, camera composition, and artistic style, without telling a story. ' +
    'Include all five colors from the JSON naturally in the visual details, translating them into English if needed. ' +
    'Do not include any written words, letters, signs, or labels inside the described image. ' +
    'Reply only with the plain paragraph, using no titles, no lists, no quotation marks, and no markdown formatting.';

  // Paso 2.2: armar el cuerpo de la petición en formato compatible con OpenAI
  const cuerpoPeticion = {
    model: process.env.TEXTO_MODELO,
    messages: [
      { role: 'system', content: mensajeSistema },
      { role: 'user', content: JSON.stringify(mundo) },
    ],
  };

  // Paso 2.3: enviar la petición POST al servicio de texto con límite de 30 segundos
  const respuesta = await fetch(process.env.TEXTO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TEXTO_API_KEY}`,
    },
    body: JSON.stringify(cuerpoPeticion),
    signal: AbortSignal.timeout(30000),
  });

  // Paso 2.4: verificar si el servidor respondió con un código de error HTTP
  if (!respuesta.ok) {
    const error = new Error('Error HTTP del modelo de texto.');
    error.status = respuesta.status;
    error.retryAfter = respuesta.headers.get('retry-after');
    throw error;
  }

  // Paso 2.5: leer la respuesta JSON y extraer el texto paso a paso con condicionales simples
  const datos = await respuesta.json();
  let descripcion = '';

  if (datos && datos.choices && datos.choices.length > 0) {
    const primeraOpcion = datos.choices[0];
    if (primeraOpcion && primeraOpcion.message && primeraOpcion.message.content) {
      descripcion = primeraOpcion.message.content.trim();
    }
  }

  // Paso 2.6: validar que la descripción no esté vacía ni supere 1500 caracteres
  if (descripcion === '') {
    throw new Error('El modelo de texto devolvió una respuesta vacía.');
  }

  if (descripcion.length > 1500) {
    console.log('Aviso: la descripción superó 1500 caracteres y fue recortada.');
    descripcion = descripcion.slice(0, 1500);
  }

  return descripcion;
}

// Paso 2.7: exportar la función para usarla desde index.js
module.exports = {
  describirMundo: describirMundo,
};
