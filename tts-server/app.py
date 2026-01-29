"""
Vietnamese TTS Server - Edge TTS
"""

import gradio as gr
import edge_tts
import asyncio
import os
import hashlib
import re

CACHE_DIR = "/tmp/tts_cache"
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
    r'\bKubernetes\b': 'Cu-bơ-nét-tít',
    r'\bAWS\b': 'A-đấp-liu-ét',
    r'\bCloud\b': 'Clao',
    r'\bDatabase\b': 'Đa-ta-bết',
    r'\bFramework\b': 'Phrêm-guốc',
    r'\bLibrary\b': 'Lai-brơ-ri',
    r'\bComponent\b': 'Com-pô-nần',
    r'\bFunction\b': 'Phăng-sần',
    r'\bVariable\b': 'Va-ri-ơ-bồ',
    r'\bArray\b': 'Ơ-rây',
    r'\bObject\b': 'Óp-giéc',
    r'\bString\b': 'Xờ-trinh',
    r'\bBoolean\b': 'Bu-li-ần',
    r'\bNull\b': 'Nâu',
    r'\bUndefined\b': 'Ân-đi-phai',
    r'\bAsync\b': 'Ây-xinh',
    r'\bAwait\b': 'Ơ-guết',
    r'\bPromise\b': 'Prô-mít',
    r'\bCallback\b': 'Cô-béc',
    r'\bHook\b': 'Húc',
    r'\bState\b': 'Xtết',
    r'\bProps\b': 'Prốp',
    r'\bRedux\b': 'Ri-đắc',
    r'\bContext\b': 'Con-téc',
    r'\bRouter\b': 'Rao-tơ',
    r'\bRoute\b': 'Rao',
    r'\bServer\b': 'Xơ-vơ',
    r'\bClient\b': 'Clai-ần',
    r'\bRequest\b': 'Ri-quét',
    r'\bResponse\b': 'Ri-xpon',
    r'\bEndpoint\b': 'En-poin',
    r'\bDebug\b': 'Đi-bấc',
    r'\bTest\b': 'Tét',
    r'\bDeploy\b': 'Đi-ploi',
    r'\bBuild\b': 'Biu',
    r'\bCompile\b': 'Com-pai',
    r'\bRun\b': 'Rân',
    r'\bCode\b': 'Cốt',
    r'\bBug\b': 'Bấc',
    r'\bFix\b': 'Phích',
    r'\bFeature\b': 'Phi-chơ',
    r'\bIssue\b': 'I-su',
    r'\bPull Request\b': 'Pul Ri-quét',
    r'\bMerge\b': 'Mơ-giơ',
    r'\bBranch\b': 'Bran-chờ',
    r'\bCommit\b': 'Com-mít',
    r'\bPush\b': 'Pút',
    r'\bPull\b': 'Pul',
    r'\bClone\b': 'Clôn',
    r'\bFork\b': 'Phoóc',
    r'\bRepository\b': 'Ri-pô-zi-to-ri',
    r'\bRepo\b': 'Ri-pô',
    
    # Interview terms
    r'\bInterview\b': 'In-tơ-viu',
    r'\bResume\b': 'Rê-zu-mê',
    r'\bCV\b': 'Xi-vi',
    r'\bSkill\b': 'Xkiu',
    r'\bSkills\b': 'Xkiu',
    r'\bExperience\b': 'Éc-xpi-ri-ần',
    r'\bProject\b': 'Prô-giéc',
    r'\bTeam\b': 'Tim',
    r'\bDeadline\b': 'Đét-lai',
    r'\bFeedback\b': 'Phít-béc',
    r'\bReview\b': 'Ri-viu',
    r'\bMeeting\b': 'Mi-tinh',
    r'\bCall\b': 'Cô',
    r'\bEmail\b': 'I-meo',
    r'\bOnline\b': 'On-lai',
    r'\bOffline\b': 'Óp-lai',
    r'\bRemote\b': 'Ri-mốt',
    r'\bOnsite\b': 'On-xai',
    r'\bHybrid\b': 'Hai-brít',
    
    # Common words
    r'\bOK\b': 'Ô-kê',
    r'\bHello\b': 'Hê-lô',
    r'\bHi\b': 'Hai',
    r'\bBye\b': 'Bai',
    r'\bThank you\b': 'Thanh kiu',
    r'\bThanks\b': 'Thanh',
    r'\bSorry\b': 'Xo-ri',
    r'\bPlease\b': 'Pli',
    r'\bYes\b': 'Dét',
    r'\bNo\b': 'Nô',
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
    
    voice_id = VOICES.get(voice, "vi-VN-HoaiMyNeural")
    
    cache_key = hashlib.md5(f"{processed_text}_{voice_id}".encode()).hexdigest()[:16]
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.mp3")
    
    if os.path.exists(cache_path):
        return cache_path
    
    communicate = edge_tts.Communicate(processed_text, voice_id)
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
