# Portal de Salud Municipal - Backend

API backend desarrollada con Node.js, Express, TypeScript y MongoDB.

## Requisitos

- Git
- Node.js y npm
- MongoDB local o una instancia accesible (por ejemplo, MongoDB Atlas)

## Clonar e instalar

````powershell
git clone [https://github.com/MarinaProg1/PortalSaludMunicipal-backend.git]
cd Backend
npm install

Si clonaste el repositorio completo del portal y no solo esta carpeta, entrá a `Backend` desde la carpeta raíz del repositorio antes de instalar las dependencias.

## Configurar el entorno

Creá el archivo `.env` a partir del ejemplo:

```env
PORT=<agregar el puerto>
ENTORNO=Local
DATABASE_URL=<URL de la base de datos>
````

`DATABASE_URL` debe apuntar a una instancia de MongoDB disponible. Para usar MongoDB Atlas, colocá en esa variable la URI de conexión provista por Atlas. `PORT` y `ENTORNO` son opcionales; si se omiten, el servidor usa el puerto `3000` y muestra `Local` como entorno.

## Iniciar en desarrollo

Con MongoDB iniciado y el archivo `.env` configurado, ejecutá:

```powershell
npm run dev
```

El servidor informa la dirección en la consola. Por defecto, queda disponible en `http://localhost:3000`. Si no puede conectarse a MongoDB, la aplicación termina con un error de conexión.

## Compilar

```powershell
npm run build
```

## Scripts disponibles

- `npm run dev`: inicia la aplicación en modo desarrollo con recarga automática.
- `npm run build`: ejecuta el compilador de TypeScript.
