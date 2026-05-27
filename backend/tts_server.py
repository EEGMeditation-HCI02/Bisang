from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import edge_tts
import os
import uuid

app = FastAPI()

# 리액트(Vite)에서 오는 요청을 허용 (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str
    voice_id: str

# 6가지 옵션 매핑 (선히, 인준) -> 원어민 음성 추가
VOICE_MAP = {
    "Sunhi": {"voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+0Hz"},
    "Aria": {"voice": "en-US-AriaNeural", "rate": "+0%", "pitch": "+0Hz"},
    "Jenny": {"voice": "en-US-JennyNeural", "rate": "+0%", "pitch": "+0Hz"},
    "Injoon": {"voice": "ko-KR-InJoonNeural", "rate": "+0%", "pitch": "+0Hz"},
    "Christopher": {"voice": "en-US-ChristopherNeural", "rate": "+0%", "pitch": "+0Hz"},
    "Guy": {"voice": "en-US-GuyNeural", "rate": "+0%", "pitch": "+0Hz"},
    # "sunhi-calm": {"voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+0Hz"},
    # "sunhi-slow": {"voice": "ko-KR-SunHiNeural", "rate": "-15%", "pitch": "-5Hz"},
    # "sunhi-deep": {"voice": "ko-KR-SunHiNeural", "rate": "-10%", "pitch": "-10Hz"},
    # "injoon-warm": {"voice": "ko-KR-InJoonNeural", "rate": "+0%", "pitch": "+0Hz"},
    # "injoon-slow": {"voice": "ko-KR-InJoonNeural", "rate": "-15%", "pitch": "-5Hz"},
    # "injoon-deep": {"voice": "ko-KR-InJoonNeural", "rate": "-10%", "pitch": "-15Hz"},
}

def remove_file(path: str):
    if os.path.exists(path):
        os.remove(path)

@app.post("/api/tts")
async def generate_tts(request: TTSRequest, background_tasks: BackgroundTasks):
    v = VOICE_MAP.get(request.voice_id, VOICE_MAP["Jenny"]) # 기본값은 Jenny로 설정
    filename = f"temp_{uuid.uuid4()}.mp3"
    
    communicate = edge_tts.Communicate(request.text, v["voice"], rate=v["rate"], pitch=v["pitch"])
    await communicate.save(filename)
    
    # 응답(오디오 재생)이 끝나면 서버 하드디스크에서 임시 파일 삭제
    background_tasks.add_task(remove_file, filename)
    
    return FileResponse(filename, media_type="audio/mpeg")

if __name__ == "__main__":
    import uvicorn
    # 8000번 포트로 서버 가동
    uvicorn.run(app, host="0.0.0.0", port=8000)