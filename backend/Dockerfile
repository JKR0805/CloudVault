# Use a specific and secure base image
FROM node:24-alpine

# Set environment variable for production
ENV NODE_ENV=production

# Set the working directory
WORKDIR /app

# Copy package files with appropriate permissions
COPY --chown=node:node package*.json ./

# Install production dependencies and clean cache to reduce image size
RUN npm ci --omit=dev && npm cache clean --force

# Copy the rest of the application code
COPY --chown=node:node . .

# Switch to the non-root user provided by the official Node image
USER node

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["node", "src/server.js"]