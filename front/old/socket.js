const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3002 });
const queued = [];
wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    try {
      const parseAction = JSON.parse(data);
      queued.push(data);
      wss.broadcast(data); // if it's a valid json, send it, it will be parsed by clients
    } catch (e) {}
  });
  if (queued.length) {
    // Could probably be done in a single message
    for (let i = 0; i < queued.length; i++) ws.send(queued[i]);
  }
});

wss.broadcast = function broadcast(msg) {
  console.log("broadcasting", msg);
  wss.clients.forEach(function each(client) {
    client.send(msg);
  });
};
