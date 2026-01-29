"""
VieNeu TTS Server for HF Spaces (Gradio SDK)
"""

import gradio as gr
import os
import hashlib

# Cache directory
CACHE_DIR = "/tmp/tts_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

# Lazy load
tts = None

def get_tts():
    global tts
    if tts is None:
        print("Loading VieNeu...")
        from vieneu import Vieneu
        tts = Vieneu()
        print("VieNeu loaded!")
    return tts

def synthesize(text: str, voice: str = "default"):
    """Generate speech from text"""
    if not text or not text.strip():
        return None
    
    # Cache key
    cache_key = hashlib.md5(f"{text}_{voice}".encode()).hexdigest()[:16]
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.wav")
    
    # Return cached if exists
    if os.path.exists(cache_path):
        return cache_path
    
    # Generate
    model = get_tts()
    voice_data = None
    if voice != "default":
        try:
            voice_data = model.get_preset_voice(voice)
        except:
            pass
    
    audio = model.infer(text=text, voice=voice_data)
    model.save(audio, cache_path)
    
    return cache_path

# Gradio interface
with gr.Blocks(title="VieNeu TTS") as demo:
    gr.Markdown("# 🎙️ VieNeu Vietnamese TTS")
    gr.Markdown("Text-to-Speech tiếng Việt tự nhiên")
    
    with gr.Row():
        text_input = gr.Textbox(
            label="Nhập văn bản",
            placeholder="Xin chào, tôi là AI Interview Coach...",
            lines=3
        )
    
    with gr.Row():
        voice_select = gr.Dropdown(
            choices=["default", "Hương", "Minh", "Lan", "Nam"],
            value="default",
            label="Giọng đọc"
        )
        submit_btn = gr.Button("🔊 Tạo giọng nói", variant="primary")
    
    audio_output = gr.Audio(label="Kết quả", type="filepath")
    
    submit_btn.click(
        fn=synthesize,
        inputs=[text_input, voice_select],
        outputs=audio_output
    )
    
    # API endpoint
    gr.Markdown("### API Endpoint")
    gr.Markdown("""
    ```
    POST /api/predict
    {
        "data": ["your text here", "default"]
    }
    ```
    """)

demo.launch()
