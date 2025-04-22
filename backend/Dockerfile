# Dockerfile (Backend - plain Node.js with Express)

FROM node:18-alpine

WORKDIR /college-room/backend

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose backend port
EXPOSE 5000

# Start your server
CMD ["node", "server.js"]
