# AI Interview Practice Platform

Ứng dụng luyện phỏng vấn với AI - giúp người dùng thực hành phỏng vấn xin việc với AI đóng vai interviewer.

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- shadcn/ui + Tailwind CSS
- TanStack React Query
- React Router DOM v6

### Backend
- Supabase (Database, Auth, Edge Functions)

### AI
- Groq API (LLaMA 3.3 70B) - Interview engine
- VieNeu TTS - Vietnamese Text-to-Speech (realtime, chạy trên CPU)

## Quick Start (Local Development)

### 1. Frontend
```bash
npm install
npm run dev
```
App chạy tại http://localhost:8080

### 2. VieNeu TTS Server (Optional)
```bash
cd tts-server
pip install -r requirements.txt
python main.py
```
TTS server chạy tại http://localhost:7860

> **Note**: Nếu không chạy TTS server, app sẽ tự động dùng Web Speech API của trình duyệt.

### 3. Supabase
Set `GROQ_API_KEY` trong [Supabase Dashboard](https://supabase.com/dashboard/project/hhtqarulddsthposdwof/settings/functions) > Secrets

## 🚀 Deploy to Production

Xem chi tiết tại [DEPLOY.md](./DEPLOY.md)

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | `your-app.vercel.app` |
| Backend | Supabase | `your-project.supabase.co` |
| TTS Server | Hugging Face Spaces | `your-space.hf.space` |

## Environment Variables

```bash
# .env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_TTS_SERVER_URL="http://localhost:7860"  # hoặc HF Spaces URL
```

## Features
- 🎯 Phỏng vấn theo role (Frontend, Backend, Fullstack, QA, BA, DevOps, Mobile, Data)
- 📊 Nhiều cấp độ (Intern → Senior)
- 🔄 3 mode: Behavioral, Technical, Mixed
- 🌐 Hỗ trợ tiếng Việt và tiếng Anh
- 🎙️ VieNeu TTS - Giọng nói tiếng Việt tự nhiên, realtime
- 🤖 AI Coach đưa ra recommendations
- 🎮 Gamification (XP, badges, streaks)
