import { useEffect, useReducer, useRef } from "react";
import { io, Socket } from "socket.io-client";

export type SocketState =
  | "IDLE"
  | "CONNECTING"
  | "CONNECTED"
  | "RECONNECTING"
  | "DISCONNECTED"
  | "FATAL";

type Event =
  | { type: "INIT_SOCKET" }
  | { type: "CONNECT_SUCCESS" }
  | { type: "CONNECT_FAIL" }
  | { type: "SOCKET_DROP" }
  | { type: "RECONNECT_SUCCESS" }
  | { type: "RECONNECT_TIMEOUT" }
  | { type: "USER_RETRY" }
  | { type: "AUTH_EXPIRED" }
  | { type: "MAX_RETRIES_EXCEEDED" };

interface MachineContext {
  retries: number;
}

interface MachineState {
  status: SocketState;
  context: MachineContext;
}
