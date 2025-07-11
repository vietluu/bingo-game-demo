import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { SocketProvider } from './services/socket';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <SocketProvider url={import.meta.env.VITE_SOCKET_URL}>
            <App />
        </SocketProvider>
    </React.StrictMode>
)
