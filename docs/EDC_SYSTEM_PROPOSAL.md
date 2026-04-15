# ENTERPRISE DIGITAL CONCIERGE (EDC) SYSTEM
## Proposal Teknis untuk Google Anti-Gravity

---

## EXECUTIVE SUMMARY

**Nama Solusi:** Enterprise Digital Concierge System (EDC)  
**Tujuan:** Membangun virtual assistant dengan avatar 3D real-time yang dapat berinteraksi dengan karyawan perusahaan via voice dengan latency rendah dan akurasi tinggi.

**Unique Value Propositions:**
- ✅ Avatar 3D dengan lip-sync real-time (< 200ms latency)
- ✅ Voice input/output dengan AI understanding natural
- ✅ Row-Level Security untuk multi-departemen enterprise
- ✅ Deployment via Docker (cloud-agnostic)
- ✅ Low-code integration dengan internal systems perusahaan

---

## 1. PROBLEM STATEMENT & SOLUTION

### Current Challenges
```
❌ HR chatbot textual → kurang engaging
❌ Phone support terbatas (jam kerja)
❌ Employee onboarding manual → mahal
❌ Internal knowledge base tidak accessible
❌ Multi-language support rumit
```

### EDC System Solution
```
✅ Avatar dengan personality → engaging & memorable
✅ 24/7 voice assistant → availability tinggi
✅ AI-powered self-service → reduce workload HR
✅ Unified knowledge base → instant access
✅ Multi-language out-of-the-box → global ready
```

---

## 2. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (React 18+)                  │
│  ┌─────────────────┐      ┌──────────────────┐                  │
│  │ Three.js Avatar │      │  Speech UI       │                  │
│  │ (WebGL)         │◄────►│  (Mic + Speakers)│                  │
│  └─────────────────┘      └──────────────────┘                  │
│         │                         │                              │
│         └──────────┬──────────────┘                              │
│                    │                                             │
│            WebSocket Connection                                  │
│          (Binary + JSON frames)                                  │
└────────────────────┼──────────────────────────────────────────┘
                     │
┌────────────────────┼──────────────────────────────────────────┐
│            GATEWAY LAYER (Nginx/Kong)                          │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ - Load Balancer                                      │     │
│  │ - TLS/SSL Termination                               │     │
│  │ - Rate Limiting (DDoS protection)                   │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────┼──────────────────────────────────────────┘
                     │
┌────────────────────┼──────────────────────────────────────────┐
│            BACKEND API LAYER (FastAPI + Python 3.11)           │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ WebSocket Manager│  │  Auth Service    │                   │
│  │  (aiohttp)       │  │  (JWT + OAuth2)  │                   │
│  └──────────────────┘  └──────────────────┘                   │
│         │                        │                             │
│  ┌──────▼──────────┐  ┌──────────▼───────┐                    │
│  │ STT Pipeline    │  │ NLP Processor    │                    │
│  │ (Whisper API)   │  │ (Gemma 3 via     │                    │
│  │                 │  │  Ollama)         │                    │
│  └──────┬──────────┘  └──────────┬───────┘                    │
│         │                        │                             │
│  ┌──────▼──────────┐  ┌──────────▼───────┐                    │
│  │ TTS Pipeline    │  │ Viseme Generator │                    │
│  │ (Coqui TTS)     │  │ (Blend Shapes    │                    │
│  │                 │  │  Mapping)        │                    │
│  └──────┬──────────┘  └──────────┬───────┘                    │
│         └─────────────┬──────────┘                             │
│                       │                                        │
│  ┌────────────────────▼─────────────────────┐                 │
│  │    Context & Memory Manager              │                 │
│  │  (Redis for session data)                │                 │
│  └────────────────────┬─────────────────────┘                 │
└────────────────────────┼──────────────────────────────────────┘
                         │
