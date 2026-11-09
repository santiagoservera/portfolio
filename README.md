# Portfolio — Santiago Servera

Sitio estático en **Astro 7** + TypeScript. Sin frameworks de UI ni librerías 3D.

```bash
npm install
npm run dev       # desarrollo
npm run build     # astro check + build de producción en dist/
npm run preview   # sirve dist/
```

## Dirección artística: “atravesar el loop”

El sitio es un recorrido a través de un agujero de gusano. El hero muestra una malla wireframe
(superficie de revolución `r(z) = R0·cosh(z/k)`, un puente de Einstein-Rosen) iluminada con los bordós
de KodLoop; al scrollear, la cámara cruza la garganta y el contenido emerge del otro lado. Cada sección
tiene una coordenada de profundidad (`z -0.27`), y el recorrido cierra en Contacto con un toroide ASCII:
el loop.

- **Tipografía**: Geist (texto), Geist Mono (detalles técnicos), Instrument Serif itálica (acentos).
  Todas self-hosted vía Fontsource.
- **Bordó**: `#6D213C` / `#8B2E4A` para luz, gradientes y estados. Para texto de acento chico se usa
  `#D68AA0`, un tinte derivado que cumple contraste AA sobre `#09090B`.

## Decisiones técnicas

| Decisión | Por qué |
| --- | --- |
| WebGL puro en vez de Three.js | La escena son líneas y puntos con un único shader. El módulo pesa ~6 KB, contra ~150 KB gzip de Three.js. |
| El 3D se carga con `import()` en `requestIdleCallback` | El contenido nunca espera al canvas. |
| El render se detiene fuera de pantalla o con la pestaña oculta | Ahorra CPU/GPU y batería. |
| ASCII generado en build (`src/lib/ascii.ts`) | El arte existe en el HTML sin JavaScript. Además sirve de fallback del túnel cuando no hay WebGL. |
| Logos de devicon (MIT) copiados a `src/assets/tech` | Son los logos reales, se inyectan inline en build y no hay dependencia en runtime. |

### Accesibilidad y fallbacks

- `prefers-reduced-motion`: el túnel queda en un cuadro estático, el toroide queda quieto y se desactivan
  los reveals, el scramble de texto y las órbitas.
- Sin WebGL (o si se pierde el contexto): se muestra el túnel ASCII estático.
- Sin JS: todo el contenido es visible, porque las animaciones de entrada solo se activan con `html.js`.
- Incluye skip link, `aria-current` en la navegación, foco visible, menú móvil con `Esc` y `aria-expanded`,
  y textos alternativos para enlaces externos.

## Contenido

Todo el contenido editable vive en `src/data/`:
`profile.ts`, `projects.ts`, `experience.ts`, `stack.ts`.

Estructura: Hero → Sobre mí → Experiencia → Proyectos → Tecnologías → Contacto.

## Recursos pendientes

1. **CV**: `public/cv/santiago-servera-cv.pdf`. Hasta que exista, el sitio muestra “Currículum · Próximamente”
   en lugar de un enlace roto. Al agregarlo, el enlace de descarga aparece solo en el próximo build.
2. **Capturas de proyectos**: ya están en `src/assets/projects/` (capturas reales de los sitios en vivo, 1440×900 @2x).
   Para actualizarlas, reemplazá `motoros.png` / `di-parola.png` por una captura nueva con el mismo nombre (16:10).
   Astro las convierte a WebP en varios tamaños. Si un proyecto no tiene `image`, se muestra un placeholder ASCII.
3. **Dominio**: definí `SITE_URL` al desplegar (o editá el fallback en `astro.config.mjs`). El canonical, el sitemap, el `robots.txt` y las metas Open Graph se generan con ese dominio.

## Despliegue

Es un sitio 100 % estático (`dist/`). Funciona en Vercel, Netlify, Cloudflare Pages o GitHub Pages sin
configuración extra: el comando de build es `npm run build` y el directorio de salida es `dist`.

## SEO y rendimiento

Medido con Lighthouse sobre el build de producción (servido con compresión):

| | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- |
| Escritorio | 100 | 100 | 100 | 100 |
| Celular | 99 | 100 | 100 | 100 |

- **SEO**: title y description, canonical, Open Graph y Twitter con imagen (`public/og.png`), datos estructurados
  (`Person` + `WebSite`), sitemap, `robots.txt` generado con el dominio real, manifest e íconos.
- **Rendimiento**: CSS en línea (sin hojas que bloqueen el render), fuentes del primer pantallazo precargadas,
  imágenes AVIF/WebP con tamaños reales, logos como archivos con carga diferida, `content-visibility` en secciones,
  y ningún script lee el layout en cada cuadro.
- **3D**: en celular el túnel arranca con el primer gesto (antes se ve la versión ASCII). En equipos sin aceleración
  por hardware se queda la versión ASCII.
- **Caché**: `public/_headers` (Netlify / Cloudflare Pages) y `vercel.json` (Vercel) definen caché inmutable para
  `/_astro/*` y cabeceras de seguridad.
- Para regenerar la imagen OG y los íconos: `node scripts/generate-assets.mjs`.
