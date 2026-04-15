# EDC SYSTEM - TECHNICAL PREPARATION CHECKLIST
## Complete Setup & Implementation Guide

---

## PHASE 0: PRE-KICKOFF (Week -1 to 0)

### [ ] PROJECT GOVERNANCE
- [ ] Project charter approved by Google Anti-Gravity leadership
- [ ] Budget allocation confirmed (estimated $80K-120K for MVP)
- [ ] Team members assigned (7 people, committed full-time)
- [ ] Stakeholder communication plan established
- [ ] Weekly sync meetings scheduled (Mondays 10 AM)
- [ ] Decision-making authority clarified (who approves scope changes?)

### [ ] INFRASTRUCTURE SETUP
- [ ] GCP Project created (anti-gravity-dev, anti-gravity-staging, anti-gravity-prod)
- [ ] Billing account linked (cost tracking enabled)
- [ ] Google Cloud SDK installed on all machines
- [ ] Service accounts created with appropriate IAM roles
- [ ] VPC networks configured (dev, staging, prod)
- [ ] Cloud DNS setup for custom domains

### [ ] DEVELOPMENT ENVIRONMENT
- [ ] Git repository created (GitHub Enterprise / Google Cloud Source)
- [ ] Branch protection rules configured (main, staging, dev)
- [ ] CI/CD pipeline structure defined (GitHub Actions / Cloud Build)
- [ ] Dependency management tools installed:
  - [ ] Node.js 20.x LTS
  - [ ] Python 3.11.x
  - [ ] Docker 24.x
  - [ ] kubectl 1.27+
  - [ ] Helm 3.x
- [ ] VSCode extensions recommended (ESLint, Prettier, Python, Docker)
- [ ] IDE settings synced across team (EditorConfig)

### [ ] SECURITY & COMPLIANCE
- [ ] Security requirements gathered from Google Anti-Gravity
- [ ] Data classification defined (public, internal, confidential, restricted)
- [ ] Encryption standards chosen (AES-256, TLS 1.3)
- [ ] Audit logging requirements specified
- [ ] Compliance targets confirmed (GDPR, SOC2, Indonesia local)
- [ ] Security baseline document created

### [ ] COMMUNICATION & DOCUMENTATION
- [ ] Confluence/Wiki space created for team docs
- [ ] Architecture Decision Record (ADR) template created
- [ ] API documentation template created (OpenAPI/Swagger)
- [ ] Code review guidelines documented
- [ ] Definition of Done (DoD) checklist created
- [ ] Communication channels setup:
  - [ ] Slack workspace (team + stakeholders)
  - [ ] Google Workspace (email, docs)
  - [ ] Jira/Linear (issue tracking)

---

## PHASE 1: FOUNDATION (Month 1)

### WEEK 1-2: Architecture & Database Design

#### [ ] ARCHITECTURE REVIEW
- [ ] Detailed architecture diagram created (C4 model)
- [ ] Component interaction diagrams finalized
- [ ] Data flow diagrams documented
- [ ] Technology choices validated with team
- [ ] ADRs written for key decisions:
  - [ ] ADR-001: Why FastAPI over Django/Flask
  - [ ] ADR-002: Why PostgreSQL + Supabase
  - [ ] ADR-003: Three.js for 3D avatar
  - [ ] ADR-004: WebSocket over polling
  - [ ] ADR-005: Kubernetes for orchestration

#### [ ] DATABASE SCHEMA DESIGN
- [ ] ER diagram created (Miro / Excalidraw)
- [ ] Table definitions written:
  ```sql
  -- Users & Auth
  users (id, email, name, department_id, role_id, created_at)
  departments (id, name, parent_id, metadata)
  roles (id, name, permissions)
  user_roles (user_id, role_id)
  
  -- Conversations
  conversations (id, user_id, started_at, ended_at, summary)
  messages (id, conversation_id, user_id, content, role, timestamp)
  
  -- Knowledge Base
  knowledge_base (id, department_id, title, content, category, created_by, created_at)
  knowledge_base_embeddings (id, kb_id, embedding, model_version)
  
  -- Avatar Personalization
  avatar_preferences (id, user_id, voice_id, avatar_id, speed, tone)
  
  -- Audit & Compliance
  audit_logs (id, user_id, action, resource_type, resource_id, timestamp, ip_address)
  ```
- [ ] Indexes planned (primary, foreign, unique, composite)
- [ ] RLS policies drafted (department isolation rules)
- [ ] Backup strategy documented (frequency, retention, testing)

#### [ ] BACKEND SKELETON
```bash
# Create project structure
mkdir -p edc-system && cd edc-system
git clone <repo-url> .

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create FastAPI app structure
touch app/main.py
touch app/api/chat.py
touch app/api/auth.py
touch app/services/stt_service.py
```

- [ ] FastAPI project created
- [ ] Pydantic models drafted
- [ ] Main.py scaffolded with basic routes
- [ ] Environment variables file (.env.example) created
- [ ] Logging configured (structlog)
- [ ] CORS middleware setup
- [ ] Health check endpoint implemented

### WEEK 2-3: Authentication & Database

