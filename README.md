# mundos-ia

Programa de consola en Node.js que genera bocetos visuales de mundos imaginarios con inteligencia artificial a partir de 7 parámetros recibidos por terminal: una situación, la descripción de un mundo y 5 colores distintos.

El flujo completo ocurre en 3 pasos encadenados por archivos en disco:
1. **Paso 1 (`src/mundo.js`):** Valida los 7 argumentos, calcula un identificador único de 8 caracteres con `object-hash` (sin incluir la fecha) y guarda el objeto en `data/mundo_<id>.json`.
2. **Paso 2 (`src/texto.js`):** Relee el archivo JSON desde el disco, lo envía al modelo de lenguaje en Groq mediante `fetch` y guarda un párrafo descriptivo en inglés en `descripciones/mundo_<id>.txt`.
3. **Paso 3 (`src/imagen.js`):** Lee el archivo `.txt` guardado, solicita la ilustración en formato JPEG a Pollinations mediante `fetch` y guarda los bytes binarios en `imagenes/mundo_<id>.jpg`.

Si la descripción `.txt` o la imagen `.jpg` de un mismo mundo ya existen en disco, el programa los reutiliza automáticamente con `fs.existsSync` para no gastar cuota de las APIs.

---

## Requisitos

- **Node.js 20.12 o superior** (necesario para `process.loadEnvFile`, `fetch` nativo y `AbortSignal.timeout`). Verifica con `node -v`.
- **npm** y **Git** instalados.
- Una cuenta gratuita y una API key activa en **Groq** (el servicio de imágenes Pollinations no requiere clave).

---

## Configuración

1. Clona este repositorio e instala la única dependencia (`object-hash`):
   ```bash
   npm install
   ```
2. Crea tu archivo local `.env` copiando la plantilla `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Abre `.env` en tu editor y reemplaza `pega_aqui_tu_clave` en `TEXTO_API_KEY` por tu clave real de Groq (`gsk_...`), sin comillas ni espacios adicionales:
   ```dotenv
   TEXTO_API_KEY=pega_aqui_tu_clave
   TEXTO_URL=https://api.groq.com/openai/v1/chat/completions
   TEXTO_MODELO=openai/gpt-oss-20b
   IMAGEN_URL=https://image.pollinations.ai/prompt/
   ```

---

## Ejemplo de uso

Recuerda incluir el doble guion (`--`) después de `npm start` para que npm entregue los argumentos a Node.js, y encerrar entre comillas (`"..."`) tanto la situación como el mundo:

```bash
npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta
```

*(Si tu red no tiene conectividad IPv6 funcional, ejecuta anteponiendo `NODE_OPTIONS="--dns-result-order=ipv4first"` antes de `npm start`.)*

### Salida esperada en consola

**Primera ejecución (crea los 3 archivos):**

```text
Paso 1: mundo guardado en data/mundo_cba86145.json
Paso 2: descripción guardada en descripciones/mundo_cba86145.txt
Paso 3: imagen guardada en imagenes/mundo_cba86145.jpg
Listo. Revisa la carpeta imagenes/
```

**Segunda ejecución con los mismos argumentos (reutiliza `.txt` y `.jpg` sin llamar a las APIs):**

```text
Paso 1: mundo guardado en data/mundo_cba86145.json
Paso 2: la descripción ya existía, no se llamó al modelo de texto.
Paso 3: la imagen ya existía, no se llamó al modelo de imágenes.
Listo. Revisa la carpeta imagenes/
```

---

## Estructura de carpetas

```text
mundos-ia/
├── src/
│   ├── index.js          # Orquesta los pasos 1 a 3, reutiliza archivos y traduce errores
│   ├── mundo.js          # Valida argumentos, calcula el id y guarda/lee el JSON
│   ├── texto.js          # Llama al modelo de texto (Groq) con fetch
│   └── imagen.js         # Llama al servicio de imágenes (Pollinations) y devuelve un Buffer
├── data/                 # Archivos JSON generados (ignorada en Git)
├── descripciones/        # Descripciones en inglés .txt (ignorada en Git)
├── imagenes/             # Imágenes generadas .jpg (ignorada en Git)
├── evidencias/           # Capturas de pantalla e imágenes de muestra para la entrega
├── .env                  # Variables locales y clave privada (NO se sube a Git)
├── .env.example          # Plantilla pública de configuración sin claves reales
├── .gitignore            # Archivos y carpetas excluidos de Git y npm publish
├── package.json          # Metadatos del proyecto, script start y dependencia object-hash
├── PROMPT.md             # Bitácora de uso de IA durante el taller
└── README.md             # Documentación principal del proyecto
```

---

## Servicios elegidos

- **Modelo de texto — Groq:** [https://console.groq.com](https://console.groq.com)  
  Endpoint compatible con OpenAI (`POST https://api.groq.com/openai/v1/chat/completions`) usando el modelo `openai/gpt-oss-20b`.
