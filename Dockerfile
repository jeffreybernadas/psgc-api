# Development Stage
FROM node:22-alpine AS development

# Define working dir in container
WORKDIR /app

# Enable pnpm (version pinned by packageManager in package.json)
RUN corepack enable

# Copy package.json and pnpm-lock.yaml to container
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all files to container
COPY . .

# Build the application for production
RUN pnpm build

# Start the application in development mode
CMD ["pnpm", "dev"]

# Production Stage
FROM node:22-alpine AS production

# Define working dir in container
WORKDIR /app

# Enable pnpm (version pinned by packageManager in package.json)
RUN corepack enable

# Copy package.json and pnpm-lock.yaml to container
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy the build, the API data and the Swagger spec to container
COPY --from=development /app/dist ./dist
COPY public ./public
COPY swagger.yaml ./

# Start the application in production mode
CMD ["node", "dist/index.js"]
