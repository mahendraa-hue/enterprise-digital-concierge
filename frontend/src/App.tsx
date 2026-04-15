import { useState, useEffect } from 'react';
import { Avatar } from './components/Avatar';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speak = (text: string, cancelPrevious = true) => {
    if (!window.speechSynthesis) return;

    if (cancelPrevious) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Auto-detect or use default voice for better compatibility
    const voices = window.speechSynthesis.getVoices();
    
    // Priority: 1. Natural Google Voices, 2. Local System Voice
    const preferredVoice = voices.find(v => v.name.includes('Natural') || v.name.includes('Google')) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      // Set lang based on voice to avoid silent failures
      utterance.lang = preferredVoice.lang;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("Speech Error:", e);
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const { isConnected, messages, sendMessage, setMessages } = useWebSocket(
    import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/chat/ws/user123',
    (_fullText) => { /* full text done — no action needed here */ },
    // ⚡ Sentence-by-sentence: voice starts the moment the first sentence is ready
    (sentence) => speak(sentence, false)
  );

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prev: any) => [...prev, { type: 'transcript', text: input }]);
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] text-white overflow-hidden font-sans" onClick={() => {
      // Initial click to unlock audio context if needed
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    }}>
      {/* 3D Avatar Layer */}
      <div className="absolute inset-0 z-0">
        <Avatar isSpeaking={isSpeaking} />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-8 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-medium uppercase tracking-widest text-cyan-400/80">
              {isConnected ? 'Concierge Online' : 'Concierge Offline'}
            </span>
          </div>

          {/* Chat Display */}
          <div className="glass rounded-2xl p-6 h-48 overflow-y-auto space-y-4 shadow-2xl glow">
            {messages.length === 0 && (
              <p className="text-white/40 italic">System ready. Start by saying hello...</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'transcript' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                  msg.type === 'transcript' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30' : 'bg-white/5 text-white/90'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
            <button 
              onClick={handleSend}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 px-8 rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            >
              Send
            </button>
          </div>

        </div>
      </div>

      {/* Header Info */}
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
          EDC <span className="text-cyan-500">SYSTEM</span>
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Enterprise Digital Concierge v1.0</p>
      </div>

    </div>
  );
}

export default App;
