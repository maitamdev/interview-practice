"""
VieNeu TTS Server - Vietnamese Text-to-Speech API
Realtime streaming cho ứng dụng phỏng vấn
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
import io
import os
import tempfile

app = FastAPI(title="VieNeu TTS Server", version="1.0.0")

# CORS cho frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy load TTS model
tts = None
VOICES = {}

def get_tts():
    global tts, VOICES
    if tts is None:
        print("🔄 Loading VieNeu TTS model...")
        from vieneu import Vieneu
        tts = Vieneu()
        VOICES = {name: desc for desc, name in tts.list_preset_voices()}
        print(f"✅ VieNeu loaded! Voices: {list(VOICES.keys())}")
    return tts


class TTSRequest(BaseModel):
    text: str
    voice: str = "Hương"  # Default female voice


class TTSResponse(BaseModel):
    success: bool
    message: str
    voices: dict = None


@app.get("/")
async def root():
    return {"status": "ok", "service": "VieNeu TTS Server", "ready": tts is not None}


@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": tts is not None}


@app.get("/voices")
async def list_voices():
    """List all available voices"""
    get_tts()  # Ensure model is loaded
    return {
        "voices": VOICES,
        "default": "Hương"
    }


@app.post("/synthesize")
async def synthesize(request: TTSRequest):
    """
    Synthesize text to speech and return audio file
    """
    try:
        model = get_tts()
        
        # Get voice data
        voice_data = None
        if request.voice in VOICES:
            voice_data = model.get_preset_voice(request.voice)
        
        # Generate audio
        audio = model.infer(text=request.text, voice=voice_data)
        
        # Save to temp file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            model.save(audio, tmp.name)
            tmp_path = tmp.name
        
        # Return audio file
        return FileResponse(
            tmp_path,
            media_type="audio/wav",
            filename="speech.wav",
            background=None  # Don't delete immediately
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/stream")
async def stream_audio(request: TTSRequest):
    """
    Stream audio in chunks for realtime playback
    """
    try:
        model = get_tts()
        
        voice_data = None
        if request.voice in VOICES:
            voice_data = model.get_preset_voice(request.voice)
        
        audio = model.infer(text=request.text, voice=voice_data)
        
        # Save to buffer
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            model.save(audio, tmp.name)
            
            # Read and stream
            with open(tmp.name, "rb") as f:
                audio_bytes = f.read()
            
            os.unlink(tmp.name)  # Clean up
        
        def generate():
            chunk_size = 4096
            for i in range(0, len(audio_bytes), chunk_size):
                yield audio_bytes[i:i + chunk_size]
        
        return StreamingResponse(
            generate(),
            media_type="audio/wav",
            headers={"Content-Disposition": "inline; filename=speech.wav"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 7860))  # HF Spaces uses 7860
    uvicorn.run(app, host="0.0.0.0", port=port)
