FROM node:20-alpine

# Instalamos Angular CLI globalmente para poder usar 'ng generate' si entramos al contenedor
RUN npm install -g @angular/cli

# Creamos la carpeta y aseguramos los permisos para el usuario 'node'
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app

WORKDIR /usr/src/app

# Usamos el usuario 'node' para todo lo que sigue
USER node

COPY --chown=node:node package*.json ./

RUN if [ -f package.json ]; then npm install; fi

EXPOSE 4200

# El comando de arranque real se sobreescribe en el docker-compose.yml
CMD ["npm", "start"]