

## Cómo ejecutar

1. Abrir una terminal dentro de la carpeta que contiene el archivo package.json.
2. Instalar las dependencias con `npm install`
3. Preparar el proyecto con `npm run setup`
   Este paso crea el archivo .env con su clave secreta, la base de datos, las tablas, los incidentes iniciales y los usuarios de prueba.
   Si se omite, el servidor lo hace solo la primera vez que se inicia.
4. Iniciar el servidor con `npm start`
5. Abrir en el navegador http://localhost:3000
6. Iniciar sesión con uno de los usuarios de prueba.

## Usuarios de prueba

| Correo | Contraseña | Rol | Puede |
| --- | --- | --- | --- |
| admin@cyberincident.com | Admin123! | admin | Consultar, crear, editar y eliminar |
| analista@cyberincident.com | Analista123! | analista | Consultar, crear y editar, pero no eliminar |

Son usuarios de demostración. En la base de datos sus contraseñas se guardan cifradas.

## Si algo falla

- Se necesita Node.js versión 18 o superior.
- Si PowerShell dice que la ejecución de scripts está deshabilitada, usar la terminal CMD o ejecutar `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
- Si el puerto 3000 está ocupado, cambiar el valor de PORT en el archivo .env y agregar la nueva dirección en CORS_ORIGENES.
- Si el servidor pide ejecutar npm run setup, hacerlo y volver a iniciar.

## Cómo ejecutar las pruebas

1. Haber hecho los pasos 2 y 3 de la sección anterior.
2. Ejecutar `npm test` para correr las 90 pruebas.
3. Ejecutar `npm run test:unitarias` para correr solo las 43 pruebas de reglas de negocio.

Las pruebas de la API revisan accesos sin token, permisos insuficientes y datos inválidos. Las unitarias revisan cada regla por separado, como los permisos por rol, las validaciones y el resumen del panel. Ninguna modifica los datos reales.

## Revisión del código

Ejecutar `npm run lint`
ESLint revisa todo el proyecto y no debe mostrar ningún problema. Su configuración está en eslint.config.js.

## Medición de rendimiento

Ejecutar `npm run medir`
El script crea 20.000 incidentes en una base temporal y mide la consulta que filtra por estado y prioridad, antes y después de las mejoras. La base temporal se borra al terminar.

Mejoras aplicadas:

- Índice combinado de estado y prioridad, con una migración propia.
- El listado trae solo las columnas que muestra; el detalle completo se pide aparte.
- Las respuestas del servidor viajan comprimidas.
- El navegador guarda las imágenes durante 7 días.
- La foto del login se sirve en formato WebP y al tamaño en que se muestra: pasó de 7.883 KB a 28 KB.
- Se quitó Bootstrap, que casi no se usaba, y jQuery ya no frena el dibujo de la página.

Lighthouse califica el login con 100 en rendimiento, accesibilidad, buenas prácticas y buscadores.

## Registro de defectos

Los defectos encontrados con DevTools y Lighthouse, su causa en el código y su corrección están en el archivo docs/defectos.md

## Cómo probar con Postman

1. Iniciar el servidor con `npm start`
2. En Postman elegir Import y seleccionar el archivo postman/CyberIncident.postman_collection.json
3. Usar Run collection para ejecutar las 24 peticiones en orden.
   La colección inicia sesión sola y guarda los tokens. También crea un incidente de prueba y lo elimina al final, así que no cambia los datos iniciales.

## Organización del código

La página sigue el patrón modelo, vista y controlador dentro de la carpeta js:

- modelos: los datos, la sesión y las reglas de negocio.
- vistas: lo único que lee y cambia la página.
- controladores: coordinan los modelos y las vistas, sin tocar la página.
- app.js: crea las piezas y las conecta.

El servidor usa la misma idea con las carpetas models, controllers y routes, más los middlewares de seguridad.

## Seguridad

- Todas las rutas de incidentes exigen iniciar sesión y enviar el token.
- El analista no puede eliminar incidentes. Si lo intenta, la API responde 403.
- Las contraseñas se guardan cifradas y nunca se envían en las respuestas.
- Los textos se limpian de código HTML y se rechazan los campos no permitidos.
- Solo los sitios indicados en CORS_ORIGENES pueden usar la API desde un navegador.
- jQuery se carga con firma de integridad, así el navegador rechaza cualquier versión alterada.

## HTTPS

En desarrollo la plataforma usa http://localhost:3000, porque el tráfico no sale de la computadora.
Al publicarla en internet debe usar HTTPS, para que las contraseñas y los tokens viajen cifrados.
Los pasos para activarlo están en el archivo docs/HTTPS.md

## Créditos

La fotografía del login es de Unsplash y se usa bajo su licencia libre.

## comandos

- `npm start` inicia el servidor.
- `npm run setup` prepara el proyecto.
- `npm test` ejecuta todas las pruebas.
- `npm run test:unitarias` ejecuta solo las pruebas unitarias.
- `npm run lint` revisa el código con ESLint.
- `npm run medir` mide el rendimiento de la consulta.
- `npm run empaquetar` crea el zip de entrega sin el archivo .env, la base de datos ni las dependencias.
- `npm run migrate` aplica las migraciones.
- `npm run migrate:undo` deshace todas las migraciones.
- `npm run seed` carga los incidentes iniciales y los usuarios de prueba.

## Rutas de la api

| Método | Ruta | Acción | Quién puede |
| --- | --- | --- | --- |
| POST | /api/auth/login | Inicia sesión y entrega el token | Cualquiera |
| GET | /api/auth/perfil | Muestra el usuario conectado | Con sesión |
| GET | /api/incidentes | Lista los incidentes, acepta los filtros estado, prioridad y tipo | admin y analista |
| GET | /api/incidentes/:id | Devuelve un incidente completo | admin y analista |
| POST | /api/incidentes | Crea un incidente | admin y analista |
| PUT | /api/incidentes/:id | Reemplaza el incidente completo | admin y analista |
| PATCH | /api/incidentes/:id | Cambia solo los campos enviados | admin y analista |
| DELETE | /api/incidentes/:id | Elimina un incidente | Solo admin |
| GET | /api/estado | Health check: revisa el servidor y la base de datos, responde 200 o 503 | Cualquiera |
