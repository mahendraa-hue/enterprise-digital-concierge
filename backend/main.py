from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn
import httpx
import json

app = FastAPI()

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "gemma"

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.get("/")
def read_root():
    return {"message": "Enterprise Digital Concierge Backend is running!"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"User via WS: {data}")
            
            # Call Ollama
            async with httpx.AsyncClient(timeout=30.0) as client:
                payload = {
                    "model": MODEL,
                    "messages": [{"role": "user", "content": data}],
                    "stream": True # We want streaming for "Enterprise" feel
                }
                
                try:
                    async with client.stream("POST", OLLAMA_URL, json=payload) as response:
                        full_response = ""
                        async for line in response.aiter_lines():
                            if line:
                                chunk = json.loads(line)
                                if "message" in chunk:
                                    content = chunk["message"].get("content", "")
                                    full_response += content
                                    # Send each chunk to frontend for real-time display
                                    await manager.send_personal_message(json.dumps({"type": "chunk", "text": content}), websocket)
                                if chunk.get("done"):
                                    await manager.send_personal_message(json.dumps({"type": "done", "text": full_response}), websocket)
                except Exception as e:
                    error_msg = f"Ollama Error: {str(e)}"
                    print(error_msg)
                    await manager.send_personal_message(json.dumps({"type": "error", "text": error_msg}), websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Client disconnected")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
