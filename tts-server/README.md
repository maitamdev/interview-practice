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

Vietnamese Text-to-Speech using VieNeu TTS model.

## Features
- Vietnamese TTS tự nhiên
- Nhiều giọng đọc: Hương, Minh, Lan, Nam
- Gradio UI + API endpoint

## API Usage

```python
from gradio_client import Client

client = Client("YOUR_USERNAME/vieneu-tts")
result = client.predict(
    text="Xin chào, tôi là AI Interview Coach",
    voice="default",
    api_name="/predict"
)
print(result)  # Path to audio file
```
