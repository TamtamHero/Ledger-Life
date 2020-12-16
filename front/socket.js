const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3002 });

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    try {
      const parseAction = JSON.parse(data);
      wss.broadcast(data); // if it's a valid json, send it, it will be parsed by clients
    } catch (e) {}
  });
  ws.send("Hello! Message From Server!!");
});

wss.broadcast = function broadcast(msg) {
  console.log("broadcasting", msg);
  wss.clients.forEach(function each(client) {
    client.send(msg);
  });
};