┌────────────────────────┼──────────────────────────────────────┐
│            DATA LAYER (PostgreSQL + Supabase)                 │
│                                                                │
│  ┌──────────────────────────────────────────────────┐        │
│  │ Row-Level Security (RLS) Policies               │        │
│  │  - Department isolation                         │        │
│  │  - User role-based access                       │        │
│  │  - Audit logging                                │        │
│  └──────────────────────────────────────────────────┘        │
│                                                                │
│  ┌──────────────────────────────────────────────────┐        │
│  │ Tables:                                          │        │
│  │  • users (auth + profile)                        │        │
│  │  • conversations (audit trail)                   │        │
│  │  • knowledge_base (internal docs)                │        │
│  │  • department_roles (RLS enforcement)            │        │
│  │  • avatar_preferences (personalization)          │        │
│  └──────────────────────────────────────────────────┘        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│            EXTERNAL INTEGRATIONS (via REST/gRPC)               │
│                                                                 │
│  ├─ OpenAI Whisper (STT)                                       │
│  ├─ ElevenLabs API (Premium TTS) / Coqui TTS (Open-source)    │
│  ├─ Gemma 3:4b via Ollama (Local LLM)                         │
│  ├─ Google Workspace API (Calendar, Contacts)                 │
│  └─ Slack API (Quick notifications)                           │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│            DEPLOYMENT & INFRASTRUCTURE (Docker + K8s)          │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐   │
│  │ Frontend        │  │ Backend         │  │ Ollama       │   │
│  │ Container       │  │ Container       │  │ Container    │   │
│  │ (Node.js)       │  │ (Python 3.11)   │  │ (GPU)        │   │
│  └─────────────────┘  └─────────────────┘  └──────────────┘   │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐   │
│  │ PostgreSQL      │  │ Redis           │  │ Nginx        │   │
│  │ Container       │  │ Container       │  │ Container    │   │
│  └─────────────────┘  └─────────────────┘  └──────────────┘   │
│                                                                 │
│  Orchestrated by: Kubernetes (GKE atau self-managed)          │
│  Storage: GCP Cloud Storage / NAS                             │
│  Monitoring: Prometheus + Grafana + CloudTracing              │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. TECH STACK DETAIL

### Frontend (Client)
```yaml
Framework:
  - React 18.2.x (TypeScript)
  - Next.js 14.x (untuk SSR + API routes)

3D Graphics:
  - Three.js r160+ (3D model rendering)
  - react-three-fiber (React binding untuk Three.js)
  - drei (3D helpers & presets)

Audio I/O:
  - Web Audio API (browser native)
  - react-use-gesture (untuk avatar interaction)
  - Tone.js (untuk sound feedback)

State Management:
  - Zustand (lightweight, tidak overkill)
  - TanStack Query (v5+) untuk server sync

UI Components:
  - Shadcn/ui (unstyled, customizable)
  - Framer Motion (animations)
  - Tailwind CSS (styling)

WebSocket Client:
  - socket.io-client (fallback, reliability)
  - atau native WebSocket API

Dev Tools:
  - Vite (build tool, fast)
  - Vitest + React Testing Library
  - Storybook 7.x (component development)

Deployment:
  - Docker multistage build
  - Nginx reverse proxy
  - GCP Cloud Run / Cloud Compute Engine
```

### Backend (API Server)
```yaml
Framework:
  - FastAPI 0.104.x (Python async web framework)
  - Python 3.11+ (async/await native)

WebSocket:
  - FastAPI native WebSocket support
  - python-socketio (untuk lebih advanced)

AI/ML Pipelines:
  - Whisper-cpp (OpenAI Whisper, low-latency STT)
  - Ollama SDK (local Gemma 3:4b inference)
  - pydub + librosa (audio processing)

TTS (Text-to-Speech):
  - Coqui TTS (open-source, self-hosted)
  - atau ElevenLabs API (cloud-based, premium quality)

Viseme Generation:
  - Custom phoneme-to-viseme mapper
  - librosa (audio feature extraction)

Database:
  - SQLAlchemy 2.0+ (ORM)
  - Alembic (migrations)
  - psycopg2-binary (PostgreSQL driver)

Caching & Sessions:
  - redis-py (untuk session management)
  - aioredis (async Redis client)

Security:
  - python-jose (JWT)
  - passlib (password hashing)
  - python-multipart (form parsing)

Monitoring:
  - OpenTelemetry SDK
  - Prometheus client (metrics)
  - structlog (structured logging)

Async Task Queue:
  - Celery + Redis (untuk async jobs)
  - atau asyncio.Task (untuk simple cases)

API Documentation:
  - Pydantic 2.0+ (auto validation)
  - FastAPI auto-generated Swagger/OpenAPI

Deployment:
  - Gunicorn + uvicorn (ASGI workers)
  - Docker container
  - K8s deployment manifests
```

