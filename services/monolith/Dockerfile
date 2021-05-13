FROM 14.16.0-alpine3.10 as builder

WORKDIR /usr/src/app
COPY package.json ./
COPY .babelrc ./
RUN npm install
COPY ./src ./src
RUN npm run build