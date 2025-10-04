FROM node:18-alpine

WORKDIR /backend-app

COPY ./package*.json .

RUN npm install

COPY . .

CMD [ "npm", "run", "dev:no-env" ]