### Database (PostgreSQL + Supabase)
```yaml
PostgreSQL 15.x
- Native JSON support
- Full-text search
- Row-Level Security (RLS)

Supabase (Optional managed layer):
- Pre-configured RLS
- Real-time subscriptions
- Vector search (pgvector)
- Auth abstraction

Schema:
  Tables:
    - public.users (auth)
    - public.departments (organization)
    - public.roles (RBAC)
    - public.conversations (audit trail)
    - public.knowledge_base (internal docs)
    - public.avatar_preferences (personalization)
    - public.audit_logs (compliance)
    - public.viseme_cache (performance optimization)

RLS Policies:
  - Department-level isolation
  - Role-based access control
  - User-owned data separation
  - Admin override capabilities

Indexes:
  - B-tree on foreign keys
  - Full-text search on knowledge base
  - Composite indexes pada queries frecuentes
```

### Infrastructure (Docker + Kubernetes)
```yaml
Containerization:
  - Docker 24.x (container engine)
  - Docker Compose (local dev)
  - Multi-stage builds (optimized images)

Orchestration:
  - Kubernetes 1.27+ (GKE recommended)
  - Helm 3.x (package management)
  - ArgoCD (GitOps deployment)

Services:
  - Nginx Ingress (API gateway)
  - Cert-manager (TLS automation)
  - Sealed Secrets (encrypted K8s secrets)

Compute:
  - GCP Compute Engine (N1-standard)
  - GCP Cloud GPU (untuk Ollama inference)
  - atau self-managed K8s cluster

Storage:
  - GCP Cloud Storage (object storage)
  - Google Cloud SQL (managed PostgreSQL)
  - Google Cloud Memorystore (managed Redis)
  - Persistent Volumes (K8s)

Networking:
  - Google Cloud VPC (network isolation)
  - Cloud Load Balancer (traffic distribution)
  - Cloud CDN (static asset caching)

Monitoring & Logging:
  - Google Cloud Monitoring (metrics)
  - Google Cloud Logging (centralized logs)
  - Prometheus + Grafana (custom dashboards)
  - Jaeger (distributed tracing)

CI/CD:
  - GitHub Actions (build automation)
  - Cloud Build (GCP native)
  - DockerHub Registry (image storage)
  - Automatic rollback on failure
```

---

## 4. MVP SCOPE (3-4 Bulan)

### Phase 1: Foundation (Bulan 1)
**Deliverables:**
- ✅ Backend API skeleton (FastAPI + PostgreSQL)
- ✅ Basic authentication (JWT + OAuth2)
- ✅ WebSocket connection handler
- ✅ Basic avatar 3D model (static, tidak animated)
- ✅ Frontend setup (React + Three.js)
- ✅ Docker compose untuk local dev

**Team:** 1 Full-stack + 1 Backend + 1 Frontend

### Phase 2: Core Voice Pipeline (Bulan 2)
**Deliverables:**
- ✅ STT integration (Whisper API)
- ✅ LLM integration (Ollama + Gemma 3:4b)
- ✅ TTS integration (Coqui TTS)
- ✅ Basic viseme mapping (synchronization)
- ✅ Session persistence (Redis)
- ✅ Unit tests (backend 80% coverage)

**Team:** 1 ML Engineer + 2 Backend

### Phase 3: Avatar Animation & Polish (Bulan 3)
**Deliverables:**
- ✅ Avatar facial animation (lip-sync + blinking)
- ✅ Real-time WebSocket optimization
- ✅ UI/UX refinement
- ✅ Integration test suite
- ✅ Performance optimization (< 200ms latency)
- ✅ Load testing (concurrent users)

**Team:** 1 Frontend (3D/Animation) + 1 QA

### Phase 4: Security & Deployment (Bulan 4)
**Deliverables:**
- ✅ Row-Level Security (RLS) policies
- ✅ End-to-end encryption
- ✅ Compliance audit (SOC2, GDPR readiness)
- ✅ Kubernetes deployment manifests
- ✅ Production database setup
- ✅ Monitoring & alerting setup

**Team:** 1 DevOps + 1 Security Engineer

---

## 5. DETAILED FEATURE BREAKDOWN

