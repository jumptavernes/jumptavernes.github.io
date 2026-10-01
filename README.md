# JUMP Tavernes — Landing V1

Landing estática responsive para presentar JUMP Tavernes y preparar solicitudes de reserva por WhatsApp.

## Configuración antes de publicar

Edita `config.js` y completa `whatsappNumber` con el número internacional sin `+`, espacios ni guiones.

```js
whatsappNumber: "34600000000"
```

Los horarios y tipos de evento también están centralizados en ese archivo.

## Desarrollo local

No requiere instalación ni compilación. Sirve la carpeta con cualquier servidor estático, por ejemplo:

```powershell
python -m http.server 4173
```

Después abre `http://localhost:4173`.

## Publicación

El proyecto es compatible con GitHub Pages. No contiene backend, calendario de disponibilidad, pagos ni envío automático de mensajes.
