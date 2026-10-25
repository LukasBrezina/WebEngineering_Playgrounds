FROM node:22-alpine
ENV HUSKY=0
WORKDIR /repo
COPY . .
RUN npm ci && npm run build -w apps/api
WORKDIR /repo/apps/api
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]