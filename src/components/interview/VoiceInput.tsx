import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  language?: 'vi' | 'en';
}

export function VoiceInput({ onTranscript, disabled, language = 'vi' }: VoiceInputProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(average / 255);
    }
    animationRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  const startRecording = async () => {
    if (!isSupported) {
      toast({
        title: 'Không hỗ trợ',
        description: 'Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome hoặc Edge.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Request microphone permission and setup audio visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Setup audio analyser for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Start level monitoring
      updateAudioLevel();

      // Setup Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = language === 'vi' ? 'vi-VN' : 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript + ' ';
          } else {
            interim += result[0].transcript;
          }
        }
        
        if (final) {
          setTranscript(prev => (prev + final).trim());
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = 'Không thể nhận diện giọng nói.';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'Không nghe thấy giọng nói. Vui lòng nói to hơn.';
            break;
          case 'audio-capture':
            errorMessage = 'Không thể truy cập microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Vui lòng cấp quyền truy cập microphone.';
            break;
          case 'network':
            errorMessage = 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.';
            break;
        }
        
        if (event.error !== 'no-speech') {
          toast({
            title: 'Lỗi',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      };

      recognition.onend = () => {
        // Auto restart if still recording (for continuous mode)
        if (isRecording && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or stopped
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (error: any) {
      console.error('Error starting recording:', error);
      
      let errorMessage = 'Không thể truy cập microphone.';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Vui lòng cấp quyền truy cập microphone trong cài đặt trình duyệt.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Không tìm thấy microphone. Vui lòng kết nối microphone.';
      }
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Stop audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setAudioLevel(0);
    setIsRecording(false);
    setInterimTranscript('');
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      setTranscript('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      {/* Compact layout: button + status inline */}
      <div className="flex items-center justify-center gap-4">
        {/* Recording button - smaller */}
        <Button
          size="default"
          variant={isRecording ? 'destructive' : 'default'}
          className={cn(
            "w-12 h-12 rounded-full p-0",
            isRecording && "animate-pulse"
          )}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
        >
          {isRecording ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>

        {/* Audio level indicator - inline */}
        {isRecording ? (
          <div className="flex items-center gap-0.5 h-6">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full bg-primary transition-all duration-75",
                  audioLevel > i / 12 ? "opacity-100" : "opacity-20"
                )}
                style={{ height: `${Math.max(4, Math.min(24, audioLevel * 30 + Math.random() * 6))}px` }}
              />
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            Nhấn để nói
          </span>
        )}
      </div>

      {/* Interim transcript - compact */}
      {isRecording && interimTranscript && (
        <p className="text-center text-sm text-muted-foreground italic truncate px-4">
          {interimTranscript}
        </p>
      )}

      {/* Transcript preview - compact */}
      {transcript && (
        <div className="flex gap-2 items-end">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className="flex-1 p-2 text-sm rounded-lg bg-card border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Chỉnh sửa nếu cần..."
          />
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTranscript('')}>
              ✕
            </Button>
            <Button size="icon" className="h-8 w-8" onClick={handleSubmit} disabled={disabled}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Text-to-Speech hook for AI responses - supports Edge TTS and Web Speech API fallback
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const TTS_SERVER_URL = import.meta.env.VITE_TTS_SERVER_URL || 'https://devtam05-vieneu-tts.hf.space';

  // Get best Vietnamese voice
  const getBestVietnameseVoice = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    
    const voices = window.speechSynthesis.getVoices();
    const vnVoices = voices.filter(v => 
      v.lang.startsWith('vi') || 
      v.name.toLowerCase().includes('vietnam')
    );
    
    if (vnVoices.length === 0) return null;
    
    // Prefer Google/Microsoft voices
    const preferred = vnVoices.find(v => 
      v.name.includes('Google') || v.name.includes('Microsoft')
    );
    return preferred || vnVoices[0];
  }, []);

  // Ensure voices are loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Call Gradio API on HF Spaces
  const callGradioTTS = useCallback(async (text: string, voice: string): Promise<string> => {
    const apiUrl = `${TTS_SERVER_URL}/gradio_api/call/synthesize`;
    
    const submitResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [text, voice] }),
    });
    
    if (!submitResponse.ok) throw new Error('Failed to submit TTS request');
    
    const { event_id } = await submitResponse.json();
    const resultResponse = await fetch(`${TTS_SERVER_URL}/gradio_api/call/synthesize/${event_id}`);
    
    if (!resultResponse.ok) throw new Error('Failed to get TTS result');
    
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
  }, [TTS_SERVER_URL]);

  // Try Edge TTS first, fallback to Web Speech API
  const speak = useCallback(async (text: string, language: 'vi' | 'en' = 'vi') => {
    // Stop any current speech
    stop();

    // Load saved settings
    const savedSettings = localStorage.getItem('voice-settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : null;
    const useEdgeTTS = settings?.useEdgeTTS !== false; // Default to true

    // Try Edge TTS for Vietnamese
    if (useEdgeTTS && language === 'vi') {
      try {
        setIsLoading(true);
        
        const voice = settings?.edgeVoice || 'Hoài My (Nữ)';
        const audioUrl = await callGradioTTS(text, voice);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onplay = () => {
          setIsLoading(false);
          setIsSpeaking(true);
        };
        audio.onended = () => {
          setIsSpeaking(false);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setIsLoading(false);
          // Fallback to Web Speech API
          speakWithWebSpeech(text, language);
        };

        await audio.play();
        return;
      } catch (err) {
        console.log('Edge TTS not available, falling back to Web Speech API');
        setIsLoading(false);
      }
    }

    // Fallback: Web Speech API
    speakWithWebSpeech(text, language);
  }, [callGradioTTS]);

  const speakWithWebSpeech = useCallback((text: string, language: 'vi' | 'en') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.error('Web Speech API not supported');
      // Try Google TTS fallback
      speakWithGoogleTTS(text, language);
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to get best Vietnamese voice
    if (language === 'vi') {
      const vnVoice = getBestVietnameseVoice();
      if (vnVoice) {
        utterance.voice = vnVoice;
        utterance.lang = vnVoice.lang;
      } else {
        // No Vietnamese voice available, use Google TTS
        console.log('No Vietnamese voice found, using Google TTS');
        speakWithGoogleTTS(text, language);
        return;
      }
    } else {
      utterance.lang = 'en-US';
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('TTS error:', e);
      setIsSpeaking(false);
      // Fallback to Google TTS on error
      speakWithGoogleTTS(text, language);
    };

    utteranceRef.current = utterance;

    // Small delay to ensure voices are loaded
    setTimeout(() => {
      synth.speak(utterance);
    }, 100);
  }, [getBestVietnameseVoice]);

  // Google Translate TTS fallback (works without installing voices)
  const speakWithGoogleTTS = useCallback((text: string, language: 'vi' | 'en') => {
    // Split text into chunks (Google TTS has 200 char limit)
    const maxLength = 200;
    const chunks: string[] = [];
    let remaining = text;
    
    while (remaining.length > 0) {
      if (remaining.length <= maxLength) {
        chunks.push(remaining);
        break;
      }
      // Find last space within limit
      let splitIndex = remaining.lastIndexOf(' ', maxLength);
      if (splitIndex === -1) splitIndex = maxLength;
      chunks.push(remaining.substring(0, splitIndex));
      remaining = remaining.substring(splitIndex).trim();
    }

    const lang = language === 'vi' ? 'vi' : 'en';
    let currentChunk = 0;

    const playNextChunk = () => {
      if (currentChunk >= chunks.length) {
        setIsSpeaking(false);
        return;
      }

      const chunk = encodeURIComponent(chunks[currentChunk]);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${chunk}&tl=${lang}&client=tw-ob`;
      
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        currentChunk++;
        playNextChunk();
      };
      audio.onerror = () => {
        console.error('Google TTS error');
        setIsSpeaking(false);
      };

      audio.play().catch(() => {
        console.error('Failed to play Google TTS');
        setIsSpeaking(false);
      });
    };

    playNextChunk();
  }, []);

  const stop = useCallback(() => {
    // Stop Edge TTS audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // Stop Web Speech
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  return { speak, stop, isSpeaking, isLoading };
}
