# pull node
FROM node:14

# if there is no PORT env variable the app defaults to 3001
# if there is a PORT env variable, this will need to be adjusted accordingly
EXPOSE 3001 
WORKDIR /usr/src/app

# copy over the files
COPY . .
RUN npm install

# command should be changed depending on NODE_ENV
CMD npm run dev
