"""
Vietnamese TTS Server - Edge TTS
"""

import gradio as gr
import edge_tts
import asyncio
import os
import hashlib

CACHE_DIR = "/tmp/tts_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

# Giọng Việt Nam từ Edge TTS
VOICES = {
    "Hoài My (Nữ)": "vi-VN-HoaiMyNeural",
    "Nam Minh (Nam)": "vi-VN-NamMinhNeural",
}

async def synthesize_async(text: str, voice: str):
    if not text or not text.strip():
        return None
    
    voice_id = VOICES.get(voice, "vi-VN-HoaiMyNeural")
    
    cache_key = hashlib.md5(f"{text}_{voice_id}".encode()).hexdigest()[:16]
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.mp3")
    
    if os.path.exists(cache_path):
        return cache_path
    
    communicate = edge_tts.Communicate(text, voice_id)
    await communicate.save(cache_path)
    
    return cache_path

def synthesize(text: str, voice: str):
    return asyncio.run(synthesize_async(text, voice))

with gr.Blocks(title="Vietnamese TTS") as demo:
    gr.Markdown("# 🎙️ Vietnamese TTS Server")
    gr.Markdown("Text-to-Speech tiếng Việt - Powered by Microsoft Edge TTS")
    
    with gr.Row():
        text_input = gr.Textbox(
            label="Nhập văn bản",
            placeholder="Xin chào, tôi là AI Interview Coach...",
            lines=3
        )
    
    with gr.Row():
        voice_select = gr.Dropdown(
            choices=list(VOICES.keys()),
            value="Hoài My (Nữ)",
            label="Giọng đọc"
        )
        submit_btn = gr.Button("🔊 Tạo giọng nói", variant="primary")
    
    audio_output = gr.Audio(label="Kết quả", type="filepath")
    
    submit_btn.click(
        fn=synthesize,
        inputs=[text_input, voice_select],
        outputs=audio_output
    )

demo.launch(server_name="0.0.0.0", server_port=7860)
