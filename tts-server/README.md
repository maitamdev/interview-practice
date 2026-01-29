---
title: VieNeu TTS Server
emoji: 🎙️
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# VieNeu TTS Server

Vietnamese Text-to-Speech API server using VieNeu TTS model.

## Features
- Realtime Vietnamese TTS
- Multiple voice presets (Hương, Ngọc, Đoan, Bình, Tuyên, Nguyên)
- REST API with FastAPI
- Streaming audio support

## API Endpoints

- `GET /` - Health check
- `GET /voices` - List available voices
- `POST /synthesize` - Generate speech from text
- `POST /stream` - Stream audio in chunks

## Usage

```bash
curl -X POST "https://your-space.hf.space/synthesize" \
  -H "Content-Type: application/json" \
  -d '{"text": "Xin chào", "voice": "Hương"}'
```
