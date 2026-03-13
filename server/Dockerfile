FROM node:20-alpine

# 1. Instalamos Chromium y sus dependencias para Alpine
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

# 2. Le decimos a Puppeteer que NO descargue Chromium (ahorra tiempo y peso)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# 3. Le indicamos la ruta del Chromium que acabamos de instalar
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app
WORKDIR /usr/src/app

USER node

COPY --chown=node:node package*.json ./

RUN if [ -f package.json ]; then npm install; fi

EXPOSE 3000

CMD ["npm", "run", "dev"]