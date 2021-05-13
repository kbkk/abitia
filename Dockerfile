FROM node:14.16.0-alpine3.10

WORKDIR /usr/src/app
COPY . ./
RUN node common/scripts/install-run-rush.js install
RUN node common/scripts/install-run-rush.js build