#### [ ] POSTGRESQL SETUP
```bash
# Option 1: Cloud SQL
gcloud sql instances create edc-postgres-dev \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-southeast2
```

- [ ] PostgreSQL 15 instance created (Cloud SQL or docker)
- [ ] Database created (`edc_dev`, `edc_staging`, `edc_prod`)
- [ ] User accounts created with minimal permissions
- [ ] Connection pooling configured (PgBouncer if needed)
- [ ] Backup automated (daily, 30-day retention)
- [ ] SSL connection required

#### [ ] SUPABASE OPTIONAL SETUP
- [ ] Supabase project created (if using managed service)
- [ ] Connection pooling enabled
- [ ] Row-Level Security (RLS) template policies created
- [ ] Real-time subscriptions tested

#### [ ] AUTHENTICATION SYSTEM
```python
# app/services/auth_service.py
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"])
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

async def authenticate_user(email: str, password: str):
    user = await db.users.find_one({"email": email})
    if not user or not pwd_context.verify(password, user.hashed_password):
        return None
    return user

async def create_access_token(user_id: str, expires_delta: timedelta = None):
    if expires_delta is None:
        expires_delta = timedelta(minutes=15)
    
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": user_id, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)
    
    user = await db.users.find_by_id(user_id)
    return user
```

- [ ] JWT secret generated and secured (Secret Manager)
- [ ] OAuth2 + JWT flow implemented
- [ ] Password hashing with bcrypt
- [ ] Token refresh mechanism (15 min access, 7 day refresh)
- [ ] Login endpoint tested
- [ ] Google Workspace SSO integration (optional, Phase 2)

### WEEK 3-4: Frontend & Docker Setup

#### [ ] REACT PROJECT SETUP
```bash
# Create React + TypeScript + Vite project
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm run dev
```

- [ ] React 18.2.x project created with TypeScript
- [ ] Vite configured (fast build, HMR)
- [ ] ESLint + Prettier configured
- [ ] Tailwind CSS installed
- [ ] Folder structure created:
  ```
  src/
  ├── components/
  │  ├── Avatar.tsx
  │  ├── VoiceInput.tsx
  │  └── ...
  ├── hooks/
  │  ├── useWebSocket.ts
  │  └── ...
  ├── pages/
  ├── types/
  └── utils/
  ```
- [ ] API client setup (fetch / axios)
- [ ] Mock API responses for testing
- [ ] Basic UI layout created

#### [ ] THREE.JS AVATAR SETUP
```javascript
// src/components/Avatar.tsx
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function Avatar() {
  const mountRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const rendererRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);

    // Load avatar model
    const loader = new GLTFLoader();
    loader.load('models/avatar.glb', (gltf) => {
      const avatar = gltf.scene;
      scene.add(avatar);
      
      // Setup lighting
      const light = new THREE.PointLight(0xffffff, 1);
      light.position.set(10, 10, 10);
      scene.add(light);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
    });

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
}
```

- [ ] Three.js r160+ installed
- [ ] Avatar 3D model loaded (GLTF format)
- [ ] Camera positioned correctly
- [ ] Lighting setup (key light, fill light, back light)
- [ ] Simple rotation animation working
- [ ] Mobile responsive (aspect ratio handling)

#### [ ] DOCKER SETUP
```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: edc_dev
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:dev_password@postgres:5432/edc_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    command: npm run dev

volumes:
  postgres_data:
```

- [ ] Dockerfile created for backend (Python 3.11 base)
- [ ] Dockerfile created for frontend (Node.js 20 base)
- [ ] docker-compose.yml created (local dev stack)
- [ ] Docker networking configured
- [ ] Volume mounts for development
- [ ] Environment file `.env.local` created

#### [ ] KUBERNETES MANIFESTS (Scaffolding)
```yaml
# kubernetes/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: edc-frontend
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: edc-frontend
  template:
    metadata:
      labels:
        app: edc-frontend
    spec:
      containers:
      - name: frontend
        image: gcr.io/anti-gravity-dev/edc-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: REACT_APP_API_URL
          value: "http://localhost:8000"
```

- [ ] Namespace created (dev, staging, prod)
- [ ] Deployment manifests scaffolded (not deployed yet)
- [ ] Service manifests created
- [ ] ConfigMap template created
- [ ] Secret template created (encrypted)

### PHASE 1 DELIVERABLE CHECKLIST
- [ ] Backend API running locally with `/health` endpoint
- [ ] Frontend loads with static avatar model
- [ ] PostgreSQL accessible with schema initialized
- [ ] Docker-compose stack fully working
- [ ] Git history clean (meaningful commits)
- [ ] README with local setup instructions
- [ ] Team can run `docker-compose up` and have full stack running

**DoD (Definition of Done):**
- [ ] Code reviewed by 2+ team members
- [ ] Unit tests written (80%+ coverage for critical paths)
- [ ] Deployment steps documented
- [ ] No hardcoded secrets
- [ ] Architecture ADRs written

---

## PHASE 2: VOICE PIPELINE (Month 2)

### WEEK 5-6: STT + LLM Integration

