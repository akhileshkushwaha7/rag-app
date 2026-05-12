# RAG Application

A full-stack Retrieval-Augmented Generation (RAG) chatbot that answers questions about uploaded documents.

## Features

- **User Authentication**: Email/password signup and login with session-based auth
- **File Upload**: Upload PDF, DOCX, or TXT files
- **Vector Search**: Semantic search using Weaviate vector database
- **AI Responses**: Get answers grounded in your documents using Groq LLM
- **Chat History**: View and manage conversation history
- **Multiple Sessions**: Create separate chat sessions

## Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL
- Weaviate (vector DB)
- Groq API (LLM)
- FastEmbed (embeddings)

**Frontend:**
- Next.js 15 (React 19)
- TypeScript
- Tailwind CSS
- Axios

**DevOps:**
- Docker & docker-compose

## Project Structure

```
backend/
├── main.py                 # FastAPI app entry
├── requirements.txt        # Python dependencies
├── db/database.py          # DB connections
├── models/                 # SQLAlchemy ORM models
├── routers/                # API endpoints
│   ├── auth.py             # Login/signup
│   └── chat.py             # Chat/file upload
└── services/               # Business logic
    ├── auth_service.py
    └── rag_service.py

frontend/
├── src/app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/login
│   ├── (auth)/signup
│   └── chat/page.tsx
└── package.json
```

## Setup & Run

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker & docker-compose
- PostgreSQL
- Weaviate

### Backend

```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL="postgresql+asyncpg://user:password@localhost/ragdb"
export WEAVIATE_URL="http://localhost:8080"
export GROQ_API_KEY="your_groq_api_key"
python main.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker (All Services)

```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## API Endpoints

### Authentication
- `POST /auth/signup` - Register user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Chat
- `POST /api/upload` - Upload file
- `POST /api/chat` - Send message
- `GET /api/chat/history/{session_id}` - Get conversation
- `GET /api/chat/sessions` - List sessions
- `DELETE /api/chat/sessions/{session_id}` - Delete session

## Database Schema

**users** - User accounts  
**sessions** - Authentication sessions  
**chat_history** - Messages  
**files** - Uploaded files metadata  

## How It Works

1. **Upload**: User uploads PDF → Backend extracts text → Chunks into 500-char segments
2. **Embed**: Each chunk converted to 384-dim vector using FastEmbed
3. **Store**: Vectors stored in Weaviate with metadata
4. **Query**: User asks question → Question embedded → Vector similarity search → Top 5 chunks retrieved
5. **LLM**: Chunks + question sent to Groq LLM
6. **Response**: LLM generates answer grounded in chunks

## Environment Variables

```
DATABASE_URL=postgresql+asyncpg://user:password@localhost/ragdb
WEAVIATE_URL=http://localhost:8080
GROQ_API_KEY=your_api_key
GROQ_MODEL=openai/gpt-oss-20b
```

## Security

- Passwords hashed with bcrypt
- HttpOnly secure cookies for sessions
- CORS configured for frontend domain
- Session validation on all protected endpoints

## Performance

- Async/await for non-blocking I/O
- Vector DB for fast semantic search
- Database connection pooling
- Batch processing for embeddings

## Production Improvements Needed

- [ ] Session expiration (currently never expires)
- [ ] Real embeddings (currently dummy vectors)
- [ ] File deletion with Weaviate cleanup
- [ ] Async file processing (Celery job queue)
- [ ] Redis caching
- [ ] Rate limiting
- [ ] Request logging
- [ ] Error monitoring (Sentry)

## Troubleshooting

**"CORS error"**: Check `allow_origins` in main.py  
**"401 Unauthorized"**: Session token invalid or missing  
**"Weaviate connection failed"**: Check WEAVIATE_URL and if container is running  
**"ModuleNotFoundError"**: Run `pip install -r requirements.txt`  

## License

MIT

