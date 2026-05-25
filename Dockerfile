FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY package*.json* ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build
RUN npm run build -w=artifacts/api-server

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/healthz', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start
ENV PORT=3001
ENV API_PORT=3001
CMD ["node", "artifacts/api-server/dist/index.mjs"]