#### [ ] WHISPER STT SETUP
```python
# app/services/stt_service.py
import whisper
import numpy as np
from io import BytesIO

class STTService:
    def __init__(self):
        # Load model on startup (can be optimized with device='cuda' for GPU)
        self.model = whisper.load_model("base")  # or "small", "medium"
    
    async def transcribe(self, audio_bytes: bytes, language: str = "en") -> str:
        """
        Transcribe audio bytes to text using OpenAI Whisper
        
        Args:
            audio_bytes: Audio data (WAV/MP3)
            language: ISO-639-1 language code
        
        Returns:
            Transcribed text
        """
        try:
            # Load audio
            audio = whisper.load_audio(BytesIO(audio_bytes))
            
            # Inference
            result = self.model.transcribe(
                audio,
                language=language,
                fp16=torch.cuda.is_available()
            )
            
            return result["text"]
        except Exception as e:
            logger.error(f"STT error: {e}")
            raise

# Alternative: OpenAI Whisper API (cloud-based, more reliable)
import openai

class WhisperAPIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
    
    async def transcribe(self, audio_bytes: bytes) -> str:
        with open("temp.wav", "wb") as f:
            f.write(audio_bytes)
        
        with open("temp.wav", "rb") as f:
            transcript = openai.Audio.transcribe("whisper-1", f)
        
        os.remove("temp.wav")
        return transcript["text"]
```

- [ ] Whisper model downloaded (base or small version)
- [ ] STT service implemented with fallback handling
- [ ] Audio preprocessing (resampling to 16kHz)
- [ ] Language detection (optional)
- [ ] Error handling for corrupted audio
- [ ] Performance tested (latency measured)
- [ ] Unit tests written

#### [ ] OLLAMA + GEMMA 3 SETUP
```bash
# Install Ollama
# https://ollama.ai/download

# Download Gemma 3:4b model
ollama pull gemma:7b-instruct

# Test local inference
curl http://localhost:11434/api/generate -d '{
  "model": "gemma:7b-instruct",
  "prompt": "Hello, what is your name?",
  "stream": false
}'
```

```python
# app/services/llm_service.py
import httpx
import json

class OllamaService:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.model = "gemma:7b-instruct"
        self.client = httpx.AsyncClient()
    
    async def generate(self, prompt: str, context: dict = None) -> str:
        """
        Generate text using local Ollama LLM
        
        Args:
            prompt: User input
            context: Conversation history, user info, etc
        
        Returns:
            Generated response
        """
        # Build system prompt with context
        system_prompt = self._build_system_prompt(context)
        full_prompt = f"{system_prompt}\n\nUser: {prompt}\nAssistant:"
        
        try:
            response = await self.client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": full_prompt,
                    "stream": False,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "top_k": 40,
                },
                timeout=60.0
            )
            
            result = response.json()
            return result["response"].strip()
        except Exception as e:
            logger.error(f"LLM error: {e}")
            raise
    
    def _build_system_prompt(self, context: dict) -> str:
        """Build system prompt with user context"""
        system = """You are EDC, an Enterprise Digital Concierge assistant.
You help employees with HR, benefits, company information, and general questions.
Be friendly, professional, and concise.
If you don't know something, say 'I don't have that information, but I can help you find it.'
"""
        if context:
            system += f"\nUser: {context.get('name', 'Employee')}"
            system += f"\nDepartment: {context.get('department', 'Unknown')}"
        
        return system
    
    async def stream_generate(self, prompt: str, context: dict = None):
        """Stream response token-by-token (for real-time feel)"""
        system_prompt = self._build_system_prompt(context)
        full_prompt = f"{system_prompt}\n\nUser: {prompt}\nAssistant:"
        
        async with self.client.stream(
            "POST",
            f"{self.base_url}/api/generate",
            json={
                "model": self.model,
                "prompt": full_prompt,
                "stream": True,
            },
            timeout=60.0
        ) as response:
            async for line in response.aiter_lines():
                if line:
                    chunk = json.loads(line)
                    yield chunk["response"]
```

- [ ] Ollama installed and running
- [ ] Gemma 3:4b model downloaded
- [ ] LLM service wrapper created
- [ ] Prompt engineering templates written
- [ ] Context injection (user info, history) implemented
- [ ] Stream response handling (for TTS pipeline)
- [ ] Error handling (model timeout, OOM)
- [ ] Performance profiling (inference latency)
- [ ] Unit tests written

#### [ ] WEBSOCKET ENDPOINT CREATION
```python
# app/api/chat.py
from fastapi import WebSocket, WebSocketDisconnect, Depends
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

manager = ConnectionManager()

@app.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    # Verify user and get context
    try:
        user = await get_current_user_from_ws(user_id)
    except:
        await websocket.close(code=1008)
        return
    
    await websocket.accept()
    manager.active_connections[user_id] = websocket
    
    try:
        while True:
            # Receive audio data
            data = await websocket.receive_bytes()
            
            # STT
            transcript = await stt_service.transcribe(data)
            
            # Send transcription back (for UI feedback)
            await websocket.send_json({
                "type": "transcript",
                "text": transcript
            })
            
            # Get user context (RLS enforced)
            context = await get_user_context(user_id)
            
            # LLM generation
            response_text = await llm_service.generate(transcript, context)
            
            # Send LLM response
            await websocket.send_json({
                "type": "response",
                "text": response_text
            })
            
            # Log conversation
            await log_conversation(user_id, transcript, response_text)
    
    except WebSocketDisconnect:
        manager.active_connections.pop(user_id)
        logger.info(f"User {user_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=1011)
```

