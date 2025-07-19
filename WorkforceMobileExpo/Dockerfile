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

# Mobile App Dockerfile for Local Development
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/ || exit 1

# Start Expo development server
CMD ["npx", "expo", "start", "--web", "--port", "3002", "--host", "0.0.0.0"] 