### Feature 1: Voice Input/Output Pipeline
```
User speaks → Browser captures audio via Web Audio API
    ↓
Audio buffered (16kHz, 16-bit mono)
    ↓
WebSocket binary frame → Backend
    ↓
Whisper STT → Text transcription
    ↓
Context retrieval from Redis (session history)
    ↓
Prompt engineering (with department context)
    ↓
Ollama Gemma 3:4b → LLM response
    ↓
Coqui TTS → Audio synthesis + phoneme stream
    ↓
Phoneme-to-Viseme mapper → Blend shape data
    ↓
WebSocket binary frame ← Backend
    ↓
Audio playback + Avatar animation synchronized
```

**Latency Target:** < 200ms end-to-end

**Code Example (Backend):**
```python
@app.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(websocket, user_id):
    await websocket.accept()
    
    while True:
        # Receive audio chunk
        data = await websocket.receive_bytes()
        
        # STT
        transcript = await transcribe_audio(data)
        
        # Get context (RLS enforced)
        context = await get_user_context(user_id)
        
        # LLM inference
        response = await llm_inference(transcript, context)
        
        # TTS + Viseme
        audio_stream, viseme_data = await tts_with_visemes(response)
        
        # Send back
        await websocket.send_json({
            "type": "response",
            "text": response,
            "viseme_stream": viseme_data
        })
        await websocket.send_bytes(audio_stream)
```

### Feature 2: Avatar 3D Rendering + Lip-Sync
```
Three.js loads Avatar model (GLTF format)
    ↓
Skeleton rig + Blend shapes untuk facial animation
    ↓
Viseme data masuk dari WebSocket
    ↓
Each viseme mapped ke blend shape weights
    ↓
Animation loop (60fps) interpolates between visemes
    ↓
Audio plays synchronously (Web Audio API)
    ↓
Result: Natural-looking talking avatar
```

**Viseme Types (13 standard):**
- A, E, I, O, U (vowels)
- F, V, M, P, B
- L, R, D, T, N
- S, Z, SH, CH
- (+ neutral/silence)

**Code Example (Frontend):**
```javascript
// Load avatar model
const gltf = await loader.loadAsync('avatar.glb');
const avatar = gltf.scene;

// Extract blend shapes
const morphTargets = avatar.getObjectByName('Head').morphTargetInfluences;

// Animate based on viseme stream
function applyViseme(visemeData) {
  morphTargets.forEach((_, index) => {
    morphTargets[index] = 0;
  });
  
  // Map viseme to blend shape
  const blendIndex = visemeMap[visemeData.phoneme];
  morphTargets[blendIndex] = visemeData.intensity;
}

// Listen to WebSocket viseme stream
socket.on('viseme', applyViseme);
```

### Feature 3: Row-Level Security (RLS)
```
Department A memiliki internal docs
Department B memiliki internal docs
Department C memiliki internal docs

When user dari Dept A membuka EDC:
  - Knowledge base query auto-filtered ke Dept A only
  - Conversation history hanya Dept A
  - Reports hanya menunjukkan Dept A data

RLS Policy di PostgreSQL:
  CREATE POLICY rls_department_isolation
    ON knowledge_base
    FOR SELECT
    USING (department_id = (
      SELECT department_id 
      FROM users 
      WHERE id = current_user_id()
    ));
```

### Feature 4: Knowledge Base Integration
```
HR uploads PDF/docs → Backend extract text
    ↓
Text embedded via sentence-transformers
    ↓
Stored di pgvector table
    ↓
User asks question → Query embedded
    ↓
Vector similarity search → Top-5 relevant docs
    ↓
Context injected ke LLM prompt
    ↓
LLM generates answer with source attribution
```

---

## 6. SECURITY ARCHITECTURE

### Authentication & Authorization
```yaml
OAuth2 + JWT:
  - Google Workspace SSO integration
  - Multi-factor authentication (optional but recommended)
  - Token refresh mechanism (15 min access, 7 day refresh)

Row-Level Security:
  - PostgreSQL RLS policies
  - Department isolation enforced at DB level
  - Admin can audit/override if needed

Encryption:
  - TLS 1.3 untuk all connections
  - Data at rest: AES-256 (PostgreSQL transparent encryption)
  - Data in transit: WSS (WebSocket Secure)

Audit Logging:
  - All conversations logged (immutable)
  - Access logs (who accessed what, when)
  - Compliance-ready format
  - Retention: 1 year minimum

Rate Limiting:
  - Per-user: 100 requests/minute
  - Per-IP: 1000 requests/minute
  - DDoS protection via Cloud Armor (GCP)
```