- [ ] WebSocket endpoint created
- [ ] Connection manager implemented
- [ ] Message routing (audio, text, metadata)
- [ ] Error handling (network issues, timeouts)
- [ ] Connection pooling tested
- [ ] Load testing on WebSocket (100+ concurrent)

### WEEK 6-7: TTS + Viseme Mapping

#### [ ] TTS SETUP (Coqui TTS)
```bash
# Install Coqui TTS
pip install TTS

# Download model
tts --model_name "tts_models/en/ljspeech/glow-tts" --list_models
```

```python
# app/services/tts_service.py
from TTS.api import TTS
import numpy as np
import soundfile as sf
from io import BytesIO

class TTSService:
    def __init__(self):
        # Initialize Coqui TTS on GPU if available
        self.tts = TTS(model_name="tts_models/en/ljspeech/glow-tts", gpu=torch.cuda.is_available())
        self.vocoder = TTS(model_name="tts_models/en/ljspeech/hifigan_v2", gpu=True)
    
    async def synthesize(self, text: str, voice_id: str = "default") -> bytes:
        """
        Synthesize text to speech
        
        Args:
            text: Text to speak
            voice_id: Voice selection
        
        Returns:
            Audio bytes (WAV format)
        """
        try:
            # Generate speech
            wav = self.tts.tts(text, speaker_idx=0, language_idx=0)
            
            # Convert to bytes
            audio_bytes = self._wav_to_bytes(wav)
            return audio_bytes
        except Exception as e:
            logger.error(f"TTS error: {e}")
            raise
    
    def _wav_to_bytes(self, wav: np.ndarray) -> bytes:
        """Convert WAV numpy array to bytes"""
        buffer = BytesIO()
        sf.write(buffer, wav, 22050, format='WAV')
        buffer.seek(0)
        return buffer.read()
    
    async def synthesize_streaming(self, text: str):
        """Stream TTS output word-by-word"""
        # Split into sentences
        sentences = text.split('. ')
        
        for sentence in sentences:
            wav = self.tts.tts(sentence.strip(), speaker_idx=0)
            audio_bytes = self._wav_to_bytes(wav)
            yield audio_bytes
```

