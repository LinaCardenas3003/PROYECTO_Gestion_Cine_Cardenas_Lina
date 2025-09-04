# Sistema de Gestión de Clientes y Puntos de Fidelidad

Este documento describe el nuevo sistema de gestión de clientes y puntos de fidelidad implementado.

## Características

- Gestión completa de clientes (CRUD)
- Sistema de puntos de fidelidad con fechas
- Reporte de fidelidad por meses

### Insomnia

#### Crear Cliente
- **URL**: `POST localhost:3000/client`
- **Body**:
```json
{
  "identification": "10001",
  "fullName": "Lina Cardenas",
  "email": "linaCardenas@mail.com",
  "phone": "3042322077"
}

{
  "identification": "10002",
  "fullName": "Camila Ortega",
  "email": "camilaOrtega@mail.com",
  "phone": "3015066088"
}

{
  "identification": "10003",
  "fullName": "Camilo Moreno",
  "email": "camiloMoreno@mail.com",
  "phone": "3107722037"
}
```

#### Obtener Todos los Clientes
- **URL**: `GET localhost:3000/client`

#### Obtener Cliente por ID
- **URL**: `GET localhost:3000/client/id`

#### Actualizar Cliente
- **URL**: `PUT localhost:3000/client/id`

#### Eliminar Cliente
- **URL**: `DELETE localhost:3000/client/id`

### Puntos de Fidelidad

#### Agregar Puntos a Cliente
- **URL**: `POST localhost:3000/client/id/puntos`
- **Body**:
```json
{
  "date": "2025-09-09",
  "points": 100
}
```

#### Reporte de Fidelidad
- **URL**: `GET localhost:3000/client/reportes/fidelidad`
