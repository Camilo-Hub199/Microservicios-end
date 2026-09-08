# Car Sales — Arquitectura de Microservicios

Proyecto académico de migración de una aplicación monolítica hacia una **arquitectura basada en microservicios**, desarrollada con **Node.js, Express, MongoDB, Docker y React/Vite**.

El objetivo del proyecto no es únicamente que la aplicación funcione, sino demostrar cómo se pueden separar las responsabilidades de un sistema en servicios independientes, cada uno con su propia lógica, dependencias y base de datos.

---

## Descripción del proyecto

El proyecto implementa una plataforma para la gestión y compra de vehículos mediante una arquitectura de microservicios.

La solución está dividida en:

* **Customers:** gestión de usuarios y autenticación.
* **Products:** gestión y consulta de vehículos.
* **Shopping:** gestión de órdenes/compras.
* **API Gateway:** punto de entrada único para el frontend.
* **MongoDB:** una base de datos independiente para cada microservicio.
* **Frontend:** aplicación web desarrollada con React y Vite.

La arquitectura permite que cada servicio sea desarrollado, ejecutado y mantenido de manera independiente.

---

# Arquitectura del sistema

La comunicación general de la aplicación sigue el siguiente flujo:

```text
┌───────────────────────────────┐
│          FRONTEND             │
│       React + Vite            │
│       localhost:5173          │
└───────────────┬───────────────┘
                │
                │ HTTP / Axios
                ▼
┌───────────────────────────────┐
│          API GATEWAY           │
│          localhost:80          │
│           Express              │
└───────┬──────────┬────────────┘
        │          │
        │          │
        ▼          ▼
┌────────────┐ ┌────────────┐
│ Customers  │ │  Products  │
│ :8001      │ │  :8002     │
└─────┬──────┘ └─────┬──────┘
      │              │
      ▼              ▼
┌────────────┐ ┌────────────┐
│ MongoDB    │ │ MongoDB    │
│ Customers  │ │ Products   │
└────────────┘ └────────────┘

                │
                ▼
        ┌──────────────┐
        │  Shopping    │
        │   :8003      │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │   MongoDB    │
        │   Shopping   │
        └──────────────┘
```

El frontend **no se comunica directamente con cada microservicio**. Todas las peticiones pasan por el API Gateway.

---

# Estructura del proyecto

