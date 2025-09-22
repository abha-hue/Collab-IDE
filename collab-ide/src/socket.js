import { io } from "socket.io-client";

// connect once and reuse
const socket = io("http://localhost:3000", {
  transports: ["websocket"], // makes connection more stable
  autoConnect: false, // control when to connect
});

export default socket;