# Registro de defectos de CyberIncident

Este documento reúne los defectos encontrados en la plataforma, cómo se detectaron, por qué ocurrían y cómo se corrigieron. Para cada uno se indica la herramienta usada, los pasos para reproducirlo, la causa en el código y la forma de comprobar que quedó resuelto.

Las herramientas usadas fueron DevTools, el panel para desarrolladores que trae el navegador y se abre con F12, y Lighthouse, el auditor incluido en DevTools que califica la página en rendimiento, accesibilidad, buenas prácticas y posicionamiento en buscadores.

## Resumen

| Defecto | Herramienta | Tipo |
| --- | --- | --- |
| 1. Error 404 del ícono de la pestaña | Console y Network | Error visible en consola |
| 2. Doble petición de la lista de incidentes | Network y Sources | Rendimiento |
| 3. Pantalla de login sin región principal | Lighthouse | Accesibilidad |
| 4. jQuery frenaba el dibujo de la página | Lighthouse y Performance | Rendimiento |
| 5. Bootstrap cargado y casi sin usar | Lighthouse y Coverage | Rendimiento |
| 6. Falta la descripción de la página | Lighthouse | Posicionamiento en buscadores |
| 7. Imagen de portada demasiado pesada | Lighthouse y Network | Rendimiento |
| 8. La entrega incluía el archivo con la clave secreta | Revisión del zip | Seguridad |
| 9. Al extraer la entrega quedaba una carpeta dentro de otra | Prueba de instalación | Entrega |

## 1. Error 404 del ícono de la pestaña

Cómo se detectó. Al abrir la página con la pestaña Console de DevTools, aparecía en cada visita un error en rojo: el servidor respondía 404, que significa recurso no encontrado, al pedir el archivo favicon.ico.

Pasos para reproducirlo.
1. Abrir la página con DevTools en la pestaña Console.
2. Recargar sin usar la memoria del navegador con Ctrl y Shift y R.
3. Aparece el error 404 de favicon.ico.

Causa raíz. Cuando una página no indica su ícono, el navegador lo busca por su cuenta en la dirección favicon.ico. El archivo index.html no declaraba ningún ícono y el servidor tampoco tenía ese archivo, así que cada visita terminaba en un error.

Punto de interrupción. No aplica, porque esta petición no la hace el código de la página sino el propio navegador. En la pestaña Network se confirma porque su origen, la columna Initiator, aparece como Other.

Corrección. Se creó el ícono img/icono.svg, se declaró en index.html en la línea 12 y se publicó la carpeta img desde app.js en la línea 36.

Verificación. La consola queda sin errores y en Network la petición del ícono responde 200, que significa correcto.

## 2. Doble petición de la lista de incidentes

Cómo se detectó. En la pestaña Network, filtrando por la palabra api, se veía que al iniciar sesión la página pedía la lista de incidentes dos veces seguidas, y que al cambiar un filtro volvía a pedir la lista completa además de la filtrada.

Pasos para reproducirlo.
1. Abrir DevTools en la pestaña Network y escribir api en el filtro.
2. Iniciar sesión o cambiar el filtro de estado.
3. Aparecen dos peticiones a incidentes por cada acción.

Causa raíz. El controlador de la página pedía dos cosas en paralelo cada vez que se actualizaba la pantalla: la lista filtrada para mostrarla y la lista completa para calcular el resumen de contadores. Esa segunda petición se repetía aunque los datos no hubieran cambiado, por ejemplo al solo filtrar.

Punto de interrupción. En la pestaña Sources se abre el archivo js/modelos/incidentes.js y se marca la línea 23, donde se ejecuta fetch, la función que envía la petición al servidor. Antes de la corrección, la ejecución se detenía dos veces por cada filtro: una con la dirección filtrada y otra con la lista completa, y el panel Call Stack, que muestra el camino que llevó hasta esa línea, indicaba que la segunda venía del cálculo del resumen. Después de la corrección se detiene una sola vez.

Corrección. El resumen ahora se guarda y solo se vuelve a pedir cuando los datos cambian, es decir, al iniciar sesión, crear, editar o eliminar. Si no hay filtros, se calcula con la misma lista que ya llegó. El cambio está en js/modelos/incidentes.js en la línea 97 y en js/controladores/incidentes.js en las líneas 41 y 51.

