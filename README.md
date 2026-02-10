# AMOR - Animación interactiva con partículas en React

Proyecto React (Vite) con flujo romántico animado:

1. Botón **Iniciar**.
2. Partículas cálidas flotando y reaccionando al mouse.
3. Secuencia de textos: **Te amo → mi niña → preciosa → gracias → por existir**.
4. Formación final con **corazones concéntricos** (corazón grande + corazones internos cada vez más pequeños) y partículas ambientales alrededor.
Proyecto React (Vite) que muestra un flujo romántico con partículas:

1. Botón **Iniciar**.
2. Partículas flotando y reaccionando al mouse.
3. Secuencia de textos: **Te amo → mi niña → preciosa → gracias → por existir**.
4. Formación final de un **corazón animado**.

## Ejecutar en local

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview
```

## Publicar en GitHub Pages (IMPORTANTE)

Este repo ya incluye un workflow en `.github/workflows/deploy-pages.yml` para compilar y publicar automáticamente.

### Configuración recomendada en GitHub

1. Ve a **Settings → Pages**.
2. En **Source**, elige **GitHub Actions** (no "Deploy from a branch").
3. Haz push a `main`.
4. Espera que termine el workflow **Deploy Vite site to GitHub Pages**.

La configuración `base: '/AMOR/'` en `vite.config.js` está preparada para tu URL:

`https://dmntrix28.github.io/AMOR/`

## Si ves la pantalla en blanco

- Verifica que en Pages esté seleccionado **GitHub Actions**.
- Revisa la pestaña **Actions** por errores de build.
- Si usas local, ejecuta con `npm run dev` (no abras `index.html` directamente).
