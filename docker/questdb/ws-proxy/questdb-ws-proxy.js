#!/usr/bin/env node

/**
 * QuestDB WebSocket-to-PostgreSQL Proxy
 * 
 * This proxy allows browser-based clients to connect to QuestDB's PostgreSQL
 * wire protocol interface via WebSockets.
 * 
 * Installation:
 *   npm install ws pg
 * 
 * Usage:
 *   node questdb-ws-proxy.js
 * 
 * Or make it executable:
 *   chmod +x questdb-ws-proxy.js
 *   ./questdb-ws-proxy.js
 */

const WebSocket = require('ws');
const { Pool } = require('pg');

const WS_PORT = 8812; // WebSocket server port (exposed as 8813 on host)
// Use Docker link hostname if available, otherwise localhost
const PG_HOST = process.env.QUESTDB_HOST || 'pixelql-questdb';
const PG_PORT = 8812;

// Create a connection pool for better performance
// Pool keeps connections alive and reuses them
const pgPool = new Pool({
  host: PG_HOST,
  port: PG_PORT,
  database: 'qdb',
  user: 'admin',
  password: 'quest',
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Fail fast if connection takes > 2s
});

console.log(`[QuestDB WS Proxy] Connection pool created for ${PG_HOST}:${PG_PORT}`);

const wss = new WebSocket.Server({ 
  port: WS_PORT,
  perMessageDeflate: false // Disable compression for lower latency
});

console.log(`[QuestDB WS Proxy] WebSocket server listening on ws://localhost:${WS_PORT}`);
console.log(`[QuestDB WS Proxy] Using connection pool (max: 10 connections)`);

wss.on('connection', (ws) => {
  console.log('[QuestDB WS Proxy] New client connected');
  
  let pgClient = null;
  let isAuthenticated = false;
  
  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      
      if (msg.type === 'auth') {
        // Handle authentication - with connection pool, we just mark as authenticated
        console.log(`[QuestDB WS Proxy] Client authenticated`);
        isAuthenticated = true;
        
        // Get a client from the pool immediately to warm up the connection
        try {
          pgClient = await pgPool.connect();
          console.log('[QuestDB WS Proxy] Pool connection acquired');
          ws.send(JSON.stringify({ type: 'ready' }));
        } catch (error) {
          console.error('[QuestDB WS Proxy] Pool connection failed:', error.message);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: `Connection failed: ${error.message}` 
          }));
        }
      } else if (msg.type === 'query') {
        // Handle query
        if (!isAuthenticated || !pgClient) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            id: msg.id,
            message: 'Not authenticated' 
          }));
          return;
        }
        
        try {
          const startTime = Date.now();
          const result = await pgClient.query(msg.sql);
          const queryTime = Date.now() - startTime;
          
          console.log(`[QuestDB WS Proxy] Query executed in ${queryTime}ms (${result.rows.length} rows)`);
          
          ws.send(JSON.stringify({ 
            type: 'result', 
            id: msg.id,
            rows: result.rows 
          }));
        } catch (error) {
          console.error('[QuestDB WS Proxy] Query error:', error.message);
          ws.send(JSON.stringify({ 
            type: 'error', 
            id: msg.id,
            message: error.message 
          }));
        }
      }
    } catch (error) {
      console.error('[QuestDB WS Proxy] Message parsing error:', error.message);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: `Invalid message format: ${error.message}` 
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('[QuestDB WS Proxy] Client disconnected');
    if (pgClient) {
      // Release the client back to the pool instead of closing it
      pgClient.release();
      console.log('[QuestDB WS Proxy] Connection released back to pool');
    }
  });
  
  ws.on('error', (error) => {
    console.error('[QuestDB WS Proxy] WebSocket error:', error.message);
  });
});

process.on('SIGINT', async () => {
  console.log('\n[QuestDB WS Proxy] Shutting down...');
  wss.close(async () => {
    console.log('[QuestDB WS Proxy] WebSocket server closed');
    await pgPool.end();
    console.log('[QuestDB WS Proxy] Connection pool closed');
    process.exit(0);
  });
});
