FROM node:lts-alpine AS build

COPY package.json tsconfig.json yarn.lock vite.config.ts index.html /build/
COPY src /build/src
COPY public /build/public

WORKDIR /build

RUN yarn install
RUN yarn build

FROM nginx:mainline-alpine

COPY --from=build /build/dist /usr/share/nginx/html
