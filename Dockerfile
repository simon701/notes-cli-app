FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install --save-dev ts-node typescript @types/node
COPY . .
EXPOSE 5000
CMD ["npx", "ts-node", "controllers/app.ts"]