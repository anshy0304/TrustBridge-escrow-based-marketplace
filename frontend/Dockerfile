# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# The env variables for vite need to be present at build time
# If your backend is running in docker-compose, this will point to localhost if accessed locally
# In production on AWS, you might want to use a relative URL like /api 
# For now, let's inject it if needed or use the default local one
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
