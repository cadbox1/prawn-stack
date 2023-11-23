FROM mhart/alpine-node:20

WORKDIR /home/node/app

COPY package.json package-lock.lock ./
RUN npm install