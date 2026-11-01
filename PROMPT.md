# PROMPT.md — Bitácora de uso de IA (`mundos-ia`)

## A. Declaración

Usé IA: **sí**

En este taller trabajé con dos asistentes de inteligencia artificial con funciones distintas:
1. **Agente de código en el editor (Google Antigravity):** escribió e iteró los archivos del proyecto parte por parte dentro de mi espacio de trabajo siguiendo mis instrucciones y restricciones.
2. **Claude (fuera del editor):** me ayudó a planificar el trabajo, revisar las entregas del agente del editor, diagnosticar comportamientos del entorno (como las variables exportadas en la terminal frente a `process.loadEnvFile`) y redactar mis prompts.

Confirmación personal: `[CONFIRM: escribe aquí una línea confirmando con tus palabras esta declaración]`

---

## B. Herramienta y modelo

- **Agente dentro del editor:** Google Antigravity — modelo: `[CONFIRM: verifica y escribe el nombre exacto del modelo que muestra el selector de tu editor]`
- **Asistente fuera del editor:** Anthropic Claude — modelo/versión: `[CONFIRM: escribe la versión exacta de Claude que utilizaste]`

---

## C. Prompt inicial (literal, completo)

`[CONFIRM: pega aquí abajo tu primer prompt exactamente como lo enviaste al inicio de esta conversación, sin resumirlo y conservando sin rellenar los marcadores originales <Groq or NVIDIA> y <NVIDIA FLUX.1-schnell or Cloudflare Workers AI>, sin adjuntar el texto completo de la guía]`

```text
[PEGA AQUÍ TU PROMPT INICIAL LITERAL Y COMPLETO]
```

---

## D. Prompts siguientes (los 4 más importantes)

### 1. Respuestas al plan inicial, servicios elegidos al comienzo y aceptación de sintaxis básica

- **Prompt enviado (literal):**
  ```text
  Answers:

  1. Services:
     - Text: Groq (https://api.groq.com/openai/v1/chat/completions), model openai/gpt-oss-20b.
     - Image: NVIDIA FLUX.1-schnell (https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell).
     So I need 2 keys: TEXTO_API_KEY (gsk_...) and IMAGEN_API_KEY (nvapi-...).
     Use these values in .env.example and in the README links. In imagen.js read
     datos.artifacts[0].base64 and check finishReason === 'SUCCESS'.

  2. Project root:
     - Yes, initialize directly in /home/oliver/Documents/Node/mundo-ia, with no nested
       mundos-ia/ subfolder. Keep "name": "mundos-ia" in package.json.
     - Keep .gitignore with only the 5 required lines. Move GUIA_mundos-ia.md to the parent
       folder (/home/oliver/Documents/Node/) before the first commit, so it is not tracked
       and does not appear in npm publish --dry-run. Do the move yourself and tell me.

  3. Syntax: Yes. Use plain beginner syntax everywhere:
     - for loops and if checks instead of new Set(...), .some(...), ?. and ??.
     - To check that the 5 colors are different, compare each color against the
       others with two nested for loops (lowercase + trim first).
     - To read API responses, check step by step with if
       (if (datos.choices && datos.choices.length > 0) ...) instead of optional chaining.
     Every line must be easy for me to explain out loud.

  4. package.json author: use "Oliver". I will edit it myself if needed.

  Go. Start Part 1.
  ```
- **Resumen de la respuesta del agente:** Movió `GUIA_mundos-ia.md` a `/home/oliver/Documents/Node/`, ejecutó `git init`, `npm init -y` y `npm install object-hash` (`^3.0.0`), y creó los archivos base (`package.json`, `.gitignore`, `.env.example`, `.env` solo con textos de marcador, `README.md` inicial y los cuatro módulos vacíos en `src/`).
- **Qué hice con ella:** Probé `npm start`, verifiqué con `git status` que no aparecieran `.env`, `node_modules/` ni `GUIA_mundos-ia.md`, e hice el commit de la Parte 1.

---

### 2. Implementación de `src/texto.js` (Parte 3) y desglose del mensaje de sistema

