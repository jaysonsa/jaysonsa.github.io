# jaysonsa.github.io

Personal portfolio of a web developer, presented as an interactive 3D virtual office: https://jaysonsa.github.io/

Each station in the office is a project. Clicking a station flies the camera over and opens a short case study (problem, solution, impact, tech, and a mock demo). A plain list view is available for quick skimming and for devices without WebGL. A station can also be linked directly, for example `https://jaysonsa.github.io/#anomaly-alerts`.

## Confidentiality

Work projects are shown under generic names with mock data only. No company code, assets, data, screenshots, or internal details are included in this repository.

## Stack

- React 19 + Vite
- Three.js via React Three Fiber and drei
- All 3D models are built from primitives in code; textures are drawn on canvas at runtime, so there are no external assets
- Deployed to GitHub Pages by GitHub Actions (`.github/workflows/deploy.yml`)

## Editing content

All text lives in [`src/content.js`](src/content.js): profile, links, project case studies, and skills. Station positions and camera angles are in [`src/stations.js`](src/stations.js).

## Local development

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```
