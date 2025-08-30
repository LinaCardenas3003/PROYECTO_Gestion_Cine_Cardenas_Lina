# Sistema de Gestión de Cines - Cine Acme

## Descripción del Proyecto

Sistema web completo para la gestión de cines, películas, salas, funciones y usuarios administrativos. Permite la administración de múltiples cines, programación de funciones, y generación de reportes detallados.

## Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura de las páginas web
- **CSS3** - Estilos y diseño responsivo
- **JavaScript (ES6+)** - Interactividad y lógica del cliente
- **Módulos ES6** - Organización del código

### Backend
- **Node.js** - Entorno de ejecución del servidor
- **Express.js** - Framework web para APIs
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación por tokens
- **bcrypt** - Encriptación de contraseñas

### Librerías y Dependencias
- **express** - Servidor web
- **mongoose** - Conexión a MongoDB
- **jsonwebtoken** - Manejo de tokens JWT
- **bcrypt** - Hash de contraseñas
- **cors** - Habilitar CORS
- **dotenv** - Variables de entorno

### Motor de Base de Datos
- **MongoDB** - Base de datos NoSQL documental
- **Mongoose ODM** - Modelado de datos y consultas

## Estructura del Proyecto

```
proyectoCine/
├── public/
│   ├── css/
│   │   ├── global.css
│   │   └── dashboard.css
│   ├── js/
│   │   ├── dashboard.js
│   │   ├── services.js
│   │   └── (otros archivos JS)
│   ├── dashboard.html
│   ├── index.html
│   └── (otras páginas HTML)
├── routes/
│   └── user.route.js
├── models/
│   └── (modelos de datos)
├── raw-data/
│   └── reportes.js
└── README.md
```

## Manual de Instrucciones

### Prerrequisitos
- Node.js (v14 o superior)
- MongoDB (local o en la nube)
- Navegador web moderno

### Instalación y Ejecución

1. **Clonar o descargar el proyecto**
   ```bash
   cd proyectoCine
   ```

2. **Instalar dependencias**
   ```bash
   npm install express mongoose jsonwebtoken bcrypt cors dotenv
   ```

3. **Configurar variables de entorno**
   Crear archivo `.env` en la raíz del proyecto:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/cineacme
   JWT_SECRET=tu_clave_secreta_jwt
   ```

4. **Iniciar el servidor**
   ```bash
   node server.js
   ```

5. **Acceder a la aplicación**
   Abrir el navegador en: `http://localhost:3000`

### Base de Datos
- La aplicación se conecta automáticamente a MongoDB
- Se crean las colecciones necesarias al iniciar
- Datos de ejemplo se pueden cargar automáticamente

## Documentación de Endpoints

### Autenticación

#### POST /login
Autentica un usuario administrativo.

**Body:**
```json
{
  "email": "admin@cineacme.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "token": "jwt_token",
  "user": {
    "_id": "user_id",
    "email": "admin@cineacme.com",
    "name": "Administrador",
    "role": "admin"
  }
}
```

### Gestión de Cines

#### GET /user/cines
Obtiene todos los cines registrados.

**Respuesta:**
```json
[
  {
    "_id": "cine_id",
    "nombre": "Cine Acme Centro",
    "ciudad": "Bogotá",
    "direccion": "Calle 123 #45-67",
    "codigo": "CAC001"
  }
]
```

#### POST /user/cines
Crea un nuevo cine.

**Body:**
```json
{
  "nombre": "Cine Acme Norte",
  "ciudad": "Bogotá",
  "direccion": "Carrera 89 #12-34",
  "codigo": "CAN001"
}
```

#### PUT /user/cines/:id
Actualiza un cine existente.

#### DELETE /user/cines/:id
Elimina un cine.

### Gestión de Películas

#### GET /user/peliculas
Obtiene todas las películas.

#### POST /user/peliculas
Crea una nueva película.

**Body:**
```json
{
  "titulo": "Avengers: Endgame",
  "genero": "Acción",
  "duracion": 181,
  "clasificacion": "PG-13"
}
```

### Gestión de Salas

#### GET /user/salas?cineId=:cineId
Obtiene las salas de un cine específico.

#### POST /user/salas
Crea una nueva sala.