### Data Privacy Compliance
```yaml
GDPR:
  - Right to deletion: Auto-purge data after N days
  - Data portability: Export conversation as JSON
  - Consent management: Opt-in for analytics

CCPA:
  - User can request data deletion
  - Transparent data handling policy
  - No third-party data sharing

Indonesia (GDPR-like):
  - Personal data stored in Indonesia region (GCP Jakarta)
  - Local data residency compliance
  - Regular security audits

Company-specific:
  - NDA clause enforced (no data leakage to competitors)
  - IP protection (generated content belongs to company)
```

---

## 7. DEPLOYMENT ARCHITECTURE

### Development Environment
```bash
# Local setup
docker-compose up

# Services:
# - frontend: http://localhost:3000
# - backend: http://localhost:8000
# - postgres: localhost:5432
# - redis: localhost:6379
# - ollama: localhost:11434
```

### Staging Environment
```
GCP Project: anti-gravity-staging

Compute:
  - GKE cluster (3 nodes, n1-standard-2)
  - 1 GPU node (NVIDIA T4) untuk Ollama

Network:
  - Cloud VPC (staging-vpc)
  - Cloud Load Balancer
  - Cloud CDN untuk static assets

Database:
  - Cloud SQL (PostgreSQL 15)
  - Cloud Memorystore (Redis)

Storage:
  - Cloud Storage bucket (staging-data)

SSL/TLS:
  - Cloud Certificate (auto-renewed)

Monitoring:
  - Cloud Monitoring (dashboards)
  - Cloud Logging (log aggregation)
  - Error Reporting (real-time alerts)

Deployment:
  - Git push → Cloud Build → GKE
  - Auto-scaling: 2-5 replicas (based on CPU)
```

### Production Environment
```
GCP Project: anti-gravity-production

Compute:
  - GKE cluster (5 nodes, n1-standard-4)
  - 2 GPU nodes (NVIDIA A100) untuk Ollama
  - Dedicated Ingress with Cloud Armor

Network:
  - Cloud VPC (multi-region capable)
  - Global HTTP(S) Load Balancer
  - Cloud Armor (DDoS + WAF)
  - Cloud CDN (aggressive caching)

Database:
  - Cloud SQL HA (multi-region failover)
  - Cloud Memorystore HA (Redis)
  - Automated backups (daily, 30-day retention)

Storage:
  - Cloud Storage (multi-region)
  - Archive to Cloud Storage (60+ days)

Security:
  - Cloud KMS (encryption key management)
  - Secret Manager (API keys, passwords)
  - Identity & Access Management (IAM)
  - VPC Service Controls (network perimeter)

Monitoring:
  - Cloud Monitoring (24/7 uptime checks)
  - Cloud Logging (real-time alerts)
  - Custom alerts on SLA breaches
  - Incident management integration

Compliance:
  - Data residency: Jakarta region
  - Regular security audits
  - Penetration testing quarterly
  - SOC2 Type II certification

High Availability:
  - RPO: 1 hour (Recovery Point Objective)
  - RTO: 15 minutes (Recovery Time Objective)
  - 99.95% SLA target
```

---

## 8. PERFORMANCE & SCALABILITY

### Latency Budget
```
User speaks → 2000ms total latency target

Breakdown:
├─ Audio capture & transmission: 100ms
├─ STT (Whisper): 500ms
├─ LLM inference (Gemma 3:4b): 800ms
├─ TTS synthesis: 300ms
├─ Viseme generation: 100ms
├─ Network + rendering: 200ms
└─ Total: ~2000ms (acceptable for voice assistant)

Optimization techniques:
├─ Streaming TTS (don't wait for full audio)
├─ Parallel processing (viseme while TTS)
├─ Model quantization (4-bit Gemma 3)
├─ Hardware acceleration (GPU for inference)
└─ Response caching (Redis for common queries)
```

