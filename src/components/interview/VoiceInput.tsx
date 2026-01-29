import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, Send, Volume2 } from 'lucide-react';
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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio analyser for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Start level monitoring
      updateAudioLevel();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        setAudioLevel(0);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      // Convert blob to base64
      const buffer = await audioBlob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Use Web Speech API for transcription (built-in, no API key needed)
      const result = await transcribeWithWebSpeech(audioBlob, language);
      setTranscript(result);
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể nhận diện giọng nói. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  // Web Speech API transcription
  const transcribeWithWebSpeech = (audioBlob: Blob, lang: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check if Web Speech API is available
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        resolve(result);
      };

      recognition.onerror = (event: any) => {
        reject(new Error(event.error));
      };

      recognition.start();
    });
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
    <div className="space-y-4">
      {/* Audio level indicator */}
      {isRecording && (
        <div className="flex items-center justify-center gap-1 h-8">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full bg-primary transition-all duration-75",
                audioLevel > i / 20 ? "opacity-100" : "opacity-20"
              )}
              style={{ height: `${Math.max(4, Math.min(32, audioLevel * 40 + Math.random() * 8))}px` }}
            />
          ))}
        </div>
      )}

      {/* Recording button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          variant={isRecording ? 'destructive' : 'default'}
          className={cn(
            "w-20 h-20 rounded-full",
            isRecording && "animate-pulse"
          )}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || isTranscribing}
        >
          {isTranscribing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </div>

      {/* Status text */}
      <p className="text-center text-sm text-muted-foreground">
        {isTranscribing 
          ? 'Đang nhận diện giọng nói...' 
          : isRecording 
            ? 'Đang ghi âm... Nhấn để dừng' 
            : 'Nhấn để bắt đầu nói'}
      </p>

      {/* Transcript preview */}
      {transcript && (
        <div className="space-y-2">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[80px] p-3 rounded-lg bg-card border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Chỉnh sửa nếu cần..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setTranscript('')}>
              Xóa
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={disabled}>
              <Send className="h-4 w-4 mr-2" />
              Gửi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Text-to-Speech hook for AI responses - supports VieNeu TTS and Web Speech API fallback
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const TTS_SERVER_URL = import.meta.env.VITE_TTS_SERVER_URL || 'http://localhost:8000';

  // Try VieNeu TTS first, fallback to Web Speech API
  const speak = useCallback(async (text: string, language: 'vi' | 'en' = 'vi') => {
    // Stop any current speech
    stop();

    // Load saved settings
    const savedSettings = localStorage.getItem('voice-settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : null;
    const useVieNeu = settings?.useVieNeu !== false; // Default to true for Vietnamese

    // Try VieNeu TTS for Vietnamese
    if (useVieNeu && language === 'vi') {
      try {
        setIsLoading(true);
        const response = await fetch(`${TTS_SERVER_URL}/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: settings?.vieneuVoice || 'Hương',
          }),
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          
          audio.onplay = () => {
            setIsLoading(false);
            setIsSpeaking(true);
          };
          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            setIsLoading(false);
            // Fallback to Web Speech API
            speakWithWebSpeech(text, language, settings);
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.log('VieNeu TTS not available, falling back to Web Speech API');
        setIsLoading(false);
      }
    }

    // Fallback: Web Speech API
    speakWithWebSpeech(text, language, settings);
  }, []);

  const speakWithWebSpeech = (text: string, language: 'vi' | 'en', settings: any) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (settings) {
      const voices = synth.getVoices();
      const savedVoice = voices.find(v => v.voiceURI === settings.voiceUri);
      if (savedVoice) utterance.voice = savedVoice;
      
      utterance.rate = settings.rate || 1.0;
      utterance.pitch = settings.pitch || 1.0;
      utterance.volume = settings.volume || 1.0;
    } else {
      utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1;
      utterance.volume = 1;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('TTS error:', e);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;

    setTimeout(() => {
      synth.speak(utterance);
    }, 100);
  };

  const stop = useCallback(() => {
    // Stop VieNeu audio
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
