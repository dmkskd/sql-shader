# QuestDB WebSocket-to-PostgreSQL Proxy
# Allows browser clients to connect to QuestDB via PostgreSQL wire protocol

FROM node:20-alpine

# Install dependencies
WORKDIR /app
RUN npm install ws pg

# Copy proxy script
COPY questdb-ws-proxy.js /app/

# Expose WebSocket port
EXPOSE 8812

# Run the proxy
CMD ["node", "questdb-ws-proxy.js"]
