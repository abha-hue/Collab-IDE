import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast'; // ✅ import toast here\r 
import './Home.css';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [id, setid] = useState('');
    const [username, setusername] = useState('');
    const navigate = useNavigate();
    const createRoom = (e) => {
        e.preventDefault();
        const roomId = uuidv4();
        setid(roomId);

        // ✅ show toast here
        toast.success('Room created successfully!');


    };

    const join_room = () => {
        if (!id || !username) {
            toast.error('Please enter room id and username');
            return
        }
        navigate(`/editor/${id}`, {
            state: {
                username,
            }
        })
    }

    return (
        <>
            {/* ✅ always rendered */}
            <div className="home-container">
                <div className="hero-section">
                    <h1 className="hero-title">Welcome to Collab-IDE</h1>
                    <p className="hero-subtitle">
                        Collaborative Code Editor for Real-time Development
                    </p>
                </div>

                <div className="form-wrapper">
                    <h2>Enter Room ID</h2>
                    <input
                        type="text"
                        placeholder="room-id"
                        value={id}
                        onChange={(e) => setid(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? join_room() : null}
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onKeyDown={(e) => e.key === 'Enter' ? join_room() : null}
                        onChange={(e) => setusername(e.target.value)}
                    />
                    <div className="btn-cont1">
                        <button className="join-btn" onClick={join_room} onKeyDown={(e) => e.key === 'Enter' ? join_room() : null}>Join</button>
                        <button className="join-btn" onClick={createRoom}>
                            Create
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