- [ ] Coqui TTS installed
- [ ] TTS model downloaded (ljspeech)
- [ ] Audio synthesis tested
- [ ] Multiple voice options (if available)
- [ ] Streaming TTS implemented (send chunks as they're generated)
- [ ] Audio quality validated
- [ ] Performance optimization (GPU acceleration)

#### [ ] VISEME MAPPING IMPLEMENTATION
```python
# app/services/viseme_service.py
import librosa
import numpy as np
from phoneme_to_viseme_mapper import PhonemeVisemeMapper

class VisemeService:
    def __init__(self):
        self.mapper = PhonemeVisemeMapper()
        self.sample_rate = 22050
    
    # Viseme types (13 standard)
    VISEMES = {
        'A': ['a', 'ɑ'],         # vowels
        'E': ['e', 'ɛ'],
        'I': ['i', 'ɪ'],
        'O': ['o', 'ɔ'],
        'U': ['u', 'ʊ'],
        'F': ['f', 'v'],         # fricatives
        'M': ['m', 'p', 'b'],    # bilabial
        'L': ['l'],              # lateral
        'D': ['d', 't', 'n'],    # dental
        'G': ['g', 'k'],         # velar
        'R': ['ɹ', 'ɾ'],         # rhotic
        'S': ['s', 'z', 'ʃ', 'ʒ'], # sibilant
        'TH': ['θ', 'ð'],        # dental fricative
    }
    
    async def generate_visemes(self, audio_bytes: bytes, text: str) -> list:
        """
        Generate viseme stream from audio and text
        
        Returns:
            List of (time, viseme_name, intensity)
        """
        try:
            # Load audio
            y, sr = librosa.load(BytesIO(audio_bytes), sr=self.sample_rate)
            
            # Get phoneme timing from text (speech recognition)
            # This is simplified; real implementation would use forced alignment
            phonemes = self.mapper.text_to_phonemes(text)
            
            # Estimate timing based on audio duration and text length
            duration = librosa.get_duration(y=y, sr=sr)
            phoneme_duration = duration / len(phonemes)
            
            # Convert phonemes to visemes
            viseme_stream = []
            current_time = 0.0
            
            for phoneme in phonemes:
                viseme = self._phoneme_to_viseme(phoneme)
                
                viseme_stream.append({
                    "time": current_time,
                    "viseme": viseme,
                    "intensity": 1.0,
                    "duration": phoneme_duration
                })
                
                current_time += phoneme_duration
            
            return viseme_stream
        except Exception as e:
            logger.error(f"Viseme generation error: {e}")
            return []
    
    def _phoneme_to_viseme(self, phoneme: str) -> str:
        """Map IPA phoneme to viseme"""
        for viseme_name, phoneme_list in self.VISEMES.items():
            if phoneme in phoneme_list:
                return viseme_name
        return "NEUTRAL"  # Default

# Alternative: Use pre-trained model for phoneme extraction
class AdvancedVisemeService:
    def __init__(self):
        # Use MFA (Montreal Forced Aligner) for better timing
        self.aligner = MFAAligner()
    
    async def generate_visemes_advanced(self, audio_bytes: bytes, text: str) -> list:
        """Use forced alignment for accurate phoneme timing"""
        # Write temporary files
        audio_path = "/tmp/audio.wav"
        text_path = "/tmp/text.txt"
        
        with open(audio_path, "wb") as f:
            f.write(audio_bytes)
        with open(text_path, "w") as f:
            f.write(text)
        
        # Run alignment
        alignment = await self.aligner.align(audio_path, text_path)
        
        # Convert to visemes
        viseme_stream = []
        for phoneme_info in alignment:
            viseme = self._phoneme_to_viseme(phoneme_info['phoneme'])
            viseme_stream.append({
                "time": phoneme_info['start'],
                "viseme": viseme,
                "intensity": 1.0,
                "duration": phoneme_info['end'] - phoneme_info['start']
            })
        
        # Cleanup
        os.remove(audio_path)
        os.remove(text_path)
        
        return viseme_stream
```

- [ ] Viseme mapper implemented
- [ ] Phoneme-to-viseme conversion working
- [ ] Timing synchronization (audio <-> viseme)
- [ ] Blend shape naming convention established (matches 3D model)
- [ ] Intensity mapping (confidence levels)
- [ ] Edge cases handled (silence, unknown phonemes)
- [ ] Performance optimized (real-time generation)

#### [ ] INTEGRATED PIPELINE
```python
# app/services/pipeline_service.py
class ConversationPipeline:
    def __init__(self, stt_service, llm_service, tts_service, viseme_service):
        self.stt = stt_service
        self.llm = llm_service
        self.tts = tts_service
        self.viseme = viseme_service
    
    async def process_audio(self, audio_bytes: bytes, user_id: str, user_context: dict) -> dict:
        """
        End-to-end pipeline: audio → transcript → response → audio + visemes
        """
        start_time = time.time()
        
        # Step 1: STT
        transcript = await self.stt.transcribe(audio_bytes)
        stt_time = time.time() - start_time
        logger.info(f"STT: {stt_time:.2f}s")
        
        # Step 2: LLM
        response_text = await self.llm.generate(transcript, user_context)
        llm_time = time.time() - start_time - stt_time
        logger.info(f"LLM: {llm_time:.2f}s")
        
        # Step 3: TTS + Viseme (parallel)
        tts_start = time.time()
        audio_bytes_response = await self.tts.synthesize(response_text)
        viseme_stream = await self.viseme.generate_visemes(audio_bytes_response, response_text)
        tts_time = time.time() - tts_start
        logger.info(f"TTS: {tts_time:.2f}s")
        
        total_time = time.time() - start_time
        logger.info(f"Total pipeline: {total_time:.2f}s")
        
        return {
            "transcript": transcript,
            "response": response_text,
            "audio": audio_bytes_response,
            "visemes": viseme_stream,
            "timing": {
                "stt": stt_time,
                "llm": llm_time,
                "tts": tts_time,
                "total": total_time
            }
        }
```

- [ ] Pipeline integration tested end-to-end
- [ ] Latency measured and logged
- [ ] Error handling for each stage
- [ ] Graceful degradation (if one service fails)
- [ ] Metrics collection (Prometheus)

### WEEK 7-8: WebSocket Optimization & Testing

#### [ ] FRONTEND WEBSOCKET CLIENT
```typescript
// frontend/src/hooks/useWebSocket.ts
import { useEffect, useState, useRef } from 'react';

export function useWebSocket(userId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [visemes, setVisemes] = useState<any[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const websocket = new WebSocket(`ws://localhost:8000/ws/chat/${userId}`);

    websocket.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'response') {
        setResponse(data.text);
      } else if (data.type === 'viseme') {
        setVisemes(data.viseme_stream);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.current = websocket;

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userId]);

  const sendAudio = async (audioBlob: Blob) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const arrayBuffer = await audioBlob.arrayBuffer();
      ws.current.send(arrayBuffer);
    }
  };

  return { isConnected, sendAudio, response, visemes };
}
```

- [ ] WebSocket client implemented
- [ ] Binary frame handling (audio data)
- [ ] JSON message handling (metadata)
- [ ] Reconnection logic (exponential backoff)
- [ ] Error handling
- [ ] Type safety (TypeScript)

#### [ ] AUDIO CAPTURE
```typescript
// frontend/src/hooks/useAudioRecording.ts
export function useAudioRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 16000 * 16, // 16kHz, 16-bit
    });

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      // Send to backend
      return audioBlob;
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = (): Blob => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Collect audio
      return new Blob(audioChunksRef.current, { type: 'audio/webm' });
    }
    return new Blob();
  };

  return { isRecording, startRecording, stopRecording };
}
```

- [ ] Audio capture implemented (Web Audio API)
- [ ] Microphone permissions handled
- [ ] Audio encoding (16kHz, 16-bit mono)
- [ ] Recording UI (record button, timer)
- [ ] Feedback on recording status

#### [ ] LOAD TESTING
```bash
# Install load testing tool
pip install locust

