import { useState, useEffect, useCallback, useRef } from 'react';

export type WSMessage = {
  type: 'chunk' | 'done' | 'error' | 'transcript';
  text: string;
};

export function useWebSocket(
  url: string, 
  onMessageComplete?: (fullText: string) => void,
  onSentenceAvailable?: (sentence: string) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const sentenceBuffer = useRef('');
  const isReceivingRef = useRef(false);

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);

    socket.onmessage = (event) => {
      let data: WSMessage;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error("Failed to parse WS message:", e);
        return;
      }

      // --- Handle completion ---
      if (data.type === 'done') {
        // Flush any remaining text in the buffer
        if (sentenceBuffer.current.trim()) {
          onSentenceAvailable?.(sentenceBuffer.current.trim());
          sentenceBuffer.current = '';
        }
        onMessageComplete?.(data.text);
        isReceivingRef.current = false;
        return;
      }

      // --- Handle errors ---
      if (data.type === 'error') {
        console.error("Server error:", data.text);
        isReceivingRef.current = false;
        return;
      }

      // --- Handle AI text chunk ---
      if (data.type === 'chunk') {
        const newText = data.text;
        sentenceBuffer.current += newText;

        // --- Aggressive Streaming TTS ---
        // We now trigger speech on commas, periods, question marks, or newlines 
        // to make the voice start as soon as possible.
        const match = sentenceBuffer.current.match(/^(.*[,.?!;])\s*/s);
        
        if (match) {
          const chunk = match[1].trim();
          if (chunk.length > 0) {
            onSentenceAvailable?.(chunk);
            sentenceBuffer.current = sentenceBuffer.current.slice(match[0].length);
          }
        }

        setMessages((prev) => {
          // If we're already receiving, append to the last chunk message
          if (isReceivingRef.current && prev.length > 0) {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg.type === 'chunk') {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...lastMsg,
                text: lastMsg.text + newText
              };
              return updated;
            }
          }
          // Start a new AI message
          isReceivingRef.current = true;
          return [...prev, { type: 'chunk', text: newText }];
        });
      }
    };

    return () => {
      socket.close();
    };
  }, [url]);

  const sendMessage = useCallback((text: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      isReceivingRef.current = false;
      sentenceBuffer.current = '';
      socketRef.current.send(text);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { isConnected, messages, setMessages, sendMessage, clearMessages };
}
