import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Chatbot() {
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // ---------- TEXT FORMAT HELPERS ----------
  const escapeHTML = (str = '') =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const formatText = (text = '') => {
    const escaped = escapeHTML(text);
    return escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  // ---------- TRANSCRIPT PARSER ----------
  const parseVoiceReply = (text = '') => {
    const transcriptMatch = text.match(/Transcript:\s*([\s\S]*?)\n\nResponse:/i);
    const responseMatch = text.match(/Response:\s*([\s\S]*)/i);

    return {
      transcript: transcriptMatch ? transcriptMatch[1].trim() : null,
      response: responseMatch ? responseMatch[1].trim() : text
    };
  };

  // ---------- SEND TEXT MESSAGE ----------
  const sendMessage = async () => {
    if (!input.trim()) return;

    setChat(prev => [...prev, { sender: 'You', text: input }]);

    try {
      const res = await axios.post('http://localhost:5000/api/chat', {
        message: input
      });

      setChat(prev => [
        ...prev,
        { sender: 'Bot', text: res.data.reply, isHTML: true }
      ]);
    } catch {
      setChat(prev => [
        ...prev,
        { sender: 'Bot', text: 'Error connecting to server.' }
      ]);
    }

    setInput('');
  };

  // ---------- VOICE RECORDING ----------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        sendVoiceNote(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch {
      alert('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceNote = async (blob) => {
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');

    setChat(prev => [...prev, { sender: 'You', text: '🎤 Voice message sent...' }]);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/chat/voice',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setChat(prev => [
        ...prev,
        { sender: 'Bot', text: res.data.reply, isHTML: true }
      ]);
    } catch {
      setChat(prev => [
        ...prev,
        { sender: 'Bot', text: 'Error processing voice message.' }
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ---------- MESSAGE RENDER ----------
  const renderMessage = (msg) => {
    if (!msg.isHTML) return <span>{msg.text}</span>;

    const { transcript, response } = parseVoiceReply(msg.text);
    const displayText = response || msg.text;

    const parts = displayText
      .split(/(https?:\/\/[^\s]+|\/register\/[^\s]+)/g)
      .filter(Boolean);

    return (
      <>
        {transcript && (
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            <em>🎧 Heard:</em> {transcript}
          </div>
        )}

        {parts.map((part, i) => {
          if (/^(https?:\/\/[^\s]+|\/register\/[^\s]+)$/.test(part)) {
            if (part.startsWith('/register/')) {
              return (
                <Link key={i} to={part} style={{ color: '#007bff' }}>
                  {part}
                </Link>
              );
            }
            return (
              <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                {part}
              </a>
            );
          }

          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: formatText(part) }}
            />
          );
        })}
      </>
    );
  };

  // ---------- UI ----------
  return (
    <div style={{ padding: '15px', maxWidth: '700px', margin: '0 auto' }}>
      <h2>Event Chatbot</h2>

      <div style={{
        height: '320px',
        overflowY: 'auto',
        border: '1px solid gray',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        {chat.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === 'You' ? 'right' : 'left', marginBottom: '10px' }}>
            <b>{msg.sender}: </b>
            {renderMessage(msg)}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={{ position: 'relative' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about events (Tamil / Hindi / English)..."
          rows={2}
          style={{
            width: '100%',
            padding: '8px 45px 8px 8px',
            borderRadius: '5px',
            border: '1px solid gray'
          }}
        />

        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          style={{
            position: 'absolute',
            right: '10px',
            top: '10px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: isRecording ? 'red' : '#555'
          }}
        >
          {isRecording ? '🛑' : '🎤'}
        </button>
      </div>

      <button
        onClick={sendMessage}
        style={{
          width: '100%',
          marginTop: '5px',
          padding: '8px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        Send
      </button>

      {isRecording && (
        <p style={{ color: 'red', fontSize: '12px' }}>
          Recording… release to send
        </p>
      )}
    </div>
  );
}

export default Chatbot;