- **Prompt enviado (acortado; se indica con `[...]` la línea de plantilla sobre `creadoEn` que quedó sin rellenar):**
  ```text
  Part 2 tested: valid world gives the same id twice, the three validation errors
  show clear Spanish messages with a usage example, and process.exitCode is 1 on
  failure (checked with echo $?). Committed.

  [...]

  Now go with Part 3 (texto.js and the step 2 section of index.js). Keep the same rules:
  complete files, plain beginner syntax, Spanish numbered comments, error.status set
  inside texto.js, no API key printed or logged. Show me the system message you wrote
  and explain each sentence of it, because I must be able to edit it live. Do not call
  the API yourself: I will run one single test and report the result.
  ```
- **Resumen de la respuesta del agente:** Creó `src/texto.js` usando `fetch` hacia `TEXTO_URL`, `AbortSignal.timeout(30000)`, asignación de `error.status` y lectura de `datos.choices[0].message.content` con condicionales `if` simples; explicó cada una de las 6 oraciones del mensaje de sistema en inglés y actualizó `src/index.js` para releer el JSON y guardar el `.txt`.
- **Qué hice con ella:** Configuré mi clave de Groq en `.env`, ejecuté una prueba que generó `descripciones/mundo_cba86145.txt` en un párrafo en inglés con los 5 colores `[CONFIRM: número de palabras obtenido con wc -w]`, verifiqué que no se imprimiera ninguna clave e hice el commit de la Parte 3.

---

### 3. Reemplazo del servicio de imágenes por Pollinations tras descartar NVIDIA y Google Gemini

- **Prompt enviado (acortado; se resume la lista de restricciones repetidas y el detalle de subtareas):**
  ```text
  CURRENT STATE
  - Parts 1 to 3 are done and committed (mundo.js, texto.js with Groq working, index.js
    orchestrating steps 1 and 2). Do not touch mundo.js or texto.js.
  - Part 4 (imagen.js, step 3) was written for NVIDIA FLUX.1-schnell, which always times out
    on my connection. I tried Google's Gemini image model, but my key has no quota for it
    (HTTP 429). I tested Pollinations from my terminal and it works: HTTP 200 in 0.6 s and
    the response is a real JPEG. My instructor allowed me to change services if the others
    failed. So: REPLACE the image service with Pollinations (no API key).
  - My network has no working IPv6, so I run Node with
    NODE_OPTIONS="--dns-result-order=ipv4first". Do not change that.
  [...]
  TASK 1: rewrite src/imagen.js [GET process.env.IMAGEN_URL + encodeURIComponent(slice(0, 900)),
          AbortSignal.timeout(120000), validar Content-Type image/ y Buffer.from(arrayBuffer)]
  TASK 2: .env and .env.example [IMAGEN_API_KEY ya no se necesita]
  TASK 3: Part 5 on top of this [fs.existsSync para reutilizar .txt y .jpg + explicarError]
  ```
- **Resumen de la respuesta del agente:** Reescribió `src/imagen.js` para Pollinations mediante `GET` sin clave, recortando la descripción en memoria a 900 caracteres, validando que `content-type` iniciara con `image/` y obteniendo los bytes con `Buffer.from(await respuesta.arrayBuffer())`; quitó `IMAGEN_API_KEY` de `.env.example` y actualizó `src/index.js` con `fs.existsSync` y `explicarError`.
- **Qué hice con ella:** Actualicé mi `.env` local a Pollinations, resolví el error `404` causado por variables viejas exportadas previamente en mi sesión de terminal (`unset IMAGEN_URL IMAGEN_API_KEY TEXTO_API_KEY TEXTO_URL TEXTO_MODELO`), busqué y borré una línea temporal `DEBUG` en `src/imagen.js` antes de confirmar con `node --check`, comprobé que se guardara el JPEG real e hice el commit de la Parte 4.

---

### 4. Revisión previa a las evidencias de Parte 5 y pruebas de errores con prefijos en la terminal

