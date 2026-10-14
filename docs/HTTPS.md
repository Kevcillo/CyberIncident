# HTTPS en CyberIncident

## Qué es 

HTTPS es la versión segura de la conexión entre el navegador y el servidor. Cuando un usuario inicia sesión, su contraseña viaja por esa conexión, y después cada petición lleva su token de acceso. Sin HTTPS, cualquier persona conectada a la misma red podría leer esos datos. Con HTTPS viajan cifrados y no se pueden usar aunque alguien los intercepte.

## Por qué en este proyecto se usa HTTP

Mientras se desarrolla, la plataforma funciona en la propia computadora. El navegador y el servidor están en el mismo equipo, así que la información no viaja por internet y no hay riesgo de que alguien la intercepte.

Cuando la plataforma se publique en internet, HTTPS será obligatorio.

## Cómo se activaría al publicar

Hay dos caminos.

**El más simple** es publicar la plataforma en un servicio de alojamiento como Render o Railway. Estos servicios activan HTTPS de forma automática, sin configurar nada.

**El otro camino** es usar un servidor propio. En ese caso se siguen estos pasos:

1. Contratar un dominio, que es el nombre del sitio en internet.
2. Instalar en el servidor un programa llamado Nginx, que recibe las visitas y se las pasa a la aplicación.
3. Obtener un certificado de seguridad gratuito de Let's Encrypt. El certificado es lo que permite cifrar la conexión y el navegador lo muestra como un candado.
4. Configurar Nginx para que use ese certificado y para que envíe a la versión segura a cualquier persona que entre por la versión sin cifrar.

La aplicación no necesita cambios en su código, porque Nginx se encarga del cifrado.

## Qué cambiar en el archivo de configuración

Al publicar la plataforma hay que ajustar dos valores del archivo .env:

1. En CORS_ORIGENES se escribe la dirección segura del sitio, que empieza con https.
2. En JWT_SECRET se pone una clave nueva y larga, distinta a la que se usó durante el desarrollo.

## Cómo comprobar que funciona

1. Al abrir el sitio, el navegador muestra un candado junto a la dirección.
2. Si alguien entra por la versión sin cifrar, el sitio lo lleva automáticamente a la versión segura.
3. La herramienta gratuita SSL Labs revisa la configuración y debería dar una calificación A.