Verificación. En Network se ve una sola petición por acción. Las pruebas unitarias del resumen confirman que los contadores siguen siendo correctos.

## 3. Pantalla de login sin región principal

Cómo se detectó. Lighthouse calificó la accesibilidad del login con 98 y señaló que el documento no tenía una región principal visible.

Pasos para reproducirlo.
1. Abrir el login con DevTools en la pestaña Lighthouse.
2. Analizar la página en modo escritorio.
3. En accesibilidad aparece el aviso de que falta la región principal.

Causa raíz. Los lectores de pantalla, que usan las personas con discapacidad visual, buscan la etiqueta main para saltar directo al contenido importante. El formulario de login estaba fuera de esa etiqueta, y la única etiqueta main de la página, la del panel, permanecía oculta hasta iniciar sesión. Así, mientras se mostraba el login no había ninguna región principal disponible.

Punto de interrupción. No aplica, porque es un problema de estructura del HTML y no de ejecución. Se revisó en la pestaña Elements y en el árbol de accesibilidad de DevTools.

Corrección. El login pasó a ser su propia región principal en index.html, en la línea 68. Como ahora hay dos regiones principales y solo una visible a la vez, la vista de sesión oculta el panel por su identificador en js/vistas/sesion.js, en la línea 14.

Verificación. Lighthouse califica la accesibilidad del login con 100.

## 4. jQuery frenaba el dibujo de la página

Cómo se detectó. Lighthouse marcó la librería jQuery como un recurso que bloquea el dibujo, con una espera evitable estimada en 320 milisegundos. En la pestaña Performance se ve que el navegador se detiene a descargarla antes de mostrar la página.

Pasos para reproducirlo.
1. Analizar el login con Lighthouse.
2. En la sección de rendimiento aparece jQuery entre las peticiones que bloquean el dibujo.

Causa raíz. Un script cargado de forma normal obliga al navegador a detenerse, descargarlo y ejecutarlo antes de seguir. jQuery se cargaba así desde internet, de modo que la página esperaba a esa descarga externa.

Punto de interrupción. No aplica. Se analizó con la pestaña Performance, que registra en una línea de tiempo cada paso de la carga.

Corrección. Se agregó el atributo defer al script de jQuery en index.html, en la línea 502. Con defer, el navegador lo descarga mientras dibuja la página y lo ejecuta al final, en el mismo orden que el resto de los scripts de la aplicación.

Verificación. Lighthouse ya no menciona jQuery entre los recursos que bloquean el dibujo, y la página funciona igual.

## 5. Bootstrap cargado y casi sin usar

Cómo se detectó. Lighthouse indicó que de los 33 KB de Bootstrap que se descargaban, 21 KB no se usaban. La herramienta Coverage de DevTools, que muestra qué parte de cada archivo se usa realmente, lo confirma.

Pasos para reproducirlo.
1. En DevTools abrir el menú de tres puntos, luego More tools y luego Coverage.
2. Recargar la página.
3. La mayor parte de bootstrap.min.css aparece marcada como no usada.

Causa raíz. La página tiene su propia hoja de estilos, css/estilos.css, que define casi todo su aspecto. Bootstrap solo aportaba una base mínima, como el tamaño de los títulos, y una regla importante que mantiene ocultos los elementos marcados como ocultos.

Punto de interrupción. No aplica. Para comprobar que quitar Bootstrap no cambiaba nada se compararon automáticamente los estilos calculados de todos los elementos de la página, con Bootstrap y sin él, en tres pantallas y en tamaño de escritorio y de celular.

Corrección. Se quitó Bootstrap de index.html y su base mínima pasó al inicio de css/estilos.css. La comparación final dio cero diferencias.

Verificación. La página se ve idéntica y ya no descarga Bootstrap desde internet.

## 6. Falta la descripción de la página

Cómo se detectó. Lighthouse calificó el posicionamiento en buscadores con 90 en el login y 75 en el panel, y señaló que faltaba la descripción.

