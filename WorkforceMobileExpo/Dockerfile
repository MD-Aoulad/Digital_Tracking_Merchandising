# Multi-stage build for Expo React Native app (web version)
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the web version of the app
RUN npm run build:web

# Production stage
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for mobile app
COPY nginx-mobile.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3002

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 