import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React dev server
    methods: ["GET", "POST"]
  }
});

// Track connected users and room states
const clients = {};
const rooms = {};

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on("join-room", ({ roomid, name }) => {
    try {
      if (!roomid || !name) {
        throw new Error("Missing roomid or name");
      }

      socket.join(roomid);
      clients[socket.id] = { clientid: socket.id, name, roomid };
      console.log(`${name} joined room ${roomid}`);

      // Send updated clients list
      io.to(roomid).emit(
        "clients-update",
        Object.values(clients).filter(c => c.roomid === roomid)
      );

      // ✅ Initialize room if it doesn't exist
      if (!rooms[roomid]) {
        rooms[roomid] = {
          code: "// Welcome to Collab-IDE!\n// Start coding here...\n\n",
          language: "javascript"
        };
      }

      // ✅ Send latest code + language to the new user
      socket.emit("code-update", {
        code: rooms[roomid].code,
        language: rooms[roomid].language
      });

      // Notify others
      socket.in(roomid).emit("user-joined", name);

    } catch (err) {
      console.error("join-room error:", err.message);
      socket.emit("error-message", "Failed to join room. Please try again.");
    }
  });

  socket.on("code-change", ({ roomid, code, language }) => {
    try {
      if (!roomid) throw new Error("Missing roomid");

      if (!rooms[roomid]) rooms[roomid] = { code: "", language: "javascript" };
      rooms[roomid].code = code;
      rooms[roomid].language = language;

      socket.to(roomid).emit("code-update", { code, language });
      console.log(`Code updated in room ${roomid}`);
    } catch (err) {
      console.error("code-change error:", err.message);
    }
  });

  socket.on("language-change", ({ roomid, language }) => {
    try {
      if (!roomid || !language) throw new Error("Missing roomid or language");

      if (!rooms[roomid]) rooms[roomid] = { code: "", language: "javascript" };
      rooms[roomid].language = language;

      socket.to(roomid).emit("language-update", { language });
      console.log(`Language changed to ${language} in room ${roomid}`);
    } catch (err) {
      console.error("language-change error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);

    const roomid = clients[socket.id]?.roomid;
    const name = clients[socket.id]?.name;
    delete clients[socket.id];

    if (roomid) {
      socket.in(roomid).emit("user-left", name);
      io.to(roomid).emit(
        "clients-update",
        Object.values(clients).filter(c => c.roomid === roomid)
      );
    }
  });
});

app.get('/', (req, res) => {
  res.send("hello world");
});

server.listen(3000, () => {
  console.log('Server started');
  console.log('Open http://localhost:3000 in your browser');
});
