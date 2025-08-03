const { io } = require('socket.io-client');

const socket = io('http://localhost:8000', {
  query: {
    userId: 'd02baa16-cbd5-49b9-9758-f00c19efa26d',
    senderId: 'cf635c8c-8d78-412e-8d2f-138678de1e18',
  },
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

socket.on('chat', (message) => {
  console.log('📨 Received:', message);
});

process.stdin.resume();
