FROM node:6.9

# Enviroment variables
ENV HOMEDIR /data
RUN apt-get update -y
RUN apt-get install build-essential -y
RUN apt-get install libssl-dev -y
RUN mkdir -p ${HOMEDIR}
WORKDIR ${HOMEDIR}

# install all dependencies
ADD package.json ./
RUN npm install

# add node content initially
ADD . .
RUN npm run bootstrap

EXPOSE 4000

CMD cd ./citation-demo && npm start
