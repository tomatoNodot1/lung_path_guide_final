FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
