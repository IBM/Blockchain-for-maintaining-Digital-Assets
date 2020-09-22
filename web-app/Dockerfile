FROM node:10.18.0-alpine

ENV WORKDIR /app/

RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    bash
WORKDIR ${WORKDIR}
COPY . ${WORKDIR}
