FROM node:18

RUN apt-get update
RUN apt-get install -y curl

WORKDIR /usr/src/keyval

COPY core ./core
COPY keyValStore ./keyValStore

COPY moduleAlias.mjs \
    ServerConfigurations.ts \ 
    package.json \
    package-lock.json \
    gruntfile.cjs \
    tsconfig.json ./

RUN npm install
RUN npm run build:all

EXPOSE 9876
CMD ["npm", "run", "start:keyval"]