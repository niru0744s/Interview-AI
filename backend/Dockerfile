# Use official Node.js 22 LTS Bookworm Slim for stability, small size, and C++ bindings (bcrypt) compatibility
FROM node:22-bookworm-slim AS base

WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# Install dependencies first (leverages Docker layer cache)
COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code
COPY . .

# Change ownership to built-in non-root node user
RUN chown -R node:node /usr/src/app

USER node

# Expose default application port
EXPOSE 5000

# Built-in health check using Node.js without needing external curl/wget
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"]