# Create load test script
# tests/locustfile.py
from locust import HttpUser, task, between
import websocket

class EDCUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def websocket_chat(self):
        # Simulate WebSocket connection
        ws = websocket.create_connection("ws://localhost:8000/ws/chat/user123")
        
        # Send audio (mock)
        audio_data = b"mock audio data"
        ws.send_binary(audio_data)
        
        # Receive response
        response = ws.recv()
        print(response)
        
        ws.close()

# Run load test
locust -f tests/locustfile.py --host=http://localhost:8000 -u 100 -r 10 -t 5m
```

- [ ] Load testing setup (Locust or similar)
- [ ] 100+ concurrent users tested
- [ ] Latency profiled (p50, p95, p99)
- [ ] Resource usage monitored (CPU, memory, connections)
- [ ] Bottlenecks identified and documented
- [ ] Optimization recommendations made

### PHASE 2 DELIVERABLE CHECKLIST
- [ ] Full voice pipeline working end-to-end
- [ ] Latency < 2 seconds (target for MVP)
- [ ] Viseme synchronization implemented (basic)
- [ ] WebSocket connection stable under load
- [ ] Database logging conversations
- [ ] Audio quality acceptable (no artifacts)
- [ ] Error handling robust
- [ ] Performance metrics collected
- [ ] Documentation updated

---

## PHASE 3: AVATAR ANIMATION & POLISH (Month 3)

### [ ] 3D AVATAR FACIAL ANIMATION

```typescript
// frontend/src/components/Avatar.tsx
export function Avatar() {
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const avatarRef = useRef<THREE.Group | null>(null);
  const { visemes } = useWebSocket(userId);

  useEffect(() => {
    // Load model with morph targets
    const loader = new GLTFLoader();
    loader.load('models/avatar-rigged.glb', (gltf) => {
      const avatar = gltf.scene;
      avatarRef.current = avatar;
      sceneRef.current.add(avatar);

      // Extract morph targets
      const mesh = avatar.getObjectByName('Head') as THREE.Mesh;
      if (mesh && mesh.morphTargetInfluences) {
        setupMorphTargets(mesh);
      }
    });

    return () => {
      // Cleanup
    };
  }, []);

  useEffect(() => {
    // Apply visemes to morph targets
    if (!avatarRef.current) return;

    const head = avatarRef.current.getObjectByName('Head') as THREE.Mesh;
    if (!head || !head.morphTargetInfluences) return;

    // Reset all morph targets
    head.morphTargetInfluences.forEach((_, i) => {
      head.morphTargetInfluences![i] = 0;
    });

    // Apply current viseme
    visemes.forEach((visemeData) => {
      const blendIndex = visemeToBlendIndex[visemeData.viseme];
      if (blendIndex !== undefined) {
        head.morphTargetInfluences![blendIndex] = visemeData.intensity;
      }
    });
  }, [visemes]);

  return <div ref={mountRef} />;
}

const visemeToBlendIndex: Record<string, number> = {
  'A': 0,
  'E': 1,
  'I': 2,
  'O': 3,
  'U': 4,
  'F': 5,
  'M': 6,
  // ... etc
};
```

- [ ] Avatar model with blend shapes loaded
- [ ] Morph target mapping established
- [ ] Real-time viseme application working
- [ ] Smooth interpolation between visemes
- [ ] Eye blinking animation (when not speaking)
- [ ] Head movement (subtle, natural)
- [ ] Facial expressions (based on sentiment/tone)

### [ ] UI/UX REFINEMENT
- [ ] Voice input UI polished (waveform visualization)
- [ ] Transcript display
- [ ] Response text display
- [ ] Avatar positioning and framing
- [ ] Loading states
- [ ] Error messages (user-friendly)
- [ ] Settings panel (voice speed, avatar style, etc.)
- [ ] Accessibility (ARIA labels, keyboard navigation)

### [ ] INTEGRATION TESTING
- [ ] End-to-end test suite written (Playwright)
- [ ] UI tests (React Testing Library)
- [ ] API tests (Pytest)
- [ ] WebSocket connection tests
- [ ] Avatar animation tests
- [ ] Performance regression tests

### [ ] PERFORMANCE OPTIMIZATION
- [ ] Frontend bundle size optimized (tree-shaking, code splitting)
- [ ] Three.js rendering optimized (LOD, frustum culling)
- [ ] Backend response time profiled
- [ ] Database queries optimized (EXPLAIN ANALYZE)
- [ ] Caching strategy implemented (Redis, browser cache)
- [ ] Latency target < 200ms achieved

---

## PHASE 4: SECURITY & DEPLOYMENT (Month 4)

### [ ] ROW-LEVEL SECURITY (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY rls_kb_department ON knowledge_base
  FOR SELECT
  USING (department_id = (
    SELECT department_id FROM users WHERE id = current_user_id()
  ));

CREATE POLICY rls_conversations_user ON conversations
  FOR SELECT
  USING (user_id = current_user_id() OR 
         user_id IN (
           SELECT user_id FROM users 
           WHERE department_id = (
             SELECT department_id FROM users WHERE id = current_user_id()
           )
         ));

-- Add admin override
CREATE POLICY rls_admin_override ON knowledge_base
  FOR SELECT
  USING (
    (SELECT is_admin FROM users WHERE id = current_user_id()) = true
  );
```

