from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import httpx
import json
import os

router = APIRouter()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL = "gemma"

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_json(self, data: dict):
        for connection in self.active_connections:
            await connection.send_json(data)

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    print(f"WS Attempt: {user_id}")
    await manager.connect(websocket)
    print(f"WS Connected: {user_id}")
    try:
        while True:
            # Receive text data (chat input)
            data = await websocket.receive_text()
            print(f"WS Received from {user_id}: {data}")
            
            # Call Ollama
            print(f"Ollama Call Start for: {data}")
            async with httpx.AsyncClient(timeout=60.0) as client:
                payload = {
                    "model": MODEL,
                    "messages": [
                        {"role": "system", "content": "You are a professional Enterprise Digital Concierge. ALWAYS respond in the SAME LANGUAGE as the user's message. Be helpful, concise, and professional."},
                        {"role": "user", "content": data}
                    ],
                    "stream": True 
                }
                
                try:
                    async with client.stream("POST", f"{OLLAMA_URL}/api/chat", json=payload) as response:
                        full_response = ""
                        async for line in response.aiter_lines():
                            if line:
                                try:
                                    chunk = json.loads(line)
                                    if "message" in chunk:
                                        content = chunk["message"].get("content", "")
                                        full_response += content
                                        # Send chunk to frontend
                                        await websocket.send_json({"type": "chunk", "text": content})
                                    if chunk.get("done"):
                                        await websocket.send_json({"type": "done", "text": full_response})
                                except Exception as e:
                                    print(f"Error parsing chunk: {e}")
                except Exception as e:
                    error_msg = f"Ollama Error: {str(e)}"
                    print(error_msg)
                    await websocket.send_json({"type": "error", "text": error_msg})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client {user_id} disconnected")
