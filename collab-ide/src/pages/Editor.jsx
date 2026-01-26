import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import './editor.css';
import Coder from '../pages/Coder';
import { io } from 'socket.io-client';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import dotenv from 'dotenv';

dotenv.config();

const Editor = () => {
    const navigate = useNavigate();
    const { roomid } = useParams();
    const location = useLocation();
    const username = location.state?.username || "Anonymous";
    const [clients, setClients] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io(process.env.backend_url, {
            transports: ["websocket"],
        });
        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-room", { roomid, name: username });
            setTimeout(() => {
                toast.success(`${username} joined room`);
            }, 50);
        });

        const handleClientsUpdate = (clients) => {
            setClients(clients);
        };
        const handleUserJoined = (name) => {
            if (name !== username) toast.success(`${name} joined the room`);
        };
        const handleUserLeft = (name) => {
            if (name !== username) {
                setTimeout(() => {
                    toast.error(`${username} left the room`);
                }, 50);
            }
        };

        socketRef.current.on("clients-update", handleClientsUpdate);
        socketRef.current.on("user-joined", handleUserJoined);
        socketRef.current.on("user-left", handleUserLeft);

        return () => {
            socketRef.current.off("clients-update", handleClientsUpdate);
            socketRef.current.off("user-joined", handleUserJoined);
            socketRef.current.off("user-left", handleUserLeft);
            socketRef.current.disconnect();
        };
    }, [roomid, username]);

    const handleDisconnect = () => {
        socketRef.current.disconnect();
        navigate('/');
    };

    const handleCopyRoomID = () => {
        navigator.clipboard.writeText(roomid);
        toast.success("Room ID copied to clipboard");
    };

    return (
        <div className='Main-wrapper'>
            <div className="aside">
                <div className="aside-content">
                    <div className="logo">
                        <div className="logo-text">Collab-IDE</div>
                    </div>
                    <h3>Connected</h3>
                    <div className="client-list">
                        {clients.map(c => <p key={c.clientid}>{c.name}</p>)}
                    </div>
                    <div className="btn-cont">
                        <button className="btn disconnect-btn" onClick={handleDisconnect}>
                            Disconnect
                        </button>
                        <button className="btn copy-roomid-btn" onClick={handleCopyRoomID}>
                            Copy RoomID
                        </button>
                    </div>
                </div>
            </div>
            <div className="Editor">
                {socketRef.current && <Coder socket={socketRef.current} roomid={roomid} />}

            </div>
        </div>
    );
};

export default Editor;
