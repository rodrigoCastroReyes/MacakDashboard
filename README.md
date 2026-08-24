# SmartCash Dashboard (Macak)

Panel de administración para eventos con pagos cashless: resumen de ventas, tokens
NFC, transacciones de puntos de venta, anulaciones, reembolsos, boletería,
asistentes y tiendas.

Construido con **React 19**, **MUI 7** y **Vite 7**, sobre una base derivada de la
plantilla [Material Dashboard 2 React](https://www.creative-tim.com/product/material-dashboard-react)
de Creative Tim.

## Requisitos

- Node.js **>= 20.19** (el repo incluye `.nvmrc` con la versión usada: `20.20.2`)
- npm 10+

```bash
nvm use          # toma la versión de .nvmrc
npm install
```

## Scripts

| Comando           | Descripción                                        |
| ----------------- | -------------------------------------------------- |
| `npm run start`   | Servidor de desarrollo (alias de `dev`)             |
| `npm run dev`     | Servidor de desarrollo con HMR en el puerto 3000    |
| `npm run build`   | Build de producción en `build/`                     |
| `npm run preview` | Sirve localmente el build de producción             |
| `npm run lint`    | ESLint sobre `src`                                  |

La app se sirve bajo la ruta **`/dashboard`**, así que en desarrollo hay que abrir
<http://localhost:3000/dashboard/>.

## Variables de entorno

Vite solo expone variables con prefijo `VITE_`. Se definen en `.env`:

```
VITE_API_BASE_URL=https://macak.tech/api/
```

Para apuntar a otro backend sin tocar el repo, crear un `.env.local` (ignorado por git).
Se leen desde `src/config.js` vía `import.meta.env`.

## Estructura

```
src/
  assets/theme/       tema MUI en claro …
  assets/theme-dark/  … y oscuro (overrides por componente)
  components/MD*/     componentes base del template (MDBox, MDTypography, …)
  examples/           componentes compuestos (Sidenav, DataTable, Charts, Navbars)
  layouts/            una carpeta por pantalla del dashboard
  hooks/              useAxios, useDownloadCard
  context/            estado global de UI y sesión
  routes.jsx          definición de rutas y entradas del Sidenav
```

Los nombres de carpetas, archivos e identificadores están en inglés. Los textos
visibles y las URLs de las rutas se mantienen en español, porque son de cara al
usuario final y las rutas ya están en uso.

## Notas de mantenimiento

- **`base` y `basename`**: `vite.config.js` define `base: "/dashboard/"` y
  `src/index.jsx` deriva el `basename` del router desde `import.meta.env.BASE_URL`.
  Si cambia la ruta de despliegue, basta con cambiar `base`.
- **`regenerator-runtime`**: se importa en `src/index.jsx` porque `react-table@7`
  depende de un `regeneratorRuntime` global que CRA inyectaba y Vite no.
- **`.npmrc` con `legacy-peer-deps`**: `react-table@7` declara peer de React <= 18.
  Funciona con React 19, pero `npm install` falla sin esa opción. Se puede quitar
  al migrar a `@tanstack/react-table`.
- **`colors.transparent.main`** debe seguir siendo un color parseable
  (`rgba(0, 0, 0, 0)`): MUI 7 aplica `alpha()` sobre cada entrada de la paleta.

## Licencia

Partes de este proyecto derivan de Material Dashboard 2 React, de Creative Tim.
Los avisos de copyright en los archivos correspondientes se conservan según su
licencia (ver `LICENSE.md`).
