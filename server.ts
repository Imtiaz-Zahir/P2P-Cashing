import express, { Request, Response } from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import fs from "fs";

const app = express();
const server = createServer(app);
const port = 3000;

const io = new Server(server, { cors: { origin: "*" } });

let script: string;
const connections: { [key: string]: RTCSessionDescriptionInit } = {};

fs.readFile("script.js", (err, data) => {
  if (err) throw err;
  script = data.toString();
});

app.get("/", (_: Request, res: Response) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("user connected");

  socket.emit("js", script);

  socket.on(
    "offer",
    (offer: RTCSessionDescriptionInit) => (connections[socket.id] = offer)
  );

  if (Object.keys(connections).length > 0) {
    console.log(connections);
  }

  socket.on("disconnect", function () {
    console.log("user disconnected");
    if (connections[socket.id]) {
      delete connections[socket.id];
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