- **Modelo de imágenes — Pollinations.ai:** [https://pollinations.ai](https://pollinations.ai)  
  Endpoint HTTP directo sin API key (`GET https://image.pollinations.ai/prompt/<descripcion>?width=1024&height=1024&nologo=true`), que entrega directamente los bytes JPEG (`image/jpeg`).

**Nota sobre servicios descartados:** Durante las pruebas iniciales se configuró **NVIDIA NIM (`FLUX.1-schnell`)**, pero las peticiones agotaban sistemáticamente el tiempo de espera (*timeout*) desde la red disponible. También se probó el modelo de generación de imágenes de **Google Gemini**, pero la cuenta devolvió error de límite de cuota (`HTTP 429`). Por este motivo se adoptó **Pollinations**, que respondió con imágenes JPEG válidas de inmediato.

---

## Solución de problemas frecuentes

1. **Error de conexión o *timeout* en redes sin IPv6 (`No se pudo conectar`):**  
   Algunas redes locales resuelven direcciones IPv6 pero no tienen salida IPv6 funcional. Ejecuta el comando forzando prioridad IPv4:
   ```bash
   NODE_OPTIONS="--dns-result-order=ipv4first" npm start -- "Una tormenta amenaza la ciudad" "Aerópolis, ciudad flotante" rojo azul verde dorado violeta
   ```
2. **Límite gratuito en Pollinations (`código 402`):**  
   El servicio sin clave de Pollinations permite generar **1 imagen cada 45 segundos por dirección IP**. Si solicitas dos imágenes seguidas antes de 45 segundos, verás el aviso en español con código `402`. Espera 45 segundos y vuelve a ejecutar el comando: el archivo `.txt` del Paso 2 se reutilizará sin gastar cuota de Groq.
3. **Variables ya exportadas en la terminal tienen prioridad sobre `.env`:**  
   `process.loadEnvFile` **no sobrescribe** variables de entorno que ya existan en la sesión actual de tu consola. Si modificas `.env` pero el programa parece ignorar el cambio, verifica que no tengas `TEXTO_API_KEY`, `TEXTO_URL`, `TEXTO_MODELO` o `IMAGEN_URL` exportadas en la terminal (puedes limpiarlas con `unset TEXTO_API_KEY TEXTO_URL TEXTO_MODELO IMAGEN_URL`).

---

## Experimento `npm publish --dry-run`

### 1. Resultado CON `.gitignore` activo

```text
npm notice Tarball Contents
npm notice 173B .env.example
npm notice 23.0kB PROMPT.md
npm notice 10.1kB README.md
npm notice 393B package.json
npm notice 1.5kB src/imagen.js
npm notice 4.5kB src/index.js
npm notice 2.1kB src/mundo.js
npm notice 2.2kB src/texto.js
npm notice total files: 21
```

### 2. Resultado SIN `.gitignore` (renombrado temporalmente)

```text
npm notice Tarball Contents
npm notice 209B .env
npm notice 173B .env.example
npm notice 51B .gitignore.experimento
npm notice 23.0kB PROMPT.md
npm notice 10.1kB README.md
npm notice 302B data/mundo_1ae95a64.json
npm notice 316B data/mundo_bb2f2b00.json
npm notice 734B descripciones/mundo_1ae95a64.txt
npm notice 681B descripciones/mundo_bb2f2b00.txt
npm notice 49.4kB imagenes/mundo_1ae95a64.jpg
npm notice 53.3kB imagenes/mundo_bb2f2b00.jpg
npm notice total files: 29
```

### 3. Análisis: ¿qué cambió y por qué sería peligroso publicar `.env`?

Con `.gitignore` activo, npm excluyó `.env`, `data/`, `descripciones/` e
`imagenes/`, que contienen configuración local y archivos generados. Al quitarlo
temporalmente, esos archivos aparecieron en el paquete; también apareció el
archivo renombrado `.gitignore.experimento`.

Publicar `.env` sería peligroso porque contiene la API key de Groq y otros datos
de configuración. Cualquier persona que descargara el paquete podría copiar la
clave, consumir la cuota, generar costos o acceder indebidamente al servicio.
Por eso `.env` debe permanecer ignorado y solo se debe publicar `.env.example`
sin secretos.

---

## Preguntas de reflexión

### 1. ¿Por qué el `id` se calcula sin incluir la fecha (`creadoEn`)?

El `id` debe depender solo de los datos que identifican al mundo: la situación,
el mundo y sus cinco colores. Si se incluyera `creadoEn`, cada ejecución produciría
un identificador diferente aunque los argumentos fueran exactamente iguales.
Al excluir la fecha, el mismo mundo reutiliza su JSON, su descripción y su imagen.

### 2. ¿Por qué el texto descriptivo se pide en inglés?

Se pide en inglés porque ese es el formato elegido para entregar la descripción
al servicio de generación de imágenes y facilita usar un vocabulario visual
amplio y consistente. El modelo de texto recibe el JSON, pero responde un único
párrafo en inglés de entre 80 y 120 palabras, sin títulos ni formato adicional.

### 3. ¿Qué diferencia hay entre recibir un JSON de texto y recibir los bytes de una imagen, y qué es base64?

El JSON de texto contiene datos estructurados y legibles, como `choices` y el
contenido de la descripción; se puede leer con `respuesta.json()`. La imagen no
se debe tratar como texto: Pollinations entrega bytes binarios, que se leen con
`arrayBuffer()` y se convierten en un `Buffer`. Base64 es una forma de representar
bytes binarios como una cadena de texto; algunos servicios la usan dentro de un
JSON, pero este proyecto recibe directamente los bytes JPEG.

### 4. ¿Qué pasa si guardas la imagen usando `'utf-8'` en `fs.writeFileSync`?

Los bytes de la imagen podrían interpretarse como caracteres y modificarse al
codificarlos como texto UTF-8. El archivo resultante podría quedar corrupto y no
abrirse como JPEG. Por eso se pasa directamente el `Buffer` a `writeFileSync`,
sin indicar `'utf-8'`.

### 5. ¿Qué pasos consumen cuota de las APIs y cómo evitaste repetirlos?

El Paso 2 consume cuota cuando llama al modelo de texto de Groq para generar la
descripción. El Paso 3 consume el servicio de imágenes cuando solicita el JPEG a
Pollinations; el Paso 1 es local y no consume cuota. Antes de llamar a cada API,
el programa comprueba con `fs.existsSync` si ya existe el `.txt` o el `.jpg` del
mismo `id` y reutiliza el archivo encontrado.

### 6. Si usaste IA: ¿qué fue lo más difícil de pedirle y qué corregiste tú?

Lo más difícil fue pedirle que mantuviera una sintaxis sencilla, respetara el
flujo por archivos y manejara correctamente respuestas JSON, errores HTTP,
timeouts y bytes de imagen. También fue necesario cambiar el servicio de imágenes
cuando NVIDIA agotaba el tiempo de espera y Gemini devolvía `HTTP 429`.
Yo probé las peticiones, cambié la configuración a Pollinations, eliminé una
línea temporal de `DEBUG`, limpié variables antiguas exportadas en la terminal y
verifiqué que el JPEG se guardara correctamente.