- [ ] RLS policies written for all tables
- [ ] Department isolation enforced
- [ ] Admin override implemented
- [ ] Policies tested (SELECT bypasses correctly)
- [ ] Audit logging for RLS violations

### [ ] ENCRYPTION & SECRETS

```bash
# Generate encryption keys
openssl rand -base64 32 > /tmp/encryption_key.txt

# Use GCP Secret Manager
gcloud secrets create DATABASE_PASSWORD \
  --data-file=/tmp/db_password.txt

gcloud secrets create JWT_SECRET \
  --data-file=/tmp/jwt_secret.txt
```

- [ ] Database encryption at rest (transparent encryption)
- [ ] Connection encryption (SSL required)
- [ ] Secrets management (GCP Secret Manager)
- [ ] TLS 1.3 enforced on all connections
- [ ] Certificate management automated (cert-manager)
- [ ] Key rotation scheduled (annual)

### [ ] AUDIT LOGGING & COMPLIANCE

```python
# app/middleware/audit.py
@app.middleware("http")
async def audit_log_middleware(request: Request, call_next):
    # Get user
    user_id = request.headers.get("X-User-ID")
    
    # Log request
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    # Write to audit log
    await db.audit_logs.insert({
        "user_id": user_id,
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "duration": duration,
        "timestamp": datetime.utcnow(),
        "ip_address": request.client.host,
    })
    
    return response
```

- [ ] Audit logging implemented
- [ ] Conversation logging (with retention policy)
- [ ] Access logs (who accessed what, when)
- [ ] Compliance reports generated (monthly)
- [ ] Data retention policy enforced (1 year default)
- [ ] Right-to-deletion implemented (GDPR compliance)

### [ ] KUBERNETES DEPLOYMENT

```yaml
# kubernetes/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: edc-staging

---
# kubernetes/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: edc-backend
  namespace: edc-staging
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: edc-backend
  template:
    metadata:
      labels:
        app: edc-backend
    spec:
      containers:
      - name: backend
        image: gcr.io/anti-gravity-staging/edc-backend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: edc-secrets
              key: DATABASE_URL
        - name: REDIS_URL
          value: "redis://redis:6379"
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1024Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# kubernetes/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: edc-backend
  namespace: edc-staging
spec:
  type: ClusterIP
  ports:
  - port: 8000
    targetPort: 8000
  selector:
    app: edc-backend

---
# kubernetes/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: edc-ingress
  namespace: edc-staging
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.staging.edc.anti-gravity.io
    secretName: edc-tls
  rules:
  - host: api.staging.edc.anti-gravity.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: edc-backend
            port:
              number: 8000
```

- [ ] Kubernetes manifests created (deployment, service, ingress)
- [ ] Helm charts created (for easy templating)
- [ ] Persistent volumes configured (for database)
- [ ] ConfigMaps created (non-sensitive config)
- [ ] Secrets created (encrypted)
- [ ] ArgoCD setup (for GitOps)
- [ ] Deployment tested on staging GKE cluster

### [ ] MONITORING & ALERTING

```yaml
# monitoring/prometheus-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
      volumes:
      - name: config
        configMap:
          name: prometheus-config

---
# monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'edc-backend'
      static_configs:
      - targets: ['localhost:8000']
    - job_name: 'kubernetes'
      kubernetes_sd_configs:
      - role: pod
```

- [ ] Prometheus setup (metrics collection)
- [ ] Grafana setup (dashboards)
- [ ] Custom metrics (latency, errors, throughput)
- [ ] Alerting rules configured (SLA monitoring)
- [ ] Alert routing (Slack, PagerDuty)
- [ ] Dashboard created (uptime, latency, errors)

### [ ] SECURITY AUDIT
- [ ] OWASP Top 10 checklist completed
- [ ] Penetration testing (third-party)
- [ ] Code security scan (SonarQube, Snyk)
- [ ] Dependency audit (security vulnerabilities)
- [ ] SSL/TLS configuration audit
- [ ] Database security audit

### [ ] DOCUMENTATION FINALIZATION
- [ ] Architecture documentation (ADRs, diagrams)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Deployment guide
- [ ] Runbook (operational procedures)
- [ ] SOP (Standard Operating Procedures)
- [ ] Troubleshooting guide

---