### Scalability Targets
```
Concurrent Users: 10,000+ simultaneously

Database:
  - PostgreSQL read replicas (3 replicas)
  - Connection pooling (PgBouncer, 100 conn/user)
  - Sharding strategy for 1M+ users

Cache:
  - Redis Cluster mode (6 nodes)
  - Session TTL: 24 hours
  - Cache invalidation: event-based

Inference:
  - Ollama on dedicated GPU cluster
  - Request queuing (max 100 in-flight)
  - Auto-scaling: +1 GPU node per 50 concurrent users

API:
  - Horizontal scaling (K8s auto-scale 2-20 replicas)
  - CDN caching (static assets, 24h TTL)
  - Rate limiting (per-user quota)
```

---

## 9. IMPLEMENTATION TIMELINE & MILESTONES

```
Month 1: Foundation
├─ Week 1-2: Project setup, architecture refinement
├─ Week 2-3: Backend skeleton, DB schema, auth
├─ Week 3-4: Frontend setup, 3D avatar loader
└─ Milestone: Running on localhost, basic UI

Month 2: Voice Pipeline
├─ Week 5-6: STT + LLM integration
├─ Week 6-7: TTS + viseme mapping
├─ Week 7-8: WebSocket optimization
└─ Milestone: End-to-end voice chat working (2-3sec latency)

Month 3: Polish & Optimize
├─ Week 9: Latency optimization (< 200ms target)
├─ Week 9-10: UI/UX refinement
├─ Week 10-11: Testing (unit, integration, load)
└─ Milestone: Production-ready MVP

Month 4: Security & Deploy
├─ Week 12-13: RLS policies, security audit
├─ Week 13-14: Staging deployment, end-to-end testing
├─ Week 15: Production deployment, monitoring setup
└─ Milestone: Live on GCP with 99.95% uptime target
```

---

## 10. RESOURCE REQUIREMENTS

### Team Structure
```
Total: 7 people (full-time, 4 months)

├─ Project Manager (1)
│  └─ Timeline, stakeholder management
│
├─ Backend Engineers (2)
│  ├─ FastAPI, WebSocket, LLM integration
│  └─ Database, caching, optimization
│
├─ Frontend Engineers (2)
│  ├─ React, Three.js, avatar animation
│  └─ WebSocket client, UI/UX
│
├─ ML/AI Engineer (1)
│  └─ STT, TTS, viseme generation, prompt engineering
│
├─ DevOps Engineer (1)
│  └─ Docker, K8s, GCP infrastructure, CI/CD
│
└─ QA Engineer (1)
   └─ Testing, performance benchmarking, security
```

### Infrastructure Costs (GCP, production)
```
Compute:
  - GKE cluster: $2,000/month
  - GPU nodes (A100): $1,500/month
  = $3,500/month

Database:
  - Cloud SQL HA: $1,200/month
  - Cloud Memorystore: $300/month
  = $1,500/month

Storage & Networking:
  - Cloud Storage: $100/month
  - Load Balancer: $400/month
  - Data transfer: $200/month
  = $700/month

Monitoring:
  - Cloud Monitoring: $100/month
  - Cloud Logging: $50/month
  = $150/month

Third-party APIs:
  - OpenAI Whisper: $0.02 per minute (optional, using local model)
  - ElevenLabs: $0.30 per 1K chars (optional, using Coqui)
  = $200-500/month (depends on usage)

TOTAL: ~$6,000-7,000/month production
TOTAL: ~$2,000-3,000/month staging + dev
```

---

## 11. SUCCESS METRICS (KPIs)

```
Technical KPIs:
├─ Latency: < 200ms (avg response time)
├─ Uptime: 99.95% (SLA)
├─ Throughput: 10,000 concurrent users
├─ Accuracy: 95%+ STT accuracy, 90%+ LLM relevance

Business KPIs:
├─ User adoption: 80%+ of employees within 3 months
├─ Engagement: 5+ interactions per user per week
├─ Time-to-value: 50% reduction in HR support tickets
├─ Satisfaction: 4.5/5 stars average rating

Security KPIs:
├─ Zero data breaches
├─ Zero unauthorized access incidents
├─ 100% audit log coverage
├─ SOC2 Type II certification within 6 months
```

---