```text
Microservicios-end/
│
├── Customers/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── ...
│
├── Products/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── ...
│
├── Shopping/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── ...
│
├── api-getaway/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── ...
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

> Nota: el nombre `api-getaway` corresponde al nombre utilizado actualmente en el proyecto.

---

# Microservicio Customers

El microservicio **Customers** se encarga de la gestión de usuarios.

### Responsabilidades

* Registro de usuarios.
* Inicio de sesión.
* Autenticación.
* Generación y validación de JWT.
* Consulta del perfil del usuario.
* Persistencia de información en MongoDB.

### Tecnologías

* Node.js
* Express
* MongoDB
* Mongoose
* JWT
* bcryptjs
* dotenv
* CORS

### Puerto

```text
8001
```

### Base de datos

```text
customers_db
```

### Endpoints principales

```http
POST /customer/signup
POST /customer/login
GET  /customer/profile
```

El sistema utiliza **JWT (JSON Web Token)** para manejar la autenticación.

Las solicitudes protegidas utilizan el esquema:

```http
Authorization: Bearer <token>
```

---

# Microservicio Products

El microservicio **Products** administra el catálogo de vehículos.

### Responsabilidades

* Consulta de vehículos.
* Consulta de un vehículo específico.
* Persistencia de vehículos.
* Seed inicial de productos.
* Administración independiente de su base de datos.

### Puerto

```text
8002
```

### Base de datos

```text
products_db
```

### Endpoints principales

```http
GET /products
GET /products/:id
```

### Seed de productos

El proyecto cuenta con un script de seed para cargar vehículos de prueba en MongoDB.

Entre los productos utilizados se encuentran vehículos como:

* Sedan Clásico
* Sedan Ejecutivo
* SUV Familiar
* y otros vehículos utilizados para las pruebas del sistema.

---

# Microservicio Shopping

El microservicio **Shopping** se encarga de la gestión de las compras y órdenes.

### Responsabilidades

* Crear órdenes.
* Consultar órdenes de un cliente.
* Asociar compras con usuarios.
* Persistir las órdenes en su propia base de datos.

### Puerto

```text
8003
```

### Base de datos

```text
shopping_db
```

### Endpoints principales

```http
POST /shopping/order
GET  /shopping/orders/:customerId
```

Este servicio posee su propia conexión a MongoDB y no comparte directamente la base de datos con Customers ni Products.

---

# API Gateway

El **API Gateway** funciona como el punto de entrada de la aplicación.

El frontend realiza las peticiones al Gateway y este se encarga de dirigirlas hacia el microservicio correspondiente.

### Puerto externo

```text
80
```

### Puerto interno

```text
8000
```

### Responsabilidades

* Recibir las peticiones del frontend.
* Redirigir solicitudes hacia Customers.
* Redirigir solicitudes hacia Products.
* Redirigir solicitudes hacia Shopping.
* Centralizar el acceso a los microservicios.
* Facilitar la comunicación entre frontend y backend.

### Rutas principales

```text
/customer/*
/products/*
/shopping/*
```

También se dispone de un endpoint de salud:

```http
GET /health
```

---

# Bases de datos

Una de las características principales de la arquitectura es que **cada microservicio posee su propia base de datos**.

```text
Customers  → customers_db
Products   → products_db
Shopping   → shopping_db
```

En Docker se utilizan contenedores independientes:

```text
mongo-customers
mongo-products
mongo-shopping
```

Esto evita que los servicios compartan directamente sus datos y mantiene una separación clara entre sus responsabilidades.

---

# Docker

Todo el backend está preparado para ejecutarse mediante Docker.

Los servicios utilizan contenedores independientes y se comunican mediante la red interna de Docker.

### Contenedores principales

```text
mongo_customers
mongo_products
mongo_shopping

customers_service
products_service
shopping_service

api_gateway
```

### Puertos

| Componente      |  Puerto |
| --------------- | ------: |
| API Gateway     |      80 |
| Customers       |    8001 |
| Products        |    8002 |
| Shopping        |    8003 |
| Mongo Customers | interno |
| Mongo Products  | interno |
| Mongo Shopping  | interno |

---

# Ejecutar el proyecto completo

Desde la raíz del proyecto:

```bash
cd ~/proyectos/Microservicios-end
```

Levantar todos los servicios:

```bash
docker compose up -d --build
```

Verificar los contenedores:

```bash
docker compose ps
```

Consultar los logs:

```bash
docker compose logs --tail=50
```

Para seguir los logs en tiempo real:

```bash
docker compose logs -f
```

---

# Reiniciar el proyecto

Para detener los contenedores:

```bash
docker compose down
```

Para volver a iniciarlos:

```bash
docker compose up -d
```

Si se realizaron cambios en Dockerfiles, dependencias o configuración:

```bash
docker compose up -d --build
```

---

# Cargar productos de prueba

Si es necesario ejecutar nuevamente el seed de Products:

```bash
docker compose exec products npm run seed
```

El seed permite cargar los vehículos iniciales en la base de datos de Products.

---

# Pruebas del backend

## Health Check

```bash
curl http://localhost/health
```

## Consultar productos

```bash
curl http://localhost/products
```

## Consultar un producto

```bash
curl http://localhost/products/<id>
```

## Registrar usuario

```bash
curl -X POST http://localhost/customer/signup
```

## Iniciar sesión

```bash
curl -X POST http://localhost/customer/login
```

## Consultar perfil

```bash
curl http://localhost/customer/profile
```

## Crear una orden

```bash
curl -X POST http://localhost/shopping/order
```

## Consultar órdenes

```bash
curl http://localhost/shopping/orders/<customerId>
```

---

# Integración con el Frontend

El proyecto backend fue integrado con el frontend desarrollado en:

```text
frontend-enfasis-i
```

El frontend está desarrollado utilizando:

* React
* Vite
* React Router
* Redux Toolkit
* Axios
* Tailwind CSS
* Lucide React

La comunicación con el backend se realiza mediante **Axios**.

La aplicación utiliza el API Gateway como punto central de comunicación:

```text
React
  ↓
Axios
  ↓
API Gateway
  ↓
Microservicios
  ↓
MongoDB
```

La URL utilizada por el frontend para comunicarse con el backend se configura mediante una variable de entorno:

```text
VITE_API_URL=http://localhost/
```

---

# Autenticación

El sistema implementa autenticación basada en **JWT**.

El flujo general es:

```text
1. Usuario se registra
        ↓
2. Usuario inicia sesión
        ↓
3. Customers valida las credenciales
        ↓
4. Se genera un JWT
        ↓
5. Frontend almacena el token
        ↓
6. Axios envía el token
        ↓
7. Backend valida el JWT
        ↓
8. Se permite acceder a recursos protegidos
```

Las peticiones autenticadas utilizan:

```http
Authorization: Bearer <JWT>
```

---

# Flujo de compra

El funcionamiento general de la aplicación sigue este proceso:

```text
Usuario
   ↓
Frontend
   ↓
Consulta vehículos
   ↓
Products
   ↓
Selecciona vehículo
   ↓
Carrito
   ↓
Realiza compra
   ↓
Shopping
   ↓
Se crea la orden
   ↓
MongoDB Shopping
```

De esta manera, Products se concentra en el catálogo y Shopping en las órdenes.

---

# Comunicación entre servicios

Las URLs internas utilizadas por Docker permiten que el API Gateway se comunique con los microservicios mediante los nombres de los servicios.

Conceptualmente:

```text
API Gateway
    │
    ├──→ Customers
    │
    ├──→ Products
    │
    └──→ Shopping
```

Los microservicios no necesitan conocer directamente la estructura interna del frontend.

---

# Variables de entorno

Los servicios utilizan variables de entorno para manejar configuraciones como:

* Puerto de ejecución.
* URL de MongoDB.
* Secret utilizado para JWT.
* URLs de comunicación entre servicios.

Ejemplo conceptual:

```env
PORT=8000
DB_URL=mongodb://...
APP_SECRET=...
```

El frontend utiliza:

```env
VITE_API_URL=http://localhost/
```

Las variables sensibles no deben almacenarse directamente en el repositorio.

---

# Independencia de los microservicios

Cada servicio mantiene sus propias dependencias.

```text
Customers/
    package.json
    Dockerfile

Products/
    package.json
    Dockerfile

Shopping/
    package.json
    Dockerfile

api-getaway/
    package.json
    Dockerfile
```

No se utilizan npm workspaces ni una carpeta `shared/`.

Esto permite que cada microservicio pueda evolucionar de forma independiente.

---

# Tecnologías utilizadas

| Tecnología     | Uso                                |
| -------------- | ---------------------------------- |
| Node.js        | Runtime del backend                |
| Express        | APIs REST                          |
| MongoDB        | Persistencia                       |
| Mongoose       | ODM para MongoDB                   |
| JWT            | Autenticación                      |
| bcryptjs       | Protección de contraseñas          |
| Axios          | Comunicación frontend/backend      |
| React          | Interfaz web                       |
| Vite           | Herramienta de desarrollo frontend |
| Redux Toolkit  | Manejo del estado                  |
| React Router   | Navegación                         |
| Tailwind CSS   | Estilos                            |
| Docker         | Contenedorización                  |
| Docker Compose | Orquestación local                 |
| Git            | Control de versiones               |
| GitHub         | Repositorio remoto                 |

---

# Estado del proyecto

| Componente                        | Estado         |
| --------------------------------- | -------------- |
| Customers                         | ✅ Implementado |
| Products                          | ✅ Implementado |
| Shopping                          | ✅ Implementado |
| API Gateway                       | ✅ Implementado |
| MongoDB Customers                 | ✅ Implementado |
| MongoDB Products                  | ✅ Implementado |
| MongoDB Shopping                  | ✅ Implementado |
| Docker Compose                    | ✅ Implementado |
| Autenticación JWT                 | ✅ Implementado |
| Seed de Products                  | ✅ Implementado |
| Integración Frontend              | ✅ Implementado |
| Consulta de vehículos             | ✅ Implementado |
| Carrito / selección de vehículos  | ✅ Implementado |
| Gestión de órdenes                | ✅ Implementado |
| Comunicación mediante API Gateway | ✅ Implementado |

---

# Validación del funcionamiento

Durante el desarrollo se realizaron pruebas mediante:

* `curl`
* Docker Compose
* Logs de los contenedores
* Pruebas de endpoints REST
* Pruebas de autenticación
* Pruebas de conexión con MongoDB
* Pruebas de integración con el frontend

Se verificó la comunicación:

```text
Frontend
   ↓
API Gateway
   ↓
Customers / Products / Shopping
   ↓
MongoDB independiente
```

---

# Objetivo académico

El proyecto permite demostrar los principales conceptos relacionados con una arquitectura de microservicios:

* Separación de responsabilidades.
* Independencia de servicios.
* Bases de datos independientes.
* Comunicación mediante APIs REST.
* API Gateway.
* Contenedorización con Docker.
* Autenticación mediante JWT.
* Integración entre frontend y backend.
* Persistencia con MongoDB.
* Escalabilidad e independencia de los componentes.
* Control de versiones mediante Git y GitHub.

La implementación busca mostrar no solamente una aplicación funcional, sino también **cómo se estructura y comunica una arquitectura basada en microservicios**.

---

# Proyecto académico

**Proyecto:** Car Sales API — Microservicios
**Arquitectura:** Microservicios
**Backend:** Node.js + Express
**Frontend:** React + Vite
**Base de datos:** MongoDB
**Contenedores:** Docker + Docker Compose
**Control de versiones:** Git + GitHub
