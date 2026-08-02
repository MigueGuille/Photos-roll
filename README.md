# MOMENTOS. — Galería de graduación

Galería responsive creada con Next.js. Permite ampliar las fotografías, navegar con gestos o teclado, seleccionar varias, descargarlas en un ZIP e imprimirlas.

## Requisitos

- Node.js 20.9 o superior. Se recomienda Node.js 22.
- npm 10 o superior.

No necesita base de datos, variables de entorno ni servicios externos.

## Probarla en tu computadora

```bash
npm ci
npm run dev
```

Abre `http://localhost:3000`.

## Subirla a Vercel — opción recomendada

1. Sube esta carpeta a un repositorio nuevo de GitHub.
2. Entra en [vercel.com](https://vercel.com), inicia sesión y pulsa **Add New → Project**.
3. Importa el repositorio.
4. Vercel reconocerá **Next.js** automáticamente. No agregues variables de entorno ni cambies los comandos.
5. Pulsa **Deploy**.

También puedes publicarla desde esta carpeta con la herramienta de Vercel:

```bash
npx vercel
```

## Subirla a Railway

1. Sube esta carpeta a GitHub.
2. Entra en [railway.app](https://railway.app) y elige **New Project → Deploy from GitHub repo**.
3. Selecciona el repositorio. Railway utilizará automáticamente el `Dockerfile` incluido.
4. Cuando termine, abre **Settings → Networking → Generate Domain** para obtener el enlace público.

No necesitas configurar variables. Railway asignará el puerto automáticamente.

## Comprobaciones disponibles

```bash
npm run build
npm test
npm run lint
```

## Cambiar las fotografías

Las imágenes están en `public/photos`. Para sustituirlas sin tocar el código, conserva estos nombres:

- `graduation-together.jpg`
- `graduation-group.jpg`
- `graduation-family.jpg`
- `graduation-diploma.jpg`
- `graduation-signing.jpg`
- `graduation-portrait.jpg`

Se recomiendan archivos JPEG estándar, orientados correctamente y con un lado largo de hasta 3600 píxeles para equilibrar impresión y velocidad.
