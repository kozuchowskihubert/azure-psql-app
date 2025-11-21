FROM node:20-alpine
WORKDIR /usr/src/app
COPY app/package.json app/package-lock.json* ./
RUN npm ci --production
COPY app/ .
EXPOSE 3000
CMD ["node","index.js"]