## 12. RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| LLM hallucination | Medium | High | Prompt engineering, grounding with knowledge base |
| Voice quality issues | Medium | Medium | User can select TTS engine, audio quality settings |
| Lip-sync out of sync | Medium | Medium | Stream-based viseme generation, latency optimization |
| Scaling problems | Low | High | Load testing early, K8s auto-scaling from day 1 |
| Security breach | Low | Critical | Regular audits, penetration testing, SOC2 compliance |
| Staff shortage | Medium | High | Well-documented code, modular architecture |

---

## 13. NEXT STEPS FOR GOOGLE ANTI-GRAVITY

1. **Week 1:** Kickoff meeting + technical architecture review
2. **Week 2:** GCP infrastructure provisioning (staging)
3. **Week 3:** Development environment setup
4. **Week 4:** Sprint 1 begins (Foundation phase)

**Questions to clarify:**
- ✅ Timeline: 3 months, 6 months, atau 12 months?
- ✅ Budget: Fixed-price, T&M, atau performance-based?
- ✅ Integration: Existing HR system, payroll, atau greenfield?
- ✅ Avatar: Custom 3D model atau use stock avatar?
- ✅ Knowledge base: Already have documented, atau start from scratch?
- ✅ LLM: Use Gemma 3:4b, atau fine-tune dengan company data?

---

## APPENDIX A: SAMPLE CODE STRUCTURE

```
edc-system/
├── frontend/
│  ├── src/
│  │  ├── components/
│  │  │  ├── Avatar.tsx (Three.js wrapper)
│  │  │  ├── VoiceInput.tsx (microphone capture)
│  │  │  ├── TextDisplay.tsx (chat history)
│  │  │  └── Settings.tsx (personalization)
│  │  ├── hooks/
│  │  │  ├── useWebSocket.ts
│  │  │  ├── useVoiceRecognition.ts
│  │  │  └── useAvatarAnimation.ts
│  │  ├── utils/
│  │  │  ├── visemeMapper.ts
│  │  │  ├── audioProcessor.ts
│  │  │  └── constants.ts
│  │  └── pages/
│  │     ├── index.tsx (main)
│  │     ├── settings.tsx
│  │     └── help.tsx
│  ├── Dockerfile
│  ├── package.json
│  └── next.config.js
│
├── backend/
│  ├── app/
│  │  ├── api/
│  │  │  ├── chat.py (WebSocket endpoint)
│  │  │  ├── auth.py (authentication)
│  │  │  ├── knowledge.py (knowledge base)
│  │  │  └── health.py (health checks)
│  │  ├── services/
│  │  │  ├── stt_service.py (Whisper)
│  │  │  ├── llm_service.py (Ollama)
│  │  │  ├── tts_service.py (Coqui)
│  │  │  ├── viseme_service.py (phoneme mapping)
│  │  │  └── database_service.py (PostgreSQL)
│  │  ├── models/
│  │  │  ├── schemas.py (Pydantic)
│  │  │  ├── orm.py (SQLAlchemy)
│  │  │  └── constants.py
│  │  ├── middleware/
│  │  │  ├── auth.py
│  │  │  ├── logging.py
│  │  │  └── cors.py
│  │  └── main.py (FastAPI app)
│  ├── tests/
│  │  ├── test_api.py
│  │  ├── test_services.py
│  │  └── test_integration.py
│  ├── alembic/ (database migrations)
│  ├── Dockerfile
│  ├── requirements.txt
│  └── docker-compose.yml
│
├── database/
│  ├── init.sql (initial schema)
│  ├── migrations/
│  │  ├── 001_users.sql
│  │  ├── 002_conversations.sql
│  │  ├── 003_knowledge_base.sql
│  │  └── 004_rls_policies.sql
│  └── seeds/ (sample data)
│
├── kubernetes/
│  ├── namespace.yaml
│  ├── frontend-deployment.yaml
│  ├── backend-deployment.yaml
│  ├── postgres-statefulset.yaml
│  ├── redis-deployment.yaml
│  ├── ingress.yaml
│  ├── configmap.yaml
│  ├── secrets.yaml (encrypted)
│  └── helm-values.yaml
│
├── docker-compose.yml (local dev)
├── README.md
├── ARCHITECTURE.md
├── DEPLOYMENT.md
└── CONTRIBUTING.md
```

---

**Document Version:** 1.0  
**Last Updated:** April 2024  
**Owner:** Technical Lead  
**Classification:** Internal Use
