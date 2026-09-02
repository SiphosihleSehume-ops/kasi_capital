FROM node:22-alpine

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies (including React Native CLI)
RUN npm ci

# Copy the rest of the project source
COPY . .

# Expose Metro bundler port
EXPOSE 8081

# Start the Metro bundler bound to all interfaces so a
# device/emulator on the host network can connect
CMD ["npx", "react-native", "start", "--host", "0.0.0.0"]
