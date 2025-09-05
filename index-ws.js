const express = require("express");
const server = require("http").createServer();
const app = express();

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);
server.listen(3000, function () {
  console.log("server started on port 3000");
});

/** Begin Websockets */
const WebSocketServer = require("ws").Server;

const wss = new WebSocketServer({ server });

process.on("SIGINT", () => {
  console.log("sigint");
  wss.clients.forEach((client) => {
    client.close();
  });
  server.close(() => {
    shutdownDB();
  });
});

wss.on("connection", function conection(ws) {
  const numClients = wss.clients.size;
  console.log("clients connected: ", numClients);

  // send message to all clients
  wss.broadcast(`Current visitors: ${numClients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send("welcome to my server");
  }

  db.run(
    `INSERT INTO visitors (count, time) VALUES (${numClients}, datetime('now'))`
  );

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

/** end Websockets */
/** begin database */
const sqlite = require("sqlite3");
const db = new sqlite.Database(":memory:");

db.serialize(() => {
  db.run(`
		CREATE TABLE visitors (
			count INTEGER,
			time TEXT
		)
	`);
});

function getCounts() {
  db.each("SELECT * FROM visitors", (err, row) => {
    console.log(row);
  });
}

// when server is done, we need to close the connection
function shutdownDB() {
  console.log("Shutting down db");
  getCounts();
  db.close();
}
