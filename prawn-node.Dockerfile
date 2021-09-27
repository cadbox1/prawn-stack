FROM mhart/alpine-node:14

WORKDIR /home/node/app

COPY package.json yarn.lock ./
RUN yarn