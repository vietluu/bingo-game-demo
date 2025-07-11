import React, { createContext, useContext, useEffect, useRef, ReactNode, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
    emit: (event: string, data?: any) => void;
    on: (event: string, callback: (data: any) => void) => void;
    off: (event: string, callback: (data: any) => void) => void;
    once: (event: string, callback: (data: any) => void) => void;
    removeAllListeners: (event?: string) => void;
    isConnected: boolean;
}

interface SocketProviderProps {
    children: ReactNode;
    url?: string;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children, url }: SocketProviderProps) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = io(url, {
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Connected to server");
            setIsConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from server");
            setIsConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, [url]);

    const emit = (event: string, data?: any) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data);
        } else {
            console.warn("Socket is not connected");
        }
    };

    const on = (event: string, callback: (data: any) => void) => {
        socketRef.current?.on(event, callback);
    };

    const off = (event: string, callback: (data: any) => void) => {
        socketRef.current?.off(event, callback);
    };

    const once = (event: string, callback: (data: any) => void) => {
        socketRef.current?.once(event, callback);
    };

    const removeAllListeners = (event?: string) => {
        if (event) {
            socketRef.current?.removeAllListeners(event);
        } else {
            socketRef.current?.removeAllListeners();
        }
    };

    const value: SocketContextType = {
        socket: socketRef.current,
        emit,
        on,
        off,
        once,
        removeAllListeners,
        isConnected,
    };

    return React.createElement(SocketContext.Provider, { value }, children);
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}