Causa raíz. La etiqueta meta description, que los buscadores muestran debajo del título en sus resultados, no existía en index.html.

Punto de interrupción. No aplica, porque es contenido del HTML.

Corrección. Se agregó la descripción en index.html, en la línea 9.

Verificación. Lighthouse califica el posicionamiento con 100 en ambas pantallas.

## 7. Imagen de portada demasiado pesada

Cómo se detectó. Al incorporar una fotografía en la pantalla de login, Lighthouse bajó la nota de rendimiento de 100 a 76 y estimó que se podían ahorrar 7.858 KB en la entrega de la imagen. En la pestaña Network se ve que la foto tardaba varios segundos en cargar.

Pasos para reproducirlo.
1. Usar la foto original descargada, sin procesar.
2. Abrir el login con una conexión 4G simulada desde la pestaña Network.
3. La imagen tarda más de siete segundos en aparecer.

Causa raíz. La foto original medía 7.360 por 4.912 píxeles y pesaba casi 8 MB, pero se muestra en un espacio de 480 por 180 píxeles. El navegador descargaba unas 420 veces más píxeles de los que se ven.

Punto de interrupción. No aplica. Se midió con Network y con Lighthouse en una conexión 4G simulada, sin memoria del navegador, promediando tres cargas.

Corrección. La foto se recortó al tamaño en que se muestra y se convirtió a WebP, un formato moderno que pesa mucho menos que JPG con la misma calidad. Se generaron dos tamaños, uno para pantallas normales y otro para pantallas de alta resolución, y un JPG pequeño de respaldo para navegadores antiguos. El elemento picture de index.html, en la línea 71, permite que el navegador elija la versión adecuada. También se indicó el ancho y el alto de la imagen para que la página no se mueva mientras carga, y se le dio prioridad alta porque es lo primero que se ve. La foto original no quedó en el proyecto.

Verificación.

| Medida en 4G | Antes | Después |
| --- | --- | --- |
| Peso de la imagen | 7.883 KB | 28 KB en pantalla normal y 86 KB en alta resolución |
| Tiempo de carga de la imagen | 7.302 ms | 107 a 178 ms |
| Rendimiento en Lighthouse | 76 | 100 |

## Defectos de la entrega

### 8. La entrega incluía el archivo con la clave secreta

Cómo se detectó. En la revisión de una entrega anterior se observó que el zip contenía el archivo .env con la clave real que firma los inicios de sesión.

Causa raíz. El zip se armaba a mano y Windows incluye todos los archivos de la carpeta. El archivo .gitignore protege el repositorio, pero no tiene efecto sobre un zip hecho a mano.

Corrección. Se generó una clave nueva para que la filtrada dejara de servir y se creó el comando npm run empaquetar, que arma el zip sin el archivo .env, la base de datos ni las dependencias, y se detiene si detecta alguno. Cada instalación genera su propia clave la primera vez que se inicia.

Verificación. Se abrió el zip y no contiene el archivo .env. Instalado desde cero, genera su propia clave y aprueba todas las pruebas.

### 9. Al extraer la entrega quedaba una carpeta dentro de otra

Cómo se detectó. Al probar la entrega como lo haría el profesor, la terminal no encontraba el archivo package.json y la instalación fallaba.

Causa raíz. Windows crea una carpeta con el nombre del zip al extraerlo, y el zip ya traía adentro otra carpeta con el mismo nombre. Al abrir la carpeta exterior, el proyecto quedaba un nivel más abajo.

Corrección. El comando de empaquetado ahora coloca los archivos directamente en la raíz del zip.

Verificación. Al extraer con Windows queda una sola carpeta con el proyecto, y la instalación funciona con npm install y npm start.

## Resultado general en Lighthouse

| Pantalla | Rendimiento | Accesibilidad | Buenas prácticas | Buscadores |
| --- | --- | --- | --- | --- |
| Login antes | 100 | 98 | 100 | 90 |
| Login después | 100 | 100 | 100 | 100 |
| Panel antes | no aplica | 100 | 100 | 75 |
| Panel después | no aplica | 100 | 100 | 100 |

En el panel Lighthouse analiza la página ya cargada, sin medir la carga, por eso el rendimiento no aplica ahí.
