# Hướng dẫn Deploy Interview Buddy

## Kiến trúc hệ thống

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│     Vercel      │     │     Supabase     │     │  Hugging Face       │
│   (Frontend)    │────▶│  (Backend + DB)  │     │  Spaces (TTS)       │
│   React App     │     │  Edge Functions  │     │  VieNeu Server      │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
```

---

## 1. Deploy TTS Server lên Hugging Face Spaces

### Bước 1: Tạo Hugging Face account
- Đăng ký tại: https://huggingface.co/join

### Bước 2: Tạo Space mới
1. Vào https://huggingface.co/new-space
2. Điền thông tin:
   - **Space name**: `vieneu-tts`
   - **License**: MIT
   - **SDK**: Docker
   - **Hardware**: CPU basic (free) hoặc CPU upgrade ($0.03/hr)
3. Click "Create Space"

### Bước 3: Upload code
Upload toàn bộ folder `tts-server/` lên Space:
- `main.py`
- `requirements.txt`
- `Dockerfile`
- `README.md`

Hoặc dùng Git:
```bash
cd tts-server
git init
git remote add origin https://huggingface.co/spaces/YOUR_USERNAME/vieneu-tts
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Bước 4: Đợi build
- Space sẽ tự động build Docker image
- Mất khoảng 5-10 phút lần đầu
- URL sẽ là: `https://YOUR_USERNAME-vieneu-tts.hf.space`

---

## 2. Deploy Backend (Supabase Edge Functions)

### Bước 1: Cài Supabase CLI
```bash
# Windows (PowerShell)
scoop install supabase

# hoặc dùng npm
npx supabase --version
```

### Bước 2: Login và link project
```bash
npx supabase login
npx supabase link --project-ref hhtqarulddsthposdwof
```

### Bước 3: Set secrets
Vào Supabase Dashboard > Settings > Edge Functions > Secrets:
- Thêm `GROQ_API_KEY` = `your-groq-api-key`

Hoặc dùng CLI:
```bash
npx supabase secrets set GROQ_API_KEY=your-groq-api-key
```

### Bước 4: Deploy functions
```bash
npx supabase functions deploy evaluate-answer
npx supabase functions deploy interview-engine
npx supabase functions deploy session-summary
npx supabase functions deploy generate-daily-challenge
```

---

## 3. Deploy Frontend lên Vercel

### Bước 1: Push code lên GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Bước 2: Import vào Vercel
1. Vào https://vercel.com/new
2. Import GitHub repository
3. Chọn project `interview-buddy`

### Bước 3: Cấu hình Environment Variables
Trong Vercel Dashboard > Settings > Environment Variables, thêm:

```
VITE_SUPABASE_PROJECT_ID=hhtqarulddsthposdwof
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://hhtqarulddsthposdwof.supabase.co
VITE_TTS_SERVER_URL=https://YOUR_USERNAME-vieneu-tts.hf.space
```

### Bước 4: Deploy
- Click "Deploy"
- Vercel sẽ tự động build và deploy
- URL sẽ là: `https://your-project.vercel.app`

---

## 4. Cập nhật CORS (nếu cần)

Nếu gặp lỗi CORS, cập nhật `tts-server/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "https://your-project.vercel.app",  # Thêm domain Vercel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Checklist Deploy

- [ ] Hugging Face Space đã running
- [ ] Supabase Edge Functions đã deploy
- [ ] GROQ_API_KEY đã set trong Supabase
- [ ] Vercel đã deploy với đúng env vars
- [ ] Test TTS: `curl https://YOUR-SPACE.hf.space/voices`
- [ ] Test app: Mở Vercel URL và thử phỏng vấn

---

## Troubleshooting

### TTS không hoạt động
- Kiểm tra HF Space có đang running không
- App sẽ tự động fallback về Web Speech API

### AI không trả lời
- Kiểm tra GROQ_API_KEY trong Supabase Secrets
- Xem logs trong Supabase Dashboard > Edge Functions > Logs

### Lỗi CORS
- Thêm domain Vercel vào allow_origins trong main.py
- Redeploy HF Space
