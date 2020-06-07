FROM node:12.18.0-stretch

RUN npm i -g pnpm@5.0.2

WORKDIR /usr/src/app

COPY package.json .

RUN pnpm install

RUN pnpm run build

CMD ["node", "dist/run.js"]
