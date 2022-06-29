FROM node:17

RUN apt-get update
RUN apt-get install -y curl

WORKDIR /usr/src/repkvs

COPY core ./core
COPY repKVS ./repKVS

COPY modAlias.ts \
    ServerConfigurations.ts \ 
    package.json \
    package-lock.json \
    gruntfile.js \
    tsconfig.json ./

RUN npm install
RUN npm run build:all

EXPOSE 9876
CMD ["npm", "run", "start:repkvs"]