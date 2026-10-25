FROM node:22-alpine AS build
ENV HUSKY=0
WORKDIR /repo
COPY . .
RUN npm ci && npm run build -w apps/web

FROM nginxinc/nginx-unprivileged:alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html