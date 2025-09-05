const express = require("express");
const server = require("http").createServer();
const app = express();

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);
server.listen(3000);

/** Begin Websockets */
const WebSocketServer = require("ws").Server;

const wss = new WebSocketServer({ server });

wss.on("connection", function conection(ws) {
  const numClients = wss.clients.size;
  console.log("clients connected: ", numClients);

  // send message to all clients
  wss.broadcast(`Current visitors: ${numClients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send("welcome to my server");
  }

  ws.on("close", () => {
    wss.broadcast(`Current visitors: ${numClients}`);
    console.log("A client disconnected");
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};
