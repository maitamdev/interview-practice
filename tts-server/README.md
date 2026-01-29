# Vietnamese TTS Server

Text-to-Speech tiếng Việt sử dụng Microsoft Edge TTS.

## Deploy trên Hugging Face Spaces

1. Tạo Space mới trên HF với Docker SDK
2. Upload các file trong folder này
3. Space sẽ tự build và chạy

## Giọng đọc

- **Hoài My (Nữ)**: vi-VN-HoaiMyNeural
- **Nam Minh (Nam)**: vi-VN-NamMinhNeural

## API

Gradio API endpoint: `/call/synthesize`

```python
# Input: [text, voice]
# Output: audio file URL
```
