

## Cómo ejecutar

1. Abrir una terminal dentro de la carpeta que contiene el archivo package.json.
2. Instalar las dependencias con `npm install`
3. Preparar el proyecto con `npm run setup`
   Este paso crea el archivo .env con su clave secreta, la base de datos, las tablas, los incidentes iniciales y los usuarios de prueba.
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
2. Ejecutar `npm test`
   Son 47 pruebas, entre ellas accesos sin token, permisos insuficientes y datos inválidos. Usan una base de datos aparte, así que no modifican los datos reales.

## Cómo probar con Postman

1. Iniciar el servidor con `npm start`
2. En Postman elegir Import y seleccionar el archivo postman/CyberIncident.postman_collection.json
3. Usar Run collection para ejecutar las 24 peticiones en orden.
   La colección inicia sesión sola y guarda los tokens. También crea un incidente de prueba y lo elimina al final, así que no cambia los datos iniciales.

## Seguridad

- Todas las rutas de incidentes exigen iniciar sesión y enviar el token.
- El analista no puede eliminar incidentes; si lo intenta, la API responde 403.
- Las contraseñas se guardan cifradas y nunca se envían en las respuestas.
- Los textos se limpian de código HTML y se rechazan los campos no permitidos.
- Solo los sitios indicados en CORS_ORIGENES pueden usar la API desde un navegador.

## HTTPS

En desarrollo la plataforma usa http://localhost:3000, porque el tráfico no sale de la computadora.
Al publicarla en internet debe usar HTTPS, para que las contraseñas y los tokens viajen cifrados.
Los pasos para activarlo están en el archivo docs/HTTPS.md

## comandos

- `npm run migrate` aplica las migraciones.
- `npm run migrate:undo` deshace todas las migraciones.
- `npm run seed` carga los incidentes iniciales y los usuarios de prueba.

## Rutas de la api

| Método | Ruta | Acción | Quién puede |
| --- | --- | --- | --- |
| POST | /api/auth/login | Inicia sesión y entrega el token | Cualquiera |
| GET | /api/auth/perfil | Muestra el usuario conectado | Con sesión |
| GET | /api/incidentes | Lista los incidentes, acepta los filtros estado, prioridad y tipo | admin y analista |
| GET | /api/incidentes/:id | Devuelve un incidente | admin y analista |
| POST | /api/incidentes | Crea un incidente | admin y analista |
| PUT | /api/incidentes/:id | Reemplaza el incidente completo | admin y analista |
| PATCH | /api/incidentes/:id | Cambia solo los campos enviados | admin y analista |
| DELETE | /api/incidentes/:id | Elimina un incidente | Solo admin |
| GET | /api/estado | Indica si el servicio está activo | Cualquiera |
