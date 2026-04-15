# EDC System - Quick Start Guide

## Prerequisites

- Docker Desktop (24.x+)
- Docker Compose (2.20+)
- Git
- 8GB RAM minimum (for Ollama)
- 20GB disk space (for models)

## Option 1: Docker Compose (Recommended - 5 minutes)

### 1. Clone and Setup

```bash
# Clone repository
git clone <repo-url> edc-system
cd edc-system

# Copy environment template
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Create required directories
mkdir -p database/migrations
mkdir -p logs
```

### 2. Start Services

```bash
# Start all services (first time takes ~2-3 min)
docker-compose up -d

# Watch logs
docker-compose logs -f

# Wait for all services to be healthy (check the output)
```

### 3. Initialize Ollama Model

```bash
# Download Gemma 3 model (first time ~2GB download)
docker exec edc-ollama ollama pull gemma:7b-instruct

# Verify model is loaded
curl http://localhost:11434/api/tags
```

### 4. Verify Services

```bash
# Frontend
open http://localhost:3000

# Backend API
open http://localhost:8000/docs

# Database UI
open http://localhost:8080
# Login: Server=postgres, User=edc_user, Password=edc_dev_password

# Redis UI
open http://localhost:8081
```

### 5. Test Voice Pipeline (Backend)

```bash
# SSH into backend container
docker exec -it edc-backend bash

# Run test script
python tests/test_pipeline.py

# Should see: STT → LLM → TTS working end-to-end
```

---

## Option 2: Local Development (Without Docker)

### Backend Setup

```bash
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Update .env with local database credentials
# DATABASE_URL=postgresql://postgres:password@localhost:5432/edc_dev
# REDIS_URL=redis://localhost:6379
# OLLAMA_URL=http://localhost:11434

# Run migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Frontend will be at http://localhost:5173
```

### Services (Separate Terminals)

```bash
# Terminal 1: PostgreSQL
docker run -d \
  --name edc-postgres \
  -e POSTGRES_DB=edc_dev \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15-alpine

# Terminal 2: Redis
docker run -d \
  --name edc-redis \
  -p 6379:6379 \
  redis:7-alpine

# Terminal 3: Ollama
docker run -d \
  --name edc-ollama \
  -p 11434:11434 \
  ollama/ollama

# Download model
docker exec edc-ollama ollama pull gemma:7b-instruct
```

---

## Testing Voice Pipeline

### 1. Test STT (Speech-to-Text)

```bash
# Record a test audio file
ffmpeg -f avfoundation -i ":0" -t 3 test_audio.wav  # macOS
ffmpeg -f dshow -i audio="Microphone" -t 3 test_audio.wav  # Windows

# Test transcription
curl -X POST http://localhost:8000/api/test/transcribe \
  -F "file=@test_audio.wav"

# Expected output:
# {"transcript": "What is my vacation balance"}
```

### 2. Test LLM (Language Model)

```bash
curl -X POST http://localhost:8000/api/test/llm \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is my vacation balance?",
    "context": {
      "name": "John Doe",
      "department": "Engineering"
    }
  }'

# Expected output:
# {"response": "I can help you with that. Let me check your account..."}
```

### 3. Test TTS (Text-to-Speech)

```bash
curl -X POST http://localhost:8000/api/test/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "You have 15 days of vacation remaining"
  }' \
  --output response_audio.wav

# Play the audio
ffplay response_audio.wav
```

### 4. Test Full Pipeline (WebSocket)

```bash
# Use WebSocket testing tool (wscat)
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:8000/ws/chat/user123

# Send binary audio data (or use Burp Suite)
# The server will respond with:
# {"type": "transcript", "text": "..."}
# {"type": "response", "text": "..."}
# Binary audio data
```

---

## Common Tasks

### View Database Schema

```bash
# Connect to PostgreSQL
psql postgresql://edc_user:edc_dev_password@localhost:5432/edc_dev

# List tables
\dt

# View users table
\d users

# Exit
\q
```

### View Redis Cache

```bash
# Connect to Redis CLI
redis-cli

# List all keys
KEYS *

# Get user session
GET session:user123

# Delete key
DEL session:user123

# Exit
EXIT
```

### Monitor Ollama Inference

```bash
# View loaded models
curl http://localhost:11434/api/tags

# Unload model (to save memory)
curl -X DELETE http://localhost:11434/api/models/gemma:7b-instruct

# Generate test
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemma:7b-instruct",
    "prompt": "Hello, what is your name?",
    "stream": false
  }'
```

### View Backend Logs

```bash
# Full logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Filtered logs
docker-compose logs -f backend | grep "ERROR"
```

