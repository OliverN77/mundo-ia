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
[PEGA AQUÍ LA SALIDA DE: npm publish --dry-run CON .gitignore]
```

### 2. Resultado SIN `.gitignore` (renombrado temporalmente)

```text
[PEGA AQUÍ LA SALIDA DE: npm publish --dry-run SIN .gitignore]
```

### 3. Análisis: ¿qué cambió y por qué sería peligroso publicar `.env`?

<!-- Escribe aquí con tus propias palabras qué archivos aparecieron al quitar .gitignore y por qué publicar .env en un registro público como npm sería peligroso -->

---

## Preguntas de reflexión

### 1. ¿Por qué el `id` se calcula sin incluir la fecha (`creadoEn`)?

<!-- Escribe aquí tu respuesta con tus propias palabras (2 a 4 líneas) -->

### 2. ¿Por qué el texto descriptivo se pide en inglés?

<!-- Escribe aquí tu respuesta con tus propias palabras (2 a 4 líneas) -->

### 3. ¿Qué diferencia hay entre recibir un JSON de texto y recibir los bytes de una imagen, y qué es base64?

<!-- Escribe aquí tu respuesta con tus propias palabras (2 a 4 líneas) -->

### 4. ¿Qué pasa si guardas la imagen usando `'utf-8'` en `fs.writeFileSync`?

<!-- Escribe aquí tu respuesta con tus propias palabras (2 a 4 líneas) -->

### 5. ¿Qué pasos consumen cuota de las APIs y cómo evitaste repetirlos?

<!-- Escribe aquí tu respuesta con tus propias palabras (2 a 4 líneas) -->

### 6. Si usaste IA: ¿qué fue lo más difícil de pedirle y qué corregiste tú?

<!-- Escribe aquí tu respuesta con tus propias palabras (2 a 4 líneas) -->