**Body:**
```json
{
  "cineId": "cine_id",
  "numero": 1,
  "capacidad": 150,
  "tipo": "Standard"
}
```

### Gestión de Funciones

#### GET /user/funciones
Obtiene funciones con filtros opcionales.

**Query Params:**
- `cineId` - ID del cine
- `peliculaId` - ID de la película
- `fecha` - Fecha específica

#### POST /user/funciones
Crea una nueva función.

**Body:**
```json
{
  "cineId": "cine_id",
  "salaId": "sala_id",
  "peliculaId": "pelicula_id",
  "fecha": "2024-01-15",
  "hora": "19:30",
  "precio": 25000
}
```

### Gestión de Usuarios Administrativos

#### GET /user
Obtiene todos los usuarios administrativos.

#### POST /user/register
Registra un nuevo usuario administrativo.

**Body:**
```json
{
  "id": "123456789",
  "name": "Juan Pérez",
  "phone": "3001234567",
  "email": "juan@cineacme.com",
  "position": "Gerente",
  "password": "password123",
  "role": "admin"
}
```

#### PUT /user/:id
Actualiza un usuario administrativo.

#### DELETE /user/:id
Elimina un usuario administrativo.

### Reportes

#### GET /user/reportes/funciones-disponibles
Reporte de funciones disponibles por cine y película.

**Query Params:**
- `cineId` - ID del cine (requerido)
- `peliculaId` - ID de la película (requerido)

**Respuesta:**
```json
[
  {
    "cine": "Cine Acme Centro",
    "sala": "Sala 1",
    "pelicula": "Avengers: Endgame",
    "fecha": "2024-01-15",
    "hora": "19:30",
    "precio": 25000,
    "asientosDisponibles": 150
  }
]
```

#### GET /user/reportes/peliculas-vigentes
Reporte de películas con funciones vigentes por fecha y cine.

**Query Params:**
- `fecha` - Fecha específica (requerido)
- `cineId` - ID del cine (requerido)

**Respuesta:**
```json
[
  {
    "pelicula": "Avengers: Endgame",
    "genero": "Acción",
    "duracion": 181,
    "funciones": [
      {
        "sala": "Sala 1",
        "hora": "19:30",
        "precio": 25000,
        "asientosDisponibles": 150
      }
    ]
  }
]
```

#### GET /user/reportes/peliculas-proyectadas
Reporte de películas proyectadas por rango de fecha.

**Query Params:**
- `fechaInicio` - Fecha de inicio (requerido)
- `fechaFin` - Fecha de fin (requerido)

**Respuesta:**
```json
[
  {
    "cine": "Cine Acme Centro",
    "ciudad": "Bogotá",
    "dias": [
      {
        "fecha": "2024-01-15",
        "peliculas": [
          {
            "pelicula": "Avengers: Endgame",
            "salas": 2,
            "funciones": 4
          }
        ]
      }
    ]
  }
]
```

## Funcionalidades Principales

### Dashboard Principal
- Visualización de cines en cards interactivas
- Navegación entre diferentes secciones
- Botones de acción para cada cine (ver salas, editar, eliminar)

### Gestión de Administrativos
- Lista de usuarios administrativos
- Formulario de registro con validaciones
- Funciones de edición y eliminación
- Cuenta admin por defecto protegida

### Sistema de Reportes
1. **Funciones Disponibles**: Por cine y película específica
2. **Películas Vigentes**: Por fecha y cine específico
3. **Proyecciones por Rango**: Por rango de fechas

### Características de Seguridad
- Autenticación JWT
- Encriptación de contraseñas con bcrypt
- Validación de roles y permisos
- Protección de rutas sensibles

## Consideraciones Técnicas

### Base de Datos
- MongoDB con Mongoose ODM
- Esquemas normalizados para cines, películas, salas y funciones
- Índices para optimizar consultas

### Frontend
- Diseño responsivo con CSS Grid y Flexbox
- Módulos JavaScript para organización del código
- Manipulación del DOM dinámica
- Gestión de estado con localStorage

### API RESTful
- Endpoints bien definidos y documentados
- Códigos de estado HTTP apropiados
- Validación de datos en backend
- Manejo de errores consistente
