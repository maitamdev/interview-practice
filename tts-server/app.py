"""
Vietnamese TTS Server - Edge TTS
"""

import gradio as gr
import edge_tts
import asyncio
import os
import hashlib
import re
import shutil

CACHE_DIR = "/tmp/tts_cache"

# Clear cache on startup
if os.path.exists(CACHE_DIR):
    shutil.rmtree(CACHE_DIR)
os.makedirs(CACHE_DIR, exist_ok=True)

# Giọng Việt Nam từ Edge TTS
VOICES = {
    "Hoài My (Nữ)": "vi-VN-HoaiMyNeural",
    "Nam Minh (Nam)": "vi-VN-NamMinhNeural",
}

# Từ điển phiên âm tiếng Anh -> tiếng Việt
ENGLISH_TO_VIETNAMESE = {
    # Job titles
    r'\bFrontend Developer\b': 'Phờ-ron-en Đê-vê-lốp-pơ',
    r'\bBackend Developer\b': 'Béc-en Đê-vê-lốp-pơ',
    r'\bFullstack Developer\b': 'Phu-xtéc Đê-vê-lốp-pơ',
    r'\bSoftware Engineer\b': 'Sóp-que Én-gi-nia',
    r'\bDeveloper\b': 'Đê-vê-lốp-pơ',
    r'\bEngineer\b': 'Én-gi-nia',
    r'\bDesigner\b': 'Đi-zai-nơ',
    r'\bManager\b': 'Ma-na-giơ',
    r'\bLeader\b': 'Li-đơ',
    r'\bSenior\b': 'Xi-ni-ơ',
    r'\bJunior\b': 'Giu-ni-ơ',
    r'\bIntern\b': 'In-tơn',
    
    # Tech terms
    r'\bReact\b': 'Ri-ắc',
    r'\bVue\b': 'Viu',
    r'\bAngular\b': 'Ang-giu-la',
    r'\bJavaScript\b': 'Gia-va-xcrip',
    r'\bTypeScript\b': 'Thai-xcrip',
    r'\bPython\b': 'Pai-thon',
    r'\bNode\.js\b': 'Nốt giây-ét',
    r'\bNodeJS\b': 'Nốt giây-ét',
    r'\bAPI\b': 'A-Pi-Ai',
    r'\bCSS\b': 'Xi-ét-ét',
    r'\bHTML\b': 'Ết-ti-ém-eo',
    r'\bGit\b': 'Gít',
    r'\bGitHub\b': 'Gít-hấp',
    r'\bDocker\b': 'Đốc-cơ',
    r'\bFramework\b': 'Phrêm-guốc',
    r'\bComponent\b': 'Com-pô-nần',
    
    # Interview terms
    r'\bInterview\b': 'In-tơ-viu',
    r'\bSkill\b': 'Xkiu',
    r'\bSkills\b': 'Xkiu',
    r'\bProject\b': 'Prô-giéc',
    r'\bTeam\b': 'Tim',
    r'\bFeedback\b': 'Phít-béc',
    r'\bOnline\b': 'On-lai',
    r'\bOffline\b': 'Óp-lai',
    
    # Common
    r'\bOK\b': 'Ô-kê',
}

def preprocess_text(text: str) -> str:
    """Thay thế từ tiếng Anh bằng phiên âm tiếng Việt"""
    result = text
    for pattern, replacement in ENGLISH_TO_VIETNAMESE.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    return result

async def synthesize_async(text: str, voice: str):
    if not text or not text.strip():
        return None
    
    # Preprocess text
    processed_text = preprocess_text(text)
    
    # Get voice ID
    voice_id = VOICES.get(voice)
    if not voice_id:
        # Fallback - try exact match
        voice_id = "vi-VN-HoaiMyNeural"
        print(f"[WARN] Voice '{voice}' not found, using default")
    
    print(f"[TTS] Input voice: '{voice}'")
    print(f"[TTS] Voice ID: '{voice_id}'")
    print(f"[TTS] Text preview: '{text[:80]}...'")
    
    # Generate unique cache key including voice
    cache_key = hashlib.md5(f"{processed_text}_{voice_id}".encode()).hexdigest()[:16]
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.mp3")
    
    # Always regenerate for debugging
    communicate = edge_tts.Communicate(processed_text, voice_id)
    await communicate.save(cache_path)
    
    print(f"[TTS] Saved to: {cache_path}")
    
    return cache_path

def synthesize(text: str, voice: str):
    print(f"\n{'='*50}")
    print(f"[REQUEST] Voice: '{voice}', Text length: {len(text)}")
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

print("[STARTUP] Vietnamese TTS Server starting...")
print(f"[STARTUP] Available voices: {list(VOICES.keys())}")

demo.launch(server_name="0.0.0.0", server_port=7860)