- **Prompt enviado (acortado; se muestra la parte correspondiente a Task A):**
  ```text
  - I learned that a variable already exported in the shell wins over .env, because
    process.loadEnvFile does not overwrite existing variables.
  [...]
  TASK A: Review before Part 5 evidence
  1. Read my current src/index.js, src/mundo.js, src/texto.js and src/imagen.js and tell me,
     in a short list, anything that breaks the rules above or the workshop rubric [...]
  2. Check that explicarError covers: 400 and 401/403 (invalid key or permission), 402/429
     (free limit; for Pollinations say to wait about 45 seconds; mention retry-after if
     present), 404/410, TypeError from fetch (no connection or wrong URL), and
     error.name === 'TimeoutError'. If something is missing, give me the complete corrected
     index.js.
  3. Give me an exact checklist of 3 or 4 commands to provoke errors on purpose WITHOUT
     editing .env (using a variable prefix such as TEXTO_API_KEY=falsa npm start -- ...) [...]
  4. Give me 3 short practice exercises for the live defense [...]
  ```
- **Resumen de la respuesta del agente:** Revisó los cuatro módulos en `src/`, agregó las ramas explícitas `error.status === 400` y `error.name === 'SyntaxError'` en `explicarError` dentro de `src/index.js` según lo pedido en el punto 2, y entregó ejemplos de comandos con prefijos de entorno junto con 3 ejercicios de práctica para sustentación.
- **Qué hice con ella:** Revisé `src/index.js` y ejecuté pruebas de error sin editar `.env` usando prefijos de variables de entorno, comprobando el mensaje en español con código de salida `1` para URL de imagen inválida (`"No se pudo conectar. Revisa tu conexión a internet o la URL en .env."`) y `[CONFIRM: detalla aquí exactamente qué otras pruebas de error corriste en tu terminal, qué mensajes y códigos devolvieron y cuándo hiciste el commit de Parte 5]`.

---

## E. Mis cambios sobre lo que entregó la IA (mínimo 3)

### Candidato 1 — Aceptar y concretar sintaxis básica (`for` e `if`) en lugar de los atajos de la guía de referencia
- **Hechos verificados:** Los fragmentos de ejemplo de la guía usada como especificación (`GUIA_mundos-ia.md`) empleaban `new Set(...)`, `.some(...)`, `?.` y `??`. El agente del editor propuso en su plan inicial reemplazarlos por ciclos `for` y condicionales `if` simples para respetar las restricciones de principiante; acepté esa propuesta e indiqué usar dos ciclos `for` anidados para comparar los 5 colores en minúsculas y condicionales `if` paso a paso para leer el JSON de las APIs.
- **Preguntas guía:**
  1. ¿Por qué aceptaste usar ciclos `for` anidados e `if` paso a paso en vez de `new Set` o `?.` que aparecían en la guía?
  2. ¿Cómo funciona la comparación de colores en `src/mundo.js` y por qué te resulta más clara para explicarla en voz alta en la sustentación?

TU EXPLICACIÓN:

Elegí esta sintaxis porque es más fácil de seguir y defender en una sustentación
de principiante. Los ciclos `for` muestran explícitamente qué elementos se
comparan, y los `if` muestran cada condición sin esconderla detrás de métodos o
atajos.

Primero se guardan los cinco colores normalizados en minúsculas y sin espacios
sobrantes. Después, el ciclo exterior elige un color y el interior empieza en la
posición siguiente (`j = i + 1`), así que cada pareja se compara una sola vez. Si
dos valores son iguales, se lanza el error; si no, la validación termina y el
mundo puede crearse.
    Los más sólidos: el candidato 2 (reemplazar NVIDIA por Pollinations) y el 3 (quitar la línea DEBUG, que además puedes explicar con grep, sed y node --check).

    Más débiles: el 1 (aceptaste una propuesta del agente) y el 4 (unset y prefijos son decisiones de uso, no ediciones al código). Úsalos solo si puedes defenderlos, y mejor agrega un tercero que sea una edición real tuya.

    Posibles terceros: si cambiaste tú algún valor del código o del .env (por ejemplo el timeout, o borrar IMAGEN_API_KEY de tu .env), o corregiste algo del README como el “de inmediato” o quién relee los archivos, puedes usarlo, pero solo si lo hiciste de verdad.
---

