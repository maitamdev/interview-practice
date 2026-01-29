# 🎯 AI Interview Coach

<div align="center">

![AI Interview Coach](https://img.shields.io/badge/AI-Interview%20Coach-00D4AA?style=for-the-badge&logo=sparkles)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=flat-square&logo=supabase)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3-FF6B35?style=flat-square)

**Luyện tập phỏng vấn với AI thông minh - Nhận feedback chi tiết và cải thiện kỹ năng mỗi ngày**

[Demo](https://interview-practice-tau.vercel.app) · [Report Bug](https://github.com/maitamdev/interview-practice/issues)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Multi-Role Support** | Frontend, Backend, Fullstack, QA, BA, DevOps, Mobile, Data Engineer |
| 📊 **Adaptive Difficulty** | Intern → Junior → Mid → Senior với câu hỏi phù hợp |
| 🔄 **Interview Modes** | Behavioral, Technical, Mixed |
| 🌐 **Bilingual** | Hỗ trợ tiếng Việt và tiếng Anh |
| 🎙️ **Voice TTS** | VieNeu TTS giọng Việt tự nhiên + Web Speech fallback |
| 🎤 **Voice Input** | Nhận diện giọng nói realtime |
| 📈 **Detailed Feedback** | Chấm điểm theo rubric + gợi ý cải thiện |
| 🎮 **Gamification** | XP, Badges, Streaks, Daily Challenges |
| 🤖 **AI Coach** | Recommendations cá nhân hóa |

## 🛠️ Tech Stack

```
Frontend:  React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
Backend:   Supabase (PostgreSQL + Auth + Edge Functions)
AI:        Groq API (LLaMA 3.3 70B Versatile)
TTS:       VieNeu (Vietnamese) + Web Speech API (fallback)
Deploy:    Vercel (Frontend) + Supabase (Backend) + HF Spaces (TTS)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn/bun
- Supabase account
- Groq API key

### 1. Clone & Install
```bash
git clone https://github.com/maitamdev/interview-practice.git
cd interview-practice
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_TTS_SERVER_URL="https://your-tts.hf.space"
```

### 3. Run Development Server
```bash
npm run dev
```
Open http://localhost:8080

## 📦 Project Structure

```
├── src/
│   ├── components/     # UI Components
│   │   ├── ui/         # shadcn/ui components
│   │   ├── interview/  # Interview-specific components
│   │   └── dashboard/  # Dashboard components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── types/          # TypeScript types
│   └── integrations/   # Supabase client
├── supabase/
│   ├── functions/      # Edge Functions (AI logic)
│   └── migrations/     # Database migrations
└── tts-server/         # VieNeu TTS server (Docker)
```

## 🌐 Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed instructions.

| Service | Platform | Status |
|---------|----------|--------|
| Frontend | Vercel | [![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://interview-practice-tau.vercel.app) |
| Backend | Supabase | [![Supabase](https://img.shields.io/badge/Supabase-Active-3FCF8E?logo=supabase)](https://supabase.com) |
| TTS | HF Spaces | [![HF](https://img.shields.io/badge/HuggingFace-Building-FFD21E?logo=huggingface)](https://huggingface.co/spaces/DevTam05/vieneu-tts) |

## 📝 License

MIT © 2025 [DevTam](https://github.com/maitamdev)

---

<div align="center">
Made with ❤️ for Vietnamese developers
</div>
