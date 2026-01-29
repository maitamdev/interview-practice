import { useState, useCallback, useRef } from 'react';

const TTS_SERVER_URL = import.meta.env.VITE_TTS_SERVER_URL || 'http://localhost:7860';

export interface Voice {
  id: string;
  name: string;
}

// Check if TTS server is available
async function checkTTSServer(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${TTS_SERVER_URL}/`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// Fallback to Web Speech API
function speakWithWebSpeech(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Web Speech API not supported'));
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.9;
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    speechSynthesis.speak(utterance);
  });
}

export function useTTS() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<string>('Hương');
  const [useWebSpeech, setUseWebSpeech] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch available voices
  const fetchVoices = useCallback(async () => {
    const serverAvailable = await checkTTSServer();
    
    if (!serverAvailable) {
      console.log('TTS server not available, using Web Speech API fallback');
      setUseWebSpeech(true);
      // Set default Web Speech voices
      setVoices([{ id: 'default', name: 'Giọng mặc định (Web)' }]);
      return;
    }
    
    try {
      const response = await fetch(`${TTS_SERVER_URL}/voices`);
      if (!response.ok) throw new Error('Failed to fetch voices');
      
      const data = await response.json();
      const voiceList = Object.entries(data.voices).map(([id, name]) => ({
        id,
        name: name as string,
      }));
      setVoices(voiceList);
      setCurrentVoice(data.default || 'Hương');
      setUseWebSpeech(false);
    } catch (err) {
      console.error('TTS voices error:', err);
      setUseWebSpeech(true);
      setVoices([{ id: 'default', name: 'Giọng mặc định (Web)' }]);
    }
  }, []);

  // Speak text
  const speak = useCallback(async (text: string, voice?: string) => {
    if (!text.trim()) return;
    
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    speechSynthesis.cancel(); // Cancel any Web Speech

    setIsLoading(true);
    setError(null);

    // Use Web Speech API fallback
    if (useWebSpeech) {
      try {
        setIsSpeaking(true);
        await speakWithWebSpeech(text);
        setIsSpeaking(false);
      } catch (err) {
        setError('Lỗi phát giọng nói');
        setIsSpeaking(false);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Use VieNeu TTS server
    try {
      const response = await fetch(`${TTS_SERVER_URL}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voice || currentVoice,
        }),
      });

      if (!response.ok) {
        throw new Error('TTS synthesis failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setError('Lỗi phát audio');
      };

      await audio.play();
      
    } catch (err) {
      // Fallback to Web Speech if VieNeu fails
      console.warn('VieNeu TTS failed, falling back to Web Speech');
      try {
        setIsSpeaking(true);
        await speakWithWebSpeech(text);
        setIsSpeaking(false);
      } catch {
        setError('Lỗi phát giọng nói');
        setIsSpeaking(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentVoice, useWebSpeech]);

  // Stop speaking
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    speechSynthesis.cancel(); // Also cancel Web Speech
    setIsSpeaking(false);
  }, []);

  // Change voice
  const changeVoice = useCallback((voiceId: string) => {
    setCurrentVoice(voiceId);
  }, []);

  return {
    speak,
    stop,
    fetchVoices,
    changeVoice,
    voices,
    currentVoice,
    isLoading,
    isSpeaking,
    error,
    useWebSpeech,
  };
}
