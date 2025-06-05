# EHR Backend

Sistema Backend para Historia Clínica Electrónica (EHR)

## Descripción
Este proyecto es una API RESTful desarrollada en Node.js y Express para la gestión de historias clínicas electrónicas. Permite administrar pacientes, usuarios, citas, consultorios, signos vitales, evoluciones, prescripciones, catálogos médicos y ubicaciones geográficas.

## Características principales
- Gestión de usuarios y roles (administrador, doctor, secretaria, enfermera)
- Registro y consulta de pacientes
- Administración de citas médicas y consultorios
- Registro de signos vitales
- Evoluciones médicas y prescripciones
- Catálogos médicos (CIE-10, medicamentos, provincias, cantones, parroquias)
- Autenticación JWT y control de acceso por roles

## Tecnologías utilizadas
- Node.js
- Express.js
- Sequelize (ORM)
- PostgreSQL
- JWT para autenticación
- PM2 para despliegue

## Instalación
1. Clona el repositorio:
   ```sh
   git clone <REPO_URL>
   cd ehr-backend
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```
3. Configura las variables de entorno en un archivo `.env` (verifica los valores en `config/db.js` y `ecosystem.config.js`). Ejemplo:
   ```env
   DB_NAME=ehr_system
   DB_USER=postgres
   DB_PASS=12345
   DB_HOST=localhost
   DB_PORT=5432
   JWT_SECRET=tu_clave_secreta
   PORT=3000
   ```
4. Ejecuta las migraciones para crear las tablas:
   ```sh
   npx sequelize-cli db:migrate
   ```
5. Inicia el servidor:
   ```sh
   npm start
   ```

## Uso
El servidor se ejecuta por defecto en `http://localhost:3000`. Todas las rutas de la API están bajo el prefijo `/api`.

### Endpoints principales
- **/api/auth/**: Autenticación y registro de usuarios
- **/api/patients/**: Gestión de pacientes
- **/api/citas/**: Gestión de citas médicas
- **/api/consultorios/**: Consultorios médicos
- **/api/vital-signs/**: Signos vitales
- **/api/evoluciones/**: Evoluciones médicas
- **/api/prescripciones/**: Prescripciones médicas
- **/api/catalogos/**: Catálogos médicos (CIE-10, medicamentos, provincias, etc.)
- **/api/ubicacion/**: Provincias, cantones y parroquias
- **/api/admin/**: Administración de usuarios

> **Nota:** La mayoría de los endpoints requieren autenticación mediante JWT.

## Scripts útiles
- `npm start`: Inicia el servidor en modo producción
- `npm run dev`: Inicia el servidor en modo desarrollo (si tienes nodemon configurado)
- `npx sequelize-cli db:migrate`: Ejecuta las migraciones de la base de datos

## Estructura de carpetas
- `controllers/`: Lógica de negocio y controladores de rutas
- `models/`: Definición de modelos Sequelize
- `routes/`: Definición de rutas de la API
- `middleware/`: Middlewares de autenticación y autorización
- `config/`: Configuración de base de datos y variables de entorno
- `migrations/`: Migraciones de la base de datos
- `services/`: Servicios auxiliares (por ejemplo, email)

## Despliegue con PM2
Puedes usar PM2 para ejecutar el servidor en producción:
```sh
npm install -g pm2
# Si tienes un script de build, ejecuta:
npm run build
# Inicia el servidor normalmente:
npm start
# O usa PM2 para gestionar el proceso:
pm2 start ecosystem.config.js
```

## Licencia
MIT
