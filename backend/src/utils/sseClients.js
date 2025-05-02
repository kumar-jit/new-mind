// const sseClients = new Map();

// export const addClient = (clientId, res) => {
//   sseClients.set(clientId, res);
// };

// export const removeClient = (clientId) => {
//   sseClients.delete(clientId);
// };

// export const getClient = (clientId) => {
//   return sseClients.get(clientId);
// };


// sseManager.js
import { EventEmitter } from 'events';

class SSEManager extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map();
  }

  addClient(clientId, res) {
    this.clients.set(clientId, res);
  }

  removeClient(clientId) {
    this.clients.delete(clientId);
  }

  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (client) {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }

  broadcast(data) {
    this.clients.forEach(client => {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
}

export const sseManager = new SSEManager();