### Run Tests

```bash
cd backend

# All tests
pytest

# With coverage
pytest --cov=app tests/

# Specific test
pytest tests/test_stt.py -v

# Watch mode
pytest-watch tests/
```

---

## Troubleshooting

### Issue: Port Already in Use

```bash
# Kill process on port 8000
lsof -i :8000
kill -9 <PID>

# Or use different port
docker-compose up -d --env-file .env.override
# (Update BACKEND_PORT in .env.override)
```

### Issue: Database Connection Error

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Restart service
docker-compose restart postgres
```

### Issue: Ollama Model Not Loading

```bash
# Check available disk space
df -h

# Check Ollama logs
docker logs edc-ollama

# Clear Ollama cache and re-download
docker exec edc-ollama rm -rf /root/.ollama
docker-compose restart ollama
docker exec edc-ollama ollama pull gemma:7b-instruct
```

### Issue: WebSocket Connection Fails

```bash
# Check backend health
curl http://localhost:8000/health

# Check WebSocket endpoint
curl http://localhost:8000/docs

# Restart backend
docker-compose restart backend
```

### Issue: Frontend Can't Reach Backend

```bash
# Check CORS settings
# In backend/app/main.py:
# Make sure frontend URL is in CORS_ORIGINS

# Check environment variables
echo $VITE_API_URL
echo $VITE_WS_URL

# Restart frontend
docker-compose restart frontend
```

---

## Development Workflows

### Adding New Backend Route

```python
# backend/app/api/my_feature.py
from fastapi import APIRouter, Depends
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/my-feature", tags=["my-feature"])

@router.post("/action")
async def my_action(
    data: MyModel,
    current_user: User = Depends(get_current_user)
):
    """My feature endpoint"""
    # Implementation
    return {"status": "success"}

# backend/app/main.py
# Add to imports:
from app.api import my_feature

# Add to app:
app.include_router(my_feature.router)
```

### Adding New Frontend Component

```typescript
// frontend/src/components/MyComponent.tsx
import { useState } from 'react';

export function MyComponent() {
  const [state, setState] = useState(null);

  return (
    <div className="my-component">
      {/* Component JSX */}
    </div>
  );
}

// frontend/src/pages/index.tsx
// Import and use:
import { MyComponent } from '../components/MyComponent';

export default function Home() {
  return (
    <div>
      <MyComponent />
    </div>
  );
}
```

### Database Migration

```bash
# Create new migration
docker exec edc-backend alembic revision --autogenerate -m "Add new table"

# Review generated migration in backend/alembic/versions/

# Apply migration
docker exec edc-backend alembic upgrade head

# Rollback (if needed)
docker exec edc-backend alembic downgrade -1
```

---

## Performance Optimization Tips

### Backend Optimization

```python
# Use connection pooling
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
)

# Cache LLM responses
from redis import Redis
cache = Redis.from_url(REDIS_URL)

# Add rate limiting
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@limiter.limit("100/minute")
async def my_endpoint():
    pass
```

### Frontend Optimization

```typescript
// Code splitting
const Avatar = lazy(() => import('./components/Avatar'));

// Memoization
const MemoizedAvatar = memo(Avatar);

// Virtual scrolling for long lists
import { FixedSizeList as List } from 'react-window';

// Image optimization
import Image from 'next/image';
```

### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_knowledge_base_department ON knowledge_base(department_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM conversations WHERE user_id = 'user123';

-- Vacuum for cleanup
VACUUM ANALYZE;
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`pytest`)
- [ ] Code coverage > 80%
- [ ] No security issues (`bandit`, `safety`)
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] API documentation updated
- [ ] Performance tested (load test with 100+ users)
- [ ] Monitoring setup (Prometheus, Grafana)
- [ ] Backup strategy configured
- [ ] Disaster recovery tested
- [ ] Team trained on deployment

---

## Support & Resources

- **Documentation:** `/docs/ARCHITECTURE.md`
- **API Docs:** http://localhost:8000/docs
- **Team Slack:** #edc-system
- **Issue Tracker:** GitHub Issues
- **Runbook:** `/docs/RUNBOOK.md`

---

## Next Steps

1. ✅ Start services: `docker-compose up -d`
2. ✅ Test voice pipeline: `curl http://localhost:8000/docs`
3. ✅ Explore frontend: `http://localhost:3000`
4. ✅ Read architecture: `/docs/ARCHITECTURE.md`
5. ✅ Join team Slack: #edc-system

**Questions?** Post in #edc-system or schedule a sync with the team.

---

**Last Updated:** April 2024  
**Version:** 1.0
