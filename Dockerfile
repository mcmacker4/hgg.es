FROM node:lts-alpine AS build

COPY .babelrc package.json tsconfig.json yarn.lock /build/
COPY src /build/src
COPY webpack /build/webpack

WORKDIR /build

RUN yarn install
RUN yarn build

FROM nginx:mainline-alpine

COPY --from=build /build/dist /usr/share/nginx/html