import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
let socket = null;

export function getSocket() {
  if (socket) return socket;
  const access = localStorage.getItem("access");
  socket = io(SOCKET_URL, {
    auth: { token: access },
    transports: ["websocket"],
  });
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
