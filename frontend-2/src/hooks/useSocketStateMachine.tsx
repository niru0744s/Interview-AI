import { useEffect, useReducer, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export type SocketState =
  | "IDLE"
  | "CONNECTING"
  | "CONNECTED"
  | "RECONNECTING"
  | "DISCONNECTED"
  | "FATAL";

type Action =
  | { type: "INIT_SOCKET" }
  | { type: "CONNECT_SUCCESS" }
  | { type: "CONNECT_ERROR"; payload: string }
  | { type: "DISCONNECT"; payload: string }
  | { type: "RECONNECT_ATTEMPT"; payload: number }
  | { type: "RECONNECT_FAILED" }
  | { type: "AUTH_ERROR" };

interface MachineContext {
  retries: number;
  error: string | null;
}

interface MachineState {
  status: SocketState;
  context: MachineContext;
}

const initialState: MachineState = {
  status: "IDLE",
  context: {
    retries: 0,
    error: null,
  },
};

function socketReducer(state: MachineState, action: Action): MachineState {
  switch (action.type) {
    case "INIT_SOCKET":
      return { ...state, status: "CONNECTING", context: { ...state.context, error: null } };
    case "CONNECT_SUCCESS":
      return { ...state, status: "CONNECTED", context: { ...state.context, retries: 0, error: null } };
    case "CONNECT_ERROR":
      return { ...state, status: "FATAL", context: { ...state.context, error: action.payload } };
    case "RECONNECT_ATTEMPT":
      return { ...state, status: "RECONNECTING", context: { ...state.context, retries: action.payload } };
    case "DISCONNECT":
      return { ...state, status: "DISCONNECTED", context: { ...state.context, error: action.payload } };
    case "RECONNECT_FAILED":
      return { ...state, status: "FATAL", context: { ...state.context, error: "Max reconnection attempts reached" } };
    case "AUTH_ERROR":
      return { ...state, status: "FATAL", context: { ...state.context, error: "Authentication failed" } };
    default:
      return state;
  }
}

export function useSocketStateMachine(url: string, token: string | null) {
  const [state, dispatch] = useReducer(socketReducer, initialState);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (!token) return;

    dispatch({ type: "INIT_SOCKET" });

    const socket = io(url, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      dispatch({ type: "CONNECT_SUCCESS" });
    });

    socket.on("connect_error", (err) => {
      if (err.message === "xhr poll error") {
        dispatch({ type: "CONNECT_ERROR", payload: "Server unreachable" });
      } else {
        dispatch({ type: "CONNECT_ERROR", payload: err.message });
      }
    });

    socket.on("reconnect_attempt", (attempt) => {
      dispatch({ type: "RECONNECT_ATTEMPT", payload: attempt });
    });

    socket.on("reconnect_failed", () => {
      dispatch({ type: "RECONNECT_FAILED" });
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, you need to reconnect manually
        socket.connect();
      }
      dispatch({ type: "DISCONNECT", payload: reason });
    });

    socketRef.current = socket;
  }, [url, token]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    status: state.status,
    error: state.context.error,
    retries: state.context.retries,
    socket: socketRef.current,
    reconnect: connect
  };
}