## PHASE 4 DELIVERABLE CHECKLIST
- [ ] Production-ready Kubernetes manifests
- [ ] All security policies implemented
- [ ] Monitoring and alerting active
- [ ] Documentation complete
- [ ] Compliance audit passed
- [ ] Load testing passed (99.95% uptime target)
- [ ] Team trained on operations
- [ ] Runbook and SOP documents signed off

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment (7 days before go-live)
- [ ] Final security audit completed
- [ ] Penetration testing passed
- [ ] Load testing passed (production capacity)
- [ ] Disaster recovery tested (data restore, failover)
- [ ] All monitoring alerts configured
- [ ] Runbook reviewed and approved
- [ ] Team on-call rotation established
- [ ] Stakeholder communication plan finalized

### Deployment Day (Friday afternoon recommended)
- [ ] All systems in green (health checks passing)
- [ ] Database backups running
- [ ] Team on standby (all timezone-aware)
- [ ] Deployment initiated
- [ ] Health checks post-deployment
- [ ] Smoke tests (basic functionality)
- [ ] User acceptance testing (UAT) by stakeholder
- [ ] Production incident war room active
- [ ] Success criteria met? → Go/No-Go decision

### Post-Deployment (First week)
- [ ] Daily standups (incident response)
- [ ] Performance monitoring (latency, errors)
- [ ] User feedback collection
- [ ] Bug fixes prioritized
- [ ] Optimization iterations
- [ ] Documentation updates
- [ ] Team retrospective (lessons learned)

---

## TOOLS & SERVICES TO PROCURE

| Category | Tool | Cost | Notes |
|----------|------|------|-------|
| **VCS** | GitHub Enterprise | $231/mo | Or use Google Cloud Source |
| **CI/CD** | Cloud Build | Pay-per-build | Or GitHub Actions free tier |
| **Cloud** | GCP (Compute + Storage) | $6-7K/mo | See infrastructure costs |
| **LLM Inference** | Ollama (open-source) | Free | Self-hosted |
| **TTS** | Coqui TTS (open-source) | Free | Self-hosted |
| **STT** | OpenAI Whisper API | $0.02/min | Or Coqui Whisper (free) |
| **Monitoring** | Prometheus + Grafana | Free | Self-hosted |
| **Logging** | Google Cloud Logging | $0.50/GB | Or ELK Stack (free) |
| **Secret Mgmt** | GCP Secret Manager | $0.06/secret/mo | Or HashiCorp Vault |
| **Communication** | Slack | $8/user/mo | Standard plan |
| **Project Mgmt** | Linear / Jira Cloud | $100-200/mo | Team collaboration |
| **3D Assets** | Sketchfab/Turbosquid | $10-50 | Avatar model licensing |

**TOTAL FIRST-YEAR COST:** ~$150K-200K (development + infrastructure + tools)

---

## SUCCESS CRITERIA

✅ **Technical Success:**
- Latency < 200ms (p95)
- 99.95% uptime
- 10,000+ concurrent users supported
- Zero data breaches
- 95%+ STT accuracy

✅ **Business Success:**
- 80%+ employee adoption (3 months)
- 50% reduction in HR support tickets
- 4.5+ stars user rating
- $500K+ cost savings (estimated)

✅ **Team Success:**
- Zero critical production incidents
- 80%+ code coverage
- Well-documented architecture
- Team confidence in system

---

## COMMUNICATION TEMPLATES

### Weekly Status Report
```
Week X Status Summary
====================
✅ Completed:
- Item 1
- Item 2

🔄 In Progress:
- Item 1 (70%)
- Item 2 (40%)

🚧 Blockers:
- Issue 1 (Impact: Medium)

📊 Metrics:
- Velocity: X story points
- Bugs closed: X
- Code coverage: X%

Next Week:
- Priority 1
- Priority 2
```

### Escalation Template
```
ESCALATION NOTICE

Issue: [Title]
Severity: [Critical/High/Medium]
Impact: [Business impact description]
Timeline: [When it must be resolved]

What we've tried: [Description]
What we need: [Help needed]
Owner: [Person responsible]
Stakeholder: [Who to notify]
```

---

## APPENDIX: GLOSSARY

- **EDC:** Enterprise Digital Concierge
- **STT:** Speech-to-Text
- **TTS:** Text-to-Speech
- **LLM:** Large Language Model
- **RLS:** Row-Level Security
- **RTO:** Recovery Time Objective
- **RPO:** Recovery Point Objective
- **SLA:** Service Level Agreement
- **MVP:** Minimum Viable Product
- **DoD:** Definition of Done
- **ADR:** Architecture Decision Record
- **IAM:** Identity & Access Management
- **JWT:** JSON Web Token
- **OAuth2:** Open Authorization 2.0
- **WebSocket:** Full-duplex communication protocol
- **K8s:** Kubernetes
- **GKE:** Google Kubernetes Engine
- **IaC:** Infrastructure as Code
- **GitOps:** Git-driven deployment
- **GDPR:** General Data Protection Regulation
- **SOC2:** Service Organization Control 2

---

**Document Version:** 1.0  
**Last Updated:** April 2024  
**Maintainer:** Technical Lead  
**Next Review:** Monthly
