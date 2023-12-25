import express, { Request, Response } from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import fs from "fs";

const app = express();
const server = createServer(app);
const port = 3000;

const io = new Server(server, { cors: { origin: "*" } });

let js: string;
let css: string;
const connections: { [key: string]: RTCSessionDescriptionInit } = {};
const socketIdToOfferProviderId: { [key: string]: string } = {};

fs.readFile("index.js", (err, data) => {
  if (err) throw err;
  js = data.toString();
});

fs.readFile("index.css", (err, data) => {
  if (err) throw err;
  css = data.toString();
});

// app.use(express.static("dist"));

app.get("/", (_: Request, res: Response) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/script.js", (_: Request, res: Response) => {
  res.sendFile(__dirname + "/script.js");
});

io.on("connection", (socket) => {
  console.log("user connected");

  const socketIds = Object.keys(connections);
  if (socketIds.length > 0) {
    const nearestClientId = nearestClient(socketIds);
    socket.emit("getFromOther", connections[nearestClientId]);
    socketIdToOfferProviderId[socket.id] = nearestClientId;
  } else {
    socket.emit("js", js);
    socket.emit("css", css);
  }

  socket.on("offer", (offer: RTCSessionDescriptionInit) => {
    connections[socket.id] = offer;
  });

  socket.on("answer", (answer: RTCSessionDescriptionInit) => {
    const socketId = socketIdToOfferProviderId[socket.id];
    socket.to(socketId).emit("answer", answer);
    delete socketIdToOfferProviderId[socketId];
    delete connections[socketId];
  });

  socket.on("fileNotFound",()=>{
    socket.emit("js", js);
    socket.emit("css", css);
  })

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

function nearestClient(socketIds: string[]) {
  return socketIds[0];
}
