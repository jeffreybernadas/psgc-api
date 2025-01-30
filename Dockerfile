# Development Stage
FROM node:22-alpine AS development

# Define working dir in container
WORKDIR /app

# Copy package.json and package-lock.json to container
COPY package*.json ./

# Set registry to npmjs registry and install dependencies
RUN yarn install --frozen-lockfile

# Copy all files to container
COPY . .

# Build the application for production
RUN yarn build

# Start the application in development mode
CMD ["yarn", "dev"]

# Production Stage
FROM node:22-alpine AS production

# Define working dir in container
WORKDIR /app

# Copy package.json and package-lock.json to container
COPY package*.json ./

# Set registry to npmjs registry and install dependencies
RUN yarn install --frozen-lockfile --only=production

# Copy all files to container
COPY --from=development /app/dist ./dist

# Start the application in production mode
CMD ["node", "dist/index.js"]