### Candidato 2 — Cambiar el servicio de imágenes a Pollinations tras probar en terminal NVIDIA y Google Gemini ( e hipótesis de `NODE_OPTIONS`)
- **Hechos verificados:** La primera versión de `src/imagen.js` enviaba un `POST` a NVIDIA FLUX.1-schnell, pero siempre terminaba en `"The operation was aborted due to timeout"` (tanto a 60 s como a 120 s). En la red local `curl -6` fallaba y `curl -4` funcionaba, pero forzar IPv4 con `NODE_OPTIONS="--dns-result-order=ipv4first"` NO solucionó el *timeout* del `POST` a NVIDIA (la causa del bloqueo del `POST` a NVIDIA nunca se determinó). Luego se probó Google Gemini: la clave podía listar modelos, pero `gemini-2.5-flash-image` respondió `HTTP 429` (cuota excedida) y algunos nombres de modelos de texto respondieron `404`, por lo que se descartó. Finalmente se probó Pollinations con `curl` desde la terminal (`HTTP 200` y un JPEG real) y, con autorización del instructor, se ordenó reescribir `src/imagen.js` para Pollinations sin clave. Si `NODE_OPTIONS="--dns-result-order=ipv4first"` sigue siendo realmente necesario con Pollinations quedó como hipótesis aún por verificar: `[CONFIRM: resultado de ejecutar un mundo nuevo SIN el prefijo NODE_OPTIONS]`.
- **Preguntas guía:**
  1. ¿Qué pruebas hiciste en tu terminal para descartar NVIDIA y Google Gemini sin adivinar la causa, y cómo verificaste Pollinations antes de cambiar el código?
  2. ¿Qué cambió en `src/imagen.js` y en `.env` al pasar de un `POST` con JSON/base64 y clave a un `GET` directo de bytes JPEG sin clave?
  3. ¿Qué ocurrió cuando probaste ejecutar un mundo nuevo sin el prefijo `NODE_OPTIONS`?

TU EXPLICACIÓN:

El cambio a Pollinations fue una decisión basada en pruebas: NVIDIA agotaba el
tiempo de espera y Gemini respondía con falta de cuota (`HTTP 429`), mientras que
Pollinations respondió con `HTTP 200` y bytes JPEG reales. Por eso `imagen.js`
pasó de enviar un `POST` con JSON, modelo y clave a hacer un `GET` cuya URL
contiene la descripción codificada.

La descripción se recorta solo en memoria a 900 caracteres para que la URL no
crezca innecesariamente; el archivo `.txt` permanece completo. La respuesta se
comprueba con `respuesta.ok` y con `Content-Type` que empiece por `image/`.
Finalmente, `arrayBuffer()` obtiene los bytes binarios y `Buffer.from` los
convierte al formato que Node.js puede escribir directamente como `.jpg`, sin
tratar la imagen como texto.

---

### Candidato 3 — Encontrar y limpiar una línea temporal `DEBUG` en `src/imagen.js` antes del commit
- **Hechos verificados:** Durante las pruebas había quedado en `src/imagen.js` una línea temporal `console.log` con `DEBUG` (que imprimía la longitud de la descripción y el inicio de la URL). Antes de confirmar los cambios en Git, la localicé con `grep -n "DEBUG" src/*.js`, la eliminé con `sed` y verifiqué que el archivo siguiera válido con `node --check`.
- **Preguntas guía:**
  1. ¿Por qué era importante quitar esa línea `DEBUG` de `src/imagen.js` antes de guardar el commit y tomar evidencias?
  2. ¿Para qué te sirvió encadenar `grep -n`, `sed` y `node --check` como revisión previa al commit?

TU EXPLICACIÓN:

Quitar la línea `DEBUG` era importante porque una impresión temporal no forma
parte del comportamiento final y podía revelar datos internos de la petición,
como la URL o el tamaño de la descripción. También podía confundir las
evidencias de la ejecución y hacer parecer que el programa producía información
adicional.

`grep -n "DEBUG" src/*.js` me permitió localizar la línea y ver su número.
Después la eliminé y ejecuté `node --check` para comprobar que la edición no
había dejado un error de sintaxis. Así separé la revisión del contenido de la
revisión de que el archivo siguiera siendo JavaScript válido antes del commit.

---

