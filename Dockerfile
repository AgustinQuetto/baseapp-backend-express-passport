FROM node:14.15.0-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production
RUN npm install pm2 -g
RUN apk add --no-cache mongodb-tools

COPY . .

EXPOSE 3000
EXPOSE 3001

CMD ["pm2-runtime", "server.js"]