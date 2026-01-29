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

// Get best Vietnamese voice from Web Speech API
function getBestVietnameseVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  
  // Priority order for Vietnamese voices
  const priorityKeywords = [
    'Google', 'Microsoft', 'Natural', 'Premium', // High quality
    'vi-VN', 'vi_VN', 'Vietnamese',
  ];
  
  // Find Vietnamese voices
  const vnVoices = voices.filter(v => 
    v.lang.startsWith('vi') || 
    v.name.toLowerCase().includes('vietnam') ||
    v.name.toLowerCase().includes('tiếng việt')
  );
  
  if (vnVoices.length === 0) return null;
  
  // Sort by priority
  vnVoices.sort((a, b) => {
    const aScore = priorityKeywords.findIndex(k => a.name.includes(k));
    const bScore = priorityKeywords.findIndex(k => b.name.includes(k));
    return (aScore === -1 ? 999 : aScore) - (bScore === -1 ? 999 : bScore);
  });
  
  return vnVoices[0];
}

// Fallback to Web Speech API with better voice selection
function speakWithWebSpeech(text: string, rate: number = 1.0): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Web Speech API not supported'));
      return;
    }
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to get best Vietnamese voice
    const vnVoice = getBestVietnameseVoice();
    if (vnVoice) {
      utterance.voice = vnVoice;
      utterance.lang = vnVoice.lang;
    } else {
      utterance.lang = 'vi-VN';
    }
    
    // Settings for more natural speech
    utterance.rate = rate; // 0.8 - 1.2 recommended
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    
    // Small delay to ensure voices are loaded
    setTimeout(() => {
      speechSynthesis.speak(utterance);
    }, 50);
  });
}

// Get all available Web Speech voices for Vietnamese
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

export function useTTS() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<string>('Hương');
  const [useWebSpeech, setUseWebSpeech] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch available voices
  const fetchVoices = useCallback(async () => {
    // Ensure Web Speech voices are loaded
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices(); // Trigger voice loading
    }
    
    const serverAvailable = await checkTTSServer();
    
    if (!serverAvailable) {
      console.log('TTS server not available, using Web Speech API fallback');
      setUseWebSpeech(true);
      // Wait a bit for voices to load, then get them
      setTimeout(() => {
        setVoices(getWebSpeechVoices());
      }, 100);
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
      setVoices(getWebSpeechVoices());
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
        await speakWithWebSpeech(text, speechRate);
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
        await speakWithWebSpeech(text, speechRate);
        setIsSpeaking(false);
      } catch {
        setError('Lỗi phát giọng nói');
        setIsSpeaking(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentVoice, useWebSpeech, speechRate]);

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

  // Change speech rate (0.5 - 2.0)
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
