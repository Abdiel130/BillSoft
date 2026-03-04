FROM node:20-alpine

# Creamos la carpeta y le damos permisos al usuario 'node' (UID 1000)
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app

WORKDIR /usr/src/app

# Cambiamos al usuario sin privilegios root
USER node

# Copiamos los archivos de dependencias (si existen)
COPY --chown=node:node package*.json ./

# Instalamos dependencias
RUN if [ -f package.json ]; then npm install; fi

# Exponemos el puerto de Express
EXPOSE 3000

# Comando por defecto (asumiendo que uses nodemon o node nativo con --watch)
CMD ["npm", "run", "dev"]