FROM node:22-alpine

WORKDIR /app
ENV PORT=80

COPY . .

EXPOSE 80

CMD ["node", "server.js"]
