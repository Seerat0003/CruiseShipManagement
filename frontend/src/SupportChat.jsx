import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketContext';
import { BsChatDotsFill, BsXCircleFill, BsSendFill } from 'react-icons/bs';
import './SupportChat.css';

const SupportChat = () => {
    const socket = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef();

    // Get current user info
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (e) => {
            const msg = e.detail;
            setMessages((prev) => [...prev, msg]);
        };

        window.addEventListener('NEW_CHAT_MESSAGE', handleNewMessage);
        return () => window.removeEventListener('NEW_CHAT_MESSAGE', handleNewMessage);
    }, [socket]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!user) return null;

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket) return;

        const msgData = {
            senderId: user.id,
            senderName: user.name,
            role: user.role,
            message: input,
            timestamp: new Date().toISOString(),
            // For voyagers, they always send to "Managers"
            // For managers, we'd need a selection UI (simplified here to reply to the last sender)
            receiverId: user.role === 'voyager' ? 'admin' : messages[messages.length - 1]?.senderId
        };

        socket.emit('chat_message', msgData);
        setMessages((prev) => [...prev, msgData]);
        setInput('');
    };

    return (
        <div className={`support-chat-wrapper ${isOpen ? 'open' : ''}`}>
            {!isOpen ? (
                <button className="chat-toggle" onClick={() => setIsOpen(true)}>
                    <BsChatDotsFill size={24} />
                    <span>Support</span>
                </button>
            ) : (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>Cruise Support</h3>
                        <button onClick={() => setIsOpen(false)}><BsXCircleFill size={20} /></button>
                    </div>
                    <div className="chat-messages">
                        {messages.length === 0 && <p className="empty-chat">How can we help you today?</p>}
                        {messages.map((msg, i) => (
                            <div key={i} className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                                <span className="sender">{msg.senderName}</span>
                                <p>{msg.message}</p>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                    <form className="chat-input" onSubmit={sendMessage}>
                        <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            placeholder="Type a message..."
                        />
                        <button type="submit"><BsSendFill /></button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SupportChat;
