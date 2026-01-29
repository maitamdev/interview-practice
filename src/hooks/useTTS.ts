import { useState, useCallback, useRef } from 'react';

const TTS_SERVER_URL = import.meta.env.VITE_TTS_SERVER_URL || 'https://devtam05-vieneu-tts.hf.space';

export interface Voice {
  id: string;
  name: string;
}

// Available voices on HF Spaces Edge TTS
const HF_VOICES: Record<string, string> = {
  "Hoài My (Nữ)": "Hoài My (Nữ)",
  "Nam Minh (Nam)": "Nam Minh (Nam)",
};

// Check if TTS server is available
async function checkTTSServer(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${TTS_SERVER_URL}/`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// Get best Vietnamese voice from Web Speech API
function getBestVietnameseVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  
  const priorityKeywords = ['Google', 'Microsoft', 'Natural', 'Premium', 'vi-VN', 'vi_VN', 'Vietnamese'];
  
  const vnVoices = voices.filter(v => 
    v.lang.startsWith('vi') || 
    v.name.toLowerCase().includes('vietnam') ||
    v.name.toLowerCase().includes('tiếng việt')
  );
  
  if (vnVoices.length === 0) return null;
  
  vnVoices.sort((a, b) => {
    const aScore = priorityKeywords.findIndex(k => a.name.includes(k));
    const bScore = priorityKeywords.findIndex(k => b.name.includes(k));
    return (aScore === -1 ? 999 : aScore) - (bScore === -1 ? 999 : bScore);
  });
  
  return vnVoices[0];
}

// Fallback to Web Speech API
function speakWithWebSpeech(text: string, rate: number = 1.0): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Web Speech API not supported'));
      return;
    }
    
    try {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      const vnVoice = getBestVietnameseVoice();
      if (vnVoice) {
        utterance.voice = vnVoice;
        utterance.lang = vnVoice.lang;
      } else {
        utterance.lang = 'vi-VN';
      }
      
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        // Ignore 'interrupted' and 'canceled' errors - these are expected when stopping
        if (e.error === 'interrupted' || e.error === 'canceled') {
          resolve();
        } else {
          reject(e);
        }
      };
      
      setTimeout(() => {
        try {
          speechSynthesis.speak(utterance);
        } catch (err) {
          reject(err);
        }
      }, 50);
    } catch (err) {
      reject(err);
    }
  });
}

// Get Web Speech voices
function getWebSpeechVoices(): Voice[] {
  const voices = speechSynthesis.getVoices();
  const vnVoices = voices.filter(v => 
    v.lang.startsWith('vi') || 
    v.name.toLowerCase().includes('vietnam')
  );
  
  if (vnVoices.length === 0) {
    return [{ id: 'default', name: 'Giọng mặc định' }];
  }
  
  return vnVoices.map(v => ({
    id: v.voiceURI,
    name: `${v.name} (${v.lang})`,
  }));
}

// Call Gradio API on HF Spaces
async function callGradioTTS(text: string, voice: string): Promise<string> {
  // Gradio API endpoint
  const apiUrl = `${TTS_SERVER_URL}/gradio_api/call/synthesize`;
  
  // Step 1: Submit the request
  const submitResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [text, voice]
    }),
  });
  
  if (!submitResponse.ok) {
    throw new Error('Failed to submit TTS request');
  }
  
  const { event_id } = await submitResponse.json();
  
  // Step 2: Get the result
  const resultResponse = await fetch(`${TTS_SERVER_URL}/gradio_api/call/synthesize/${event_id}`);
  
  if (!resultResponse.ok) {
    throw new Error('Failed to get TTS result');
  }
  
  // Parse SSE response
  const resultText = await resultResponse.text();
  const lines = resultText.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data && data[0] && data[0].url) {
        return data[0].url;
      }
    }
  }
  
  throw new Error('No audio URL in response');
}

export function useTTS() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<string>('Hoài My (Nữ)');
  const [useWebSpeech, setUseWebSpeech] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isCancelledRef = useRef(false); // Track if speech was cancelled

  // Fetch available voices
  const fetchVoices = useCallback(async () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
    }
    
    const serverAvailable = await checkTTSServer();
    
    if (!serverAvailable) {
      console.log('TTS server not available, using Web Speech API fallback');
      setUseWebSpeech(true);
      setTimeout(() => {
        setVoices(getWebSpeechVoices());
      }, 100);
      return;
    }
    
    // Use HF Spaces voices
    const voiceList = Object.entries(HF_VOICES).map(([id, name]) => ({
      id,
      name,
    }));
    setVoices(voiceList);
    setCurrentVoice('Hoài My (Nữ)');
    setUseWebSpeech(false);
  }, []);

  // Speak text
  const speak = useCallback(async (text: string, voice?: string) => {
    console.log('[TTS] speak() called, isCancelled:', isCancelledRef.current);
    
    if (!text.trim()) return;
    
    // Reset cancelled flag when starting new speech
    isCancelledRef.current = false;
    
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    speechSynthesis.cancel();

    setIsLoading(true);
    setError(null);

    // Use Web Speech API fallback
    if (useWebSpeech) {
      console.log('[TTS] Using Web Speech API');
      try {
        setIsSpeaking(true);
        await speakWithWebSpeech(text, speechRate);
        if (!isCancelledRef.current) {
          setIsSpeaking(false);
        }
      } catch (err) {
        console.log('[TTS] Web Speech error, isCancelled:', isCancelledRef.current);
        if (!isCancelledRef.current) {
          setError('Lỗi phát giọng nói');
          setIsSpeaking(false);
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Use HF Spaces TTS
    console.log('[TTS] Using HF Spaces TTS');
    try {
      const selectedVoice = voice || currentVoice;
      const audioUrl = await callGradioTTS(text, selectedVoice);
      
      // Check if cancelled during API call
      if (isCancelledRef.current) {
        console.log('[TTS] Cancelled during API call, aborting');
        setIsLoading(false);
        return;
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => {
        console.log('[TTS] Audio onplay, isCancelled:', isCancelledRef.current);
        if (!isCancelledRef.current) {
          setIsSpeaking(true);
        }
      };
      audio.onended = () => {
        console.log('[TTS] Audio onended, isCancelled:', isCancelledRef.current);
        if (!isCancelledRef.current) {
          setIsSpeaking(false);
        }
      };
      audio.onerror = () => {
        console.log('[TTS] Audio onerror, isCancelled:', isCancelledRef.current);
        if (!isCancelledRef.current) {
          setIsSpeaking(false);
          setError('Lỗi phát audio');
        }
      };

      await audio.play();
      
    } catch (err) {
      console.log('[TTS] HF TTS catch block, isCancelled:', isCancelledRef.current, 'error:', err);
      
      // DON'T fallback to Web Speech if cancelled
      if (isCancelledRef.current) {
        console.log('[TTS] Cancelled, NOT falling back to Web Speech');
        setIsLoading(false);
        return;
      }
      
      console.warn('[TTS] HF TTS failed, falling back to Web Speech:', err);
      try {
        setIsSpeaking(true);
        await speakWithWebSpeech(text, speechRate);
        if (!isCancelledRef.current) {
          setIsSpeaking(false);
        }
      } catch {
        if (!isCancelledRef.current) {
          setError('Lỗi phát giọng nói');
          setIsSpeaking(false);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentVoice, useWebSpeech, speechRate]);

  // Stop speaking
  const stop = useCallback(() => {
    console.log('[TTS] stop() called');
    
    // Set cancelled flag to prevent fallback
    isCancelledRef.current = true;
    
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {
        // Ignore errors when stopping
      }
      audioRef.current = null;
    }
    
    try {
      speechSynthesis.cancel();
    } catch (e) {
      // Ignore errors when cancelling
    }
    
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  // Change voice
  const changeVoice = useCallback((voiceId: string) => {
    setCurrentVoice(voiceId);
  }, []);

  // Change speech rate
  const changeRate = useCallback((rate: number) => {
    setSpeechRate(Math.max(0.5, Math.min(2.0, rate)));
  }, []);

  return {
    speak,
    stop,
    fetchVoices,
    changeVoice,
    changeRate,
    voices,
    currentVoice,
    speechRate,
    isLoading,
    isSpeaking,
    error,
    useWebSpeech,
  };
}
