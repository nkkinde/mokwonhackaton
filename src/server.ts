import http from 'http';
import { app } from './app';
import { Server } from 'socket.io';
import { env } from './config/env';
import { registerGateway } from './modules/ws/gateway';

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: env.CORS_ORIGIN, credentials: true } });
registerGateway(io);

server.listen(env.PORT, () => console.log(`API on :${env.PORT}`));
