FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app/api
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 8080
USER node
CMD ["npm", "start"]