### Candidato 4 — Limpiar variables viejas del entorno con `unset` y provocar errores con prefijos sin tocar `.env`
- **Hechos verificados:** A partir de la sugerencia de Claude verificada con `echo "$IMAGEN_URL"`, comprobé que `process.loadEnvFile` no sobrescribe variables ya exportadas en la terminal (que habían quedado tras ejecutar antes `set -a; source .env; set +a`), las limpié con `unset IMAGEN_URL IMAGEN_API_KEY TEXTO_API_KEY TEXTO_URL TEXTO_MODELO`, y luego aproveché esa misma regla usando prefijos por comando (`TEXTO_API_KEY=falsa npm start -- ...`, `IMAGEN_URL=...`) para provocar errores de prueba sin modificar mi archivo `.env` (`[CONFIRM: lista de pruebas de error que corriste con este método y sus mensajes]`).
- **Preguntas guía:**
  1. ¿Qué ventaja de seguridad y comodidad tiene provocar errores pasando una variable al inicio del comando en lugar de abrir y editar `.env` cada vez?
  2. ¿Por qué funciona ese prefijo exactamente por la misma razón que antes te había causado el error `404`?

TU EXPLICACIÓN:

Usar un prefijo como `IMAGEN_URL=... npm start -- ...` permite probar una
configuración temporal para un único proceso. No modifica `.env`, evita borrar o
restaurar claves manualmente y reduce el riesgo de dejar una clave falsa o una
URL de prueba guardada en el proyecto.

Funciona porque el shell coloca esa variable en el entorno del proceso que va a
ejecutar `npm`. Node la recibe en `process.env`, y `process.loadEnvFile` no
reemplaza una variable que ya existe allí. Es la misma prioridad que causó el
`404`, solo que esta vez se usa de manera intencional para comprobar el manejo
de errores.

---

## F. Una línea de código que no entendía

### 5 líneas candidatas copiadas de los archivos reales en `src/`

1. **`src/mundo.js` (líneas 30–37):**
   ```js
   for (let i = 0; i < coloresMinusculas.length; i++) {
    for (let j = i + 1; j < coloresMinusculas.length; j++) {
      if (coloresMinusculas[i] === coloresMinusculas[j]) {
        throw new Error(`Los 5 colores deben ser distintos.\n${EJEMPLO_USO}`);
      }
    }
  }
   ```
   *Recordatorio:* Compara cada color en la posición `i` solo contra los colores posteriores (`j = i + 1`) para detectar colores repetidos sin compararlo consigo mismo.

2. **`src/mundo.js` (línea 56):**
   ```js
   const id = hash(datosParaHash).slice(0, 8);
   ```
   *Recordatorio:* Calcula un resumen alfanumérico determinista a partir de `{ situacion, mundo, colores }` (sin la fecha) y recorta los primeros 8 caracteres para nombrar los archivos.

3. **`src/texto.js` (línea 28):**
   ```js
   signal: AbortSignal.timeout(30000),
   ```
   *Recordatorio:* Aborta automáticamente la petición `fetch` si pasan 30 000 milisegundos sin respuesta completa, lanzando un error con `error.name === 'TimeoutError'`.

4. **`src/imagen.js` (líneas 44–45):**
   ```js
    const datosBinarios = await respuesta.arrayBuffer();
    const bytesImagen = Buffer.from(datosBinarios);
   ```
   *Recordatorio:* Espera los bytes crudos del JPEG entregados por Pollinations y los convierte en un `Buffer` de Node.js para escribirlos en disco sin codificación `'utf-8'`.

5. **`src/index.js` (línea 64):**
   ```js
   process.loadEnvFile(path.join(RAIZ, '.env'));
   ```
   *Recordatorio:* Lee `.env` en la raíz del proyecto e inyecta sus variables en `process.env` de forma nativa, respetando cualquier variable que ya exista previamente en el entorno de la terminal.

### Preguntas guía para elegir una y explicarla
1. ¿Qué entra en esa línea de código y qué produce cuando Node.js la ejecuta?
2. ¿Qué fallaría en el programa si borraras esa línea o cambiaras uno de sus parámetros?
3. ¿Cómo la explicarías con tus propias palabras durante la sustentación?

