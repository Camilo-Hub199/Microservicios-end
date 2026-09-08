# Car Sales API — microservicios

Migración del monolito [`backend-mono-api`](../backend-mono-api) a microservicios. Repositorio con fines didácticos: el objetivo es que se vea *cómo* funcionan los microservicios, no solo que funcionen.

## Modelo de organización

Un solo repositorio, pero **cada servicio es completamente autónomo**: su propio `package.json`, su `node_modules`, su `Dockerfile`, su `docker-compose.yml` y **su propia base de datos**. No hay npm workspaces ni carpeta `shared/` — cada carpeta se comporta como si fuera un repositorio aparte, para que las fronteras entre servicios sean reales y no una convención que se pueda romper por accidente.

El razonamiento completo está en [`docs/00-modelo-de-organizacion.md`](./docs/00-modelo-de-organizacion.md).

## Servicios

| Servicio | Puerto | Base de datos | Estado |
| --- | --- | --- | --- |
| [`gateway`](./gateway) | 8000 | — | ⬜ pendiente |
| [`customers`](./customers) | 8001 | `customers-db` | ✅ migrado |
| [`products`](./products) | 8002 | `products-db` | ✅ migrado |
| [`shopping`](./shopping) | 8003 | `shopping-db` | ⬜ pendiente |

## Levantar un servicio solo

Cada servicio es autosuficiente. No hace falta nada del resto del repositorio:

```bash
cd products
docker compose up --build
docker compose exec products npm run seed
curl -s localhost:8002/products | jq '{total: (.products|length), categories}'
```

Sin Docker, con un Mongo local:

```bash
cd products
npm install
cp .env.example .env
npm run seed
npm start
```
