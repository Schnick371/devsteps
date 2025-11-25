#!/usr/bin/env node

/**
 * Simple MCP Client Test
 * Tests the DevSteps MCP Server via stdio
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'packages/mcp-server/dist/index.js');
const workingDir = join(__dirname, 'test-project');

console.log('🧪 Starting MCP Server Test Client...\n');

// Start MCP server
const server = spawn('node', [serverPath], {
  cwd: workingDir,
  stdio: ['pipe', 'pipe', 'inherit'],
});

let buffer = '';
let requestId = 0;

// Handle server responses
server.stdout.on('data', (data) => {
  buffer += data.toString();
  
  // Try to parse complete JSON messages
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Keep incomplete line in buffer
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log('📨 Response:', JSON.stringify(response, null, 2));
      } catch (e) {
        // Log messages that aren't JSON (like startup logs)
        if (!line.includes('"level":')) {
          console.log('📝 Server log:', line);
        }
      }
    }
  }
});

// Helper to send MCP requests
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    id: ++requestId,
    method,
    params,
  };
  
  console.log(`\n🚀 Sending: ${method}`);
  console.log('📤 Request:', JSON.stringify(request, null, 2));
  
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Wait a bit for server to start, then run tests
setTimeout(() => {
  console.log('\n--- Starting Tests ---\n');
  
  // Test 1: Initialize
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0',
    },
  });
  
  // Test 2: List tools
  setTimeout(() => {
    sendRequest('tools/list');
  }, 1000);
  
  // Test 3: Call devsteps-status tool
  setTimeout(() => {
    sendRequest('tools/call', {
      name: 'devsteps-status',
      arguments: {},
    });
  }, 2000);
  
  // Test 4: List items
  setTimeout(() => {
    sendRequest('tools/call', {
      name: 'devsteps-list',
      arguments: {
        status: 'draft',
      },
    });
  }, 3000);
  
  // Exit after tests
  setTimeout(() => {
    console.log('\n✅ Tests completed. Shutting down...\n');
    server.stdin.end();
    setTimeout(() => process.exit(0), 500);
  }, 4000);
  
}, 500);

// Handle errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`\n🏁 Server exited with code ${code}`);
});