Línea:

TU EXPLICACIÓN:

Elegí `process.loadEnvFile(path.join(RAIZ, '.env'))`. `RAIZ` es la carpeta
principal del proyecto y `path.join` construye la ruta correcta a `.env` sin
depender de escribir manualmente separadores. Al ejecutar la línea, Node.js lee
ese archivo e incorpora sus variables al objeto `process.env`.

Gracias a esto, los módulos pueden consultar `TEXTO_URL`, `TEXTO_API_KEY` e
`IMAGEN_URL` sin poner esos valores directamente en el código. Si se borrara la
línea, el programa no cargaría automáticamente `.env` y las peticiones podrían
fallar por configuración ausente. Si se cambiara `RAIZ` o el nombre del archivo,
podría leer una ruta equivocada. Las variables que ya existen en la terminal se
mantienen, lo que explica el error `404` documentado en la sección G.

---

## G. Un error

### Línea de tiempo verificada del error en el Paso 3 (`código 404` por variable exportada en la terminal)

- **Mensaje de error exacto (sin claves):**
  `Error: El modelo o la URL no existen (código 404). Revisa tu configuración en .env.`
- **Qué probé:**
  1. El archivo `.txt` de la descripción ya existía en `descripciones/`, así que el Paso 2 se reutilizaba y el fallo ocurría al llegar al Paso 3.
  2. Probé con `curl` en la terminal enviando esa misma descripción a Pollinations y respondió `HTTP 200` con datos JPEG reales.
  3. Revisé `src/imagen.js` y confirmé que construía la URL correctamente, y revisé `.env` y confirmé que `IMAGEN_URL` ya tenía la dirección de Pollinations.
  4. Siguiendo la sugerencia de mi otro asistente de IA (Claude) sobre cómo funciona `process.loadEnvFile`, ejecuté `echo "$IMAGEN_URL"` en esa terminal y comprobé que seguía mostrando la URL vieja de NVIDIA.
- **Causa:**
  Antes, en esa misma sesión de terminal, había ejecutado `set -a; source .env; set +a` cuando `.env` todavía tenía los datos de NVIDIA. Eso dejó `IMAGEN_URL` exportada en el entorno de la consola, y `process.loadEnvFile` en Node.js **no sobrescribe** variables que ya existen en `process.env`.
- **Solución:**
  Ejecuté en la terminal:
  ```bash
  unset IMAGEN_URL IMAGEN_API_KEY TEXTO_API_KEY TEXTO_URL TEXTO_MODELO
  ```
  Volví a ejecutar el programa y el Paso 3 tomó la URL de Pollinations desde `.env` y guardó la imagen JPEG correctamente.

### Preguntas guía para redactar tu explicación
1. ¿Por qué parecía contradictorio que `.env` y `curl` estuvieran bien pero `npm start` siguiera devolviendo `código 404`?
2. ¿Qué aprendiste sobre la relación entre las variables de la terminal (`export` / `set -a`), `process.env` y `process.loadEnvFile`?

TU EXPLICACIÓN:

No había una contradicción real: eran dos fuentes de configuración distintas. El
archivo `.env` en el disco y la URL de Pollinations funcionaban correctamente, por
eso `curl` recibía `HTTP 200`. Sin embargo, `npm start` se ejecutaba desde una
terminal que todavía tenía exportada la URL antigua de NVIDIA. Esa variable llegaba
al proceso de Node.js mediante el entorno de la terminal y tenía prioridad sobre el
valor nuevo del archivo `.env`, por lo que el programa seguía construyendo la
petición con una URL que devolvía `404`.

Aprendí que `set -a; source .env; set +a` no solo lee el archivo temporalmente:
deja sus variables exportadas en la sesión actual de la terminal. Después, esas
variables pasan a `process.env` cuando se inicia Node.js. `process.loadEnvFile`
inyecta las variables del archivo, pero no sobrescribe las que ya existen en
`process.env`; por eso conservaba el valor viejo. Al ejecutar `unset` y volver a
iniciar el programa, la variable dejó de estar definida en la terminal y Node.js
pudo tomar la URL correcta desde `.env`.
