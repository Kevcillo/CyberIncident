

## Cómo ejecutar

1. Abrir una terminal dentro de la carpeta que contiene el archivo package.json.
2. Instalar las dependencias con `npm install`
3. Preparar el proyecto con `npm run setup`
   Este paso crea el archivo .env, la base de datos, la tabla y los incidentes iniciales.
4. Iniciar el servidor con `npm start`
5. Abrir en el navegador http://localhost:3000

## Si algo falla

- Se necesita Node.js versión 18 o superior.
- Si PowerShell dice que la ejecución de scripts está deshabilitada, usar la terminal CMD o ejecutar `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
- Si el puerto 3000 está ocupado, cambiar el valor de PORT en el archivo .env
- Si el servidor pide ejecutar npm run setup, hacerlo y volver a iniciar.

## Cómo ejecutar las pruebas

1. Haber hecho los pasos 2 y 3 de la sección anterior.
2. Ejecutar `npm test`
   Las pruebas usan una base de datos aparte, así que no modifican los datos reales.

## Cómo probar con Postman

1. Iniciar el servidor con `npm start`
2. En Postman elegir Import y seleccionar el archivo postman/CyberIncident.postman_collection.json
3. Ejecutar las peticiones en orden, o usar Run collection para ejecutarlas todas.
   La colección crea un incidente de prueba y lo elimina al final, así que no cambia los datos iniciales.

## comandos

- `npm run migrate` aplica las migraciones.
- `npm run migrate:undo` deshace todas las migraciones.
- `npm run seed` carga los incidentes iniciales.

## Rutas de la api

- GET /api/incidentes lista los incidentes y acepta los filtros estado, prioridad y tipo.
- GET /api/incidentes/:id devuelve un incidente.
- POST /api/incidentes crea un incidente.
- PUT /api/incidentes/:id actualiza los campos enviados.
- DELETE /api/incidentes/:id elimina un incidente.
- GET /api/estado indica si el servicio está activo.

